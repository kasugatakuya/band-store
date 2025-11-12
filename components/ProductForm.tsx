"use client"

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

const productSchema = z.object({
  name: z.string().min(1, '商品名は必須です'),
  description: z.string().optional(),
  price: z.number().positive('価格は正の数である必要があります'),
  image: z.string().optional(),
  type: z.enum(['ALBUM', 'TSHIRT']),
  stock: z.number().int().nonnegative('在庫数は0以上である必要があります'),
  featured: z.boolean(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: any
  isEdit?: boolean
}

export default function ProductForm({ product, isEdit }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.image || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      image: product?.image || '',
      type: product?.type || 'ALBUM',
      stock: product?.stock || 0,
      featured: product?.featured || false,
    },
  })
  
  // 画像URLの変更を監視してプレビューを更新
  const imageUrl = watch('image')
  if (imageUrl && imageUrl !== previewUrl && !uploading) {
    setPreviewUrl(imageUrl)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '画像のアップロードに失敗しました')
      }

      const data = await response.json()
      setValue('image', data.url)
      setPreviewUrl(data.url)
    } catch (error) {
      console.error('アップロードエラー:', error)
      alert(error instanceof Error ? error.message : 'アップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'
      const method = product ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('商品の保存に失敗しました')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('商品保存エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>商品詳細</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">商品名</Label>
            <Input
              id="name"
              {...register('name')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">商品説明</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="price">価格 (¥)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price', { valueAsNumber: true })}
              className={errors.price ? 'border-red-500' : ''}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">商品画像</Label>
            
            {previewUrl && (
              <div className="relative w-32 h-32 mb-2">
                <Image
                  src={previewUrl}
                  alt="プレビュー"
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'アップロード中...' : '画像を選択'}
              </Button>
              
              <Input
                id="image"
                type="text"
                placeholder="または画像URLを入力"
                {...register('image')}
                className="flex-1"
              />
            </div>
            
            {errors.image && (
              <p className="text-red-500 text-sm">{errors.image.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type">商品タイプ</Label>
            <Select
              value={watch('type')}
              onValueChange={(value) => setValue('type', value as 'ALBUM' | 'TSHIRT')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALBUM">アルバム</SelectItem>
                <SelectItem value="TSHIRT">Tシャツ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="stock">在庫数</Label>
            <Input
              id="stock"
              type="number"
              {...register('stock', { valueAsNumber: true })}
              className={errors.stock ? 'border-red-500' : ''}
            />
            {errors.stock && (
              <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={watch('featured')}
              onCheckedChange={(checked) => setValue('featured', checked as boolean)}
            />
            <Label htmlFor="featured">注目商品</Label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : product ? '商品を更新' : '商品を作成'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/products')}
            >
              キャンセル
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}