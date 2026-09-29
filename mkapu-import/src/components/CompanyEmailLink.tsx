"use client";

import { useEmpresa } from "@/context/EmpresaContext";

const FALLBACK_EMAIL = "marlomauriciop1@gmail.com";

export default function CompanyEmailLink() {
  const { empresa } = useEmpresa();
  const email = empresa?.email || FALLBACK_EMAIL;

  return (
    <a href={`mailto:${email}`}>
      {email}
    </a>
  );
}
