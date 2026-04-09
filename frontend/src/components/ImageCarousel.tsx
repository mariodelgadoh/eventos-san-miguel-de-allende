import React, { useState, useEffect } from 'react';

interface ImageCarouselProps {
  images: string[];
  interval?: number;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, interval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images.length) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* Imágenes */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`San Miguel de Allende ${index + 1}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          
          {/* Overlay suave para legibilidad */}
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Indicadores de progreso */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20">
          <div className="flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="group relative"
                aria-label={`Ir a imagen ${index + 1}`}
              >
                <div className={`h-0.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 bg-white' 
                    : 'w-4 bg-white/40 hover:bg-white/60'
                }`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Flechas de navegación - Ocultas en móvil */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goToSlide((currentIndex - 1 + images.length) % images.length)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Imagen anterior"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => goToSlide((currentIndex + 1) % images.length)}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
            aria-label="Imagen siguiente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;