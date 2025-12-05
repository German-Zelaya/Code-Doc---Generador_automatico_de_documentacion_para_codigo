# Inicio Rápido - Code Doc Generator OVA

## 🚀 5 Pasos para Empezar

### 1️⃣ Importar el OVA

1. Abre **VirtualBox**
2. **Archivo → Importar servicio virtualizado**
3. Selecciona `CodeDocGenerator-v1.0.ova`
4. Haz clic en **Importar**

### 2️⃣ Iniciar la VM

1. Selecciona **CodeDocGenerator**
2. Haz clic en **Iniciar**
3. Espera **2-3 minutos** mientras arrancan los servicios

### 3️⃣ Abrir la Aplicación

En tu navegador (en tu máquina, NO dentro de la VM):

```
http://localhost:5173
```

### 4️⃣ Registrarte

1. Haz clic en **"Registrarse"**
2. Completa el formulario
3. Inicia sesión

### 5️⃣ Documentar Código

1. Sube un archivo `.py`, `.js`, `.php`, `.go` o `.java`
2. Espera la generación automática
3. Exporta en DOCX, PDF o Markdown

---

## 🎯 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación Principal** | http://localhost:5173 | Interfaz web |
| Backend API | http://localhost:8000 | API REST |
| n8n | http://localhost:5678 | Automatización |

---

## 🔑 Credenciales

### Sistema (SSH/Consola)
- Usuario: `codedoc`
- Contraseña: `codedoc2024`

### Aplicación Web
- Debes registrarte (primera vez)

### Panel Admin
- Contraseña: `admin123`

---

## ❓ Problemas Comunes

### ❌ La página no carga

**Solución**: Espera 3 minutos y recarga la página. Los servicios tardan en iniciar.

### ❌ "Error al generar documentación"

**Solución**: Ollama está descargando el modelo. Espera 5 minutos e intenta de nuevo.

### ❌ No puedo acceder

**Solución**: Verifica que la VM esté encendida en VirtualBox.

---

## 🛟 Ayuda Rápida

Ver estado de servicios (dentro de la VM):

```bash
/home/codedoc/Code-Doc-Generator/ova-setup/scripts/verify-system.sh
```

---

## 📚 Documentación Completa

Consulta `README-OVA.md` para información detallada.

---

**¡Disfruta Code Doc Generator!** 🎉
