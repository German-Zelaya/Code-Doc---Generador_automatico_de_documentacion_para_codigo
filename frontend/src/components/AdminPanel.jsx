import React, { useState, useEffect } from 'react';
import { Trash2, Users, LogOut, Shield } from 'lucide-react';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchUsers();
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Contraseña incorrecta');
      }

      localStorage.setItem('admin_token', data.access_token);
      setIsAuthenticated(true);
      fetchUsers();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${username}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al eliminar usuario');
      }

      setSuccess(`Usuario "${username}" eliminado exitosamente`);
      fetchUsers();
      
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setPassword('');
    setUsers([]);
  };

  const handleBackToLogin = () => {
    window.location.href = '/';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-red-600 opacity-10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 opacity-10 blur-3xl rounded-full"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="w-20 h-20 mx-auto mb-4 text-red-500" />
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider">
              PANEL ADMIN
            </h1>
            <p className="text-gray-400 text-sm tracking-widest">ACCESO RESTRINGIDO</p>
          </div>

          <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-8 shadow-2xl shadow-red-900/20">
            <div className="space-y-5">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
                  CONTRASEÑA DE ADMINISTRADOR
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-4 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'VERIFICANDO...' : 'ACCEDER AL PANEL'}
              </button>

              <button
                onClick={handleBackToLogin}
                className="w-full mt-3 text-gray-400 hover:text-white transition-colors font-semibold"
              >
                ← Volver al login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-600 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider">
              PANEL DE ADMINISTRACIÓN
            </h1>
            <p className="text-gray-400 text-sm tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4" />
              GESTIÓN DE USUARIOS
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            CERRAR SESIÓN
          </button>
        </div>

        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-600 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg overflow-hidden shadow-2xl shadow-red-900/20">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-red-600 to-orange-600">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-black tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-white font-black tracking-wider">USUARIO</th>
                  <th className="px-6 py-4 text-left text-white font-black tracking-wider">EMAIL</th>
                  <th className="px-6 py-4 text-center text-white font-black tracking-wider">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                      No hay usuarios registrados
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 text-gray-300 font-mono">{user.id}</td>
                      <td className="px-6 py-4 text-white font-semibold">{user.username}</td>
                      <td className="px-6 py-4 text-gray-400">{user.email}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={loading}
                          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Trash2 className="w-4 h-4" />
                          ELIMINAR
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-900/50 px-6 py-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm text-center">
              Total de usuarios registrados: <span className="text-red-500 font-bold">{users.length}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca</p>
          <p className="text-red-600/70">Proyecto de Taller de Especialidad - SHC131</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;