# Code Doc - Generador Automático de Documentación para Código

## 📖 Descripción del Proyecto

**Code Doc Generator** es un sistema completo de generación automática de documentación para código fuente utilizando Inteligencia Artificial. Este proyecto forma parte del Taller de Especialidad (SHC131) de la Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca.

### ✨ Características Principales

- 🤖 **Generación automática de documentación** usando IA (Ollama + Llama3.2)
- 🌐 **Interfaz web moderna** con React y Tailwind CSS
- 🔒 **Sistema de autenticación** completo con JWT
- 📊 **Análisis de código** con estadísticas detalladas
- 🔄 **Regeneración inteligente** con feedback del usuario
- 📄 **Exportación múltiple**: DOCX, PDF, Markdown
- 🔁 **Automatización con n8n** para flujos avanzados
- 👥 **Panel de administración** para gestión de usuarios
- 🌍 **Soporte multi-lenguaje**: Python, JavaScript, PHP, Go, Java

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────┐
│                   USUARIO FINAL                     │
│                 (Navegador Web)                     │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              FRONTEND (Puerto 5173)                 │
│           React + Vite + Tailwind CSS               │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│              BACKEND (Puerto 8000)                  │
│                FastAPI + Python                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  • Autenticación JWT                         │  │
│  │  • Análisis de código                        │  │
│  │  • Gestión de usuarios                       │  │
│  │  • Exportación de documentos                 │  │
│  └──────────────────────────────────────────────┘  │
└──────┬────────────────────────────────────┬─────────┘
       │                                    │
       ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│  OLLAMA AI       │              │   n8n (Docker)   │
│  (Puerto 11434)  │              │  (Puerto 5678)   │
│  Modelo: llama3.2│              │  Automatización  │
└──────────────────┘              └──────────────────┘
       │
       ▼
┌──────────────────┐
│  SQLite DB       │
│  Usuarios y Datos│
└──────────────────┘
```

---

## 📁 Estructura del Proyecto

```
Code-Doc-Generator/
├── backend/                    # Backend FastAPI
│   ├── main.py                # API principal
│   ├── ai_model.py            # Lógica de IA
│   ├── export_documents.py    # Exportación de documentos
│   ├── requirements.txt       # Dependencias Python
│   └── .env                   # Variables de entorno
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── App.jsx           # Aplicación principal
│   │   └── main.jsx          # Punto de entrada
│   ├── package.json          # Dependencias Node
│   └── vite.config.js        # Configuración Vite
├── ova-setup/                 # Configuración para OVA
│   ├── docker/               # Docker Compose
│   │   ├── docker-compose.yml
│   │   └── n8n-workflows/
│   ├── systemd/              # Servicios systemd
│   │   ├── code-doc-backend.service
│   │   ├── code-doc-frontend.service
│   │   ├── code-doc-n8n.service
│   │   └── ollama.service
│   ├── scripts/              # Scripts de automatización
│   │   ├── install.sh
│   │   ├── verify-system.sh
│   │   └── create-ova.sh
│   └── docs/                 # Documentación del OVA
│       ├── README-OVA.md
│       ├── GUIA-CREACION-OVA.md
│       └── INICIO-RAPIDO.md
├── code_doc_gen.db           # Base de datos SQLite
└── README-PROYECTO.md        # Este archivo
```

---

## 🚀 Formas de Usar el Proyecto

### Opción 1: Usar el OVA (Recomendado para Usuarios Finales) ⭐

**La forma más fácil** - Solo importa y ejecuta:

1. Descarga el archivo `CodeDocGenerator-v1.0.ova`
2. Importa en VirtualBox
3. Inicia la VM
4. Accede a http://localhost:5173

📖 **Guía completa**: [ova-setup/docs/README-OVA.md](ova-setup/docs/README-OVA.md)

### Opción 2: Instalación Manual Local

**Para desarrollo o pruebas locales**:

#### Requisitos previos:
- Python 3.10+
- Node.js 18+
- Ollama instalado
- Docker (opcional, para n8n)

#### Pasos:

1. **Clonar el repositorio**
```bash
git clone [URL_DEL_REPO]
cd Code-Doc-Generator
```

2. **Backend**
```bash
cd backend
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edita .env con tus configuraciones

# Iniciar backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

3. **Frontend**
```bash
cd frontend
npm install
npm run dev
# Accede a http://localhost:5173
```

4. **Ollama**
```bash
# Descargar modelo
ollama pull llama3.2

# Ollama debe estar corriendo
ollama serve
```

5. **n8n (Opcional)**
```bash
cd ova-setup/docker
docker-compose up -d
# Accede a http://localhost:5678
```

### Opción 3: Crear tu Propio OVA

**Para distribuir a otros usuarios**:

Sigue la guía completa en: [ova-setup/docs/GUIA-CREACION-OVA.md](ova-setup/docs/GUIA-CREACION-OVA.md)

**Resumen rápido**:
1. Crea una VM con Ubuntu Server 22.04
2. Ejecuta el script de instalación:
   ```bash
   sudo ./ova-setup/scripts/install.sh
   ```
3. Exporta la VM:
   ```bash
   ./ova-setup/scripts/create-ova.sh
   ```

---

## 🔑 Configuración

### Variables de Entorno (`.env`)

```env
# JWT
SECRET_KEY=tu_clave_secreta_super_segura

# Admin
ADMIN_PASSWORD=admin123

# SMTP (para recuperación de contraseña)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 📚 Documentación

### Para Usuarios Finales (OVA)

- [README-OVA.md](ova-setup/docs/README-OVA.md) - Manual completo del OVA
- [INICIO-RAPIDO.md](ova-setup/docs/INICIO-RAPIDO.md) - Guía de inicio rápido

### Para Desarrolladores/Administradores

- [GUIA-CREACION-OVA.md](ova-setup/docs/GUIA-CREACION-OVA.md) - Cómo crear el OVA
- [ova-setup/README.md](ova-setup/README.md) - Documentación del setup
- [CHANGELOG.md](ova-setup/CHANGELOG.md) - Historial de cambios

### Documentación de API

Cuando el backend esté corriendo, visita:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- React 19.1.1
- Vite 7.1.7
- Tailwind CSS 3.4.18
- React Router DOM 7.9.4
- Lucide React (iconos)

### Backend
- FastAPI 0.109.0
- Python 3.10+
- SQLAlchemy 2.0.25
- Uvicorn 0.27.0
- Pydantic 2.5.3
- Python-JOSE (JWT)
- Passlib (encriptación)

### IA
- Ollama (servidor local)
- Llama3.2 (modelo)
- LangChain 0.1.0
- LangChain-Ollama 0.1.0

### Automatización
- n8n (Docker)
- Docker Compose

### Exportación
- python-docx (Word)
- WeasyPrint (PDF)
- Markdown (nativo)

### Base de Datos
- SQLite 3

---

## 🎯 Funcionalidades Detalladas

### 1. Análisis de Código

- Detección automática de lenguaje por extensión
- Conteo de funciones y clases
- Estadísticas de documentación existente
- Análisis de flujo de control (bucles, condicionales)

### 2. Generación de Documentación

- Docstrings en formato estándar según lenguaje:
  - Python: Google Style
  - JavaScript: JSDoc
  - PHP: PHPDoc
  - Go: GoDoc
- Documentación de parámetros y retornos
- Explicación de bucles y condicionales
- Comentarios de inicio/fin de estructuras

### 3. Regeneración Inteligente

- Feedback personalizado del usuario
- Mejora iterativa de la documentación
- Conservación del código original

### 4. Exportación

**Formatos soportados:**
- **DOCX**: Documento Word con formato profesional
- **PDF**: Documento PDF listo para imprimir
- **Markdown**: Archivo .md para GitHub/GitLab

**Opciones de exportación:**
- Descarga directa
- Envío por email (vía n8n)

### 5. Gestión de Usuarios

- Registro con validación de email
- Login con JWT
- Recuperación de contraseña por email
- Panel de administración
- CRUD de usuarios (solo admin)

---

## 🔐 Seguridad

- Contraseñas encriptadas con bcrypt
- Tokens JWT con expiración
- Validación de entrada con Pydantic
- CORS configurado
- Variables sensibles en .env
- Servicios corriendo con usuario no-root (en OVA)

---

## 📊 Puertos Utilizados

| Servicio | Puerto | Protocolo | Descripción |
|----------|--------|-----------|-------------|
| Frontend | 5173 | HTTP | Interfaz web |
| Backend | 8000 | HTTP | API REST |
| n8n | 5678 | HTTP | Automatización |
| Ollama | 11434 | HTTP | Servicio IA |

---

## 🧪 Testing

### Verificar Backend

```bash
curl http://localhost:8000
# Respuesta: {"message": "Code Documentation Generator API - Running"}
```

### Verificar Frontend

```bash
curl http://localhost:5173
# Debe devolver HTML
```

### Verificar Ollama

```bash
curl http://localhost:11434
# Respuesta: "Ollama is running"
```

### Verificar n8n

```bash
curl http://localhost:5678
# Debe devolver HTML
```

---

## 🐛 Solución de Problemas

### Backend no inicia

```bash
# Verificar dependencias
pip install -r requirements.txt

# Verificar Ollama
ollama list

# Ver logs
python -m uvicorn main:app --reload
```

### Frontend no compila

```bash
# Limpiar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versión de Node
node --version  # Debe ser 18+
```

### IA no genera documentación

```bash
# Verificar Ollama
ollama serve

# Descargar modelo
ollama pull llama3.2

# Verificar que esté corriendo
curl http://localhost:11434
```

### n8n no funciona

```bash
# Verificar Docker
docker ps

# Reiniciar n8n
cd ova-setup/docker
docker-compose restart
```

---

## 🤝 Contribuciones

Este es un proyecto académico de la Universidad San Francisco Xavier de Chuquisaca.

Para contribuir:
1. Fork el repositorio
2. Crea una rama de feature
3. Haz commit de tus cambios
4. Push a la rama
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto es propiedad de la Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca.

**Materia**: Taller de Especialidad - SHC131
**Año**: 2024

Todos los derechos reservados ©

---

## 📞 Soporte

### Para Usuarios del OVA

Consulta la documentación en `ova-setup/docs/README-OVA.md`

### Para Desarrollo

1. Revisa esta documentación
2. Consulta los logs de los servicios
3. Verifica la configuración en `.env`

---

## 🎓 Créditos

**Universidad**: Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca

**Proyecto**: Generador Automático de Documentación de Código con IA

**Materia**: Taller de Especialidad - SHC131

**Año**: 2024

---

## ✅ Estado del Proyecto

- ✅ Backend completamente funcional
- ✅ Frontend completamente funcional
- ✅ Integración con IA (Ollama + Llama3.2)
- ✅ Exportación DOCX, PDF, Markdown
- ✅ Sistema de usuarios y autenticación
- ✅ Panel de administración
- ✅ Integración con n8n
- ✅ OVA listo para distribución
- ✅ Documentación completa

**Versión actual**: 1.0.0

---

**¡Gracias por usar Code Doc Generator!** 🚀
