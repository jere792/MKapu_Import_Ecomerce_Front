"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppModal } from "@/context/AppModalContext";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import SectionHeader from "@/components/layout/admin/SectionHeader";

type ProductoImagen = {
  id: number;
  producto_id: number;
  url_imagenes: string;
  orden: number;
};

type ProductoVideo = {
  id: number;
  producto_id: number;
  video_url: string | null;
  titulo: string | null;
  orden: number;
};

type Producto = {
  id: number;
  name: string;
  code: string;
  image_url: string | null;
};

type Tab = "imagenes" | "videos";

export default function ProductoMediaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const productoId = Number(id);

  const [producto, setProducto] = useState<Producto | null>(null);
  const [tab, setTab] = useState<Tab>("imagenes");
  const [imagenes, setImagenes] = useState<ProductoImagen[]>([]);
  const [videos, setVideos] = useState<ProductoVideo[]>([]);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [videoTitulo, setVideoTitulo] = useState("");
  const [loading, setLoading] = useState(true);
  const [vidError, setVidError] = useState<string | null>(null);
  const { confirm, alert: showAlert } = useAppModal();
  const [vidSuccess, setVidSuccess] = useState(false);

  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  async function loadAll() {
    setLoading(true);
    const [prodRes, imgRes, vidRes] = await Promise.all([
      supabase
        .from("productos")
        .select("id,name,code,image_url")
        .eq("id", productoId)
        .single(),
      supabase
        .from("producto_imagenes")
        .select("*")
        .eq("producto_id", productoId)
        .order("orden"),
      supabase
        .from("producto_videos")
        .select("*")
        .eq("producto_id", productoId)
        .order("orden"),
    ]);

    if (prodRes.data) setProducto(prodRes.data);
    setImagenes(imgRes.data ?? []);
    setVideos(vidRes.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, [productoId]);

  async function handleImgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadingImg(true);
    let orden = imagenes.length;

    for (const file of files) {
      const ext = file.name.split(".").pop();
      const path = `productos/gallery/${productoId}_${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("imagenes")
        .upload(path, file, { upsert: true });

      if (error) continue;

      const url = supabase.storage.from("imagenes").getPublicUrl(path)
        .data.publicUrl;

      await supabase
        .from("producto_imagenes")
        .insert({ producto_id: productoId, url_imagenes: url, orden });

      orden++;
    }

    setUploadingImg(false);
    if (imgRef.current) imgRef.current.value = "";
    await loadAll();
  }

  async function deleteImagen(imgId: number) {
    const _ok = await confirm({ title: "¿Eliminar imagen?", message: "Esta acción no se puede deshacer.", confirmText: "Eliminar", cancelText: "Cancelar", variant: "danger" });
    if (!_ok) return;
    await supabase.from("producto_imagenes").delete().eq("id", imgId);
    await loadAll();
  }

  async function setMainImage(url: string) {
    await supabase
      .from("productos")
      .update({ image_url: url })
      .eq("id", productoId);
    await loadAll();
  }

  async function moverImagen(index: number, dir: "arriba" | "abajo") {
    const arr = [...imagenes];
    const target = dir === "arriba" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;

    [arr[index], arr[target]] = [arr[target], arr[index]];

    await Promise.all(
      arr.map((img, i) =>
        supabase
          .from("producto_imagenes")
          .update({ orden: i })
          .eq("id", img.id),
      ),
    );

    await loadAll();
  }

  async function handleVidUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setVidError(null);
    setVidSuccess(false);

    if (file.size > 100 * 1024 * 1024) {
      setVidError(
        `El video pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. Máximo permitido: 100 MB.`,
      );
      if (vidRef.current) vidRef.current.value = "";
      return;
    }

    setUploadingVid(true);

    const ext = file.name.split(".").pop();
    const path = `productos/videos/${productoId}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploadingVid(false);
      setVidError("Error al subir el archivo: " + uploadError.message);
      if (vidRef.current) vidRef.current.value = "";
      return;
    }

    const url = supabase.storage.from("imagenes").getPublicUrl(path)
      .data.publicUrl;

    const { error: insertError } = await supabase
      .from("producto_videos")
      .insert({
        producto_id: productoId,
        video_url: url,
        titulo: videoTitulo || null,
        orden: videos.length,
      });

    setUploadingVid(false);

    if (insertError) {
      setVidError("Video subido pero error al guardar: " + insertError.message);
      if (vidRef.current) vidRef.current.value = "";
      return;
    }

    setVideoTitulo("");
    setVidSuccess(true);
    setTimeout(() => setVidSuccess(false), 3000);
    if (vidRef.current) vidRef.current.value = "";
    await loadAll();
  }

  async function deleteVideo(vidId: number) {
    const _ok = await confirm({ title: "¿Eliminar video?", message: "Esta acción no se puede deshacer.", confirmText: "Eliminar", cancelText: "Cancelar", variant: "danger" });
    if (!_ok) return;
    await supabase.from("producto_videos").delete().eq("id", vidId);
    await loadAll();
  }

  async function moverVideo(index: number, dir: "arriba" | "abajo") {
    const arr = [...videos];
    const target = dir === "arriba" ? index - 1 : index + 1;
    if (target < 0 || target >= arr.length) return;

    [arr[index], arr[target]] = [arr[target], arr[index]];

    await Promise.all(
      arr.map((v, i) =>
        supabase.from("producto_videos").update({ orden: i }).eq("id", v.id),
      ),
    );

    await loadAll();
  }

  const ordenBtnStyle = (disabled: boolean): React.CSSProperties => ({
    border: "1px solid #e0e0e0",
    borderRadius: 5,
    background: disabled ? "#f9f9f9" : "#fff",
    color: disabled ? "#ddd" : "#888",
    cursor: disabled ? "not-allowed" : "pointer",
    width: 24,
    height: 24,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    padding: 0,
  });

  return (
    <div
      style={{
        padding: "1.5rem 1.25rem 2.5rem",
        background: "#f8f7f4",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          margin: 0,
          padding: "0 24px",
        }}
      >
        <SectionHeader
          title="Galería & Videos"
          icon={<ImageIcon size={18} />}
          description={
            <span>
              <code
                style={{
                  background: "#f0f0f0",
                  padding: "2px 7px",
                  borderRadius: 4,
                  fontSize: ".78rem",
                  color: "#555",
                }}
              >
                {producto?.code}
              </code>
              &nbsp;{producto?.name}
            </span>
          }
          actions={
            <button
              onClick={() => router.back()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                background: "#fff",
                color: "#555",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={15} />
              Volver
            </button>
          }
        >

        <div
          style={{
            borderBottom: "1px solid #e8e8e8",
            marginBottom: 24,
            display: "flex",
            gap: 4,
          }}
        >
          <button
            onClick={() => setTab("imagenes")}
            style={{
              padding: "10px 20px",
              fontSize: ".875rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: "transparent",
              color: tab === "imagenes" ? "#f5a623" : "#888",
              borderBottom:
                tab === "imagenes"
                  ? "3px solid #f5a623"
                  : "3px solid transparent",
              transition: "color .15s, border-color .15s",
            }}
          >
            <ImageIcon
              size={14}
              style={{
                display: "inline",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            Imágenes ({imagenes.length})
          </button>

          <button
            onClick={() => setTab("videos")}
            style={{
              padding: "10px 20px",
              fontSize: ".875rem",
              fontWeight: 700,
              cursor: "pointer",
              border: "none",
              background: "transparent",
              color: tab === "videos" ? "#f5a623" : "#888",
              borderBottom:
                tab === "videos"
                  ? "3px solid #f5a623"
                  : "3px solid transparent",
              transition: "color .15s, border-color .15s",
            }}
          >
            <Video
              size={14}
              style={{
                display: "inline",
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            Videos ({videos.length})
          </button>
        </div>
        </SectionHeader>

        {tab === "imagenes" && (
          <div style={{ animation: "pm-fadein 0.2s ease" }}>
            <div
              onClick={() => imgRef.current?.click()}
              style={{
                border: "2px dashed #e0e0e0",
                borderRadius: 12,
                padding: "40px 24px",
                textAlign: "center",
                cursor: uploadingImg ? "not-allowed" : "pointer",
                background: "#fafafa",
                transition: "border-color 0.2s, background 0.2s",
                marginBottom: 24,
              }}
            >
              {uploadingImg ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Loader2
                    size={28}
                    style={{
                      color: "#f5a623",
                      animation: "pm-spin 0.8s linear infinite",
                    }}
                  />
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "#b37400",
                    }}
                  >
                    Subiendo imágenes...
                  </p>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      background: "#f0f0f0",
                      borderRadius: 99,
                      overflow: "hidden",
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: "#f5a623",
                        borderRadius: 99,
                        animation: "pm-progress 1.5s ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Upload size={28} style={{ color: "#ccc" }} />
                  <p style={{ margin: 0, fontWeight: 700, color: "#666" }}>
                    Haz clic o arrastra imágenes aquí
                  </p>
                  <p style={{ margin: 0, fontSize: ".75rem", color: "#bbb" }}>
                    PNG, JPG, WEBP · Múltiples archivos
                  </p>
                </div>
              )}

              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImgUpload}
              />
            </div>

            {imagenes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#ccc",
                }}
              >
                <ImageIcon size={36} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: ".9rem" }}>
                  Sin imágenes en la galería todavía
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 12,
                }}
              >
                {imagenes.map((img, i) => {
                  const isMain = img.url_imagenes === producto?.image_url;
                  return (
                    <div
                      key={img.id}
                      style={{
                        position: "relative",
                        borderRadius: 10,
                        overflow: "hidden",
                        border: isMain
                          ? "2px solid #f5a623"
                          : "2px solid #e0e0e0",
                        background: "#f9f9f9",
                        transition: "border-color 0.15s",
                      }}
                    >
                      {isMain && (
                        <span
                          style={{
                            position: "absolute",
                            top: 6,
                            left: 6,
                            background: "#f5a623",
                            color: "#fff",
                            fontSize: ".65rem",
                            fontWeight: 800,
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          ✓ Principal
                        </span>
                      )}

                      <span
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          background: "rgba(0,0,0,0.5)",
                          color: "#fff",
                          fontSize: ".65rem",
                          fontWeight: 800,
                          padding: "2px 7px",
                          borderRadius: 4,
                        }}
                      >
                        #{i + 1}
                      </span>

                      <img
                        src={img.url_imagenes}
                        alt=""
                        style={{
                          width: "100%",
                          aspectRatio: "1/1",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.45)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "0")
                        }
                      >
                        {!isMain && (
                          <button
                            onClick={() => setMainImage(img.url_imagenes)}
                            style={{
                              background: "#f5a623",
                              color: "#fff",
                              border: "none",
                              fontSize: ".72rem",
                              padding: "6px 12px",
                              borderRadius: 6,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            ★ Principal
                          </button>
                        )}

                        <button
                          onClick={() => deleteImagen(img.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            background: "rgba(220,53,69,0.9)",
                            color: "#fff",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: ".8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          padding: "6px 8px",
                          borderTop: "1px solid #e8e8e8",
                          background: "#fff",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            disabled={i === 0}
                            onClick={() => moverImagen(i, "arriba")}
                            style={ordenBtnStyle(i === 0)}
                            title="Mover arriba"
                          >
                            ▲
                          </button>

                          <button
                            disabled={i === imagenes.length - 1}
                            onClick={() => moverImagen(i, "abajo")}
                            style={ordenBtnStyle(i === imagenes.length - 1)}
                            title="Mover abajo"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "videos" && (
          <div style={{ animation: "pm-fadein 0.2s ease" }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                borderTop: "3px solid #6366f1",
              }}
            >
              <h3
                style={{
                  margin: "0 0 16px",
                  fontSize: ".95rem",
                  fontWeight: 700,
                  color: "#1a1a1a",
                }}
              >
                Subir nuevo video
              </h3>

              {vidError && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 8,
                    fontSize: ".85rem",
                    fontWeight: 600,
                    marginBottom: 16,
                    background: "#fde8e8",
                    color: "#a71d2a",
                    border: "1px solid rgba(167,29,42,0.2)",
                  }}
                >
                  ❌ {vidError}
                </div>
              )}

              {vidSuccess && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 14px",
                    borderRadius: 8,
                    fontSize: ".85rem",
                    fontWeight: 600,
                    marginBottom: 16,
                    background: "#e8f7ee",
                    color: "#1a7a3c",
                    border: "1px solid rgba(26,122,60,0.2)",
                  }}
                >
                  ✅ Video subido y guardado correctamente.
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "end",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: ".7rem",
                      fontWeight: 700,
                      color: "#aaa",
                      marginBottom: 5,
                      textTransform: "uppercase",
                      letterSpacing: ".06em",
                    }}
                  >
                    Título del video (opcional)
                  </label>

                  <input
                    placeholder="Ej: Demostración del producto"
                    value={videoTitulo}
                    onChange={(e) => setVideoTitulo(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #e0e0e0",
                      borderRadius: 8,
                      fontSize: ".875rem",
                      background: "#fff",
                      color: "#1a1a1a",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  disabled={uploadingVid}
                  onClick={() => {
                    setVidError(null);
                    vidRef.current?.click();
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    background: uploadingVid ? "#ccc" : "#f5a623",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: ".875rem",
                    cursor: uploadingVid ? "not-allowed" : "pointer",
                  }}
                >
                  {uploadingVid ? (
                    <>
                      <Loader2
                        size={15}
                        style={{ animation: "pm-spin 0.8s linear infinite" }}
                      />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={15} />
                      Subir video
                    </>
                  )}
                </button>

                <input
                  ref={vidRef}
                  type="file"
                  accept="video/*"
                  style={{ display: "none" }}
                  onChange={handleVidUpload}
                />
              </div>

              {uploadingVid && (
                <div
                  style={{
                    width: "100%",
                    height: 6,
                    background: "#f0f0f0",
                    borderRadius: 99,
                    overflow: "hidden",
                    marginTop: 12,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "#f5a623",
                      borderRadius: 99,
                      animation: "pm-progress 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              )}

              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: ".75rem",
                  color: "#aaa",
                }}
              >
                Formatos: MP4, MOV, AVI, WEBM · Máximo 100 MB
              </p>
            </div>

            {videos.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "#ccc",
                }}
              >
                <Video size={36} style={{ marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: ".9rem" }}>
                  Sin videos para este producto
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {videos.map((v, i) => (
                  <div
                    key={v.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "#fff",
                      border: "1px solid #e8e8e8",
                      borderRadius: 10,
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      <button
                        disabled={i === 0}
                        onClick={() => moverVideo(i, "arriba")}
                        style={ordenBtnStyle(i === 0)}
                        title="Subir"
                      >
                        ▲
                      </button>

                      <button
                        disabled={i === videos.length - 1}
                        onClick={() => moverVideo(i, "abajo")}
                        style={ordenBtnStyle(i === videos.length - 1)}
                        title="Bajar"
                      >
                        ▼
                      </button>
                    </div>

                    <video
                      src={v.video_url ?? ""}
                      controls
                      style={{
                        width: 120,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 8,
                        background: "#000",
                        flexShrink: 0,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontWeight: 700,
                          fontSize: ".875rem",
                          color: "#1a1a1a",
                        }}
                      >
                        {v.titulo || (
                          <span
                            style={{
                              color: "#ccc",
                              fontWeight: 400,
                            }}
                          >
                            Sin título
                          </span>
                        )}
                      </p>

                      <p
                        style={{
                          margin: 0,
                          fontSize: ".75rem",
                          color: "#aaa",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {v.video_url}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteVideo(v.id)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: "rgba(220,53,69,0.07)",
                        color: "#dc3545",
                        border: "1px solid rgba(220,53,69,0.2)",
                        padding: "5px 12px",
                        borderRadius: 6,
                        fontSize: ".8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pm-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pm-progress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
        @keyframes pm-fadein {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
