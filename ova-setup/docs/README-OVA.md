# Code Doc Generator - Máquina Virtual (OVA)

## 📖 Descripción

**Code Doc Generator** es un sistema completo de generación automática de documentación para código fuente utilizando Inteligencia Artificial. Este archivo OVA contiene una máquina virtual completamente configurada y lista para usar.

### Características principales:

- ✅ **Frontend Web** (React + Vite) - Interfaz gráfica moderna
- ✅ **Backend API** (FastAPI + Python) - Procesamiento de código
- ✅ **Inteligencia Artificial** (Ollama + Llama3.2) - Generación de documentación
- ✅ **Automatización** (n8n) - Flujos de exportación y notificaciones
- ✅ **Base de datos** (SQLite) - Gestión de usuarios
- ✅ **Auto-inicio** - Todos los servicios se inician automáticamente

### Lenguajes soportados:

- Python
- JavaScript/TypeScript
- PHP
- Go
- Java

---

## 🖥️ Requisitos del Sistema

### Requisitos mínimos:

- **RAM**: 4 GB (recomendado 8 GB)
- **CPU**: 2 núcleos (recomendado 4 núcleos)
- **Disco**: 20 GB de espacio libre
- **Software**: VirtualBox 6.0 o superior

### Sistema operativo del host:

- Windows 10/11
- macOS 10.14+
- Linux (cualquier distribución moderna)

---

## 🚀 Guía de Instalación Rápida

### Paso 1: Descargar e instalar VirtualBox

1. Descarga VirtualBox desde: https://www.virtualbox.org/wiki/Downloads
2. Instala VirtualBox en tu sistema

### Paso 2: Importar el archivo OVA

1. Abre VirtualBox
2. Ve a **Archivo → Importar servicio virtualizado** (o **File → Import Appliance**)
3. Selecciona el archivo `CodeDocGenerator-v1.0.ova`
4. Haz clic en **Siguiente**
5. Revisa la configuración (puedes ajustar RAM y CPU si lo deseas)
6. Haz clic en **Importar**
7. Espera a que termine la importación (puede tomar varios minutos)

### Paso 3: Iniciar la máquina virtual

1. Selecciona la VM **CodeDocGenerator** en la lista
2. Haz clic en **Iniciar**
3. Espera a que el sistema arranque completamente (aproximadamente 2-3 minutos)

### Paso 4: Acceder a la aplicación

1. Abre tu navegador web en tu **máquina host** (no dentro de la VM)
2. Ve a: **http://localhost:5173**
3. ¡Listo! Ya puedes usar Code Doc Generator

---

## 🔑 Credenciales por Defecto

### Usuario del sistema (SSH/Consola):

- **Usuario**: `codedoc`
- **Contraseña**: `codedoc2024` (cámbiala después del primer inicio)

### Aplicación web:

Debes registrarte en la aplicación web la primera vez que la uses.

### Panel de administración:

- **Contraseña de admin**: `admin123` (configurable en el archivo `.env`)

---

## 📡 Puertos y Servicios

La VM expone los siguientes puertos que son accesibles desde tu máquina host:

| Servicio | Puerto | URL de Acceso | Descripción |
|----------|--------|---------------|-------------|
| Frontend | 5173 | http://localhost:5173 | Interfaz web principal |
| Backend API | 8000 | http://localhost:8000 | API REST |
| n8n | 5678 | http://localhost:5678 | Panel de automatización |
| Ollama | 11434 | http://localhost:11434 | Servicio de IA |

**Nota**: No necesitas cambiar ninguna configuración, todo está pre-configurado.

---

## 🎯 Cómo Usar la Aplicación

### 1. Registrarte

1. Abre http://localhost:5173
2. Haz clic en "Registrarse"
3. Completa el formulario con tus datos
4. Inicia sesión

### 2. Generar Documentación

1. Sube un archivo de código (Python, JavaScript, PHP, Go, Java)
2. El sistema analizará automáticamente el código
3. La IA generará documentación completa con:
   - Docstrings/comentarios de funciones
   - Descripción de parámetros
   - Explicación de flujo de control
   - Documentación de bucles y condicionales
4. Puedes regenerar la documentación con feedback personalizado
5. Exporta en formato **DOCX**, **PDF** o **Markdown**

### 3. Exportar Documentación

Tienes dos opciones para exportar:

**Opción A - Descarga directa:**
- Descarga el archivo en tu navegador inmediatamente

**Opción B - Envío por email (vía n8n):**
- Configura tu email en la aplicación
- n8n procesará y enviará el documento por correo

---

## 🔧 Administración del Sistema

### Verificar estado de los servicios

Inicia sesión en la VM por SSH o consola y ejecuta:

```bash
# Verificar todos los servicios
sudo systemctl status code-doc-backend
sudo systemctl status code-doc-frontend
sudo systemctl status code-doc-n8n
sudo systemctl status ollama

# O usa el script de verificación
/home/codedoc/Code-Doc-Generator/ova-setup/scripts/verify-system.sh
```

### Reiniciar un servicio

```bash
sudo systemctl restart code-doc-backend
sudo systemctl restart code-doc-frontend
sudo systemctl restart code-doc-n8n
sudo systemctl restart ollama
```

### Ver logs de un servicio

```bash
sudo journalctl -u code-doc-backend -f
sudo journalctl -u code-doc-frontend -f
```

### Detener todos los servicios

```bash
sudo systemctl stop code-doc-backend
sudo systemctl stop code-doc-frontend
sudo systemctl stop code-doc-n8n
sudo systemctl stop ollama
```

### Iniciar todos los servicios

```bash
sudo systemctl start ollama
sudo systemctl start code-doc-n8n
sudo systemctl start code-doc-backend
sudo systemctl start code-doc-frontend
```

---

## 🐛 Solución de Problemas

### La aplicación no carga en el navegador

1. Verifica que la VM esté encendida
2. Espera 2-3 minutos después de iniciar la VM
3. Verifica que los servicios estén corriendo:
   ```bash
   /home/codedoc/Code-Doc-Generator/ova-setup/scripts/verify-system.sh
   ```
4. Si algún servicio está caído, reinícialo:
   ```bash
   sudo systemctl restart code-doc-backend
   sudo systemctl restart code-doc-frontend
   ```

### La IA no genera documentación

1. Verifica que Ollama esté corriendo:
   ```bash
   sudo systemctl status ollama
   ```
2. Verifica que el modelo esté instalado:
   ```bash
   ollama list
   ```
3. Si no aparece `llama3.2`, descárgalo:
   ```bash
   ollama pull llama3.2
   ```

### n8n no funciona

1. Verifica que Docker esté corriendo:
   ```bash
   sudo systemctl status docker
   ```
2. Verifica el contenedor de n8n:
   ```bash
   docker ps | grep n8n
   ```
3. Reinicia el servicio:
   ```bash
   sudo systemctl restart code-doc-n8n
   ```

### El frontend no se conecta al backend

1. Verifica que ambos servicios estén corriendo
2. Verifica que no haya conflictos de puertos
3. Revisa los logs del backend:
   ```bash
   sudo journalctl -u code-doc-backend -n 50
   ```

### Rendimiento lento

1. Asigna más RAM a la VM (recomendado: 8 GB)
2. Asigna más núcleos de CPU (recomendado: 4 núcleos)
3. Cierra aplicaciones innecesarias en tu máquina host

---

## 🔐 Seguridad

### Cambiar contraseña del usuario del sistema

```bash
passwd codedoc
```

### Cambiar contraseña de administrador

Edita el archivo `.env` en el backend:

```bash
nano /home/codedoc/Code-Doc-Generator/backend/.env
```

Cambia la línea:
```
ADMIN_PASSWORD=admin123
```

Luego reinicia el backend:
```bash
sudo systemctl restart code-doc-backend
```

### Configurar email SMTP

Edita el archivo `.env`:

```bash
nano /home/codedoc/Code-Doc-Generator/backend/.env
```

Configura:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
```

Reinicia el backend:
```bash
sudo systemctl restart code-doc-backend
```

---

## 🌐 Configuración de Red

### Acceso desde otras computadoras en la red local

Por defecto, la VM solo es accesible desde tu máquina host (localhost). Para permitir acceso desde otras computadoras:

1. Apaga la VM
2. En VirtualBox, selecciona la VM → **Configuración**
3. Ve a **Red**
4. Cambia "NAT" a "Adaptador puente" (Bridged Adapter)
5. Inicia la VM
6. Dentro de la VM, obtén la IP:
   ```bash
   ip addr show
   ```
7. Accede desde otras computadoras usando la IP obtenida:
   ```
   http://192.168.x.x:5173
   ```

---

## 📚 Recursos Adicionales

### Documentación completa

Dentro de la VM, en:
```
/home/codedoc/Code-Doc-Generator/ova-setup/docs/
```

### Archivos importantes

- **Backend**: `/home/codedoc/Code-Doc-Generator/backend/`
- **Frontend**: `/home/codedoc/Code-Doc-Generator/frontend/`
- **Base de datos**: `/home/codedoc/Code-Doc-Generator/code_doc_gen.db`
- **Configuración n8n**: `/home/codedoc/Code-Doc-Generator/ova-setup/docker/`

---

## 📞 Soporte

### Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca

- **Proyecto**: Taller de Especialidad - SHC131
- **Contacto**: (Agrega tu email o contacto aquí)

### Problemas conocidos

Consulta el archivo `KNOWN_ISSUES.md` en la carpeta `docs/`

---

## 📝 Licencia

Este proyecto es propiedad de la Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca.

Todos los derechos reservados © 2024

---

## ✅ Checklist de Inicio Rápido

- [ ] VirtualBox instalado
- [ ] Archivo OVA importado
- [ ] VM iniciada
- [ ] Navegador abierto en http://localhost:5173
- [ ] Usuario registrado en la aplicación
- [ ] Primer archivo de código documentado exitosamente

**¡Disfruta usando Code Doc Generator!** 🚀
