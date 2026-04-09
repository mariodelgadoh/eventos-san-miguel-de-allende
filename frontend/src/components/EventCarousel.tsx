import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { formatEventDateRange } from '../utils/dateUtils';

interface EventCarouselProps {
  events: Event[];
  interval?: number;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events, interval = 6000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (events.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, interval);

    return () => clearInterval(timer);
  }, [events.length, interval, isPaused]);

  if (!events.length) return null;

  const currentEvent = events[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  return (
    <div 
      className="relative w-full h-screen overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        {currentEvent.images && currentEvent.images[0] ? (
          <img
            src={currentEvent.images[0]}
            alt={currentEvent.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-600 text-6xl">📷</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      </div>

      {/* Indicadores de posición */}
      {events.length > 1 && (
        <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {events.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex 
                  ? 'w-8 md:w-10 h-0.5 bg-white' 
                  : 'w-4 md:w-6 h-0.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Contenido */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-10 text-white z-10">
        <div className="max-w-3xl mx-auto">
          {/* Categoría */}
          <div className="mb-2 md:mb-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm border border-white/20">
              {currentEvent.category}
            </span>
            {currentEvent.isFeatured && (
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 backdrop-blur-sm border border-yellow-500/30">
                Destacado
              </span>
            )}
          </div>

          {/* Título */}
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light mb-2 leading-tight">
            {currentEvent.name}
          </h2>

          {/* Fecha y ubicación */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-3 md:mb-5">
            <div className="flex items-center gap-2 text-xs md:text-sm text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatEventDateRange(currentEvent.startDate, currentEvent.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-white/70">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate max-w-[180px] sm:max-w-md">{currentEvent.address}</span>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-xs sm:text-sm md:text-base text-white/60 max-w-2xl mb-4 md:mb-6 line-clamp-2">
            {currentEvent.description}
          </p>

          {/* Botón */}
          <Link
            to={`/events/${currentEvent._id}`}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-5 md:px-7 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium hover:bg-gray-100 transition w-full sm:w-auto"
          >
            Ver detalles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Flechas de navegación - Ocultas en móvil */}
      {events.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white text-lg lg:text-xl hover:bg-white/20 transition z-20"
            aria-label="Anterior"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 transform -translate-y-1/2 w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white text-lg lg:text-xl hover:bg-white/20 transition z-20"
            aria-label="Siguiente"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default EventCarousel;