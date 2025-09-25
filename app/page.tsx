import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/ProductGrid'

export default async function HomePage() {
  const featuredProducts = await prisma.product.findMany({
    where: { featured: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Band Store</h1>
          <p className="text-xl mb-8">Discover our latest albums and exclusive merchandise</p>
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Products</h2>
          <ProductGrid products={featuredProducts} />
        </div>
      </section>
    </div>
  )
}
