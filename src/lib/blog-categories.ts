import { prisma } from "@/lib/prisma";

export type BlogCategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
};

export async function listBlogCategories(): Promise<BlogCategoryItem[]> {
  return prisma.blogCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
    },
  });
}

export async function getBlogCategoryBySlug(slug: string) {
  return prisma.blogCategory.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
    },
  });
}
