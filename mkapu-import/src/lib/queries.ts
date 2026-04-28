import { supabase, Producto, Categoria } from "./supabase";

// ── TIPOS NUEVOS ───────────────────────────────────────────

export type Marca = {
  id: number;
  name: string;
  logo_url: string | null;
  activo: boolean;
  orden: number;
};

export type Colaborador = {
  id: number;
  name: string;
  logo_url: string | null;
  url: string | null;
  activo: boolean;
  orden: number;
};

export type Video = {
  id: number;
  title: string;
  descripcion: string | null;
  youtube_id: string | null;
  video_url: string | null;
  tipo: "video" | "vlog";
  thumbnail: string | null;
  activo: boolean;
  created_at: string;
};

export type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
  created_at: string;
};

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

export async function getProductosNuevos(limit = 10): Promise<Producto[]> {
  const { data, error } = await supabase
    .from("productos")
    .select("*")
    .eq("is_new", true)
    .eq("activo", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching nuevos productos:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductoImagenes(productoId: number): Promise<ProductoImagen[]> {
  const { data, error } = await supabase
    .from("producto_imagenes")
    .select("*")
    .eq("producto_id", productoId)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching imagenes del producto:", error.message);
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
    const { data: productos, error: prodError } = await supabase
      .from("productos")
      .select("category");

    if (prodError) {
      console.error("Error fetching productos for categories:", prodError.message);
      return [];
    }

    const { data: categorias, error: catError } = await supabase
      .from("categorias")
      .select("id, name");

    if (catError) {
      console.error("Error fetching categorias:", catError.message);
      return [];
    }

    const catMap = new Map(
      (categorias ?? []).map((c: any) => [String(c.id), c.name])
    );

    const uniqueCatIds = Array.from(
      new Set(
        (productos ?? [])
          .map((p: any) => p.category)
          .filter((c): c is string | number => Boolean(c))
      )
    );

    return uniqueCatIds
      .map((id) => catMap.get(String(id)))
      .filter((name): name is string => Boolean(name))
      .sort();
  } catch (err) {
    console.error("Error in getCategoriasFromProductos:", err);
    return [];
  }
}

// ── MARCAS ─────────────────────────────────────────────────

export async function getMarcas(): Promise<Marca[]> {
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching marcas:", error.message);
    return [];
  }
  return data ?? [];
}

// ── COLABORADORES ──────────────────────────────────────────

export async function getColaboradores(): Promise<Colaborador[]> {
  const { data, error } = await supabase
    .from("colaboradores")
    .select("*")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) {
    console.error("Error fetching colaboradores:", error.message);
    return [];
  }
  return data ?? [];
}

// ── VIDEOS ─────────────────────────────────────────────────

export async function getVideos(tipo?: "video" | "vlog"): Promise<Video[]> {
  let query = supabase
    .from("videos")
    .select("*")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (tipo) {
    query = query.eq("tipo", tipo);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching videos:", error.message);
    return [];
  }
  return data ?? [];
}