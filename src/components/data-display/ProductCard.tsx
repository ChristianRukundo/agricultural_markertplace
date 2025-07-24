"use client"

import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"
import { Avatar } from "@/components/ui/Avatar"
import Link from "next/link"

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    farmer: {
      id: string
      name: string
      avatar?: string
      location: string
    }
    category: string
    rating: number
    reviewCount: number
    inStock: boolean
  }
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const handleMouseEnter = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: -8,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out",
    })
    gsap.to(imageRef.current, {
      scale: 1.1,
      duration: 0.5,
      ease: "power2.out",
    })
  })

  const handleMouseLeave = contextSafe(() => {
    gsap.to(cardRef.current, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    })
    gsap.to(imageRef.current, {
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
    })
  })

  const handleAddToCart = contextSafe(() => {
    const button = cardRef.current?.querySelector("[data-cart-button]")
    if (button) {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
      })
    }
    onAddToCart?.(product.id)
  })

  return (
    <Card
      ref={cardRef}
      className="group cursor-pointer overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48 overflow-hidden">
          <div
            ref={imageRef}
            className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
            style={{
              backgroundImage: product.images[0] ? `url(${product.images[0]})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="error">Out of Stock</Badge>
            </div>
          )}
          <Badge variant="info" className="absolute top-3 left-3">
            {product.category}
          </Badge>
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} size="sm" readonly />
          <span className="text-sm text-gray-500 dark:text-gray-400">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2">
          <Avatar src={product.farmer.avatar} alt={product.farmer.name} size="sm" />
          <div className="flex-1 min-w-0">
            <Link href={`/farmers/${product.farmer.id}`}>
              <p className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 truncate">
                {product.farmer.name}
              </p>
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.farmer.location}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {new Intl.NumberFormat("en-RW", {
              style: "currency",
              currency: "RWF",
            }).format(product.price)}
          </div>
          <Button
            data-cart-button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="min-w-[100px]"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  )
}
