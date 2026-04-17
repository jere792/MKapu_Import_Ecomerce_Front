import { supabase, Producto, Categoria } from "./supabase";

// ── PRODUCTOS ──────────────────────────────────────────────

export async function getProductos(): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching productos:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductosByCategoria(category: string | number): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("category", category)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching productos by category:", error.message);
    return [];
  }
  return data ?? [];
}

export async function searchProductos(query: string): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("id", { ascending: true });

  if (error) {
    console.error("Error searching productos:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching producto by slug:", error.message);
    return null;
  }
  return data;
}

export async function getProductoById(id: number): Promise<Producto | null> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching producto by id:", error.message);
    return null;
  }
  return data;
}

export async function getProductosDestacados(limit = 8): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("featured", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching destacados:", error.message);
    return [];
  }
  return data ?? [];
}

// ── CATEGORÍAS ─────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categorias:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoriasFromProductos(): Promise<string[]> {
  try {
    // Obtener productos
    const { data: productos, error: prodError } = await supabase
      .from("productos")
      .select("category");

    if (prodError) {
      console.error("Error fetching productos for categories:", prodError.message);
      return [];
    }

    // Obtener categorías
    const { data: categorias, error: catError } = await supabase
      .from("categorias")
      .select("id, name");

    if (catError) {
      console.error("Error fetching categorias:", catError.message);
      return [];
    }

    // Crear mapa de ID -> nombre
    const catMap = new Map(
      (categorias ?? []).map((c: any) => [String(c.id), c.name])
    );

    // Obtener IDs únicos de categorías usadas
    const uniqueCatIds = Array.from(
      new Set(
        (productos ?? [])
          .map((p: any) => p.category)
          .filter((c): c is string | number => Boolean(c))
      )
    );

    // Convertir IDs a nombres
    const catNames = uniqueCatIds
      .map((id) => catMap.get(String(id)))
      .filter((name): name is string => Boolean(name))
      .sort();

    return catNames;
  } catch (err) {
    console.error("Error in getCategoriasFromProductos:", err);
    return [];
  }
}