import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { formatEventDateOnly, formatEventTime } from '../utils/dateUtils';

interface EventCardProps {
  event: Event;
  onFavorite?: () => void;
  isFavorite?: boolean;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onFavorite, 
  isFavorite, 
  onDelete, 
  onEdit,
  showActions = false 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Cultura: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    Música: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    Gastronomía: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    Arte: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    Deporte: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    Religioso: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  };

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  };

  const categoryStyle = getCategoryStyle(event.category);

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100">
        <div className="relative aspect-[4/3] overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
            </div>
          )}
          
          {event.images && event.images[0] && !imageError ? (
            <img
              src={event.images[0]}
              alt={event.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-4xl text-gray-300">📷</span>
            </div>
          )}
          
          {/* Favorite Button */}
          {onFavorite && (
            <button
              onClick={onFavorite}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                isFavorite 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/80 text-gray-400 hover:bg-white'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          
          {/* Category Badge */}
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border}`}>
              {event.category}
            </span>
          </div>
          
          {/* Featured Badge */}
          {event.isFeatured && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Destacado</span>
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-base font-semibold text-gray-800 line-clamp-1 mb-1">
          {event.name || 'Sin nombre'}
        </h3>
        
        {/* Description */}
        <p className="text-gray-500 text-xs line-clamp-2 mb-3 leading-relaxed">
          {event.description || 'Sin descripción'}
        </p>
        
        {/* Date and Location */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {formatEventDateOnly(event.startDate)} • {formatEventTime(event.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.address || 'Sin dirección'}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 bg-gray-900 text-white text-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Ver detalles
          </Link>
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  Editar
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;