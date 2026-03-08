"use client";

import Image from "next/image"
import { useState } from "react"
import { buildSupabaseImageUrl } from "@/lib/image-utils"

interface Props {
  imagePath: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function ImageWithFallback({
  imagePath,
  alt,
  width,
  height,
  className,
  priority = false
}: Props) {

  // Resolve base urls
  const supabaseUrl = buildSupabaseImageUrl(imagePath, width)
  
  // Universal fallback to placeholder, ignoring old fallback structures
  const fallbackUrl = '/linux-placeholder.webp';

  const initialSrc = supabaseUrl || fallbackUrl;
  const [src, setSrc] = useState(initialSrc);
  
  // React to prop changes directly in render to avoid effect lag parsing
  if (src !== initialSrc && src !== fallbackUrl) {
    setSrc(initialSrc);
  }

  const handleError = () => {
    if (src !== fallbackUrl) {
      setSrc(fallbackUrl)
    }
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain bg-[#1E1E1E] ${className || ''}`}
      sizes="(max-width: 768px) 100vw,
             (max-width: 1200px) 50vw,
             33vw"
      onError={handleError}
      priority={priority}
    />
  )
}
