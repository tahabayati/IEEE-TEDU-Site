import { notFound } from "next/navigation";
import BlogArticle from "../../components/BlogArticle";
import { getPublishedPost } from "../../../lib/blog.mjs";

// Rendered on first visit, then cached; the admin panel revalidates it on every change.
export const revalidate = 3600;

export async function generateMetadata({ params }) {
  const post = await getPublishedPost((await params).slug);
  return post ? { title: `${post.title} | IEEE TEDU`, description: post.excerpt } : {};
}

export default async function Page({ params }) {
  const post = await getPublishedPost((await params).slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
