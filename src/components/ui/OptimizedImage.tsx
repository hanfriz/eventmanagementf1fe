import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill,
  sizes,
  priority,
  fallbackSrc = "/images/placeholder-event.jpg",
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Handle image error by falling back to unoptimized img tag
  const handleError = () => {
    setHasError(true);
    setImgSrc(fallbackSrc);
  };

  // List of trusted domains that we want to optimize with Next.js Image
  const trustedDomains = [
    "images.unsplash.com",
    "via.placeholder.com",
    "res.cloudinary.com",
    "jadwalkajian.com",
  ];

  // For maximum compatibility, use regular img tag for all external URLs
  // except for specifically trusted domains
  const shouldUseNextImage = src.startsWith("http")
    ? trustedDomains.some((domain) => src.includes(domain))
    : true; // Relative URLs are always safe

  if (hasError || (src.startsWith("http") && !shouldUseNextImage)) {
    const imgClassName = fill
      ? `${className || ""} object-cover w-full h-full`.trim()
      : className;

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={imgClassName}
        onError={() => setImgSrc(fallbackSrc)}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={handleError}
    />
  );
}
