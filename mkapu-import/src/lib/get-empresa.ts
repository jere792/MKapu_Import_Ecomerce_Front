import { supabaseAdmin, type Empresa } from "@/lib/supabase";

export async function getEmpresa(): Promise<Empresa | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("empresa")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Error cargando empresa:", error.message);
      return null;
    }

    return (data as Empresa) ?? null;
  } catch (err) {
    console.error("Error cargando empresa:", err);
    return null;
  }
}
