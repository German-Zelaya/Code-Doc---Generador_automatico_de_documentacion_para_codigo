#!/bin/bash

#####################################################################
# Script de Instalación Automática - Code Doc Generator
# Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca
# Proyecto: Generador Automático de Documentación de Código
#####################################################################

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_DIR="/home/codedoc/Code-Doc-Generator"
SYSTEM_USER="codedoc"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Code Doc Generator - Instalación Automática             ║"
echo "║   Universidad San Francisco Xavier de Chuquisaca          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Función para imprimir con color
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root (sudo)"
    exit 1
fi

print_info "Iniciando instalación del sistema Code Doc Generator..."
sleep 2

#####################################################################
# PASO 1: Actualizar el sistema
#####################################################################
print_info "Paso 1/10: Actualizando el sistema..."
apt-get update -qq
apt-get upgrade -y -qq
print_status "Sistema actualizado"

#####################################################################
# PASO 2: Instalar dependencias base
#####################################################################
print_info "Paso 2/10: Instalando dependencias del sistema..."
apt-get install -y -qq \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    docker.io \
    docker-compose \
    sqlite3 \
    software-properties-common \
    ca-certificates \
    gnupg \
    lsb-release

print_status "Dependencias instaladas"

#####################################################################
# PASO 3: Crear usuario del sistema
#####################################################################
print_info "Paso 3/10: Configurando usuario del sistema..."
if id "$SYSTEM_USER" &>/dev/null; then
    print_warning "Usuario $SYSTEM_USER ya existe"
else
    useradd -m -s /bin/bash $SYSTEM_USER
    usermod -aG docker $SYSTEM_USER
    print_status "Usuario $SYSTEM_USER creado"
fi

#####################################################################
# PASO 4: Instalar Ollama
#####################################################################
print_info "Paso 4/10: Instalando Ollama..."
if command -v ollama &> /dev/null; then
    print_warning "Ollama ya está instalado"
else
    curl -fsSL https://ollama.ai/install.sh | sh
    print_status "Ollama instalado"
fi

#####################################################################
# PASO 5: Copiar proyecto al directorio del usuario
#####################################################################
print_info "Paso 5/10: Configurando proyecto..."
if [ -d "$PROJECT_DIR" ]; then
    print_warning "El directorio del proyecto ya existe"
else
    mkdir -p $PROJECT_DIR
    # Copiar todo el proyecto
    cp -r /tmp/Code-Doc-Generator/* $PROJECT_DIR/
    chown -R $SYSTEM_USER:$SYSTEM_USER $PROJECT_DIR
    print_status "Proyecto copiado"
fi

#####################################################################
# PASO 6: Instalar dependencias de Python
#####################################################################
print_info "Paso 6/10: Instalando dependencias de Python..."
cd $PROJECT_DIR/backend
sudo -u $SYSTEM_USER pip3 install --user -r requirements.txt
print_status "Dependencias de Python instaladas"

#####################################################################
# PASO 7: Instalar dependencias de Node.js
#####################################################################
print_info "Paso 7/10: Instalando dependencias de Node.js..."
cd $PROJECT_DIR/frontend
sudo -u $SYSTEM_USER npm install
sudo -u $SYSTEM_USER npm run build
print_status "Dependencias de Node.js instaladas y proyecto compilado"

#####################################################################
# PASO 8: Configurar servicios systemd
#####################################################################
print_info "Paso 8/10: Configurando servicios systemd..."
cp $PROJECT_DIR/ova-setup/systemd/*.service /etc/systemd/system/
systemctl daemon-reload

# Habilitar servicios
systemctl enable ollama.service
systemctl enable code-doc-n8n.service
systemctl enable code-doc-backend.service
systemctl enable code-doc-frontend.service

print_status "Servicios systemd configurados"

#####################################################################
# PASO 9: Iniciar Ollama y descargar modelo
#####################################################################
print_info "Paso 9/10: Iniciando Ollama y descargando modelo llama3.2..."
systemctl start ollama.service
sleep 5

# Descargar modelo llama3.2
sudo -u $SYSTEM_USER ollama pull llama3.2
print_status "Modelo llama3.2 descargado"

#####################################################################
# PASO 10: Iniciar servicios
#####################################################################
print_info "Paso 10/10: Iniciando todos los servicios..."

# Iniciar Docker
systemctl start docker
systemctl enable docker

# Iniciar n8n
systemctl start code-doc-n8n.service
sleep 10

# Iniciar backend
systemctl start code-doc-backend.service
sleep 5

# Iniciar frontend
systemctl start code-doc-frontend.service
sleep 5

print_status "Todos los servicios iniciados"

#####################################################################
# CONFIGURACIÓN FINAL
#####################################################################
print_info "Configurando firewall y red..."

# Configurar UFW (firewall)
ufw allow 5173/tcp comment 'Code Doc Frontend'
ufw allow 8000/tcp comment 'Code Doc Backend'
ufw allow 5678/tcp comment 'n8n'
ufw allow 11434/tcp comment 'Ollama'

print_status "Firewall configurado"

#####################################################################
# VERIFICACIÓN
#####################################################################
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ¡Instalación completada exitosamente!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Servicios instalados y en ejecución:"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "  ${BLUE}n8n:${NC}       http://localhost:5678"
echo -e "  ${BLUE}Ollama:${NC}    http://localhost:11434"
echo ""
echo "Para verificar el estado de los servicios:"
echo "  sudo systemctl status code-doc-backend"
echo "  sudo systemctl status code-doc-frontend"
echo "  sudo systemctl status code-doc-n8n"
echo "  sudo systemctl status ollama"
echo ""
echo -e "${YELLOW}Nota:${NC} Todos los servicios se iniciarán automáticamente al reiniciar el sistema."
echo ""
echo "Para acceder a la aplicación, abre un navegador y ve a:"
echo -e "  ${GREEN}http://localhost:5173${NC}"
echo ""
