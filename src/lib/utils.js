import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const defaultProductSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#1f2937" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
    </defs>
    <rect width="800" height="1000" fill="url(#bg)" rx="28" />
    <rect x="60" y="60" width="680" height="880" rx="24" fill="rgba(255,255,255,0.03)" stroke="rgba(251,191,36,0.45)" stroke-width="4" />
    <text x="400" y="420" text-anchor="middle" fill="#fbbf24" font-size="78" font-family="Georgia, serif" letter-spacing="8">REVA</text>
    <text x="400" y="500" text-anchor="middle" fill="#f8fafc" font-size="34" font-family="Arial, sans-serif" letter-spacing="4">DEFAULT PRODUCT IMAGE</text>
  </svg>`;

export const DEFAULT_PRODUCT_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(defaultProductSvg)}`;

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const normalizeProductImages = (images) => {
  const cleanImages = Array.isArray(images) ? images.filter(Boolean) : [];
  return cleanImages.length ? cleanImages : [DEFAULT_PRODUCT_IMAGE];
};

export const hasProductImages = (images) => Array.isArray(images) && images.some(Boolean);

export const getProductThumbnail = (product) => normalizeProductImages(product?.images)[0];

export const isIframe = window.self !== window.top;
