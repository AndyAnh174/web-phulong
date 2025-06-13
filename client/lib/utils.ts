import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Utility function to ensure URLs use HTTPS protocol
 * This helps prevent Mixed Content errors when HTTPS pages try to load HTTP resources
 */
export function ensureHttps(url: string): string {
  if (!url) return url;
  
  // If URL starts with http:// (not https://), replace it with https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  return url;
}

/**
 * Process image data to ensure all URLs use HTTPS
 */
export function processImageUrls(images: any[]): any[] {
  if (!Array.isArray(images)) return images;
  
  return images.map((img: any) => ({
    ...img,
    full_url: img.full_url ? ensureHttps(img.full_url) : img.full_url,
    url: img.url ? ensureHttps(img.url) : img.url,
    image_url: img.image_url ? ensureHttps(img.image_url) : img.image_url
  }));
}
