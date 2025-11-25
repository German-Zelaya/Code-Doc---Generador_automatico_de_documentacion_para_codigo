import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle, Code, FileText, Loader } from 'lucide-react';

const AIModelView = () => {
  const [originalCode, setOriginalCode] = useState('');
  const [documentedCode, setDocumentedCode] = useState('');
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('python');
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('generating'); // 'generating', 'showing', 'accepted'

  useEffect(() => {
    // Obtener datos del análisis previo (desde localStorage o props)
    const storedCode = localStorage.getItem('uploaded_code');
    const storedFilename = localStorage.getItem('uploaded_filename');
    const storedLanguage = localStorage.getItem('detected_language') || 'python';
    
    if (storedCode && storedFilename) {
      setOriginalCode(storedCode);
      setFilename(storedFilename);
      setLanguage(storedLanguage);
      generateDocumentation(storedCode, storedFilename, storedLanguage);
    } else {
      setError('No hay código para documentar. Por favor sube un archivo primero.');
    }
  }, []);

  const generateDocumentation = async (code, fname, lang) => {
    setLoading(true);
    setError('');
    setStep('generating');

    try {
      const response = await fetch('http://localhost:8000/api/generate-documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, filename: fname, language: lang })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al generar documentación');
      }

      setDocumentedCode(data.documented_code);
      setStatistics(data.statistics);
      setStep('showing');

    } catch (err) {
      setError(err.message);
      setStep('showing');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/regenerate-documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: originalCode,
          language: language,
          feedback: 'Genera una versión diferente y más detallada'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al regenerar');
      }

      setDocumentedCode(data.documented_code);
      setStatistics(data.statistics);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    // Guardar el código documentado y el lenguaje para la siguiente fase
    localStorage.setItem('documented_code', documentedCode);
    localStorage.setItem('final_filename', filename);
    localStorage.setItem('final_language', language);
    
    // Redirigir a la pantalla de documentación generada
    window.location.href = '/documentation-result';
  };

  if (loading && step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center p-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-64 h-64 bg-red-600 opacity-10 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 opacity-10 blur-3xl rounded-full animate-pulse"></div>
        </div>

        <div className="relative z-10 text-center">
          <Loader className="w-20 h-20 mx-auto mb-6 text-red-500 animate-spin" />
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-4 tracking-wider">
            PROCESANDO CON IA
          </h1>
          <p className="text-gray-400 text-lg tracking-wide">
            El modelo está analizando y documentando tu código...
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce delay-200"></div>
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

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-red-500" />
            MODELO IA
          </h1>
          <p className="text-gray-400 text-sm tracking-widest">
            Documentación Generada
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-600 text-red-400 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
              <p className="text-gray-400 text-sm font-bold mb-2 tracking-wide">FUNCIONES TOTALES</p>
              <p className="text-white text-4xl font-black">{statistics.total_functions}</p>
            </div>

            <div className="bg-black/60 backdrop-blur-sm border-2 border-green-900/50 rounded-lg p-6 shadow-2xl shadow-green-900/20">
              <p className="text-gray-400 text-sm font-bold mb-2 tracking-wide">AHORA DOCUMENTADAS</p>
              <p className="text-green-400 text-4xl font-black">{statistics.documented_functions}</p>
            </div>

            <div className="bg-black/60 backdrop-blur-sm border-2 border-orange-900/50 rounded-lg p-6 shadow-2xl shadow-orange-900/20">
              <p className="text-gray-400 text-sm font-bold mb-2 tracking-wide">COBERTURA</p>
              <p className="text-orange-400 text-4xl font-black">{statistics.documentation_percentage}%</p>
            </div>
          </div>
        )}

        {/* Code Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Original Code */}
          <div className="bg-black/60 backdrop-blur-sm border-2 border-gray-700 rounded-lg p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5 text-gray-400" />
              CÓDIGO ORIGINAL
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                {originalCode}
              </pre>
            </div>
          </div>

          {/* Documented Code */}
          <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              CÓDIGO DOCUMENTADO
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                {documentedCode || 'Generando documentación...'}
              </pre>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRegenerate}
            disabled={loading || !documentedCode}
            className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white font-black px-8 py-4 rounded-lg tracking-wider shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'REGENERANDO...' : 'PEDIR OTRAS SUGERENCIAS'}
          </button>

          <button
            onClick={handleAccept}
            disabled={loading || !documentedCode}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black px-8 py-4 rounded-lg tracking-wider shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <CheckCircle className="w-5 h-5" />
            ACEPTAR SUGERENCIAS
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca</p>
          <p className="text-red-600/70">Proyecto de Taller de Especialidad - SHC131</p>
        </div>
      </div>
    </div>
  );
};

export default AIModelView;