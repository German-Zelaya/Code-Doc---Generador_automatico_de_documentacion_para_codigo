#!/bin/bash

#####################################################################
# Script para Crear OVA - Code Doc Generator
# Este script debe ejecutarse en tu máquina HOST (no en la VM)
#####################################################################

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Code Doc Generator - Creador de OVA                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Nombre de la VM
VM_NAME="CodeDocGenerator"
OVA_NAME="CodeDocGenerator-v1.0.ova"

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar VBoxManage
if ! command -v VBoxManage &> /dev/null; then
    print_error "VBoxManage no encontrado. Asegúrate de tener VirtualBox instalado."
    exit 1
fi

print_info "Verificando VM '$VM_NAME'..."

# Verificar si la VM existe
if ! VBoxManage list vms | grep -q "\"$VM_NAME\""; then
    print_error "La VM '$VM_NAME' no existe."
    echo ""
    echo "Por favor, crea primero la VM siguiendo estos pasos:"
    echo "1. Crear nueva VM en VirtualBox"
    echo "2. Instalar Ubuntu Server 22.04 LTS"
    echo "3. Ejecutar el script de instalación dentro de la VM"
    echo "4. Apagar la VM"
    echo "5. Ejecutar este script nuevamente"
    exit 1
fi

print_status "VM encontrada"

# Verificar que la VM esté apagada
VM_STATE=$(VBoxManage showvminfo "$VM_NAME" --machinereadable | grep "VMState=" | cut -d'"' -f2)

if [ "$VM_STATE" != "poweroff" ]; then
    print_error "La VM debe estar apagada para exportar. Estado actual: $VM_STATE"
    echo ""
    echo "Apaga la VM con:"
    echo "  VBoxManage controlvm \"$VM_NAME\" poweroff"
    exit 1
fi

print_status "VM apagada, lista para exportar"

# Exportar a OVA
print_info "Exportando VM a OVA..."
print_info "Esto puede tomar varios minutos..."

VBoxManage export "$VM_NAME" \
    --output "$OVA_NAME" \
    --vsys 0 \
    --product "Code Doc Generator" \
    --producturl "https://www.usfx.bo" \
    --vendor "Universidad San Francisco Xavier de Chuquisaca" \
    --version "1.0" \
    --description "Sistema completo de generación automática de documentación de código con IA. Incluye Frontend (React), Backend (FastAPI), n8n y Ollama pre-configurados." \
    --eulafile "../docs/EULA.txt"

if [ $? -eq 0 ]; then
    print_status "OVA creado exitosamente"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ¡OVA creado exitosamente!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Archivo OVA: $OVA_NAME"
    echo "Tamaño: $(du -h "$OVA_NAME" | cut -f1)"
    echo ""
    echo "Para distribuir el OVA, los usuarios deben:"
    echo "1. Importar el archivo OVA en VirtualBox"
    echo "2. Iniciar la VM"
    echo "3. Acceder a http://localhost:5173 en el navegador"
    echo ""
    echo "Credenciales por defecto:"
    echo "  Usuario del sistema: codedoc"
    echo "  Contraseña: (la que configuraste durante la instalación)"
    echo ""
else
    print_error "Error al crear el OVA"
    exit 1
fi
