import BannerForm from "@/components/layout/admin/BannerForm";

export default async function EditarBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BannerForm mode="edit" bannerId={Number(id)} />;
}