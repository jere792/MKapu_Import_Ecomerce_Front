const WHY_ITEMS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="1" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: "Directo del fabricante",
    desc: "Sin intermediarios. Precios competitivos con calidad de primera.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Soporte técnico local",
    desc: "Equipo en Lima para instalación, mantenimiento y garantía.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Despacho rápido",
    desc: "Entrega en Lima Metropolitana en 24–48 horas hábiles.",
  },
  {
    num: "04",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Asesoría personalizada",
    desc: "Te ayudamos a elegir el equipo ideal para tu negocio.",
  },
];

export default function PorQueElegirnosHome() {
  return (
    <section className="bg-[#0d0d0d] py-24 px-10 max-[600px]:px-5 max-[600px]:py-16">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-[72px]">
          <span className="inline-block text-[11px] font-medium tracking-[0.2em] uppercase text-brand mb-4">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-[clamp(32px,5vw,56px)] font-extrabold text-white leading-[1.05] max-w-[620px] [&_em]:not-italic [&_em]:text-brand">
            Importación directa,
            <br />
            <em>calidad garantizada</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 min-[481px]:grid-cols-2 lg:grid-cols-4 border border-white/8 rounded-sm">
          {WHY_ITEMS.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden p-8 md:p-10 transition-colors border-white/8 border-r border-b lg:border-b-0 lg:last:border-r-0 max-[768px]:[&:nth-child(2n)]:border-r-0 max-[480px]:border-r-0 hover:bg-[rgba(224,92,42,0.05)] before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-[#e05c2a] before:scale-x-0 before:origin-left before:transition-transform before:duration-[350ms] before:ease-[cubic-bezier(0.4,0,0.2,1)] hover:before:scale-x-100"
            >
              <div className="text-[72px] font-extrabold text-white/4 leading-none -mb-4 tracking-[-4px] transition-colors group-hover:text-[rgba(224,92,42,0.12)]">
                {item.num}
              </div>
              <div className="w-10 h-10 mb-5 flex items-center justify-center [&_svg]:w-7 [&_svg]:h-7 [&_svg]:stroke-brand [&_svg]:fill-none [&_svg]:[stroke-width:1.5] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
                {item.icon}
              </div>
              <h3 className="text-[15px] font-bold text-white mb-3 tracking-[-0.01em]">
                {item.title}
              </h3>
              <p className="text-[13.5px] text-white/45 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}