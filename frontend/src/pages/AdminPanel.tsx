import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { User } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  activeEvents: number;
  featuredEvents: number;
  totalComments: number;
  totalFavorites: number;
  blockedUsers: number;
  admins: number;
  organizers: number;
  eventsByCategory: Array<{ _id: string; count: number }>;
  topUsers: Array<{ name: string; email: string; eventCount: number }>;
}

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'stats'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getStats()
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.blockUser(selectedUser._id, blockReason);
      await fetchData();
      setShowBlockModal(false);
      setBlockReason('');
      setSelectedUser(null);
      alert('✅ Usuario bloqueado exitosamente');
    } catch (error: any) {
      console.error('Error blocking user:', error);
      alert(error.response?.data?.message || 'Error al bloquear usuario');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (window.confirm('¿Estás seguro de desbloquear este usuario?')) {
      try {
        await adminService.unblockUser(userId);
        await fetchData();
        alert('✅ Usuario desbloqueado exitosamente');
      } catch (error: any) {
        console.error('Error unblocking user:', error);
        alert(error.response?.data?.message || 'Error al desbloquear usuario');
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`⚠️ ¿Estás seguro de eliminar a ${userName}?\n\nSe eliminarán TODOS sus eventos, comentarios y favoritos. Esta acción no se puede deshacer.`)) {
      try {
        await adminService.deleteUser(userId);
        await fetchData();
        alert('✅ Usuario eliminado exitosamente');
      } catch (error: any) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Error al eliminar usuario');
      }
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'organizer' : 'admin';
    const confirmMsg = newRole === 'admin' 
      ? '¿Estás seguro de dar permisos de ADMINISTRADOR a este usuario?' 
      : '¿Estás seguro de quitar permisos de administrador?';
    
    if (window.confirm(confirmMsg)) {
      try {
        await adminService.updateUserRole(userId, newRole);
        await fetchData();
        alert(`✅ Rol actualizado a: ${newRole === 'admin' ? 'Administrador' : 'Organizador'}`);
      } catch (error: any) {
        console.error('Error changing role:', error);
        alert(error.response?.data?.message || 'Error al cambiar rol');
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-white text-center">
            👑 Panel de Administración
          </h1>
          <p className="text-red-100 text-center mt-2">
            Gestión completa de usuarios, eventos y estadísticas
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📊 Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            👥 Usuarios ({users.length})
          </button>
        </div>

        {/* Estadísticas */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6 animate-fade-in">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-gray-600">Usuarios Totales</div>
                <div className="text-xs text-gray-500 mt-1">
                  Admins: {stats.admins} | Organizadores: {stats.organizers}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-2xl font-bold text-green-600">{stats.totalEvents}</div>
                <div className="text-gray-600">Eventos Totales</div>
                <div className="text-xs text-gray-500 mt-1">
                  Activos: {stats.activeEvents} | Destacados: {stats.featuredEvents}
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-2">💬</div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
                <div className="text-gray-600">Comentarios</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-2">❤️</div>
                <div className="text-2xl font-bold text-red-600">{stats.totalFavorites}</div>
                <div className="text-gray-600">Favoritos</div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-2">🚫</div>
                <div className="text-2xl font-bold text-orange-600">{stats.blockedUsers}</div>
                <div className="text-gray-600">Usuarios Bloqueados</div>
              </div>
            </div>

            {/* Eventos por categoría */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📊 Eventos por Categoría</h2>
              <div className="space-y-3">
                {stats.eventsByCategory.map(cat => (
                  <div key={cat._id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{cat._id}</span>
                      <span className="text-gray-600">{cat.count} eventos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full h-2 transition-all"
                        style={{ width: `${(cat.count / stats.totalEvents) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top usuarios */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">🏆 Usuarios Más Activos</h2>
              <div className="space-y-3">
                {stats.topUsers.length > 0 ? (
                  stats.topUsers.map((user, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-2xl text-blue-600">{user.eventCount}</div>
                        <div className="text-xs text-gray-500">eventos</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No hay datos suficientes</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Gestión de Usuarios */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <input
                type="text"
                placeholder="🔍 Buscar usuarios por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Eventos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Registro</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className={`${user.isBlocked ? 'bg-red-50' : 'hover:bg-gray-50'} transition`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role === 'admin' ? '👑 Admin' : '📝 Organizador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-blue-600">{user.eventsCount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBlocked ? (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            🚫 Bloqueado
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            ✅ Activo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: es })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 flex-wrap">
                          {!user.isBlocked ? (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBlockModal(true);
                              }}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition"
                            >
                              Bloquear
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(user._id)}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition"
                            >
                              Desbloquear
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="px-3 py-1 bg-red-700 text-white rounded-lg text-sm hover:bg-red-800 transition"
                            >
                              Eliminar
                            </button>
                          )}
                          <button
                            onClick={() => handleChangeRole(user._id, user.role)}
                            className={`px-3 py-1 rounded-lg text-sm transition ${
                              user.role === 'admin'
                                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                          >
                            {user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron usuarios
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para bloquear usuario */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-2">🚫</div>
              <h2 className="text-xl font-bold text-gray-800">Bloquear Usuario</h2>
            </div>
            <p className="text-gray-600 mb-4 text-center">
              ¿Estás seguro de bloquear a <strong className="text-red-600">{selectedUser.name}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">Motivo del bloqueo:</label>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition"
                placeholder="Ej: Publicación de contenido inapropiado, spam, acoso..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBlockUser}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Bloquear Usuario
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                  setBlockReason('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;