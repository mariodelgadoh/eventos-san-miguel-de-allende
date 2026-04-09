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
      } catch (error: any) {
        console.error('Error unblocking user:', error);
        alert(error.response?.data?.message || 'Error al desbloquear usuario');
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${userName}? Se eliminarán TODOS sus eventos, comentarios y favoritos. Esta acción no se puede deshacer.`)) {
      try {
        await adminService.deleteUser(userId);
        await fetchData();
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
      } catch (error: any) {
        console.error('Error changing role:', error);
        alert(error.response?.data?.message || 'Error al cambiar rol');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-gray-600"></div>
        <p className="mt-4 text-gray-400 text-sm">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-light text-gray-800">Panel de Administración</h1>
          <p className="text-gray-400 text-sm mt-1">Gestión completa de usuarios y eventos</p>
          <div className="w-12 h-0.5 bg-gray-200 mt-3"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'stats'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Estadísticas
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-1 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Usuarios ({users.length})
          </button>
        </div>

        {/* Estadísticas */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Tarjetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Usuarios</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.totalUsers}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Admins: {stats.admins} | Org: {stats.organizers}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Eventos</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.totalEvents}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Activos: {stats.activeEvents} | Destacados: {stats.featuredEvents}</p>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Comentarios</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.totalComments}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Favoritos</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.totalFavorites}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase">Bloqueados</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-1">{stats.blockedUsers}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Eventos por categoría */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-medium text-gray-700">Eventos por categoría</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {stats.eventsByCategory.map((cat) => (
                    <div key={cat._id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{cat._id}</span>
                        <span className="text-gray-400">{cat.count} eventos</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1">
                        <div
                          className="bg-gray-600 rounded-full h-1"
                          style={{ width: `${(cat.count / stats.totalEvents) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top usuarios */}
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h2 className="text-sm font-medium text-gray-700">Usuarios más activos</h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  {stats.topUsers.length > 0 ? (
                    stats.topUsers.map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">{user.eventCount}</p>
                          <p className="text-xs text-gray-400">eventos</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 text-sm py-4">No hay datos suficientes</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gestión de Usuarios */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Rol</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Eventos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Registro</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className={user.isBlocked ? 'bg-red-50/30' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'bg-gray-50 text-gray-500'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Organizador'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">{user.eventsCount || 0}</td>
                      <td className="px-4 py-3">
                        {user.isBlocked ? (
                          <span className="text-xs text-red-600">Bloqueado</span>
                        ) : (
                          <span className="text-xs text-green-600">Activo</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: es })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-center">
                          {!user.isBlocked ? (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBlockModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition"
                              title="Bloquear"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnblockUser(user._id)}
                              className="p-1 text-gray-400 hover:text-green-600 transition"
                              title="Desbloquear"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </button>
                          )}
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="p-1 text-gray-400 hover:text-red-600 transition"
                              title="Eliminar"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleChangeRole(user._id, user.role)}
                            className={`p-1 transition ${
                              user.role === 'admin'
                                ? 'text-gray-400 hover:text-yellow-600'
                                : 'text-gray-400 hover:text-blue-600'
                            }`}
                            title={user.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para bloquear usuario */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-2">Bloquear usuario</h2>
              <p className="text-sm text-gray-500 mb-4">
                ¿Estás seguro de bloquear a <span className="font-medium text-gray-700">{selectedUser.name}</span>?
              </p>
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-1">Motivo</label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition resize-none"
                  placeholder="Motivo del bloqueo..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBlockUser}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
                >
                  Bloquear
                </button>
                <button
                  onClick={() => {
                    setShowBlockModal(false);
                    setSelectedUser(null);
                    setBlockReason('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;