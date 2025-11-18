import React, { useState } from 'react';
import { Upload, FileCode, CheckCircle, XCircle, BarChart3, LogOut } from 'lucide-react';

const UploadCode = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const username = localStorage.getItem('username') || 'Usuario';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setAnalysis(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/analyze-code', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al analizar el archivo');
      }

      setAnalysis(data);
      
      // Guardar el código y el lenguaje para la siguiente fase
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem('uploaded_code', e.target.result);
        localStorage.setItem('uploaded_filename', file.name);
        localStorage.setItem('detected_language', data.language);
      };
      reader.readAsText(file);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLanguageColor = (lang) => {
    const colors = {
      python: 'from-blue-600 to-blue-700',
      javascript: 'from-yellow-600 to-yellow-700',
      java: 'from-red-600 to-orange-700',
      cpp: 'from-blue-700 to-purple-700',
      csharp: 'from-purple-600 to-purple-700',
      php: 'from-indigo-600 to-purple-600',
      ruby: 'from-red-700 to-red-800',
      go: 'from-cyan-600 to-blue-700'
    };
    return colors[lang] || 'from-gray-600 to-gray-700';
  };

  const getDocumentationLevel = (percentage) => {
    if (percentage >= 80) return { text: 'EXCELENTE', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-600' };
    if (percentage >= 60) return { text: 'BUENO', color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-600' };
    if (percentage >= 40) return { text: 'REGULAR', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-600' };
    if (percentage >= 20) return { text: 'BAJO', color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-600' };
    return { text: 'MUY BAJO', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-600' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-600 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider">
              SUBIR CÓDIGO
            </h1>
            <p className="text-gray-400 text-sm tracking-widest">
              Bienvenido, <span className="text-red-500 font-bold">{username}</span>
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

        {/* Upload Area */}
        <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-8 shadow-2xl shadow-red-900/20 mb-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive 
                ? 'border-red-500 bg-red-900/20' 
                : 'border-gray-700 hover:border-red-600'
            }`}
          >
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={handleFileInput}
              accept=".py,.js,.jsx,.ts,.tsx,.java,.cpp,.c,.h,.hpp,.cs,.php,.rb,.go"
            />
            
            <label htmlFor="fileInput" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <p className="text-white text-xl font-bold mb-2">
                {file ? file.name : 'Arrastra tu archivo aquí'}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                o haz click para seleccionar
              </p>
              <p className="text-gray-500 text-xs">
                Formatos soportados: Python, JavaScript, PHP, Go
              </p>
            </label>
          </div>

          {file && !analysis && (
            <div className="mt-6 flex items-center justify-between bg-gray-900/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileCode className="w-6 h-6 text-red-500" />
                <div>
                  <p className="text-white font-semibold">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black px-8 py-3 rounded-lg tracking-wider shadow-lg shadow-red-600/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'ANALIZANDO...' : 'ANALIZAR CÓDIGO'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </div>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Language Detection */}
            <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <FileCode className="w-6 h-6 text-red-500" />
                LENGUAJE DETECTADO
              </h2>
              <div className={`bg-gradient-to-r ${getLanguageColor(analysis.language)} p-6 rounded-lg`}>
                <p className="text-white text-4xl font-black uppercase tracking-wider text-center">
                  {analysis.language}
                </p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
                <p className="text-gray-400 text-sm font-bold mb-2 tracking-wide">LÍNEAS DE CÓDIGO</p>
                <p className="text-white text-4xl font-black">{analysis.total_lines}</p>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
                <p className="text-gray-400 text-sm font-bold mb-2 tracking-wide">FUNCIONES</p>
                <p className="text-white text-4xl font-black">{analysis.functions_count}</p>
              </div>

              <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
                <p className="text-gray-400 text-sm font-bold mb-2 tracking-wide">CLASES</p>
                <p className="text-white text-4xl font-black">{analysis.classes_count}</p>
              </div>
            </div>

            {/* Documentation Level */}
            <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
              <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-red-500" />
                NIVEL DE DOCUMENTACIÓN
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Funciones Documentadas</p>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <p className="text-white text-2xl font-bold">
                      {analysis.documented_functions} / {analysis.functions_count}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Porcentaje de Documentación</p>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className={`text-4xl font-black ${getDocumentationLevel(analysis.documentation_percentage).color}`}>
                          {analysis.documentation_percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-lg bg-gray-800">
                      <div
                        style={{ width: `${analysis.documentation_percentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-red-600 to-orange-600 transition-all duration-1000"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`mt-6 ${getDocumentationLevel(analysis.documentation_percentage).bg} border ${getDocumentationLevel(analysis.documentation_percentage).border} rounded-lg p-4`}>
                <p className={`text-center font-black text-xl tracking-wider ${getDocumentationLevel(analysis.documentation_percentage).color}`}>
                  NIVEL: {getDocumentationLevel(analysis.documentation_percentage).text}
                </p>
              </div>
            </div>

            {/* Next Step Button */}
            <div className="text-center">
              <button
                onClick={() => window.location.href = '/ai-model'}
                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black px-12 py-4 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 text-xl"
              >
                CREAR DOCUMENTACIÓN CON AGENTE IA →
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca</p>
          <p className="text-red-600/70">Proyecto de Taller de Especialidad - SHC131</p>
        </div>
      </div>
    </div>
  );
};

export default UploadCode;