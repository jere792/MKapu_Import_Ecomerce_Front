import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPromocionesActivasMap, calcularPrecioConDescuento } from "@/lib/queries";
import ProductoDetailClient from "./ProductoDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("productos")
    .select(
      `
      *,
      categorias (
        id,
        name
      )
    `,
    )
    .eq("id", Number(id))
    .eq("activo", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const producto = {
    ...data,
    category_name: Array.isArray(data.categorias)
      ? (data.categorias[0]?.name ?? null)
      : (data.categorias?.name ?? null),
  };

  const { data: sugeridos } = await supabase
    .from("productos")
    .select("*")
    .eq("category", data.category)
    .eq("activo", true)
    .neq("id", Number(id))
    .limit(8);

  const promocionesMap = await getPromocionesActivasMap();

  return (
    <ProductoDetailClient
      producto={producto}
      sugeridos={sugeridos ?? []}
      promocionesMap={promocionesMap}
    />
  );
}
