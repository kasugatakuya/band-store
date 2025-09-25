import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">All Products</h1>
      <ProductGrid products={products} />
    </div>
  )
}