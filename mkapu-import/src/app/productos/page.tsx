import { Suspense } from "react";
import { getProductos, getCategoriasFromProductos } from "@/lib/queries";
import ProductosClient from "./ProductosClient";

export const revalidate = 3600;

function Loading() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "60vh", flexDirection: "column", gap: "1rem", color: "#888"
    }}>
      <div style={{
        width: "40px", height: "40px",
        border: "3px solid #f0ebe4", borderTop: "3px solid #f5a623",
        borderRadius: "50%", animation: "spin 0.8s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>Cargando productos...</p>
    </div>
  );
}

export default async function Page() {
  const [products, categories] = await Promise.all([
    getProductos(),
    getCategoriasFromProductos(),
    
  ]);
  

  return (
    <Suspense fallback={<Loading />}>
      <ProductosClient initialProducts={products} allCats={categories} />
    </Suspense>
  );
}