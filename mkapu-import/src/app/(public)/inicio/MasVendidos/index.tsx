import Link from "next/link";
import Carousel from "@/components/carousel";
import { AnyProduct, PromocionesMap, toCarouselProduct } from "../types";

export default function MasVendidosHome({
  products,
  promocionesMap,
}: {
  products: AnyProduct[];
  promocionesMap: PromocionesMap;
}) {
  const featured = products.filter((p: AnyProduct) => p.featured);
  const items = featured.length > 0 ? featured : products.slice(0, 10);

  return (
    <section className="bg-[#faf8f5] px-6 py-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-8">
          <span className="inline-block text-[0.7rem] font-bold tracking-[0.1em] uppercase text-brand mb-2">
            Más vendidos
          </span>
          <h2 className="text-[clamp(1.4rem,3vw,2rem)] font-black tracking-[-0.02em] mb-2 text-[#1a1a1a]">
            Productos destacados
          </h2>
          <p className="text-[0.92rem] leading-relaxed max-w-[480px] mx-auto text-[#777]">
            Los equipos más solicitados por restaurantes y hoteles de Lima.
          </p>
        </div>
        <Carousel
          products={items.map(toCarouselProduct)}
          title=""
          promocionesMap={promocionesMap}
        />
        <div className="text-center mt-6">
          <Link
            href="/productos"
            className="text-[0.88rem] font-bold text-brand no-underline border-b-2 border-transparent hover:border-brand transition-colors"
          >
            Ver todos →
          </Link>
        </div>
      </div>
    </section>
  );
}