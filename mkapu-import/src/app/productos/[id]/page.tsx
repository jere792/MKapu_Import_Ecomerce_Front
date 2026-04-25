import { getProductoById } from "@/lib/queries";
import ProductoDetailClient from "./ProductoDetailClient";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProductoPage({ params }: Props) {
  const { id } = await params;
  const producto = await getProductoById(Number(id));

  if (!producto) {
    notFound();
  }

  return <ProductoDetailClient producto={producto} />;
}
