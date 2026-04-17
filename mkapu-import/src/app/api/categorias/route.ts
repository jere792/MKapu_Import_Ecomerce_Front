// src/app/api/categorias/route.ts
// Fallback API route — se usa si el Navbar necesita cargar categorías client-side
import { NextResponse } from "next/server";
import { getCategoriasFromProductos } from "@/lib/queries";

export const revalidate = 3600; // cache 1 hora

export async function GET() {
  const categorias = await getCategoriasFromProductos();
  return NextResponse.json(categorias);
}