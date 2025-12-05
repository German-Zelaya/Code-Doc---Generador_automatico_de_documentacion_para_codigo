# OVA Setup - Code Doc Generator

Este directorio contiene todos los archivos necesarios para crear y distribuir una máquina virtual (OVA) completamente funcional del sistema Code Doc Generator.

---

## 📁 Estructura del Directorio

```
ova-setup/
├── docker/                          # Configuración de Docker
│   ├── docker-compose.yml          # Compose para n8n
│   └── n8n-workflows/              # Workflows pre-configurados
├── systemd/                         # Servicios systemd
│   ├── code-doc-backend.service    # Servicio del Backend
│   ├── code-doc-frontend.service   # Servicio del Frontend
│   ├── code-doc-n8n.service        # Servicio de n8n
│   └── ollama.service              # Servicio de Ollama
├── scripts/                         # Scripts de automatización
│   ├── install.sh                  # Instalación automática completa
│   ├── verify-system.sh            # Verificación del sistema
│   └── create-ova.sh               # Exportación a OVA
├── docs/                            # Documentación
│   ├── README-OVA.md               # Manual del usuario final
│   └── GUIA-CREACION-OVA.md        # Guía para crear el OVA
└── README.md                        # Este archivo
```

---

## 🎯 Propósito

Este setup permite crear una máquina virtual lista para distribuir que incluye:

✅ **Frontend** (React + Vite) en puerto 5173
✅ **Backend** (FastAPI + Python) en puerto 8000
✅ **n8n** (Docker) en puerto 5678
✅ **Ollama + llama3.2** en puerto 11434
✅ **Base de datos SQLite** pre-configurada
✅ **Auto-inicio** de todos los servicios
✅ **Configuración de red** lista para usar

---

## 🚀 Para Crear el OVA

### Opción 1: Proceso Automático

Si ya tienes una VM de Ubuntu Server 22.04 instalada:

```bash
# Dentro de la VM
cd /tmp
git clone [URL_DEL_REPO]
cd Code-Doc-Generator
sudo ./ova-setup/scripts/install.sh
```

Luego, en tu máquina host:

```bash
cd ova-setup/scripts
./create-ova.sh
```

### Opción 2: Proceso Manual

Sigue la **Guía Completa**: [GUIA-CREACION-OVA.md](docs/GUIA-CREACION-OVA.md)

---

## 📖 Para Usar el OVA

Consulta el **Manual de Usuario**: [README-OVA.md](docs/README-OVA.md)

---

## 🔧 Componentes Incluidos

### 1. Docker Compose (n8n)

**Archivo**: `docker/docker-compose.yml`

Configura n8n con:
- Puerto 5678 expuesto
- Volumen persistente para datos
- Workflows pre-cargados
- Red bridge personalizada

### 2. Servicios Systemd

**Ubicación**: `systemd/*.service`

Cada servicio está configurado para:
- Auto-inicio en el arranque del sistema
- Auto-restart en caso de fallo
- Logging centralizado (journalctl)
- Dependencias correctas entre servicios

**Orden de inicio**:
1. `ollama.service` - Modelo de IA
2. `docker.service` → `code-doc-n8n.service` - Automatización
3. `code-doc-backend.service` - API
4. `code-doc-frontend.service` - Interfaz web

### 3. Script de Instalación

**Archivo**: `scripts/install.sh`

Realiza automáticamente:
1. Actualización del sistema
2. Instalación de dependencias (Python, Node, Docker)
3. Creación del usuario `codedoc`
4. Instalación de Ollama + modelo llama3.2
5. Copia del proyecto
6. Instalación de dependencias de Python y Node
7. Compilación del frontend
8. Configuración de servicios systemd
9. Inicio automático de todos los servicios

### 4. Script de Verificación

**Archivo**: `scripts/verify-system.sh`

Verifica:
- Estado de todos los servicios systemd
- Conectividad de todos los puertos
- Modelos de Ollama instalados
- Contenedores Docker corriendo
- Archivos críticos presentes

### 5. Script de Exportación

**Archivo**: `scripts/create-ova.sh`

Exporta la VM a formato OVA con:
- Metadatos del proyecto
- Descripción completa
- Información de la universidad
- Verificaciones previas

---

## 🔑 Configuración por Defecto

### Usuario del Sistema

- **Usuario**: `codedoc`
- **Password**: `codedoc2024`
- **Home**: `/home/codedoc`
- **Grupos**: `docker`, `sudo`

### Directorios Importantes

- **Proyecto**: `/home/codedoc/Code-Doc-Generator/`
- **Backend**: `/home/codedoc/Code-Doc-Generator/backend/`
- **Frontend**: `/home/codedoc/Code-Doc-Generator/frontend/`
- **Base de datos**: `/home/codedoc/Code-Doc-Generator/code_doc_gen.db`

### Puertos Expuestos

| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| Frontend | 5173 | HTTP |
| Backend | 8000 | HTTP |
| n8n | 5678 | HTTP |
| Ollama | 11434 | HTTP |
| SSH | 22 | TCP |

---

## 📝 Personalización

### Cambiar Credenciales

Edita `backend/.env` antes de crear el OVA:

```bash
# Contraseña de administrador
ADMIN_PASSWORD=tu_nueva_password

# Configuración SMTP (opcional)
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_password_de_aplicacion
```

### Cambiar Puertos

Edita los archivos `.service` en `systemd/` antes de instalar:

```ini
# Ejemplo: cambiar puerto del frontend
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 3000
```

### Agregar Modelos de IA Adicionales

Modifica `scripts/install.sh` para incluir más modelos:

```bash
sudo -u $SYSTEM_USER ollama pull llama3.2
sudo -u $SYSTEM_USER ollama pull codellama
sudo -u $SYSTEM_USER ollama pull mistral
```

---

## 🧪 Testing

### Probar Localmente (Sin OVA)

```bash
# Iniciar todos los servicios manualmente
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &

cd ../frontend
npm run dev &

cd ../ova-setup/docker
docker-compose up -d

ollama serve &
```

### Probar el OVA

1. Importa el OVA en VirtualBox
2. Inicia la VM
3. Ejecuta el script de verificación:
   ```bash
   /home/codedoc/Code-Doc-Generator/ova-setup/scripts/verify-system.sh
   ```
4. Accede a http://localhost:5173 desde el host

---

## 🐛 Troubleshooting

### Servicios no inician

```bash
# Ver logs
sudo journalctl -u code-doc-backend -n 100
sudo journalctl -u code-doc-frontend -n 100

# Reiniciar servicio
sudo systemctl restart code-doc-backend
```

### n8n no accesible

```bash
# Verificar Docker
sudo systemctl status docker

# Verificar contenedor
docker ps | grep n8n

# Reiniciar n8n
sudo systemctl restart code-doc-n8n
```

### Ollama no responde

```bash
# Verificar servicio
sudo systemctl status ollama

# Ver modelos instalados
ollama list

# Descargar modelo si falta
ollama pull llama3.2
```

---

## 📊 Requisitos del Sistema (VM)

### Mínimos

- RAM: 4 GB
- CPU: 2 cores
- Disco: 20 GB
- Red: NAT

### Recomendados

- RAM: 8 GB
- CPU: 4 cores
- Disco: 40 GB
- Red: NAT con port forwarding

---

## 📦 Distribución

### Archivos a Incluir

```
CodeDocGenerator-v1.0/
├── CodeDocGenerator-v1.0.ova          # El archivo OVA
├── README-OVA.md                       # Manual del usuario
├── GUIA-INSTALACION.md                 # Guía de instalación
├── CodeDocGenerator-v1.0.ova.md5       # Checksum MD5
├── CodeDocGenerator-v1.0.ova.sha256    # Checksum SHA256
└── LICENSE.txt                         # Licencia
```

### Generar Checksums

```bash
md5sum CodeDocGenerator-v1.0.ova > CodeDocGenerator-v1.0.ova.md5
sha256sum CodeDocGenerator-v1.0.ova > CodeDocGenerator-v1.0.ova.sha256
```

---

## 🎓 Información del Proyecto

**Institución**: Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca
**Materia**: Taller de Especialidad - SHC131
**Proyecto**: Generador Automático de Documentación de Código con IA
**Año**: 2024

---

## 📞 Soporte

Para problemas o preguntas:

1. Revisa la documentación en `docs/`
2. Ejecuta `verify-system.sh` para diagnóstico
3. Consulta los logs con `journalctl`

---

## ✅ Checklist de Validación Pre-Distribución

Antes de distribuir el OVA, verifica:

- [ ] Todos los servicios inician automáticamente
- [ ] Frontend accesible en puerto 5173
- [ ] Backend responde en puerto 8000
- [ ] n8n funcional en puerto 5678
- [ ] Ollama con modelo llama3.2 instalado
- [ ] Puede crear usuario y documentar código
- [ ] Exportación a DOCX/PDF/Markdown funciona
- [ ] No hay credenciales sensibles hardcoded
- [ ] Documentación completa incluida
- [ ] OVA probado en instalación limpia
- [ ] Tamaño del OVA razonable (<25GB)
- [ ] Checksums generados

---

**¡Listo para crear tu OVA!** 🚀
