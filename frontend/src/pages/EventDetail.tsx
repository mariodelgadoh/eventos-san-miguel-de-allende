import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventService, commentService, favoriteService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Event, Comment } from '../types';
import { formatEventDateRange } from '../utils/dateUtils';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isOrganizer } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchComments();
      if (user) {
        checkFavorite();
      }
    }
  }, [id, user]);

  // Auto-play del carrusel
  useEffect(() => {
    if (!event?.images || event.images.length <= 1 || !isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % event.images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [event?.images, isAutoPlaying]);

  const fetchEvent = async () => {
    try {
      const data = await eventService.getEventById(id!);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(id!);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const checkFavorite = async () => {
    try {
      const favorites = await favoriteService.getFavorites();
      setIsFavorite(favorites.some(f => f.event._id === id));
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      alert('Inicia sesión para guardar favoritos');
      return;
    }
    
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(id!);
        setIsFavorite(false);
      } else {
        await favoriteService.addFavorite(id!);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Inicia sesión para comentar');
      return;
    }
    
    try {
      await commentService.addComment(id!, newComment, rating);
      setNewComment('');
      setRating(5);
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await eventService.deleteEvent(id!);
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const openLightbox = (index: number) => {
    setIsAutoPlaying(false);
    setLightboxIndex(index);
    setSelectedImage(event?.images[index] || null);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setIsAutoPlaying(true);
  };

  const lightboxNextImage = () => {
    if (event?.images && lightboxIndex < event.images.length - 1) {
      const newIndex = lightboxIndex + 1;
      setLightboxIndex(newIndex);
      setSelectedImage(event.images[newIndex]);
    } else if (event?.images) {
      const newIndex = 0;
      setLightboxIndex(newIndex);
      setSelectedImage(event.images[newIndex]);
    }
  };

  const lightboxPrevImage = () => {
    if (event?.images && lightboxIndex > 0) {
      const newIndex = lightboxIndex - 1;
      setLightboxIndex(newIndex);
      setSelectedImage(event.images[newIndex]);
    } else if (event?.images) {
      const newIndex = event.images.length - 1;
      setLightboxIndex(newIndex);
      setSelectedImage(event.images[newIndex]);
    }
  };

  const goToImage = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentImageIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
        <p className="mt-4 text-gray-400 text-sm">Cargando evento...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📷</div>
          <h1 className="text-xl font-medium text-gray-800 mb-2">Evento no encontrado</h1>
          <p className="text-gray-500 text-sm mb-6">El evento que buscas no existe o fue eliminado</p>
          <button
            onClick={() => navigate('/events')}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Ver todos los eventos
          </button>
        </div>
      </div>
    );
  }

  const categoryIcons: Record<string, string> = {
    Cultura: '🎭',
    Música: '🎵',
    Gastronomía: '🍽️',
    Arte: '🎨',
    Deporte: '⚽',
    Religioso: '⛪',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Imagen principal y encabezado con carrusel automático */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden mb-6">
          {event.images && event.images.length > 0 ? (
            <div className="relative">
              {/* Imagen principal */}
              <div className="relative">
                <img 
                  src={event.images[currentImageIndex]} 
                  alt={event.name}
                  className="w-full h-96 object-cover cursor-pointer transition-opacity duration-500"
                  onClick={() => openLightbox(currentImageIndex)}
                />
                
                <button
                  onClick={handleFavorite}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-xl hover:bg-white transition"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
              </div>
              
              {/* Indicadores de posición */}
              {event.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0">
                  <div className="flex gap-2 justify-center">
                    {event.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToImage(idx)}
                        className={`transition-all duration-300 rounded-full ${
                          idx === currentImageIndex 
                            ? 'w-6 h-1.5 bg-white' 
                            : 'w-3 h-1.5 bg-white/50 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 bg-gray-100 flex items-center justify-center relative">
              <span className="text-6xl opacity-30">{categoryIcons[event.category]}</span>
              <button
                onClick={handleFavorite}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center text-xl hover:bg-white transition"
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {event.category}
              </span>
              {event.isFeatured && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                  Destacado
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-light text-gray-800 mb-4">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Fecha y hora</p>
                  <p className="text-sm text-gray-800">{formatEventDateRange(event.startDate, event.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="text-sm text-gray-800">{event.address}</p>
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${event.coordinates.lat}&mlon=${event.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver en mapa →
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Organizador</p>
                  <p className="text-sm text-gray-800">{event.organizer?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs text-gray-500">Coordenadas</p>
                  <p className="text-xs text-gray-600">
                    {event.coordinates.lat}, {event.coordinates.lng}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-800 mb-3">Descripción</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
            
            {(isAdmin || (isOrganizer && event.organizer?._id === user?._id)) && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => navigate(`/edit-event/${event._id}`)}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Editar evento
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
                >
                  Eliminar evento
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Comentarios */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">
              Comentarios ({comments.length})
            </h2>
          </div>
          
          <div className="p-6">
            {user ? (
              <form onSubmit={handleAddComment} className="mb-8 bg-gray-50 p-5 rounded-lg">
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Tu calificación</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="text-2xl transition"
                      >
                        <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition bg-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Publicar comentario
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 p-5 rounded-lg text-center mb-8">
                <p className="text-gray-500 text-sm">Inicia sesión para dejar un comentario</p>
              </div>
            )}
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {comment.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{comment.user.name}</span>
                        </div>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < comment.rating ? 'text-yellow-500' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {format(new Date(comment.createdAt), "d MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No hay comentarios aún. Sé el primero en comentar</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal - CON FLECHAS MÁS OSCURAS */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative max-w-6xl max-h-screen p-4">
            <img 
              src={selectedImage} 
              alt="Vista ampliada"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-xl hover:bg-black/80 transition-all duration-300 hover:scale-110"
            >
              ✕
            </button>
            
            {event.images && event.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxPrevImage();
                  }}
                  disabled={lightboxIndex === 0}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-2xl transition-all duration-300 hover:bg-black/80 hover:scale-110 ${
                    lightboxIndex === 0 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    lightboxNextImage();
                  }}
                  disabled={lightboxIndex === event.images.length - 1}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-2xl transition-all duration-300 hover:bg-black/80 hover:scale-110 ${
                    lightboxIndex === event.images.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Indicadores de posición */}
            {event.images && event.images.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                {event.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxIndex(idx);
                      setSelectedImage(event.images[idx]);
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      idx === lightboxIndex 
                        ? 'w-8 h-1.5 bg-white' 
                        : 'w-4 h-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Contador de imágenes */}
            {event.images && event.images.length > 1 && (
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium">
                {lightboxIndex + 1} / {event.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;