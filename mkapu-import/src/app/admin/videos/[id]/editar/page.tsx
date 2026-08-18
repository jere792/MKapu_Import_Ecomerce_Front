import VideoForm from "@/components/layout/admin/VideoForm";

export default async function EditarVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VideoForm mode="edit" videoId={Number(id)} />;
}