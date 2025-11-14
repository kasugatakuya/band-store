export type ProductType = 'CD' | 'CLOTHING' | 'GOODS'

export interface ShippingAddress {
  zipCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2?: string
  phone?: string
  name?: string
}

export interface Product {
  id: string
  name: string
  description?: string | null
  price: number
  image?: string | null
  type: ProductType
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  product: Product
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product: Product
  quantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  stripePaymentId?: string | null
  shippingAddress: ShippingAddress
  createdAt: Date
  updatedAt: Date
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'