import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const activeClass = "text-gray-900 border-b-2 border-gray-900 pb-1";
  const inactiveClass = "text-gray-600 hover:text-gray-900 transition pb-1";

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md border-b border-gray-100' 
          : 'bg-white/95 backdrop-blur-sm border-b border-gray-100'
      }`}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="text-xl md:text-2xl font-light tracking-wide text-gray-800 hover:text-gray-600 transition"
              onClick={closeMenu}
            >
              Eventos<span className="font-semibold">SMA</span>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/events" 
                className={`font-medium ${isActive('/events') ? activeClass : inactiveClass}`}
              >
                Eventos
              </Link>
              
              {user ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`font-medium ${isActive('/admin') ? activeClass : inactiveClass}`}
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/favorites" 
                    className={`font-medium ${isActive('/favorites') ? activeClass : inactiveClass}`}
                  >
                    Favoritos
                  </Link>
                  <Link 
                    to="/create-event" 
                    className={`font-medium ${isActive('/create-event') ? activeClass : inactiveClass}`}
                  >
                    Crear evento
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="text-gray-600 hover:text-gray-900 transition font-medium pb-1"
                  >
                    Salir
                  </button>
                  <span className="text-gray-700 text-sm font-medium border-l border-gray-200 pl-4">
                    {user.name.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`font-medium ${isActive('/login') ? activeClass : inactiveClass}`}
                  >
                    Ingresar
                  </Link>
                  <Link 
                    to="/register" 
                    className={`font-medium ${isActive('/register') ? activeClass : inactiveClass}`}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menú"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="md:hidden pb-4 space-y-1">
              <Link 
                to="/events" 
                className={`block py-3 px-3 rounded-lg transition ${isActive('/events') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={closeMenu}
              >
                Eventos
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className={`block py-3 px-3 rounded-lg transition ${isActive('/admin') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                      onClick={closeMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/favorites" 
                    className={`block py-3 px-3 rounded-lg transition ${isActive('/favorites') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={closeMenu}
                  >
                    Favoritos
                  </Link>
                  <Link 
                    to="/create-event" 
                    className={`block py-3 px-3 rounded-lg transition ${isActive('/create-event') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={closeMenu}
                  >
                    Crear evento
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="block w-full text-left py-3 px-3 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Cerrar sesión
                  </button>
                  <div className="pt-3 pb-2 px-3 text-gray-500 text-sm border-t border-gray-100 mt-2">
                    Hola, {user.name}
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`block py-3 px-3 rounded-lg transition ${isActive('/login') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={closeMenu}
                  >
                    Iniciar sesión
                  </Link>
                  <Link 
                    to="/register" 
                    className={`block py-3 px-3 rounded-lg transition ${isActive('/register') ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    onClick={closeMenu}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>
      
      {/* Espaciador */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;