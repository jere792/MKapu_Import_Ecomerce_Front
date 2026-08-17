import Link from "next/link";

export default function SubNavbar() {
  return (
    <div className="hidden md:flex md:sticky md:top-[67px] z-[99] bg-[#1e1e1e] border-b-[3px] border-[#f5a623] border-t border-[#f5a623] justify-center items-stretch w-full min-h-[42px]">
      <div className="flex items-stretch w-full max-w-[1000px]">
        <Link href="/" className="group flex-1 flex items-center justify-center px-6 py-3 no-underline bg-[#1e1e1e] border-r-2 border-[#2e2e2e] transition-colors min-w-0 last:border-r-0 hover:bg-[#282828]">
          <span className="text-[0.8rem] font-bold text-[#cccccc] tracking-[0.1em] uppercase transition-colors whitespace-nowrap group-hover:text-[#f5a623]">Home</span>
        </Link>
        <Link href="/productos" className="group flex-1 flex items-center justify-center px-6 py-3 no-underline bg-[#1e1e1e] border-r-2 border-[#2e2e2e] transition-colors min-w-0 last:border-r-0 hover:bg-[#282828]">
          <span className="text-[0.8rem] font-bold text-[#cccccc] tracking-[0.1em] uppercase transition-colors whitespace-nowrap group-hover:text-[#f5a623]">Catálogo</span>
        </Link>
        <Link href="/blog" className="group flex-1 flex items-center justify-center px-6 py-3 no-underline bg-[#1e1e1e] border-r-2 border-[#2e2e2e] transition-colors min-w-0 last:border-r-0 hover:bg-[#282828]">
          <span className="text-[0.8rem] font-bold text-[#cccccc] tracking-[0.1em] uppercase transition-colors whitespace-nowrap group-hover:text-[#f5a623]">Blog</span>
        </Link>
        <Link href="/quienes-somos" className="group flex-1 flex items-center justify-center px-6 py-3 no-underline bg-[#1e1e1e] border-r-2 border-[#2e2e2e] transition-colors min-w-0 last:border-r-0 hover:bg-[#282828]">
          <span className="text-[0.8rem] font-bold text-[#cccccc] tracking-[0.1em] uppercase transition-colors whitespace-nowrap group-hover:text-[#f5a623]">Quiénes Somos</span>
        </Link>
        <Link href="/contacto" className="group flex-1 flex items-center justify-center px-6 py-3 no-underline bg-[#1e1e1e] border-r-2 border-[#2e2e2e] transition-colors min-w-0 last:border-r-0 hover:bg-[#282828]">
          <span className="text-[0.8rem] font-bold text-[#cccccc] tracking-[0.1em] uppercase transition-colors whitespace-nowrap group-hover:text-[#f5a623]">Contacto</span>
        </Link>
      </div>
    </div>
  );
}