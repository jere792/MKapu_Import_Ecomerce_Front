import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

export interface Producto {
  id: number;
  code: string;
  name: string;
  category: number | null;
  category_name?: string;
  description: string | null;
  price: number;
  featured: boolean;
  image_url: string | null;
  activo: boolean;
  created_at?: string;
  is_new: boolean;
  low_stock: boolean;
  agotado: boolean;
  slug?: string;
}

export type Promocion = {
  id: number;
  producto_id: number;
  producto_nombre?: string;
  tipo_descuento: "porcentaje" | "monto_fijo";
  valor_descuento: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
  created_at?: string;
};

export type Categoria = {
  id: number;
  name: string;
  slug: string;
  activo?: boolean;
};

export type Empresa = {
  id: number;
  nombre: string;
  razon_social: string | null;
  ruc: string | null;
  direccion: string | null;
  logo: string | null;
  email: string | null;
  whatsapp: string | null;
  whatsapp_soporte: string | null;
  numero_reclamos: string | null;
  descripcion: string | null;
  horario_atencion: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
};

export type Reclamacion = {
  id?: number;
  ticket?: string;
  nombres: string;
  apellidos: string;
  dni?: string;
  email: string;
  telefono?: string;
  direccion?: string;
  tipo: string;
  fecha_consumo?: string;
  producto?: string;
  monto?: number;
  descripcion: string;
  pedido?: string;
  created_at?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. "
    //"Agrégalas en el dashboard de Cloudflare Workers > Settings > Variables."
  );
}

export const supabase =
  typeof window === "undefined"
    ? createClient(supabaseUrl, supabaseKey)
    : createBrowserClient(supabaseUrl, supabaseKey);

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = typeof window === "undefined" && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey)
  : supabase;