import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const categoryColors: Record<string, string> = {
    Cultura: 'bg-purple-100 text-purple-800',
    Música: 'bg-green-100 text-green-800',
    Gastronomía: 'bg-red-100 text-red-800',
    Arte: 'bg-yellow-100 text-yellow-800',
    Deporte: 'bg-blue-100 text-blue-800',
  };

  const categoryIcons: Record<string, string> = {
    Cultura: '🎭',
    Música: '🎵',
    Gastronomía: '🍽️',
    Arte: '🎨',
    Deporte: '⚽',
  };

  // Función segura para formatear fecha
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        {event.images && event.images[0] ? (
          <img
            src={event.images[0]}
            alt={event.name}
            className="w-full h-40 sm:h-48 object-cover"
          />
        ) : (
          <div className="w-full h-40 sm:h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-4xl">{categoryIcons[event.category]}</span>
          </div>
        )}
        {onFavorite && (
          <button
            onClick={onFavorite}
            className={`absolute top-2 right-2 text-2xl transition transform hover:scale-110 bg-white bg-opacity-80 rounded-full p-1.5 shadow-md ${
              isFavorite ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      
      <div className="p-3 sm:p-4 md:p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 line-clamp-1 flex-1">
            {event.name || 'Sin nombre'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-2 line-clamp-2 text-xs sm:text-sm">
          {event.description || 'Sin descripción'}
        </p>
        
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${categoryColors[event.category] || 'bg-gray-100 text-gray-800'}`}>
            {categoryIcons[event.category] || '📌'} {event.category || 'General'}
          </span>
          {event.isFeatured && (
            <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              ⭐ Destacado
            </span>
          )}
        </div>
        
        <div className="space-y-1 text-xs sm:text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            <span>📅</span>
            <span className="text-xs sm:text-sm">
              {formatDate(event.date)}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span>📍</span>
            <span className="truncate text-xs sm:text-sm">{event.address || 'Sin dirección'}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 bg-blue-600 text-white text-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition font-medium text-xs sm:text-sm"
          >
            Ver detalles
          </Link>
          {showActions && (
            <>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition text-xs sm:text-sm"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-xs sm:text-sm"
                >
                  🗑️
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;