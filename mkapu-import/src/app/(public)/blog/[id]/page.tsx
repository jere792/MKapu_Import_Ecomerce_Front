import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import BlogDetailClient from "./BlogDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export const revalidate = 60;

export default async function BlogDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: post } = await supabase
    .from("vlog_posts")
    .select("*")
    .eq("id", id)
    .eq("activo", true)
    .single();

  if (!post) {
    notFound();
  }

  const [{ data: imagenes }, { data: videos }] = await Promise.all([
    supabase
      .from("vlog_imagenes")
      .select("*")
      .eq("vlog_post_id", post.id)
      .order("orden"),
    supabase
      .from("vlog_videos")
      .select("*")
      .eq("vlog_post_id", post.id)
      .order("orden"),
  ]);

  return (
    <BlogDetailClient
      post={post}
      imagenes={imagenes || []}
      videos={videos || []}
    />
  );
}