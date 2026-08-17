import { supabase } from "@/lib/supabase";
import QuienesSomosClient from "./QuienesSomosClient";

export const revalidate = 60;

// Tipo explícito para las imágenes
type SeccionImagen = {
  id: number;
  seccion_id: number;
  url_imagen: string;
  orden: number;
};

export default async function QuienesSomosPage() {
  const [{ data: secciones }, { data: bannerData }] = await Promise.all([
    supabase
      .from("quienes_somos_secciones")
      .select("*")
      .eq("activo", true)
      .order("orden"),
    supabase
      .from("banners_config")
      .select("titulo, subtitulo, image_url, activo")
      .eq("ruta", "/quienes-somos")
      .single(),
  ]);

  const seccionesList = secciones ?? [];

  const { data: todasImagenes } = await supabase
    .from("quienes_somos_imagenes")
    .select("*")
    .in(
      "seccion_id",
      seccionesList.map((s) => s.id),
    )
    .order("orden", { ascending: true });

  const imagenesPorSeccion: Record<number, SeccionImagen[]> = {};

  for (const img of (todasImagenes ?? []) as SeccionImagen[]) {
    if (!imagenesPorSeccion[img.seccion_id]) {
      imagenesPorSeccion[img.seccion_id] = [];
    }
    imagenesPorSeccion[img.seccion_id].push(img);
  }

  const seccionesWithImages = seccionesList.map((seccion) => ({
    ...seccion,
    imagenes: imagenesPorSeccion[seccion.id] ?? [],
  }));

  return (
    <QuienesSomosClient
      secciones={seccionesWithImages}
      banner={bannerData ?? null}
    />
  );
}
