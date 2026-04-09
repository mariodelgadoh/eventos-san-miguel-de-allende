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

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchComments();
      if (user) {
        checkFavorite();
      }
    }
  }, [id, user]);

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
    setCurrentImageIndex(index);
    setSelectedImage(event?.images[index] || null);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (event?.images && currentImageIndex < event.images.length - 1) {
      const newIndex = currentImageIndex + 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(event.images[newIndex]);
    }
  };

  const prevImage = () => {
    if (event?.images && currentImageIndex > 0) {
      const newIndex = currentImageIndex - 1;
      setCurrentImageIndex(newIndex);
      setSelectedImage(event.images[newIndex]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-800">Evento no encontrado</h1>
          <button
            onClick={() => navigate('/events')}
            className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition"
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

  const categoryColors: Record<string, string> = {
    Cultura: 'from-purple-500 to-pink-500',
    Música: 'from-green-500 to-emerald-500',
    Gastronomía: 'from-red-500 to-orange-500',
    Arte: 'from-yellow-500 to-amber-500',
    Deporte: 'from-blue-500 to-cyan-500',
    Religioso: 'from-indigo-500 to-purple-500',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Galería de Imágenes */}
          {event.images && event.images.length > 0 ? (
            <div className="relative">
              <div className="h-96 bg-gray-900 relative">
                <img 
                  src={event.images[0]} 
                  alt={event.name}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => openLightbox(0)}
                />
                <button
                  onClick={handleFavorite}
                  className="absolute top-4 right-4 text-4xl transition transform hover:scale-110 z-10 bg-white bg-opacity-80 rounded-full p-2 shadow-lg"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
                {event.images.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="inline-flex gap-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      1 / {event.images.length}
                    </div>
                  </div>
                )}
              </div>

              {event.images.length > 1 && (
                <div className="bg-white p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {event.images.map((img, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === index 
                            ? 'border-blue-500 shadow-lg transform scale-105' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          const heroImage = document.querySelector('.h-96 img') as HTMLImageElement;
                          if (heroImage) heroImage.src = img;
                        }}
                      >
                        <img
                          src={img}
                          alt={`${event.name} - ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`h-80 bg-gradient-to-r ${categoryColors[event.category]} relative flex items-center justify-center`}>
              <span className="text-9xl opacity-50">{categoryIcons[event.category]}</span>
              <button
                onClick={handleFavorite}
                className="absolute top-4 right-4 text-4xl transition transform hover:scale-110 z-10"
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            </div>
          )}
          
          <div className="p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${categoryColors[event.category]} text-white`}>
                {categoryIcons[event.category]} {event.category}
              </span>
              {event.isFeatured && (
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                  ⭐ Destacado
                </span>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{event.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📅</div>
                <div>
                  <p className="text-sm text-gray-500">Fecha y hora</p>
                  <p className="font-semibold text-gray-800">
                    {formatEventDateRange(event.startDate, event.endDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">📍</div>
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-semibold text-gray-800">{event.address}</p>
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${event.coordinates.lat}&mlon=${event.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver en mapa →
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">👤</div>
                <div>
                  <p className="text-sm text-gray-500">Organizador</p>
                  <p className="font-semibold text-gray-800">{event.organizer?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl">🌍</div>
                <div>
                  <p className="text-sm text-gray-500">Coordenadas</p>
                  <p className="font-mono text-sm text-gray-600">
                    {event.coordinates.lat}, {event.coordinates.lng}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📖</span> Descripción
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
            
            {(isAdmin || (isOrganizer && event.organizer?._id === user?._id)) && (
              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={() => navigate(`/edit-event/${event._id}`)}
                  className="flex-1 bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition"
                >
                  ✏️ Editar evento
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                >
                  🗑️ Eliminar evento
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="relative max-w-5xl max-h-screen p-4">
              <img 
                src={selectedImage} 
                alt="Vista ampliada"
                className="max-w-full max-h-screen object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition"
              >
                ✕
              </button>
              
              {event.images && event.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    disabled={currentImageIndex === 0}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition ${
                      currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    ❮
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    disabled={currentImageIndex === event.images.length - 1}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 transition ${
                      currentImageIndex === event.images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    ❯
                  </button>
                  
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="inline-flex gap-2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full">
                      {event.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(idx);
                            setSelectedImage(event.images[idx]);
                          }}
                          className={`w-2 h-2 rounded-full transition ${
                            idx === currentImageIndex ? 'bg-white w-4' : 'bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>💬</span> Comentarios y Reseñas
            <span className="text-sm text-gray-500 ml-2">({comments.length})</span>
          </h2>
          
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8 bg-gray-50 p-6 rounded-xl">
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Tu calificación:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-3xl transition transform hover:scale-110"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition"
              >
                Publicar comentario
              </button>
            </form>
          ) : (
            <div className="bg-blue-50 p-6 rounded-xl text-center mb-8">
              <p className="text-blue-800">🔐 Inicia sesión para dejar un comentario</p>
            </div>
          )}
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment._id} className="border-b border-gray-200 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-gray-800">{comment.user.name}</span>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < comment.rating ? 'text-yellow-500' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(comment.createdAt), "d MMM yyyy", { locale: es })}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">💭</div>
                <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;