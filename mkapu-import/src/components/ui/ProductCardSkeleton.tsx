"use client";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-white border border-[#ede8e1] rounded-[14px] overflow-hidden animate-[skeletonPulse_1.4s_ease-in-out_infinite]">
      <div className="aspect-square bg-[#f3ede5]" />
      <div className="p-3 flex flex-col gap-2.5">
        <div className="h-3.5 bg-[#f0ebe4] rounded-full w-[45%]" />
        <div className="h-3.5 bg-[#f5f0ea] rounded-full w-full" />
        <div className="h-3 bg-[#f5f0ea] rounded-full w-[60%]" />
      </div>
      <style>{`@keyframes skeletonPulse{0%,100%{opacity:1}50%{opacity:.6}} @media(prefers-reduced-motion:reduce){.animate-\\[skeletonPulse_1\\.4s_ease-in-out_infinite\\]{animation:none!important}}`}</style>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 max-[768px]:grid-cols-[repeat(auto-fill,minmax(155px,1fr))]">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
