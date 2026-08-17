import Link from "next/link";
import Carousel from "@/components/carousel";
import { AnyProduct, PromocionesMap, toCarouselProduct } from "../types";

export default function NuevosProductosHome({
  products,
  promocionesMap,
}: {
  products: AnyProduct[];
  promocionesMap: PromocionesMap;
}) {
  return (
    <section className="bg-[#111] px-6 py-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-2">
            Recién llegados
          </span>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.02em] mb-2 text-white">
            Nuevos Productos
          </h2>
          <p className="text-[0.92rem] leading-relaxed max-w-[480px] mx-auto text-[#888]">
            Los últimos equipos que acaban de llegar al catálogo.
          </p>
        </div>
        <Carousel
          products={products.map(toCarouselProduct)}
          title=""
          promocionesMap={promocionesMap}
        />
        <div className="text-center mt-6">
          <Link
            href="/productos?new=true"
            className="text-[0.88rem] font-bold text-brand no-underline border-b-2 border-transparent hover:border-brand transition-colors"
          >
            Ver todos →
          </Link>
        </div>
      </div>
    </section>
  );
}