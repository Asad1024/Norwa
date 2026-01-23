'use client'

import { useState } from 'react'
import { Image as ImageIcon } from 'lucide-react'

interface ProductImageProps {
  imageUrl: string | null | undefined
  alt?: string
  className?: string
  containerClassName?: string
  iconSize?: 'small' | 'medium' | 'large'
  showText?: boolean
  placeholderText?: string
}

export default function ProductImage({ 
  imageUrl, 
  alt = '', 
  className = 'w-full h-full object-contain',
  containerClassName = 'w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden',
  iconSize = 'medium',
  showText = true,
  placeholderText
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false)
  const hasValidImage = imageUrl && imageUrl.trim() && !imageError

  if (hasValidImage) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={className}
        loading="lazy"
        onError={() => setImageError(true)}
      />
    )
  }

  const iconSizes = {
    small: 'w-6 h-6',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  }

  const textSizes = {
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm'
  }

  const gaps = {
    small: 'gap-1',
    medium: 'gap-2',
    large: 'gap-3'
  }

  const defaultText = iconSize === 'large' ? 'No Image Available' : 'No Image'
  const displayText = placeholderText || defaultText

  return (
    <div className={containerClassName} style={{ pointerEvents: 'none' }}>
      <div className={`flex flex-col items-center ${gaps[iconSize]}`}>
        <ImageIcon className={`${iconSizes[iconSize]} text-gray-400`} strokeWidth={1.5} />
        {showText && (
          <span className={`${textSizes[iconSize]} text-gray-400 font-medium`}>{displayText}</span>
        )}
      </div>
    </div>
  )
}
