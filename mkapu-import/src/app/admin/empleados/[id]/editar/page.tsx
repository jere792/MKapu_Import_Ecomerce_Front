import EmpleadoForm from "@/components/layout/admin/EmpleadoForm";

export default async function EditarEmpleadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EmpleadoForm mode="edit" empleadoId={Number(id)} />;
}