export type AnyProduct = any;

export type PromocionesMap = Record<
  number,
  { tipo_descuento: string; valor_descuento: number }
>;

export function toCarouselProduct(p: AnyProduct) {
  return {
    ...p,
    imageUrl: p.image_url ?? "",
    pricemCaja: p.price_caja ?? undefined,
    unidadcaja: p.unidad_caja ?? undefined,
    priceMayorista: p.price_mayorista ?? undefined,
    unidadMayorista: p.unidad_mayorista ?? undefined,
    description: p.description ?? "",
    featured: p.featured ?? false,
  };
}