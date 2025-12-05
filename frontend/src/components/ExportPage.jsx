import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const ExportPage = () => {
  const [documentedCode, setDocumentedCode] = useState('');
  const [filename, setFilename] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('docx');
  const [exportMethod, setExportMethod] = useState('direct'); // 'direct' o 'n8n'
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const storedCode = localStorage.getItem('documented_code');
    const storedFilename = localStorage.getItem('final_filename');
    
    if (storedCode && storedFilename) {
      setDocumentedCode(storedCode);
      setFilename(storedFilename);
    } else {
      setError('No hay documentación para exportar. Por favor completa el proceso anterior.');
    }
  }, []);

  const handleExport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    if (exportMethod === 'n8n' && !userEmail) {
      setError('Por favor ingresa tu email para recibir el documento');
      setLoading(false);
      return;
    }

    try {
      if (exportMethod === 'direct') {
        // Descarga directa (como antes)
        const response = await fetch('http://localhost:8000/api/export', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documented_code: documentedCode,
            filename: filename,
            format: selectedFormat
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Error al exportar');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const extension = selectedFormat === 'docx' ? '.docx' : selectedFormat === 'pdf' ? '.pdf' : '.md';
        a.download = `${filename.replace('.py', '').replace('.js', '').replace('.php', '').replace('.go', '')}_documented${extension}`;
        
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setSuccess(`¡Archivo descargado exitosamente en formato ${selectedFormat.toUpperCase()}!`);
        
      } else {
        // Envío por n8n
        const response = await fetch('http://localhost:5678/webhook/export-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documented_code: documentedCode,
            filename: filename,
            format: selectedFormat,
            user_email: userEmail
          })
        });

        if (!response.ok) {
          throw new Error('Error al procesar con n8n');
        }

        setSuccess('¡Documento enviado! Recibirás un email con el archivo y el link de Google Drive y Github en unos momentos.');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formats = [
    {
      id: 'docx',
      name: 'Microsoft Word (DOCX)',
      description: 'Documento editable compatible con Word, Google Docs, LibreOffice',
      icon: '📄',
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Documento portátil universal, listo para compartir e imprimir',
      icon: '📕',
      color: 'from-red-600 to-red-700'
    },
    {
      id: 'markdown',
      name: 'Markdown (MD)',
      description: 'Formato de texto plano compatible con GitHub, GitLab, etc.',
      icon: '📝',
      color: 'from-gray-600 to-gray-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-600 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-600 opacity-10 blur-3xl rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2 tracking-wider flex items-center justify-center gap-3">
            <Download className="w-10 h-10 text-red-500" />
            EXPORTAR DOCUMENTO
          </h1>
          <p className="text-gray-400 text-sm tracking-widest">
            Selecciona el formato de exportación
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

        {/* File Info */}
        <div className="bg-black/60 backdrop-blur-sm border-2 border-red-900/50 rounded-lg p-6 shadow-2xl shadow-red-900/20 mb-6">
          <div className="flex items-center gap-4">
            <FileText className="w-12 h-12 text-red-500" />
            <div>
              <p className="text-gray-400 text-sm">Archivo a exportar:</p>
              <p className="text-white text-xl font-bold">{filename}</p>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-black text-white mb-4">SELECCIONA EL FORMATO</h2>
          
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              disabled={loading}
              className={`w-full bg-black/60 backdrop-blur-sm border-2 rounded-lg p-6 transition-all transform hover:scale-102 ${
                selectedFormat === format.id
                  ? 'border-red-600 shadow-lg shadow-red-600/50'
                  : 'border-gray-700 hover:border-red-800'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{format.icon}</div>
                <div className="flex-1 text-left">
                  <h3 className={`text-xl font-bold mb-1 ${
                    selectedFormat === format.id ? 'text-red-500' : 'text-white'
                  }`}>
                    {format.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{format.description}</p>
                </div>
                {selectedFormat === format.id && (
                  <CheckCircle className="w-8 h-8 text-red-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Export Method Selection */}
        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-black text-white mb-4">MÉTODO DE EXPORTACIÓN</h2>
          
          <button
            onClick={() => setExportMethod('direct')}
            disabled={loading}
            className={`w-full bg-black/60 backdrop-blur-sm border-2 rounded-lg p-6 transition-all transform hover:scale-102 ${
              exportMethod === 'direct'
                ? 'border-red-600 shadow-lg shadow-red-600/50'
                : 'border-gray-700 hover:border-red-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <Download className="w-8 h-8 text-blue-500" />
              <div className="flex-1 text-left">
                <h3 className={`text-xl font-bold mb-1 ${
                  exportMethod === 'direct' ? 'text-red-500' : 'text-white'
                }`}>
                  Descarga Directa
                </h3>
                <p className="text-gray-400 text-sm">Descargar el archivo inmediatamente a tu computadora</p>
              </div>
              {exportMethod === 'direct' && (
                <CheckCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
          </button>

          <button
            onClick={() => setExportMethod('n8n')}
            disabled={loading}
            className={`w-full bg-black/60 backdrop-blur-sm border-2 rounded-lg p-6 transition-all transform hover:scale-102 ${
              exportMethod === 'n8n'
                ? 'border-red-600 shadow-lg shadow-red-600/50'
                : 'border-gray-700 hover:border-red-800'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">☁️</div>
              <div className="flex-1 text-left">
                <h3 className={`text-xl font-bold mb-1 ${
                  exportMethod === 'n8n' ? 'text-red-500' : 'text-white'
                }`}>
                  Envío Automático (n8n)
                </h3>
                <p className="text-gray-400 text-sm">Guardar en Google Drive y Github y recibir por email</p>
              </div>
              {exportMethod === 'n8n' && (
                <CheckCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
          </button>

          {exportMethod === 'n8n' && (
            <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4 mt-4">
              <label className="block text-gray-400 text-sm font-bold mb-2 tracking-wide">
                TU EMAIL
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-gray-900/80 border-2 border-gray-700 focus:border-blue-600 rounded px-4 py-3 text-white placeholder-gray-600 transition-all outline-none"
              />
              <p className="text-gray-500 text-xs mt-2">
                Recibirás el documento por email y se guardará en tu Google Drive y GitHub.
              </p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleExport}
            disabled={loading || !documentedCode}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-black py-6 rounded-lg tracking-widest shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-xl"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                {exportMethod === 'n8n' ? 'PROCESANDO Y ENVIANDO...' : 'GENERANDO Y EXPORTANDO...'}
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                {exportMethod === 'n8n' ? 'ENVIAR POR EMAIL' : 'GENERAR Y EXPORTAR'}
              </>
            )}
          </button>

          <button
            onClick={() => window.location.href = '/documentation-result'}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-lg tracking-wider transition-all"
          >
            ← VOLVER A EDITAR
          </button>

          <button
            onClick={() => window.location.href = '/upload'}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg tracking-wide transition-all"
          >
            DOCUMENTAR OTRO ARCHIVO
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-900/20 border border-blue-600/50 rounded-lg p-6">
          <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sobre los formatos
          </h3>
          <ul className="text-gray-400 text-sm space-y-2">
            <li>• <strong>DOCX:</strong> Ideal para editar y personalizar el documento</li>
            <li>• <strong>PDF:</strong> Perfecto para compartir y presentar sin modificaciones</li>
            <li>• <strong>Markdown:</strong> Compatible con GitHub, GitLab y editores de código</li>
          </ul>
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

export default ExportPage;