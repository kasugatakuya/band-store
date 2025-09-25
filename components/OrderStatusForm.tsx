"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface OrderStatusFormProps {
  orderId: string
  currentStatus: string
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const statuses = [
    { value: 'PENDING', label: '保留中' },
    { value: 'PROCESSING', label: '処理中' },
    { value: 'SHIPPED', label: '出荷済み' },
    { value: 'DELIVERED', label: '配送完了' },
    { value: 'CANCELLED', label: 'キャンセル済み' }
  ]
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        router.refresh()
      } else {
        console.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <select 
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-1 border rounded text-sm"
        disabled={loading}
      >
        {statuses.map(statusOption => (
          <option key={statusOption.value} value={statusOption.value}>
            {statusOption.label}
          </option>
        ))}
      </select>
      <Button 
        type="submit" 
        size="sm" 
        variant="outline"
        disabled={loading || status === currentStatus}
      >
        {loading ? '更新中...' : 'ステータス更新'}
      </Button>
    </form>
  )
}