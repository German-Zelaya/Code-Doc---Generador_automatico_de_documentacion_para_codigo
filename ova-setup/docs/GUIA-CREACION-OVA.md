# Guía Completa para Crear el OVA de Code Doc Generator

Esta guía te ayudará a crear el archivo OVA desde cero, paso a paso.

---

## 📋 Requisitos Previos

### Software necesario:

- **VirtualBox** 6.0 o superior
- **Ubuntu Server 22.04 LTS ISO** (descarga desde https://ubuntu.com/download/server)
- Este repositorio clonado en tu máquina

### Recursos recomendados para la VM:

- **RAM**: 8 GB
- **CPU**: 4 núcleos
- **Disco**: 40 GB (dinámico)
- **Red**: NAT

---

## 🔧 Paso 1: Crear la Máquina Virtual

### 1.1 Crear nueva VM en VirtualBox

1. Abre VirtualBox
2. Haz clic en **Nuevo** (New)
3. Configura:
   - **Nombre**: `CodeDocGenerator`
   - **Tipo**: Linux
   - **Versión**: Ubuntu (64-bit)
   - Haz clic en **Siguiente**

### 1.2 Configurar memoria RAM

1. Asigna **8192 MB** (8 GB)
2. Haz clic en **Siguiente**

### 1.3 Configurar disco duro

1. Selecciona **Crear un disco duro virtual ahora**
2. Haz clic en **Crear**
3. Tipo de archivo: **VDI (VirtualBox Disk Image)**
4. Almacenamiento: **Dinámicamente asignado**
5. Tamaño: **40 GB**
6. Haz clic en **Crear**

### 1.4 Configuración adicional

1. Selecciona la VM recién creada
2. Haz clic en **Configuración** (Settings)
3. Ve a **Sistema → Procesador**
   - Asigna **4 CPUs**
4. Ve a **Red**
   - Adaptador 1: **NAT**
   - En **Avanzado**, haz clic en **Reenvío de puertos**
   - Agrega estas reglas:

| Nombre | Protocolo | IP anfitrión | Puerto anfitrión | IP invitado | Puerto invitado |
|--------|-----------|--------------|------------------|-------------|-----------------|
| Frontend | TCP | 127.0.0.1 | 5173 | | 5173 |
| Backend | TCP | 127.0.0.1 | 8000 | | 8000 |
| n8n | TCP | 127.0.0.1 | 5678 | | 5678 |
| Ollama | TCP | 127.0.0.1 | 11434 | | 11434 |
| SSH | TCP | 127.0.0.1 | 2222 | | 22 |

5. Haz clic en **Aceptar**

---

## 💿 Paso 2: Instalar Ubuntu Server

### 2.1 Montar la ISO

1. Selecciona la VM
2. Haz clic en **Configuración → Almacenamiento**
3. Selecciona el controlador IDE vacío
4. Haz clic en el icono de disco a la derecha
5. Selecciona **Elegir un archivo de disco**
6. Busca y selecciona la ISO de Ubuntu Server 22.04
7. Haz clic en **Aceptar**

### 2.2 Iniciar instalación

1. Inicia la VM
2. Selecciona el idioma: **English** (recomendado para evitar problemas)
3. Selecciona **Install Ubuntu Server**
4. Sigue el asistente de instalación:
   - **Keyboard**: English (US)
   - **Network**: Configuración automática (DHCP)
   - **Proxy**: Dejar en blanco
   - **Mirror**: Por defecto
   - **Storage**: Usar disco completo (por defecto)
   - **Profile Setup**:
     - Your name: `Code Doc Admin`
     - Server name: `codedoc-server`
     - Username: `codedoc`
     - Password: `codedoc2024` (o el que prefieras)
   - **SSH Setup**: Instalar OpenSSH server ✅
   - **Featured Server Snaps**: No seleccionar nada
5. Espera a que termine la instalación
6. Cuando termine, selecciona **Reboot Now**
7. Quita la ISO cuando se solicite (presiona Enter)

### 2.3 Primer inicio

1. Espera a que aparezca el prompt de login
2. Inicia sesión:
   - Usuario: `codedoc`
   - Contraseña: `codedoc2024`

---

## 📦 Paso 3: Preparar el Sistema

### 3.1 Actualizar el sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 3.2 Copiar el proyecto a la VM

Hay varias formas de hacerlo:

#### Opción A: Clonar desde Git (recomendado)

```bash
cd /tmp
git clone https://github.com/TU_USUARIO/Code-Doc-Generator.git
```

#### Opción B: Usar SCP desde tu máquina host

En tu máquina host (no en la VM):

```bash
# Comprimir el proyecto
cd /ruta/al/proyecto
tar -czf code-doc.tar.gz .

# Copiar a la VM (el puerto 2222 redirige al 22 de la VM)
scp -P 2222 code-doc.tar.gz codedoc@localhost:/tmp/
```

Luego, en la VM:

```bash
cd /tmp
tar -xzf code-doc.tar.gz
mv Code-Doc-Generator /tmp/
```

#### Opción C: Usar carpeta compartida de VirtualBox

1. Instala Guest Additions en la VM
2. Configura carpeta compartida en VirtualBox
3. Monta la carpeta dentro de la VM

---

## 🚀 Paso 4: Ejecutar el Script de Instalación

### 4.1 Preparar el script

```bash
cd /tmp/Code-Doc-Generator
chmod +x ova-setup/scripts/install.sh
```

### 4.2 Ejecutar instalación

```bash
sudo ./ova-setup/scripts/install.sh
```

Este script hará:

1. ✅ Actualizar el sistema
2. ✅ Instalar todas las dependencias (Python, Node.js, Docker, etc.)
3. ✅ Instalar Ollama y descargar el modelo llama3.2
4. ✅ Configurar servicios systemd
5. ✅ Iniciar todos los servicios
6. ✅ Configurar auto-inicio

**Nota**: Este proceso puede tomar entre 30-60 minutos dependiendo de tu conexión a internet.

### 4.3 Verificar la instalación

```bash
/home/codedoc/Code-Doc-Generator/ova-setup/scripts/verify-system.sh
```

Deberías ver todos los servicios en estado **✓ Activo**.

---

## 🧪 Paso 5: Probar el Sistema

### 5.1 Desde tu navegador (máquina host)

1. Abre: http://localhost:5173
2. Deberías ver la interfaz de Code Doc Generator
3. Regístrate y prueba documentar un archivo

### 5.2 Verificar todos los servicios

```bash
# Frontend
curl http://localhost:5173

# Backend
curl http://localhost:8000

# n8n
curl http://localhost:5678

# Ollama
curl http://localhost:11434
```

Si todos responden, el sistema está funcionando correctamente.

---

## 🧹 Paso 6: Limpiar el Sistema

Antes de exportar, es buena idea limpiar archivos temporales:

```bash
# Limpiar cache de apt
sudo apt clean
sudo apt autoclean
sudo apt autoremove -y

# Limpiar logs viejos
sudo journalctl --vacuum-time=1d

# Limpiar historial de bash
history -c
cat /dev/null > ~/.bash_history

# Limpiar archivos temporales
sudo rm -rf /tmp/*
sudo rm -rf /var/tmp/*
```

---

## 📤 Paso 7: Apagar y Exportar a OVA

### 7.1 Apagar la VM correctamente

Dentro de la VM:

```bash
sudo shutdown -h now
```

Espera a que la VM se apague completamente.

### 7.2 Exportar a OVA

#### Opción A: Usar el script automatizado

En tu máquina host, navega a la carpeta del proyecto:

```bash
cd /ruta/al/proyecto/ova-setup/scripts
chmod +x create-ova.sh
./create-ova.sh
```

#### Opción B: Exportar manualmente desde VirtualBox

1. Abre VirtualBox
2. Selecciona la VM **CodeDocGenerator**
3. Ve a **Archivo → Exportar servicio virtualizado**
4. Configura:
   - **Formato**: OVF 2.0
   - **Archivo**: Elige ubicación y nombre (`CodeDocGenerator-v1.0.ova`)
   - **Opciones**:
     - ✅ Incluir imágenes ISO
     - Modo MAC: Incluir solo direcciones de adaptadores NAT
5. En **Appliance settings**, completa:
   - **Producto**: Code Doc Generator
   - **Versión**: 1.0
   - **Proveedor**: Universidad San Francisco Xavier de Chuquisaca
   - **URL**: https://www.usfx.bo
   - **Descripción**: Sistema completo de generación automática de documentación de código con IA
6. Haz clic en **Exportar**
7. Espera a que se complete (puede tomar 10-30 minutos)

#### Opción C: Desde línea de comandos

```bash
VBoxManage export CodeDocGenerator \
    --output CodeDocGenerator-v1.0.ova \
    --vsys 0 \
    --product "Code Doc Generator" \
    --producturl "https://www.usfx.bo" \
    --vendor "Universidad San Francisco Xavier de Chuquisaca" \
    --version "1.0" \
    --description "Sistema completo de generación automática de documentación de código con IA. Incluye Frontend (React), Backend (FastAPI), n8n y Ollama pre-configurados."
```

---

## ✅ Paso 8: Verificar el OVA

### 8.1 Probar el OVA en una VM nueva

1. Crea una nueva VM importando el OVA
2. Inicia la VM
3. Espera 2-3 minutos
4. Accede a http://localhost:5173
5. Prueba todas las funcionalidades

### 8.2 Verificar tamaño del OVA

```bash
ls -lh CodeDocGenerator-v1.0.ova
```

El tamaño debería estar entre 10-20 GB.

---

## 📦 Paso 9: Distribuir

### 9.1 Crear un paquete completo

Crea una carpeta de distribución:

```
CodeDocGenerator-v1.0/
├── CodeDocGenerator-v1.0.ova
├── README-OVA.md
├── GUIA-INSTALACION.md
├── CHANGELOG.md
└── LICENSE.txt
```

### 9.2 Comprimir (opcional)

Si necesitas reducir el tamaño para distribución:

```bash
# Comprimir con 7-Zip (mejor compresión)
7z a -t7z -mx=9 CodeDocGenerator-v1.0.7z CodeDocGenerator-v1.0.ova

# O con zip
zip -9 CodeDocGenerator-v1.0.zip CodeDocGenerator-v1.0.ova
```

### 9.3 Calcular checksums

Para verificar integridad:

```bash
# MD5
md5sum CodeDocGenerator-v1.0.ova > CodeDocGenerator-v1.0.ova.md5

# SHA256
sha256sum CodeDocGenerator-v1.0.ova > CodeDocGenerator-v1.0.ova.sha256
```

---

## 🎯 Checklist Final

Antes de distribuir el OVA, verifica:

- [ ] Todos los servicios inician automáticamente al arrancar
- [ ] Frontend accesible en http://localhost:5173
- [ ] Backend API responde en http://localhost:8000
- [ ] n8n funciona en http://localhost:5678
- [ ] Ollama tiene el modelo llama3.2 instalado
- [ ] Se puede registrar un usuario nuevo
- [ ] Se puede documentar un archivo de código
- [ ] Se pueden exportar documentos (DOCX, PDF, Markdown)
- [ ] No hay credenciales sensibles hardcoded
- [ ] Documentación incluida y actualizada
- [ ] OVA probado en una instalación limpia de VirtualBox

---

## 🐛 Solución de Problemas Durante la Creación

### Error: "No se puede exportar mientras la VM está corriendo"

**Solución**: Apaga completamente la VM antes de exportar.

```bash
VBoxManage controlvm CodeDocGenerator poweroff
```

### Error: "Falta espacio en disco"

**Solución**: El OVA puede ser grande (10-20 GB). Asegúrate de tener suficiente espacio.

### Error al descargar modelo de Ollama

**Solución**: Si la descarga del modelo llama3.2 falla, descárgalo manualmente:

```bash
sudo systemctl start ollama
ollama pull llama3.2
```

### Servicios no inician automáticamente

**Solución**: Verifica que estén habilitados:

```bash
sudo systemctl enable ollama
sudo systemctl enable code-doc-backend
sudo systemctl enable code-doc-frontend
sudo systemctl enable code-doc-n8n
```

---

## 📞 Soporte

Si tienes problemas durante la creación del OVA:

1. Revisa los logs de instalación
2. Ejecuta el script de verificación
3. Consulta la documentación de VirtualBox

---

**¡Éxito creando tu OVA!** 🎉
