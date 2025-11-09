from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import re
from ai_model import generate_documentation_suggestions, regenerate_documentation, generate_final_document
from export_documents import create_docx, create_pdf_simple, create_markdown_document

# Cargar variables de entorno
load_dotenv()

# Configuración
SECRET_KEY = os.getenv("SECRET_KEY", "tu_clave_secreta_super_segura_cambiala")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
RESET_TOKEN_EXPIRE_MINUTES = 30

# Configuración de Email
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Base de datos SQLite
SQLALCHEMY_DATABASE_URL = "sqlite:///./code_doc_gen.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo de Usuario
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    reset_token = Column(String, nullable=True)
    reset_token_expires = Column(String, nullable=True)

# Crear tablas
Base.metadata.create_all(bind=engine)

# Configuración de encriptación
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

# FastAPI app
app = FastAPI(title="Code Documentation Generator API")

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas Pydantic
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class AdminLogin(BaseModel):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    
    class Config:
        from_attributes = True

class DocumentationRequest(BaseModel):
    code: str
    filename: str

class RegenerateRequest(BaseModel):
    code: str
    feedback: str = None

class AcceptDocumentationRequest(BaseModel):
    documented_code: str
    filename: str

class ExportRequest(BaseModel):
    documented_code: str
    filename: str
    format: str  # 'docx', 'pdf', 'markdown'

# Dependencias
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Funciones auxiliares
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_reset_token():
    return secrets.token_urlsafe(32)

def send_email(to_email: str, subject: str, body: str):
    """Enviar email usando Gmail SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        
        html_part = MIMEText(body, 'html')
        msg.attach(html_part)
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error enviando email: {e}")
        return False

# Endpoints
@app.post("/api/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    
    if db_user:
        if db_user.username == user.username:
            raise HTTPException(status_code=400, detail="El nombre de usuario ya está registrado")
        else:
            raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": new_user.username
    }

@app.post("/api/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == credentials.username_or_email) | 
        (User.email == credentials.username_or_email)
    ).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username
    }

@app.post("/api/password-reset-request")
def password_reset_request(request: PasswordResetRequest, db: Session = Depends(get_db)):
    """Solicitar recuperación de contraseña"""
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Este correo no está registrado en el sistema")
    
    reset_token = create_reset_token()
    expires = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    
    user.reset_token = reset_token
    user.reset_token_expires = expires.isoformat()
    db.commit()
    
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    email_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #1a1a1a; color: #ffffff; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .header h1 {{ margin: 0; font-size: 32px; letter-spacing: 2px; }}
            .content {{ background-color: #262626; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #999; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>CODE DOC</h1>
                <p>GENERADOR AUTOMÁTICO DE DOCUMENTACIÓN</p>
            </div>
            <div class="content">
                <h2>Recuperación de Contraseña</h2>
                <p>Hola <strong>{user.username}</strong>,</p>
                <p>Recibimos una solicitud para restablecer tu contraseña. Si no fuiste tú, ignora este email.</p>
                <p>Haz click en el botón de abajo para crear una nueva contraseña:</p>
                <a href="{reset_link}" class="button">RESTABLECER CONTRASEÑA</a>
                <p>O copia este enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #ea580c;">{reset_link}</p>
                <p><strong>Este enlace expira en {RESET_TOKEN_EXPIRE_MINUTES} minutos.</strong></p>
            </div>
            <div class="footer">
                <p>Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca</p>
                <p>Proyecto de Taller de Especialidad - SHC131</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    email_sent = send_email(
        to_email=user.email,
        subject="Recuperación de Contraseña - Code Doc Generator",
        body=email_body
    )
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Error al enviar el email")
    
    return {"message": "Si el correo existe, recibirás un email con instrucciones"}

@app.post("/api/password-reset")
def password_reset(reset_data: PasswordReset, db: Session = Depends(get_db)):
    """Restablecer contraseña usando el token"""
    user = db.query(User).filter(User.reset_token == reset_data.token).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")
    
    if user.reset_token_expires:
        expires = datetime.fromisoformat(user.reset_token_expires)
        if datetime.utcnow() > expires:
            raise HTTPException(status_code=400, detail="Token expirado")
    
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    return {"message": "Contraseña actualizada exitosamente"}

@app.get("/")
def root():
    return {"message": "Code Documentation Generator API - Running"}

# === ENDPOINTS DE ADMINISTRACIÓN ===

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

@app.post("/api/admin/login")
def admin_login(credentials: AdminLogin):
    """Login de administrador"""
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Contraseña de administrador incorrecta")
    
    access_token = create_access_token(data={"sub": "admin", "role": "admin"})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": "admin"
    }

@app.get("/api/admin/users", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    """Obtener todos los usuarios (solo admin)"""
    users = db.query(User).all()
    return users

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Eliminar un usuario por ID (solo admin)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    username = user.username
    db.delete(user)
    db.commit()
    
    return {"message": f"Usuario '{username}' eliminado exitosamente"}

# === ANÁLISIS DE CÓDIGO ===

LANGUAGE_PATTERNS = {
    'python': {
        'extensions': ['.py'],
        'function_pattern': r'def\s+\w+\s*\([^)]*\)\s*:',
        'class_pattern': r'class\s+\w+\s*[\(:]',
        'docstring_pattern': r'("""[\s\S]*?"""|\'\'\'[\s\S]*?\'\'\')',
        'comment_pattern': r'#.*$'
    },
    'javascript': {
        'extensions': ['.js', '.jsx', '.ts', '.tsx'],
        'function_pattern': r'(function\s+\w+\s*\([^)]*\)|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|\w+\s*\([^)]*\)\s*{)',
        'class_pattern': r'class\s+\w+\s*{',
        'docstring_pattern': r'/\*\*[\s\S]*?\*/',
        'comment_pattern': r'//.*$|/\*[\s\S]*?\*/'
    },
    'java': {
        'extensions': ['.java'],
        'function_pattern': r'(?:public|private|protected)?\s*(?:static\s+)?[\w<>\[\]]+\s+\w+\s*\([^)]*\)\s*{',
        'class_pattern': r'(?:public|private)?\s*class\s+\w+',
        'docstring_pattern': r'/\*\*[\s\S]*?\*/',
        'comment_pattern': r'//.*$|/\*[\s\S]*?\*/'
    }
}

def detect_language(filename: str) -> str:
    """Detectar lenguaje por extensión"""
    ext = os.path.splitext(filename)[1].lower()
    for lang, data in LANGUAGE_PATTERNS.items():
        if ext in data['extensions']:
            return lang
    return 'unknown'

def analyze_code(code: str, language: str) -> dict:
    """Analizar código y calcular estadísticas"""
    if language not in LANGUAGE_PATTERNS:
        return {
            'language': language,
            'total_lines': len(code.split('\n')),
            'functions_count': 0,
            'classes_count': 0,
            'documented_functions': 0,
            'documentation_percentage': 0
        }
    
    patterns = LANGUAGE_PATTERNS[language]
    lines = code.split('\n')
    total_lines = len(lines)
    
    functions = re.findall(patterns['function_pattern'], code, re.MULTILINE)
    functions_count = len(functions)
    
    classes = re.findall(patterns['class_pattern'], code, re.MULTILINE)
    classes_count = len(classes)
    
    documented_functions = 0
    
    if functions_count > 0:
        code_lines = code.split('\n')
        for i, line in enumerate(code_lines):
            if re.search(patterns['function_pattern'], line):
                search_range = '\n'.join(code_lines[i:min(i+5, len(code_lines))])
                if re.search(patterns['docstring_pattern'], search_range, re.MULTILINE):
                    documented_functions += 1
    
    documentation_percentage = 0
    if functions_count > 0:
        documentation_percentage = round((documented_functions / functions_count) * 100, 1)
    
    return {
        'language': language,
        'total_lines': total_lines,
        'functions_count': functions_count,
        'classes_count': classes_count,
        'documented_functions': documented_functions,
        'documentation_percentage': documentation_percentage
    }

@app.post("/api/analyze-code")
async def analyze_code_file(file: UploadFile = File(...)):
    """Analizar archivo de código subido"""
    try:
        content = await file.read()
        code = content.decode('utf-8')
        
        language = detect_language(file.filename)
        
        if language == 'unknown':
            raise HTTPException(
                status_code=400, 
                detail="Tipo de archivo no soportado. Soportamos: Python, JavaScript, Java"
            )
        
        analysis = analyze_code(code, language)
        analysis['filename'] = file.filename
        
        return analysis
        
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="El archivo no es un archivo de texto válido")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al analizar el archivo: {str(e)}")

# === ENDPOINTS DE IA ===

@app.post("/api/generate-documentation")
async def generate_documentation(request: DocumentationRequest):
    """Generar documentación usando el modelo de IA"""
    try:
        result = generate_documentation_suggestions(request.code)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("message", "Error al generar documentación"))
        
        return {
            "success": True,
            "documented_code": result["documented_code"],
            "original_code": result["original_code"],
            "statistics": result["statistics"],
            "filename": request.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/api/regenerate-documentation")
async def regenerate_doc(request: RegenerateRequest):
    """Regenerar documentación con feedback"""
    try:
        result = regenerate_documentation(request.code, request.feedback)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result.get("message", "Error al regenerar"))
        
        return {
            "success": True,
            "documented_code": result["documented_code"],
            "statistics": result["statistics"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.post("/api/accept-documentation")
async def accept_doc(request: AcceptDocumentationRequest):
    """Aceptar documentación y generar documento final"""
    try:
        final_doc = generate_final_document(request.documented_code, request.filename)
        
        return {
            "success": True,
            "final_document": final_doc,
            "message": "Documentación aceptada y documento generado"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# === ENDPOINTS DE EXPORTACIÓN ===

@app.post("/api/export")
async def export_document(request: ExportRequest):
    """Exportar documento en el formato especificado"""
    try:
        if request.format == 'docx':
            file_stream = create_docx(request.documented_code, request.filename, request.filename)
            filename = f"{request.filename.replace('.py', '')}_documented.docx"
            media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            
        elif request.format == 'pdf':
            file_stream = create_pdf_simple(request.documented_code, request.filename, request.filename)
            filename = f"{request.filename.replace('.py', '')}_documented.pdf"
            media_type = "application/pdf"
            
        elif request.format == 'markdown':
            markdown_content = create_markdown_document(request.documented_code, request.filename, request.filename)
            from io import BytesIO
            file_stream = BytesIO(markdown_content.encode('utf-8'))
            filename = f"{request.filename.replace('.py', '')}_documented.md"
            media_type = "text/markdown"
            
        else:
            raise HTTPException(status_code=400, detail="Formato no soportado. Use: docx, pdf, markdown")
        
        return StreamingResponse(
            file_stream,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al exportar: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)