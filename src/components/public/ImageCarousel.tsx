"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageCarouselProps {
  images: Array<{ id: number; url: string; sortOrder: number }>;
  sizes?: string;
  priority?: boolean;
}

interface ImageModalProps {
  images: Array<{ id: number; url: string; sortOrder: number }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
}

function ImageModal({ images, currentIndex, onClose, onNext, onPrev, onSelectIndex }: ImageModalProps) {
  const isSingleImage = images.length === 1;
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap implementation
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Focus the close button when modal opens
    const closeButton = modal.querySelector('button[aria-label="Close"]') as HTMLButtonElement;
    closeButton?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    return () => modal.removeEventListener('keydown', handleTab);
  }, []);

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-in fade-in zoom-in duration-300" onClick={onClose}>
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors bg-background/80 border border-border hover:border-primary rounded-sm p-2 md:p-2.5 z-10"
        aria-label="Close"
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
      <div className="relative max-w-6xl max-h-[75vh] w-full" onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-4 left-4 font-mono text-xs text-muted-foreground bg-background/80 border border-border px-2 py-1 rounded-sm">
          {isSingleImage ? '1 / 1' : `${currentIndex + 1} / ${images.length}`}
        </div>
        <Image
          src={images[currentIndex].url}
          alt="Project image"
          width={1920}
          height={1080}
          className="object-contain w-full h-full rounded-sm"
        />
        {!isSingleImage && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/80 border border-border hover:border-primary text-muted-foreground hover:text-primary p-1 md:p-1.5 transition-colors rounded-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/80 border border-border hover:border-primary text-muted-foreground hover:text-primary p-1 md:p-1.5 transition-colors rounded-sm"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}
      </div>
      {!isSingleImage && (
        <div className="mt-4 sm:mt-6 flex gap-3 overflow-x-auto max-w-6xl w-full px-4 pb-2 justify-center scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50 touch-pan-x" style={{ scrollBehavior: 'smooth' }} onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => onSelectIndex(idx)}
              className={`shrink-0 relative w-12 h-8 md:w-20 md:h-14 rounded-sm overflow-hidden transition-all duration-300 hover:scale-105 ${idx === currentIndex ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : 'opacity-40 hover:opacity-100'
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
      )}
    </div>
  );
}

export default function ImageCarousel({ images, sizes = "(max-width: 768px) 100vw, 50vw", priority = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      if (e.key === "Escape") {
        setIsModalOpen(false);
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, nextImage, prevImage]);

  // Body scroll lock when modal opens
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

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
          <ImageModal
            images={images}
            currentIndex={0}
            onClose={() => setIsModalOpen(false)}
            onNext={nextImage}
            onPrev={prevImage}
            onSelectIndex={setCurrentIndex}
          />
        )}
      </>
    );
  }

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
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 bg-background/80 border border-border hover:border-primary text-muted-foreground hover:text-primary p-1 md:p-1.5 transition-colors rounded-sm"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 bg-background/80 border border-border hover:border-primary text-muted-foreground hover:text-primary p-1 md:p-1.5 transition-colors rounded-sm"
          aria-label="Next image"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
              className={`${index === currentIndex ? "w-4 h-0.5 bg-primary" : "w-2 h-0.5 bg-border"} transition-colors`}
            />
          ))}
        </div>
      </div>
      {isModalOpen && (
        <ImageModal
          images={images}
          currentIndex={currentIndex}
          onClose={() => setIsModalOpen(false)}
          onNext={nextImage}
          onPrev={prevImage}
          onSelectIndex={setCurrentIndex}
        />
      )}
    </>
  );
}
