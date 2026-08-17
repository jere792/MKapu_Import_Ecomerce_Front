import ClientShell from "@/components/layout/public/ClientShell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientShell>{children}</ClientShell>;
}