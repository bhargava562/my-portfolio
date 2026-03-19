"use client";

import Image from "next/image"
import { useState } from "react"
import { buildSupabaseImageUrl } from "@/lib/image-utils"

// ─── Types ───────────────────────────────────────────────────

interface BaseProps {
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}

interface FixedProps extends BaseProps {
  imagePath: string
  width: number
  height: number
  fill?: false
  src?: never
}

interface FillProps extends BaseProps {
  fill: true
  src: string
  imagePath?: never
  width?: never
  height?: never
}

type Props = FixedProps | FillProps

// ─── Constants ───────────────────────────────────────────────

const FALLBACK_URL = '/linux-placeholder.webp'

// ─── Helper ──────────────────────────────────────────────────

function resolveImageSrc(props: Props): string {
  if ('src' in props && props.src) {
    // Fill mode: src can be a full URL or a Supabase path
    const raw = props.src
    if (raw.startsWith('http') || raw.startsWith('/')) {
      return raw
    }
    // Treat as Supabase storage path
    return buildSupabaseImageUrl(raw, 800) || FALLBACK_URL
  }
  // Fixed mode: use imagePath
  if ('imagePath' in props && props.imagePath) {
    return buildSupabaseImageUrl(props.imagePath, props.width!) || FALLBACK_URL
  }
  return FALLBACK_URL
}

// ─── Component ───────────────────────────────────────────────

export function ImageWithFallback(props: Props) {
  const { alt, className, priority = false, sizes } = props

  const initialSrc = resolveImageSrc(props)
  const [src, setSrc] = useState(initialSrc)

  // React to prop changes
  if (src !== initialSrc && src !== FALLBACK_URL) {
    setSrc(initialSrc)
  }

  const handleError = () => {
    if (src !== FALLBACK_URL) {
      setSrc(FALLBACK_URL)
    }
  }

  const defaultSizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

  // Fill mode
  if (props.fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className || 'object-cover'}
        sizes={sizes || defaultSizes}
        onError={handleError}
        priority={priority}
      />
    )
  }

  // Fixed dimensions mode
  return (
    <Image
      src={src}
      alt={alt}
      width={props.width}
      height={props.height}
      className={`object-contain bg-[#1E1E1E] ${className || ''}`}
      sizes={sizes || defaultSizes}
      onError={handleError}
      priority={priority}
    />
  )
}
