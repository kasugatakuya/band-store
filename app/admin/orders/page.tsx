import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { OrderStatusForm } from '@/components/OrderStatusForm'

export default async function AdminOrdersPage() {
  const session = await auth()
  
  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })

  if (user?.role !== 'ADMIN') {
    redirect('/')
  }

  let orders = []
  
  try {
    orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
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
    
    // デバッグ用：注文データの価格をコンソールに出力
    orders.forEach(order => {
      console.log(`注文 ${order.id}: total=${order.total}`)
      order.items.forEach(item => {
        console.log(`  アイテム ${item.id}: price=${item.price}, product.price=${item.product.price}`)
      })
    })
    
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">注文管理</h1>
        <Link href="/admin">
          <Button variant="outline">
            管理者ページに戻る
          </Button>
        </Link>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">注文がありません。</p>
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
                      お客様: {order.user.name || order.user.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      注文日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-lg font-bold mt-1">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">注文商品:</h4>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div className="flex items-center space-x-3">
                            {item.product.image && (
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.quantity}個 × {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {order.shippingAddress && (
                    <div>
                      <h4 className="font-semibold mb-2">配送先住所:</h4>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <pre>{JSON.stringify(order.shippingAddress, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <OrderStatusForm orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

