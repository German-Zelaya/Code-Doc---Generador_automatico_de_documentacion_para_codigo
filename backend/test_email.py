import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os

load_dotenv()

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

print(f"Intentando enviar desde: {SMTP_USER}")
print(f"Contraseña configurada: {'Sí' if SMTP_PASSWORD else 'NO'}")

try:
    msg = MIMEMultipart()
    msg['From'] = SMTP_USER
    msg['To'] = SMTP_USER  # Te envías a ti mismo
    msg['Subject'] = "Test de Email - Code Doc"
    
    body = "Si recibes este email, la configuración funciona correctamente!"
    msg.attach(MIMEText(body, 'plain'))
    
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.set_debuglevel(1)  # Ver más detalles
        server.starttls()
        print("Conectando...")
        server.login(SMTP_USER, SMTP_PASSWORD)
        print("Login exitoso!")
        server.send_message(msg)
        print("¡Email enviado!")
        
except Exception as e:
    print(f"ERROR: {e}")