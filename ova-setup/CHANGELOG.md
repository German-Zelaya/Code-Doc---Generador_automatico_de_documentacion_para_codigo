# Changelog - Code Doc Generator OVA

Todos los cambios notables en este proyecto OVA serán documentados en este archivo.

---

## [1.0.0] - 2024-12-05

### ✨ Características Iniciales

#### Sistema Completo Pre-configurado
- ✅ Ubuntu Server 22.04 LTS como base
- ✅ Auto-inicio de todos los servicios
- ✅ Configuración de red lista (NAT con port forwarding)
- ✅ Usuario `codedoc` pre-creado

#### Frontend
- ✅ React 19.1.1 + Vite 7.1.7
- ✅ Tailwind CSS 3.4.18
- ✅ React Router DOM 7.9.4
- ✅ Lucide React para iconos
- ✅ Servicio systemd configurado
- ✅ Puerto 5173 expuesto

#### Backend
- ✅ FastAPI 0.109.0
- ✅ Python 3.10+
- ✅ SQLAlchemy 2.0.25 con SQLite
- ✅ Autenticación JWT
- ✅ Sistema de recuperación de contraseña
- ✅ Panel de administración
- ✅ Servicio systemd configurado
- ✅ Puerto 8000 expuesto

#### Inteligencia Artificial
- ✅ Ollama instalado y configurado
- ✅ Modelo llama3.2 pre-descargado
- ✅ LangChain 0.1.0 integrado
- ✅ Soporte multi-lenguaje:
  - Python
  - JavaScript/TypeScript
  - PHP
  - Go
  - Java
- ✅ Servicio systemd configurado
- ✅ Puerto 11434 expuesto

#### Automatización (n8n)
- ✅ n8n corriendo en Docker
- ✅ Workflow pre-configurado para exportación
- ✅ Integración con backend
- ✅ Soporte para envío de emails
- ✅ Servicio systemd configurado
- ✅ Puerto 5678 expuesto

#### Funcionalidades Principales
- ✅ Análisis de código automático
- ✅ Generación de documentación con IA
- ✅ Documentación de bucles y flujo de control
- ✅ Regeneración con feedback personalizado
- ✅ Exportación a múltiples formatos:
  - DOCX (Word)
  - PDF
  - Markdown
- ✅ Estadísticas de documentación
- ✅ Gestión de usuarios
- ✅ Panel de administración

#### Scripts de Automatización
- ✅ `install.sh` - Instalación automática completa
- ✅ `verify-system.sh` - Verificación del sistema
- ✅ `create-ova.sh` - Exportación a OVA

#### Documentación
- ✅ README-OVA.md - Manual del usuario final
- ✅ GUIA-CREACION-OVA.md - Guía para crear el OVA
- ✅ INICIO-RAPIDO.md - Guía de inicio rápido
- ✅ README.md - Documentación del setup

### 🔧 Configuración Técnica

#### Servicios Systemd
- `ollama.service` - Servicio de IA
- `code-doc-backend.service` - API Backend
- `code-doc-frontend.service` - Interfaz Web
- `code-doc-n8n.service` - Automatización

#### Puertos Configurados
- 5173 - Frontend (React)
- 8000 - Backend (FastAPI)
- 5678 - n8n
- 11434 - Ollama
- 22 - SSH (mapeado a 2222 en host)

#### Dependencias Instaladas

**Sistema:**
- curl, wget, git
- build-essential
- Python 3.10+
- Node.js 18+
- Docker + Docker Compose
- SQLite3

**Python:**
- fastapi, uvicorn
- sqlalchemy, pydantic
- langchain, langchain-ollama
- python-jose, passlib
- python-docx, markdown, weasyprint
- requests, python-dotenv

**Node.js:**
- react, react-dom
- react-router-dom
- vite, lucide-react
- tailwindcss, postcss, autoprefixer

### 📦 Estructura de Directorios

```
/home/codedoc/Code-Doc-Generator/
├── backend/              # Backend FastAPI
├── frontend/             # Frontend React
├── ova-setup/           # Configuración OVA
│   ├── docker/          # Docker Compose
│   ├── systemd/         # Servicios
│   ├── scripts/         # Scripts de automatización
│   └── docs/            # Documentación
└── code_doc_gen.db      # Base de datos SQLite
```

### 🎯 Requisitos del Sistema

**Mínimos:**
- RAM: 4 GB
- CPU: 2 cores
- Disco: 20 GB
- VirtualBox 6.0+

**Recomendados:**
- RAM: 8 GB
- CPU: 4 cores
- Disco: 40 GB

### 🔐 Seguridad

- Contraseñas por defecto incluidas (deben cambiarse)
- Servicios corriendo con usuario no-root
- Firewall UFW configurado
- Acceso SSH habilitado

### 📝 Notas Conocidas

1. Primera descarga del modelo IA puede tardar 5-10 minutos
2. Servicios tardan 2-3 minutos en iniciar completamente
3. n8n requiere Docker funcionando correctamente
4. Frontend debe compilarse antes de usar (incluido en setup)

### 🐛 Problemas Conocidos

Ninguno reportado en esta versión inicial.

---

## Formato del Changelog

Este changelog sigue las convenciones de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

### Tipos de cambios:
- **✨ Características** - Nuevas funcionalidades
- **🔧 Configuración** - Cambios en configuración
- **🐛 Correcciones** - Corrección de bugs
- **📝 Documentación** - Cambios en documentación
- **⚡ Mejoras** - Mejoras de rendimiento
- **🔐 Seguridad** - Parches de seguridad
- **⚠️ Deprecado** - Funcionalidades que se eliminarán
- **❌ Eliminado** - Funcionalidades eliminadas

---

**Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca**
*Proyecto de Taller de Especialidad - SHC131*
