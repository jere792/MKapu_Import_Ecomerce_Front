"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAppModal } from "@/context/AppModalContext";
import SectionHeader from "@/components/layout/admin/SectionHeader";
import DataTable from "@/components/layout/admin/DataTable";
import BannerTabs from "@/components/layout/admin/BannerTabs";
import {
  Image as ImageIcon,
  Pencil,
  Trash2,
  PlusCircle,
} from "lucide-react";

type BannerCarousel = {
  id: number;
  titulo: string | null;
  subtitulo: string | null;
  descripcion: string | null;
  eyebrow: string | null;
  titulo_completo: string | null;
  image_url: string;
  orden: number;
  activo: boolean;
  created_at?: string | null;
};

const tdStyle: React.CSSProperties = {
  padding: "0.85rem 1rem",
  verticalAlign: "middle",
};

function ThumbImg({
  src,
  alt,
  w = 88,
  h = 56,
}: {
  src: string;
  alt?: string;
  w?: number;
  h?: number;
}) {
  const [err, setErr] = useState(false);
  return err || !src ? (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        background: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        color: "#bbb",
      }}
    >
      <ImageIcon size={16} />
      <span style={{ fontSize: "0.65rem", fontWeight: 600 }}>Sin imagen</span>
    </div>
  ) : (
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setErr(true)}
      style={{
        width: w,
        height: h,
        objectFit: "cover",
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        display: "block",
        background: "#f5f5f5",
      }}
    />
  );
}

export default function AdminBannersPage() {
  const [carousel, setCarousel] = useState<BannerCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const { confirm, alert: showAlert } = useAppModal();

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("banners_carousel")
      .select("*")
      .order("orden", { ascending: true });
    setCarousel(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function persistOrder(list: BannerCarousel[]) {
    setSavingOrder(true);
    const reordered = list.map((item, index) => ({
      ...item,
      orden: index + 1,
    }));
    setCarousel(reordered);
    await Promise.all(
      reordered.map((item) =>
        supabase
          .from("banners_carousel")
          .update({ orden: item.orden })
          .eq("id", item.id),
      ),
    );
    setSavingOrder(false);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const copy = [...carousel];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    void persistOrder(copy);
  }

  function moveDown(index: number) {
    if (index === carousel.length - 1) return;
    const copy = [...carousel];
    [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
    void persistOrder(copy);
  }

  async function onDeleteCarousel(id: number) {
    const ok = await confirm({
      title: "¿Eliminar banner?",
      message: "Esta acción no se puede deshacer.",
      variant: "danger",
      confirmText: "Eliminar",
    });
    if (!ok) return;
    await supabase.from("banners_carousel").delete().eq("id", id);
    await load();
  }

  function formatFecha(fecha?: string | null) {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <SectionHeader
        title="Banners"
        icon={<ImageIcon size={18} />}
        description="Gestiona el carrusel principal y los banners de cada página"
        actions={
          <Link
            href="/admin/banners/nuevo"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#f5a623",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.65rem 1.1rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            <PlusCircle size={15} /> Nuevo slide
          </Link>
        }
      />

      <BannerTabs />

      <div style={{ marginTop: "1.25rem" }}>
        <DataTable
          columns={[
            { key: "preview", label: "Preview" },
            { key: "titulo", label: "Título / Subtítulo" },
            { key: "fecha", label: "Fecha / Orden" },
            { key: "estado", label: "Estado" },
            { key: "acciones", label: "Acciones" },
          ]}
          rows={carousel}
          pageSize={10}
          minWidth="700px"
          loading={loading}
          loadingText="Cargando banners..."
          banner={
            savingOrder && (
              <div
                style={{
                  padding: "0.6rem 1.25rem",
                  background: "#fff8e6",
                  borderBottom: "1px solid #ffe5a0",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#c47d00",
                    fontWeight: 600,
                  }}
                >
                  Guardando orden...
                </span>
              </div>
            )
          }
          emptyText="No hay slides todavía. Crea el primero con &quot;Nuevo slide&quot;."
          renderRow={(b, i) => (
            <tr
              key={b.id}
              style={{
                borderBottom:
                  i < carousel.length - 1 ? "1px solid #f2f2f2" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fdfcfb")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* Preview */}
              <td style={tdStyle}>
                <ThumbImg src={b.image_url} alt={b.titulo ?? ""} />
              </td>

              {/* Título */}
              <td style={tdStyle}>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#111",
                    fontSize: "0.9rem",
                    marginBottom: "2px",
                  }}
                >
                  {b.titulo ?? (
                    <span style={{ color: "#ccc", fontWeight: 400 }}>
                      Sin título
                    </span>
                  )}
                </div>
                {b.subtitulo && (
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    {b.subtitulo}
                  </div>
                )}
              </td>

              {/* Fecha + orden */}
              <td style={tdStyle}>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#aaa",
                    marginBottom: "8px",
                  }}
                >
                  {formatFecha(b.created_at)}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0 || savingOrder}
                    title="Subir"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "6px",
                      border: "1px solid #e2e2e2",
                      background: "#fff",
                      cursor:
                        i === 0 || savingOrder ? "not-allowed" : "pointer",
                      opacity: i === 0 || savingOrder ? 0.35 : 1,
                      fontWeight: 700,
                      color: "#666",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >
                    ↑
                  </button>
                  <span
                    style={{
                      minWidth: "20px",
                      textAlign: "center",
                      fontWeight: 700,
                      color: "#555",
                      fontSize: "0.85rem",
                    }}
                  >
                    {b.orden}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === carousel.length - 1 || savingOrder}
                    title="Bajar"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "6px",
                      border: "1px solid #e2e2e2",
                      background: "#fff",
                      cursor:
                        i === carousel.length - 1 || savingOrder
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        i === carousel.length - 1 || savingOrder ? 0.35 : 1,
                      fontWeight: 700,
                      color: "#666",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "background 0.15s",
                    }}
                  >
                    ↓
                  </button>
                </div>
              </td>

              {/* Estado */}
              <td style={tdStyle}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: b.activo
                      ? "rgba(34,197,94,0.09)"
                      : "rgba(239,68,68,0.09)",
                    color: b.activo ? "#16a34a" : "#dc2626",
                    border: `1px solid ${b.activo ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  }}
                >
                  {b.activo ? "Activo" : "Inactivo"}
                </span>
              </td>

              {/* Acciones */}
              <td style={tdStyle}>
                <div style={{ display: "flex", gap: "6px" }}>
                  <Link
                    href={`/admin/banners/${b.id}/editar`}
                    title="Editar"
                    style={{
                      background: "rgba(245,166,35,0.08)",
                      border: "1px solid rgba(245,166,35,0.2)",
                      borderRadius: "7px",
                      padding: "6px 7px",
                      cursor: "pointer",
                      color: "#f5a623",
                      display: "flex",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => onDeleteCarousel(b.id)}
                    title="Eliminar"
                    style={{
                      background: "rgba(220,38,38,0.07)",
                      border: "1px solid rgba(220,38,38,0.18)",
                      borderRadius: "7px",
                      padding: "6px 7px",
                      cursor: "pointer",
                      color: "#dc2626",
                      display: "flex",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}