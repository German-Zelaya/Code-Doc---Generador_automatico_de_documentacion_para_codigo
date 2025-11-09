import React, { useState, useEffect } from 'react';

const AuthPage = () => {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    usernameOrEmail: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  // Detectar si hay un token en la URL para reset
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setView('reset');
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username_or_email: formData.usernameOrEmail,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en la autenticación');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      
      window.location.href = '/upload';
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error en el registro');
      }

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('username', data.username);
      
      window.location.href = '/upload';
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al enviar el email');
      }

      setSuccess('¡Email enviado! Revisa tu bandeja de entrada');
      setTimeout(() => {
        setView('login');
        setSuccess('');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:8000/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          new_password: formData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al restablecer la contraseña');
      }

      setSuccess('¡Contraseña actualizada! Redirigiendo al login...');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginView = () => (
    <>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          USUARIO O CORREO
        </label>
        <input
          type="text"
          name="usernameOrEmail"
          value={formData.usernameOrEmail}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="tu_usuario o correo@ejemplo.com"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          CONTRASEÑA
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="••••••••"
        />
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={() => setView('forgot')}
          className="text-orange-500 text-sm hover:text-orange-400 transition-colors font-semibold"
        >
          ¿Olvidó su contraseña?
        </button>
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
        {loading ? 'PROCESANDO...' : 'INGRESAR AL SISTEMA'}
      </button>
    </>
  );

  const renderRegisterView = () => (
    <>
      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          NOMBRE DE USUARIO
        </label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="tu_usuario"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          CORREO ELECTRÓNICO
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          CONTRASEÑA
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
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
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-4 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? 'PROCESANDO...' : 'REGISTRARME'}
      </button>
    </>
  );

  const renderForgotView = () => (
    <>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          CORREO ELECTRÓNICO
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="correo@ejemplo.com"
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-600 text-green-400 px-4 py-3 rounded text-sm">
          {success}
        </div>
      )}

      <button
        onClick={handleForgotPassword}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-4 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? 'ENVIANDO...' : 'ENVIAR EMAIL DE RECUPERACIÓN'}
      </button>

      <button
        onClick={() => setView('login')}
        className="w-full mt-3 text-gray-400 hover:text-white transition-colors font-semibold"
      >
        ← Volver al login
      </button>
    </>
  );

  const renderResetView = () => (
    <>
      <div className="mb-4">
        <p className="text-gray-400 text-sm">
          Crea una nueva contraseña para tu cuenta.
        </p>
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          NUEVA CONTRASEÑA
        </label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
          CONFIRMAR CONTRASEÑA
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-red-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-600 text-green-400 px-4 py-3 rounded text-sm">
          {success}
        </div>
      )}

      <button
        onClick={handleResetPassword}
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-4 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {loading ? 'PROCESANDO...' : 'RESTABLECER CONTRASEÑA'}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-600 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider">
            CODE DOC
          </h1>
          <p className="text-gray-400 text-sm tracking-widest">GENERADOR AUTOMÁTICO</p>
        </div>

        <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-8 shadow-2xl shadow-red-900/20">
          {/* Imagen/Logo personalizable */}
          {view !== 'forgot' && view !== 'reset' && (
            <div className="flex justify-center mb-6">
              <img 
                src="/doom.gif" 
                alt="Logo" 
                className="h-36 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {view !== 'forgot' && view !== 'reset' && (
            <div className="flex mb-6 bg-gray-900/50 rounded-lg p-1">
              <button
                onClick={() => setView('login')}
                className={`flex-1 py-3 px-4 font-bold tracking-wider transition-all ${
                  view === 'login'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                INGRESAR
              </button>
              <button
                onClick={() => setView('register')}
                className={`flex-1 py-3 px-4 font-bold tracking-wider transition-all ${
                  view === 'register'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                CREAR CUENTA
              </button>
            </div>
          )}

          {view === 'forgot' && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-white tracking-wider">RECUPERAR CONTRASEÑA</h2>
            </div>
          )}

          {view === 'reset' && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-white tracking-wider">NUEVA CONTRASEÑA</h2>
            </div>
          )}

          <div className="space-y-5">
            {view === 'login' && renderLoginView()}
            {view === 'register' && renderRegisterView()}
            {view === 'forgot' && renderForgotView()}
            {view === 'reset' && renderResetView()}
          </div>

          <div className="mt-6 text-center text-gray-500 text-xs">
            <p>UNIVERSIDAD MAYOR REAL Y PONTIFICIA</p>
            <p className="text-red-600/70">DE SAN FRANCISCO XAVIER DE CHUQUISACA</p>
          </div>
        </div>

        <p className="text-center mt-6 text-gray-600 text-sm">
          Proyecto de Taller de Especialidad - SHC131
        </p>
      </div>
    </div>
  );
};

export default AuthPage;