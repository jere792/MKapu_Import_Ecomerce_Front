import PromocionForm from "@/components/layout/admin/PromocionForm";

export default async function EditarPromocionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PromocionForm mode="edit" promocionId={Number(id)} />;
}