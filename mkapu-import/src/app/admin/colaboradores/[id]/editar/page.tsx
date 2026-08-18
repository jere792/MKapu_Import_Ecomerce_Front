import ColaboradorForm from "@/components/layout/admin/ColaboradorForm";

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ColaboradorForm mode="edit" colaboradorId={Number(id)} />;
}