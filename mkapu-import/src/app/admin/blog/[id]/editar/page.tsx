import BlogForm from "@/components/layout/admin/BlogForm";

export default async function EditarPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogForm mode="edit" postId={Number(id)} />;
}