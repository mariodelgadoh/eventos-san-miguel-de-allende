import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { favoriteService } from '../services/api';
import { Favorite } from '../types';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (eventId: string) => {
    try {
      await favoriteService.removeFavorite(eventId);
      setFavorites(favorites.filter(f => f.event._id !== eventId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
        <p className="mt-4 text-gray-400 text-sm">Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-light text-gray-800">Mis Favoritos</h1>
          <p className="text-gray-400 text-sm mt-2">Eventos que has guardado</p>
          <div className="w-12 h-0.5 bg-gray-200 mx-auto mt-4"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Estadísticas */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div className="bg-white rounded-lg border border-gray-100 px-6 py-3 inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Total de favoritos</p>
              <p className="text-xl font-semibold text-gray-800">
                {favorites.length} {favorites.length === 1 ? 'evento' : 'eventos'}
              </p>
            </div>
          </div>
          
          {favorites.length > 0 && (
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition border border-gray-200"
            >
              Descubrir más eventos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>

        {/* Grid de favoritos */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => (
              <div key={fav._id} className="transition-all duration-300 hover:-translate-y-1">
                <EventCard
                  event={fav.event}
                  onFavorite={() => handleRemoveFavorite(fav.event._id)}
                  isFavorite={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No tienes eventos favoritos
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Explora eventos y guarda tus favoritos
            </p>
            <Link
              to="/events"
              className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Explorar eventos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;