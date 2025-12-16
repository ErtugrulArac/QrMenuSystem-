'use client';

import ProductCart from "@/components/ProductCart";
import { oneProductType } from "@/types";

interface ProductsRendererProps {
  products: oneProductType[];
}

export default function ProductsRenderer({ products }: ProductsRendererProps) {
  return (
    <>
      {products.map((product) => (
        <ProductCart key={product.id} products={product} />
      ))}
    </>
  );
}
