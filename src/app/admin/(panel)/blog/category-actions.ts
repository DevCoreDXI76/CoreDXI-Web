"use server";

import { revalidatePath } from "next/cache";
import {
  normalizeCategorySlug,
  uniqueCategorySlug,
} from "@/lib/blog-category-slug";
import { prisma } from "@/lib/prisma";
import { requireBlogEditor } from "@/lib/require-blog-editor";

function revalidateCategoryPaths(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidatePath("/admin/blog/topics");
  if (slug) revalidatePath(`/blog/category/${slug}`);
}

export type BlogCategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  sortOrder?: number;
};

export async function createBlogCategory(
  input: BlogCategoryInput
): Promise<{ success: boolean; message: string }> {
  const gate = await requireBlogEditor();
  if (!gate.ok) return { success: false, message: gate.message };

  const name = input.name.trim();
  if (!name) return { success: false, message: "주제 이름을 입력해 주세요." };

  try {
    const slugInput = normalizeCategorySlug(input.slug ?? "");
    let slug: string;

    if (slugInput) {
      const taken = await prisma.blogCategory.findUnique({
        where: { slug: slugInput },
      });
      if (taken) {
        return {
          success: false,
          message: "이미 사용 중인 URL slug입니다.",
        };
      }
      slug = slugInput;
    } else if (input.slug?.trim()) {
      return {
        success: false,
        message:
          "URL slug는 영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.",
      };
    } else {
      slug = await uniqueCategorySlug(name, async (s) => {
        const row = await prisma.blogCategory.findUnique({ where: { slug: s } });
        return row !== null;
      });
    }

    const maxOrder = await prisma.blogCategory.aggregate({
      _max: { sortOrder: true },
    });

    await prisma.blogCategory.create({
      data: {
        name,
        slug,
        description: input.description?.trim() || null,
        sortOrder: input.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    revalidateCategoryPaths(slug);
    return { success: true, message: "주제가 추가되었습니다." };
  } catch (e) {
    console.error("[createBlogCategory]", e);
    return { success: false, message: "주제 추가 중 오류가 발생했습니다." };
  }
}

export async function updateBlogCategory(
  id: string,
  input: BlogCategoryInput
): Promise<{ success: boolean; message: string }> {
  const gate = await requireBlogEditor();
  if (!gate.ok) return { success: false, message: gate.message };

  const name = input.name.trim();
  if (!name) return { success: false, message: "주제 이름을 입력해 주세요." };

  try {
    const existing = await prisma.blogCategory.findUnique({ where: { id } });
    if (!existing) return { success: false, message: "주제를 찾을 수 없습니다." };

    await prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        description: input.description?.trim() || null,
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      },
    });

    revalidateCategoryPaths(existing.slug);
    return { success: true, message: "저장되었습니다." };
  } catch (e) {
    console.error("[updateBlogCategory]", e);
    return { success: false, message: "저장 중 오류가 발생했습니다." };
  }
}

export async function deleteBlogCategory(
  id: string
): Promise<{ success: boolean; message: string }> {
  const gate = await requireBlogEditor();
  if (!gate.ok) return { success: false, message: gate.message };

  try {
    const existing = await prisma.blogCategory.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    });
    if (!existing) return { success: false, message: "주제를 찾을 수 없습니다." };

    if (existing._count.posts > 0) {
      return {
        success: false,
        message: `이 주제에 ${existing._count.posts}개의 글이 있습니다. 글의 주제를 변경한 뒤 삭제하세요.`,
      };
    }

    await prisma.blogCategory.delete({ where: { id } });
    revalidateCategoryPaths(existing.slug);
    return { success: true, message: "주제가 삭제되었습니다." };
  } catch (e) {
    console.error("[deleteBlogCategory]", e);
    return { success: false, message: "삭제 중 오류가 발생했습니다." };
  }
}
