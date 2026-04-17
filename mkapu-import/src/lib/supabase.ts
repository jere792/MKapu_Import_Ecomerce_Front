import { createClient } from "@supabase/supabase-js";

export interface Producto {
  id: number;
  code: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  price_caja?: number;
  unidad_caja?: number;
  price_mayorista?: number;
  unidad_mayorista?: number;
  featured?: boolean;
  image_url?: string;
  activo?: boolean;
  created_at?: string;
}

export type Categoria = {
  id: string;
  nombre: string;
  slug: string;
  imagen?: string;
};

export type Reclamacion = {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  tipo: string;
  descripcion: string;
  created_at?: string;
};

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);