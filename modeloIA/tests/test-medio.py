import random
import string
from datetime import datetime, timedelta

class Usuario:
    def __init__(self, nombre, correo):
        self.nombre = nombre
        self.correo = correo
        self.id = self._generar_id()

    def _generar_id(self):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

    def cambiar_correo(self, nuevo_correo):
        self.correo = nuevo_correo

    def __str__(self):
        return f"{self.nombre} ({self.correo}) - ID: {self.id}"


class Sesion:
    def __init__(self, usuario):
        self.usuario = usuario
        self.inicio = datetime.now()
        self.expiracion = self.inicio + timedelta(minutes=30)
        self.token = self._generar_token()

    def _generar_token(self):
        return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

    def es_valida(self):
        return datetime.now() < self.expiracion

    def renovar(self):
        self.expiracion = datetime.now() + timedelta(minutes=30)
        self.token = self._generar_token()


class GestorUsuarios:
    def __init__(self):
        self.usuarios = {}
        self.sesiones = {}

    def registrar_usuario(self, nombre, correo):
        if correo in self.usuarios:
            return None
        usuario = Usuario(nombre, correo)
        self.usuarios[correo] = usuario
        return usuario

    def iniciar_sesion(self, correo):
        usuario = self.usuarios.get(correo)
        if not usuario:
            return None
        sesion = Sesion(usuario)
        self.sesiones[sesion.token] = sesion
        return sesion

    def validar_sesion(self, token):
        sesion = self.sesiones.get(token)
        if sesion and sesion.es_valida():
            return sesion.usuario
        return None

    def cerrar_sesion(self, token):
        if token in self.sesiones:
            del self.sesiones[token]


def generar_usuarios_prueba(gestor, cantidad):
    nombres = ["Ana", "Luis", "Carlos", "María", "Sofía", "Pedro"]
    for i in range(cantidad):
        nombre = random.choice(nombres)
        correo = f"{nombre.lower()}{i}@correo.com"
        gestor.registrar_usuario(nombre, correo)


if __name__ == "__main__":
    gestor = GestorUsuarios()
    generar_usuarios_prueba(gestor, 5)

    sesion = gestor.iniciar_sesion("ana0@correo.com")
    if sesion:
        print("Sesión iniciada:", sesion.token)
        print("Usuario validado:", gestor.validar_sesion(sesion.token))
        gestor.cerrar_sesion(sesion.token)
        print("Sesión cerrada")