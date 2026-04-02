"use client";

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { buildSupabaseImageUrl } from "@/lib/image-utils"

// ─── Types ───────────────────────────────────────────────────

interface BaseProps {
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
  loadTimeout?: number // Timeout in milliseconds (default: 10000ms = 10s)
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
const DEFAULT_TIMEOUT = 10000 // 10 seconds

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
  const { alt, className, priority = false, sizes, loadTimeout = DEFAULT_TIMEOUT } = props

  const initialSrc = resolveImageSrc(props)
  const [src, setSrc] = useState(initialSrc)
  const [isLoading, setIsLoading] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasLoadedRef = useRef(false)

  // React to prop changes
  useEffect(() => {
    if (src !== initialSrc && src !== FALLBACK_URL) {
      setSrc(initialSrc)
      setIsLoading(true)
      hasLoadedRef.current = false
    }
  }, [initialSrc, src])

  // Set timeout for image loading
  useEffect(() => {
    // Skip timeout if already using fallback or if image already loaded
    if (src === FALLBACK_URL || hasLoadedRef.current) {
      return
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (isLoading && !hasLoadedRef.current) {
        console.warn(`[ImageWithFallback] Image load timeout after ${loadTimeout}ms:`, src)
        setSrc(FALLBACK_URL)
        setIsLoading(false)
      }
    }, loadTimeout)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src, isLoading, loadTimeout])

  const handleError = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (src !== FALLBACK_URL) {
      console.warn('[ImageWithFallback] Image load error:', src)
      setSrc(FALLBACK_URL)
    }
    setIsLoading(false)
  }

  const handleLoad = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    hasLoadedRef.current = true
    setIsLoading(false)
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
        onLoad={handleLoad}
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
      onLoad={handleLoad}
      priority={priority}
    />
  )
}
