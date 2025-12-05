#!/bin/bash

#####################################################################
# Script de Verificación del Sistema - Code Doc Generator
#####################################################################

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Code Doc Generator - Verificación del Sistema           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Función para verificar servicio
check_service() {
    local service=$1
    local port=$2
    local name=$3

    echo -n "Verificando $name... "

    if systemctl is-active --quiet $service; then
        echo -e "${GREEN}✓ Activo${NC}"

        if [ ! -z "$port" ]; then
            if curl -s http://localhost:$port > /dev/null 2>&1; then
                echo -e "  Puerto $port: ${GREEN}✓ Respondiendo${NC}"
            else
                echo -e "  Puerto $port: ${YELLOW}! No responde${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ Inactivo${NC}"
        echo -e "  ${YELLOW}Intenta: sudo systemctl start $service${NC}"
    fi
    echo ""
}

# Función para verificar puerto
check_port() {
    local port=$1
    local name=$2

    echo -n "Verificando $name en puerto $port... "

    if curl -s http://localhost:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Respondiendo${NC}"
    else
        echo -e "${RED}✗ No responde${NC}"
    fi
}

# Verificar servicios
echo -e "${BLUE}═══ Servicios del Sistema ═══${NC}"
echo ""
check_service "ollama" "11434" "Ollama AI"
check_service "code-doc-backend" "8000" "Backend API"
check_service "code-doc-frontend" "5173" "Frontend"
check_service "code-doc-n8n" "5678" "n8n"

# Verificar Docker
echo -e "${BLUE}═══ Docker ═══${NC}"
echo ""
echo -n "Estado de Docker... "
if systemctl is-active --quiet docker; then
    echo -e "${GREEN}✓ Activo${NC}"
    echo ""
    echo "Contenedores en ejecución:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo -e "${RED}✗ Inactivo${NC}"
fi
echo ""

# Verificar modelo Ollama
echo -e "${BLUE}═══ Modelo de IA ═══${NC}"
echo ""
echo "Modelos de Ollama instalados:"
ollama list 2>/dev/null || echo -e "${RED}No se pudo conectar a Ollama${NC}"
echo ""

# Verificar conectividad
echo -e "${BLUE}═══ Conectividad ═══${NC}"
echo ""
check_port "5173" "Frontend"
check_port "8000" "Backend API"
check_port "5678" "n8n"
check_port "11434" "Ollama"
echo ""

# Resumen
echo -e "${BLUE}═══ Resumen ═══${NC}"
echo ""
echo "URLs de acceso:"
echo -e "  ${GREEN}Frontend:${NC}  http://localhost:5173"
echo -e "  ${GREEN}Backend:${NC}   http://localhost:8000"
echo -e "  ${GREEN}n8n:${NC}       http://localhost:5678"
echo -e "  ${GREEN}Ollama:${NC}    http://localhost:11434"
echo ""

# Base de datos
if [ -f "/home/codedoc/Code-Doc-Generator/code_doc_gen.db" ]; then
    echo -e "Base de datos: ${GREEN}✓ Encontrada${NC}"
else
    echo -e "Base de datos: ${YELLOW}! No encontrada${NC}"
fi
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Para ver logs de un servicio:"
echo "  sudo journalctl -u <servicio> -f"
echo ""
echo "Ejemplo:"
echo "  sudo journalctl -u code-doc-backend -f"
echo ""
