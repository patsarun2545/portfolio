"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageCarouselProps {
  images: Array<{ id: number; url: string; sortOrder: number }>;
  sizes?: string;
  priority?: boolean;
}

export default function ImageCarousel({ images, sizes = "(max-width: 768px) 100vw, 50vw", priority = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (images.length === 0) return null;
  if (images.length === 1) {
    return (
      <>
        <div className="relative w-full aspect-4/3 sm:aspect-video cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <Image
            src={images[0].url}
            alt="Project image"
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover"
          />
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300" onClick={() => setIsModalOpen(false)}>
            <button
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all bg-black/40 hover:bg-black/60 rounded-full p-2.5 z-10 hover:scale-110"
              aria-label="Close"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <div className="relative max-w-6xl max-h-[75vh] w-full" onClick={(e) => e.stopPropagation()}>
              <Image
                src={images[0].url}
                alt="Project image"
                width={1920}
                height={1080}
                className="object-contain w-full h-full rounded-xl shadow-2xl"
              />
            </div>
            <div className="mt-4 sm:mt-6 flex gap-3 overflow-x-auto max-w-6xl w-full px-4 pb-2 justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50" onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${idx === 0 ? 'ring-2 ring-primary ring-offset-2 ring-offset-black shadow-lg' : 'opacity-60 hover:opacity-100'
                    }`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className="relative w-full aspect-4/3 sm:aspect-video cursor-pointer" onClick={() => setIsModalOpen(true)}>
        <Image
          src={images[currentIndex].url}
          alt={`Project image ${currentIndex + 1}`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
        <button
          onClick={(e) => { e.stopPropagation(); prevImage(); }}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground rounded-full p-1.5 sm:p-2 transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-background/50 hover:bg-background/70 text-foreground rounded-full p-1.5 sm:p-2 transition-colors"
          aria-label="Next image"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? "bg-foreground" : "bg-foreground/50"
                }`}
            />
          ))}
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300" onClick={() => setIsModalOpen(false)}>
          <button
            onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-all bg-black/40 hover:bg-black/60 rounded-full p-2.5 z-10 hover:scale-110"
            aria-label="Close"
          >
            <X className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <div className="relative max-w-6xl max-h-[75vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[currentIndex].url}
              alt={`Project image ${currentIndex + 1}`}
              width={1920}
              height={1080}
              className="object-contain w-full h-full rounded-xl shadow-2xl"
            />
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all hover:scale-110"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 sm:p-3 transition-all hover:scale-110"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          <div className="mt-4 sm:mt-6 flex gap-3 overflow-x-auto max-w-6xl w-full px-4 pb-2 justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50" onClick={(e) => e.stopPropagation()}>
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 ${idx === currentIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-black shadow-lg' : 'opacity-60 hover:opacity-100'
                  }`}
              >
                <Image
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
