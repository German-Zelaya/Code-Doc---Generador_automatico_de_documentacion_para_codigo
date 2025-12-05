import React, { useState, useEffect } from 'react';
import { FileText, Edit3, Save, Download, CheckCircle, AlertCircle } from 'lucide-react';

const DocumentationResult = () => {
  const [documentedCode, setDocumentedCode] = useState('');
  const [filename, setFilename] = useState('');
  const [language, setLanguage] = useState('python');
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [finalDocument, setFinalDocument] = useState('');

  useEffect(() => {
    // Obtener el código documentado de la fase anterior
    const storedCode = localStorage.getItem('documented_code');
    const storedFilename = localStorage.getItem('final_filename');
    const storedLanguage = localStorage.getItem('final_language') || 'python';
    
    if (storedCode && storedFilename) {
      setDocumentedCode(storedCode);
      setEditedCode(storedCode);
      setFilename(storedFilename);
      setLanguage(storedLanguage);
      generatePreview(storedCode, storedFilename, storedLanguage);
    } else {
      setError('No hay documentación para mostrar. Por favor completa el proceso anterior.');
    }
  }, []);

  const generatePreview = async (code, fname, lang) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/accept-documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documented_code: code,
          filename: fname,
          language: lang
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al generar documento');
      }

      setFinalDocument(data.final_document);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    setDocumentedCode(editedCode);
    setIsEditing(false);
    setSuccess('Cambios guardados exitosamente');
    generatePreview(editedCode, filename, language);
    
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleCancelEdit = () => {
    setEditedCode(documentedCode);
    setIsEditing(false);
  };

  const handleExport = () => {
    // Redirigir a la pantalla de exportación
    window.location.href = '/export';
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentedCode);
    setSuccess('Código copiado al portapapeles');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-xl font-bold">Generando documento final...</p>
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
            <FileText className="w-10 h-10 text-red-500" />
            DOCUMENTACIÓN GENERADA
          </h1>
          <p className="text-gray-400 text-sm tracking-widest">
            Archivo: <span className="text-red-500 font-bold">{filename}</span>
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-900/30 border border-green-600 text-green-400 px-6 py-4 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-600 text-red-400 px-6 py-4 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Código Documentado (Editable) */}
          <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                CÓDIGO DOCUMENTADO
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  EDITAR
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    <Save className="w-4 h-4" />
                    GUARDAR
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    CANCELAR
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full h-96 bg-gray-900 text-green-300 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-600"
                spellCheck="false"
              />
            ) : (
              <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
                <pre className="text-green-300 text-sm font-mono whitespace-pre-wrap">
                  {documentedCode}
                </pre>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
              >
                COPIAR CÓDIGO
              </button>
            </div>
          </div>

          {/* Vista Previa del Documento Markdown */}
          <div className="bg-black/60 backdrop-blur-sm border-2 border-orange-900/50 rounded-lg p-6 shadow-2xl shadow-orange-900/20">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              VISTA PREVIA - DOCUMENTO FINAL
            </h2>
            
            <div className="bg-gray-900 rounded-lg p-6 h-96 overflow-y-auto">
              <div className="prose prose-invert max-w-none">
                <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                  {finalDocument}
                </pre>
              </div>
            </div>

            <div className="mt-4 text-gray-400 text-xs">
              <p>Este es el documento en formato Markdown que será exportado.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.location.href = '/upload'}
            className="bg-gray-800 hover:bg-gray-700 text-white font-black px-8 py-4 rounded-lg tracking-wider shadow-lg transition-all transform hover:scale-105"
          >
            ← DOCUMENTAR OTRO ARCHIVO
          </button>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black px-12 py-4 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105"
          >
            <Download className="w-5 h-5" />
            EXPORTAR ARCHIVO
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

export default DocumentationResult;