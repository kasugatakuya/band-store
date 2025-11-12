import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/types/product'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader className="p-0">
            {product.image ? (
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
            ) : (
              <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
                <span className="text-gray-400">画像なし</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {product.type === 'ALBUM' ? 'アルバム' : 'Tシャツ'}
            </p>
            {product.description && (
              <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
            )}
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <span className="text-xl font-bold">¥{product.price.toLocaleString('ja-JP')}</span>
            <Link href={`/products/${product.id}`}>
              <Button>詳細を見る</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}