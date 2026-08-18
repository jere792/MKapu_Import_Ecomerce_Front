import ProductoForm from "@/components/layout/admin/ProductoForm";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductoForm mode="edit" productId={Number(id)} />;
}