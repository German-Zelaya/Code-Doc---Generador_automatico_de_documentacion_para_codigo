import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthPage from './components/AuthPage'
import AdminPanel from './components/AdminPanel'
import UploadCode from './components/UploadCode'
import AIModelView from './components/AIModelView'
import DocumentationResult from './components/DocumentationResult'
import ExportPage from './components/ExportPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/reset-password" element={<AuthPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/upload" element={<UploadCode />} />
        <Route path="/ai-model" element={<AIModelView />} />
        <Route path="/documentation-result" element={<DocumentationResult />} />
        <Route path="/export" element={<ExportPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App