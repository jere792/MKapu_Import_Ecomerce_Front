import { supabase } from "@/lib/supabase";
import BlogList from "./BlogList";

export const revalidate = 60;

export default async function BlogPage() {
  const [{ data: posts }, { data: bannerData }] = await Promise.all([
    supabase
      .from("vlog_posts")
      .select("*")
      .eq("activo", true)
      .order("fecha_publicacion", { ascending: false }),
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/blog")
      .single(),
  ]);

  const postList = posts ?? [];

  const { data: todasImagenes } = await supabase
    .from("vlog_imagenes")
    .select("vlog_post_id, url_imagen, orden")
    .in(
      "vlog_post_id",
      postList.map((p) => p.id),
    )
    .order("orden", { ascending: true });

  const imagenPorPost: Record<number, string> = {};
  for (const img of todasImagenes ?? []) {
    if (imagenPorPost[img.vlog_post_id] === undefined) {
      imagenPorPost[img.vlog_post_id] = img.url_imagen;
    }
  }

  const postsWithImages = postList.map((post) => ({
    ...post,
    imagen_principal: imagenPorPost[post.id] ?? null,
  }));

  return <BlogList posts={postsWithImages} banner={bannerData ?? null} />;
}
