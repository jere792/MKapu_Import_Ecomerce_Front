"use client";

export default function BlogPage() {
  const posts = [
    {
      slug: "importacion-equipos-gastronomicos",
      title: "¿Por qué importar equipos gastronómicos directamente?",
      date: "15 de abril, 2026",
      category: "Importación",
      excerpt:
        "Descubre las ventajas de importar directamente desde el fabricante y cómo MKapu Import te garantiza los mejores precios del mercado peruano.",
    },
    {
      slug: "guia-freidoras-aire",
      title: "Guía completa para elegir tu freidora de aire",
      date: "10 de abril, 2026",
      category: "Guías",
      excerpt:
        "Comparamos las mejores freidoras de aire disponibles: capacidad, potencia, funciones y cuál es la ideal para tu negocio o hogar.",
    },
    {
      slug: "hornos-conveccion-negocios",
      title: "Hornos de convección: la mejor inversión para tu negocio",
      date: "3 de abril, 2026",
      category: "Equipos",
      excerpt:
        "Un horno de convección puede transformar tu cocina profesional. Te explicamos qué modelos ofrece MKapu Import y sus características clave.",
    },
    {
      slug: "maquinas-hielo-hosteleria",
      title: "Máquinas de hielo: qué considerar antes de comprar",
      date: "25 de marzo, 2026",
      category: "Guías",
      excerpt:
        "Producción diaria, tipo de hielo, consumo eléctrico y mantenimiento: todo lo que necesitas saber para elegir la máquina de hielo correcta.",
    },
    {
      slug: "equipos-refrigeracion-comercial",
      title: "Refrigeración comercial: diferencias entre modelos",
      date: "18 de marzo, 2026",
      category: "Equipos",
      excerpt:
        "Repasamos las diferencias entre refrigeradoras verticales, horizontales y vitrinas de frío para ayudarte a tomar la mejor decisión.",
    },
    {
      slug: "cuidado-equipos-cocina",
      title: "Cómo mantener tus equipos de cocina en perfecto estado",
      date: "10 de marzo, 2026",
      category: "Mantenimiento",
      excerpt:
        "Consejos prácticos de limpieza y mantenimiento para prolongar la vida útil de tus electrodomésticos y equipos de cocina profesional.",
    },
  ];

  const categoryColors: Record<string, string> = {
    Importación: "#f5a623",
    Guías: "#3b82f6",
    Equipos: "#10b981",
    Mantenimiento: "#8b5cf6",
  };

  return (
    <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
      {/* HERO */}
      <section
        style={{
          background: "#1a1a1a",
          borderBottom: "3px solid #f5a623",
          padding: "3.5rem 1.5rem 3rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#f5a623",
            marginBottom: "0.75rem",
          }}
        >
          Blog MKapu Import
        </p>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 900,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}
        >
          Noticias, guías y consejos
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "#999",
            maxWidth: "520px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Todo lo que necesitas saber sobre equipos de cocina, importación y
          cómo sacarle el máximo provecho a tus productos MKapu.
        </p>
      </section>

      {/* GRID DE POSTS */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))",
            gap: "1.5rem",
          }}
        >
          {posts.map((post) => (
            <article
              key={post.slug}
              style={{
                background: "#fff",
                borderRadius: "14px",
                border: "1px solid #ede8e1",
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 32px rgba(0,0,0,0.10)";
                (e.currentTarget as HTMLElement).style.transform =
                  "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#fff",
                    background: categoryColors[post.category] ?? "#f5a623",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "99px",
                  }}
                >
                  {post.category}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#aaa" }}>{post.date}</span>
              </div>
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {post.title}
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#666", lineHeight: 1.6, margin: 0 }}>
                {post.excerpt}
              </p>
              <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.83rem",
                    fontWeight: 700,
                    color: "#f5a623",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Leer más →
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}