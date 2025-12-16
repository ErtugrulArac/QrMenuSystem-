'use client';

import ProductCart from "@/components/ProductCart";
import { oneProductType } from "@/types";

interface ProductsRendererProps {
  products: oneProductType[] | undefined;
}

export default function ProductsRenderer({ products }: ProductsRendererProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      {products.map((product) => (
        <ProductCart key={product.id} products={product} />
      ))}
    </>
  );
}
