"use server";

/**
 * [홍보팀/개발팀] 블로그 글 저장 — Tiptap JSON(`content`) + 임시저장(DRAFT) / 발행(PUBLISHED).
 */

import { revalidatePath } from "next/cache";
import type { BlogPostStatus, Prisma } from "@/generated/prisma/client";
import { uniqueSlug } from "@/lib/blog-slug";
import { prisma } from "@/lib/prisma";
import { requireBlogEditor } from "@/lib/require-blog-editor";
import type { BlogPostContent } from "@/types/blocknote";

async function revalidateBlogPaths(categorySlug?: string, postSlug?: string) {
  revalidatePath("/blog");
  if (categorySlug) revalidatePath(`/blog/category/${categorySlug}`);
  if (postSlug) revalidatePath(`/blog/${postSlug}`);
  revalidatePath("/admin/blog");
}

export type SaveBlogPostInput = {
  id?: string;
  title: string;
  categoryId: string;
  excerpt: string;
  content: BlogPostContent;
  status: BlogPostStatus;
};

export async function saveBlogPost(
  input: SaveBlogPostInput
): Promise<{ success: boolean; message: string; id?: string; slug?: string }> {
  const gate = await requireBlogEditor();
  if (!gate.ok) return { success: false, message: gate.message };

  const title = input.title.trim();
  if (!title) return { success: false, message: "제목을 입력해 주세요." };

  if (!input.categoryId) {
    return { success: false, message: "주제를 선택해 주세요." };
  }

  const category = await prisma.blogCategory.findUnique({
    where: { id: input.categoryId },
    select: { id: true, slug: true },
  });
  if (!category) return { success: false, message: "선택한 주제를 찾을 수 없습니다." };

  const excerpt = input.excerpt.trim() || null;
  const contentJson = JSON.parse(JSON.stringify(input.content)) as Prisma.InputJsonValue;

  try {
    if (input.id) {
      const existing = await prisma.blogPost.findUnique({
        where: { id: input.id },
        include: { category: { select: { slug: true } } },
      });
      if (!existing) return { success: false, message: "글을 찾을 수 없습니다." };

      const publishedAt =
        input.status === "PUBLISHED"
          ? (existing.publishedAt ?? new Date())
          : null;

      await prisma.blogPost.update({
        where: { id: input.id },
        data: {
          title,
          categoryId: category.id,
          excerpt,
          content: contentJson,
          status: input.status,
          publishedAt,
        },
      });

      await revalidateBlogPaths(category.slug, existing.slug);
      if (existing.category.slug !== category.slug) {
        await revalidateBlogPaths(existing.category.slug);
      }

      return {
        success: true,
        message: "저장되었습니다.",
        id: existing.id,
        slug: existing.slug,
      };
    }

    const slug = await uniqueSlug(title, async (s) => {
      const row = await prisma.blogPost.findUnique({ where: { slug: s } });
      return row !== null;
    });

    const created = await prisma.blogPost.create({
      data: {
        slug,
        title,
        categoryId: category.id,
        excerpt,
        content: contentJson,
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await revalidateBlogPaths(category.slug, created.slug);
    return {
      success: true,
      message:
        input.status === "PUBLISHED" ? "발행되었습니다." : "임시저장되었습니다.",
      id: created.id,
      slug: created.slug,
    };
  } catch (e) {
    console.error("[saveBlogPost]", e);
    return { success: false, message: "저장 중 오류가 발생했습니다." };
  }
}
