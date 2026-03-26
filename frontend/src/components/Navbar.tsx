import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-800'
    }`}>
      <div className="container mx-auto px-3 md:px-4">
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-xl md:text-2xl font-bold hover:text-blue-200 transition flex items-center gap-2"
            onClick={closeMenu}
          >
            <span className="text-2xl md:text-3xl">🎉</span>
            <span className="hidden xs:inline">Eventos SMA</span>
            <span className="xs:hidden">SMA</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link to="/events" className="hover:text-blue-200 transition font-medium">
              📅 Eventos
            </Link>
            
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-blue-200 transition font-medium">
                    👑 Admin
                  </Link>
                )}
                <Link to="/favorites" className="hover:text-blue-200 transition font-medium">
                  ❤️ Favoritos
                </Link>
                <Link to="/create-event" className="hover:text-blue-200 transition font-medium">
                  ✨ Crear
                </Link>
                <button onClick={handleLogout} className="hover:text-blue-200 transition font-medium">
                  🚪 Salir
                </button>
                <span className="text-yellow-200 text-sm">👤 {user.name.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200 transition font-medium">
                  🔑 Ingresar
                </Link>
                <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <Link 
              to="/events" 
              className="block py-3 px-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              onClick={closeMenu}
            >
              📅 Eventos
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block py-3 px-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                    onClick={closeMenu}
                  >
                    👑 Panel Admin
                  </Link>
                )}
                <Link 
                  to="/favorites" 
                  className="block py-3 px-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                  onClick={closeMenu}
                >
                  ❤️ Mis Favoritos
                </Link>
                <Link 
                  to="/create-event" 
                  className="block py-3 px-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                  onClick={closeMenu}
                >
                  ✨ Crear Evento
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left py-3 px-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                >
                  🚪 Cerrar Sesión
                </button>
                <div className="pt-2 text-yellow-200 text-sm px-2">
                  👤 {user.name}
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="block py-3 px-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                  onClick={closeMenu}
                >
                  🔑 Iniciar Sesión
                </Link>
                <Link 
                  to="/register" 
                  className="block py-3 px-2 bg-white text-blue-600 rounded-lg font-semibold mt-2"
                  onClick={closeMenu}
                >
                  📝 Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;