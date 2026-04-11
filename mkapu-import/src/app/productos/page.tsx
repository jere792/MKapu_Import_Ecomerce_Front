import { Suspense } from "react";
import ProductosClient from "./ProductosClient";

function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      flexDirection: "column",
      gap: "1rem",
      color: "#888"
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "3px solid #f0ebe4",
        borderTop: "3px solid #e05c2a",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>Cargando productos...</p>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductosClient />
    </Suspense>
  );
}