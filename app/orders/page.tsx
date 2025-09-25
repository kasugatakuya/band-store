import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default async function OrdersPage() {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '保留中'
      case 'PROCESSING':
        return '処理中'
      case 'SHIPPED':
        return '出荷済み'
      case 'DELIVERED':
        return '配送完了'
      case 'CANCELLED':
        return 'キャンセル済み'
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">注文履歴</h1>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">まだ注文がありません。</p>
            <a 
              href="/products" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              商品を見る
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      注文 #{order.id.slice(-8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    <p className="text-lg font-bold mt-1">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      {item.product.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">
                          数量: {item.quantity}個 × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}