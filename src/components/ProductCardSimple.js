'use client';

import Image from 'next/image';
import Link from 'next/link';

const shimmer = (w, h) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f6f7f8" offset="20%" />
      <stop stop-color="#edeef1" offset="50%" />
      <stop stop-color="#f6f7f8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f6f7f8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function ProductCardSimple({ product }) {
  const { name, images, price, permalink } = product;
  const mainImage = images[0];
  
  if (!mainImage) {
    return null;
  }

  const imageWidth = 800;
  const imageHeight = 800;
  const devPermalink = permalink.replace('woo.groovygallerydesigns.com', 'dev.groovygallerydesigns.com');
  
  return (
    <Link href={devPermalink} className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square">
        <Image
          src={mainImage.src}
          alt={mainImage.alt || name}
          width={imageWidth}
          height={imageHeight}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          priority={false}
          quality={75}
          placeholder="blur"
          blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(imageWidth, imageHeight))}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
      </div>
      
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-black hover:text-blue-600">
          {name}
        </h2>
        
        <div className="flex items-center">
          <span className="text-black" style={{marginRight: '-7px'}}>$</span>
          <span className="text-black font-bold">{price}</span>
        </div>
      </div>
    </Link>
  );
}
