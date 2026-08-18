import SobreNosotrosForm from "@/components/layout/admin/SobreNosotrosForm";

export default async function EditarSeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SobreNosotrosForm mode="edit" seccionId={Number(id)} />;
}