export const dynamic = "force-static";
export const revalidate = 300;

import { getProductos, getProductosNuevos, getBanners, getPromocionesActivasMap } from "@/lib/queries";
import HeroHome from "./inicio/Hero";
import MasVendidosHome from "./inicio/MasVendidos";
import NuevosProductosHome from "./inicio/NuevosProductos";
import MarcasHome from "./inicio/Marcas";
import MapaHome from "./inicio/Mapa";
import SeccionesHome from "./inicio/Secciones";
import PorQueElegirnosHome from "./inicio/PorQueElegirnos";
import ColaboradoresHome from "./inicio/Colaboradores";
import VideoHome from "./inicio/Video";

export default async function HomePage() {
  const [products, nuevos, banners, promocionesMap] = await Promise.all([
    getProductos(),
    getProductosNuevos(),
    getBanners(),
    getPromocionesActivasMap(),
  ]);

  return (
    <div className="overflow-x-hidden">
      <HeroHome initialBanners={banners} />
      <MasVendidosHome products={products} promocionesMap={promocionesMap} />
      <NuevosProductosHome products={nuevos} promocionesMap={promocionesMap} />
      <MarcasHome />
      <MapaHome />
      <SeccionesHome />
      <PorQueElegirnosHome />
      <ColaboradoresHome />
      <VideoHome />
    </div>
  );
}