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
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          ❤️ Mis Eventos Favoritos
        </h1>
        <p className="text-gray-600">
          {favorites.length} {favorites.length === 1 ? 'evento guardado' : 'eventos guardados'}
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <EventCard
              key={fav._id}
              event={fav.event}
              onFavorite={() => handleRemoveFavorite(fav.event._id)}
              isFavorite={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No tienes eventos favoritos
          </h2>
          <p className="text-gray-500 mb-6">
            Explora eventos y guarda tus favoritos haciendo clic en el corazón ❤️
          </p>
          <Link
            to="/events"
            className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition"
          >
            Explorar eventos
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;