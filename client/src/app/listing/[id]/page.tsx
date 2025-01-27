import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";

function ProductDetailsPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent id={params.id} />
    </Suspense>
  );
}

export default ProductDetailsPage;
