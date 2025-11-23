<?php

class Usuario {
    private $id;
    private $nombre;
    private $correo;
    private $password;

    public function __construct($id, $nombre, $correo, $password) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->correo = $correo;
        $this->password = $password;
    }

    public function getId() {
        return $this->id;
    }

    public function getNombre() {
        return $this->nombre;
    }

    public function getCorreo() {
        return $this->correo;
    }

    public function validarPassword($password) {
        return $this->password === $password;
    }
}

class Proyecto {
    private $id;
    private $nombre;
    private $descripcion;
    private $tareas = [];

    public function __construct($id, $nombre, $descripcion) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->descripcion = $descripcion;
    }

    public function agregarTarea(Tarea $tarea) {
        $this->tareas[] = $tarea;
    }

    public function getTareas() {
        return $this->tareas;
    }

    public function getNombre() {
        return $this->nombre;
    }
}

class Tarea {
    private $id;
    private $titulo;
    private $estado;
    private $fechaLimite;

    public function __construct($id, $titulo, $fechaLimite) {
        $this->id = $id;
        $this->titulo = $titulo;
        $this->estado = "pendiente";
        $this->fechaLimite = $fechaLimite;
    }

    public function completar() {
        $this->estado = "completada";
    }

    public function getEstado() {
        return $this->estado;
    }

    public function getTitulo() {
        return $this->titulo;
    }

    public function getFechaLimite() {
        return $this->fechaLimite;
    }
}

class GestorUsuarios {
    private $usuarios = [];

    public function registrarUsuario($id, $nombre, $correo, $password) {
        $usuario = new Usuario($id, $nombre, $correo, $password);
        $this->usuarios[$correo] = $usuario;
        return $usuario;
    }

    public function autenticar($correo, $password) {
        if (isset($this->usuarios[$correo])) {
            $usuario = $this->usuarios[$correo];
            if ($usuario->validarPassword($password)) {
                return $usuario;
            }
        }
        return null;
    }
}

class GestorProyectos {
    private $proyectos = [];

    public function crearProyecto($id, $nombre, $descripcion) {
        $proyecto = new Proyecto($id, $nombre, $descripcion);
        $this->proyectos[$id] = $proyecto;
        return $proyecto;
    }

    public function obtenerProyecto($id) {
        return $this->proyectos[$id] ?? null;
    }

    public function listarProyectos() {
        return $this->proyectos;
    }
}

class Sistema {
    private $gestorUsuarios;
    private $gestorProyectos;

    public function __construct() {
        $this->gestorUsuarios = new GestorUsuarios();
        $this->gestorProyectos = new GestorProyectos();
    }

    public function registrarUsuario($id, $nombre, $correo, $password) {
        return $this->gestorUsuarios->registrarUsuario($id, $nombre, $correo, $password);
    }

    public function login($correo, $password) {
        return $this->gestorUsuarios->autenticar($correo, $password);
    }

    public function crearProyecto($id, $nombre, $descripcion) {
        return $this->gestorProyectos->crearProyecto($id, $nombre, $descripcion);
    }

    public function agregarTareaAProyecto($proyectoId, $tareaId, $titulo, $fechaLimite) {
        $proyecto = $this->gestorProyectos->obtenerProyecto($proyectoId);
        if ($proyecto) {
            $tarea = new Tarea($tareaId, $titulo, $fechaLimite);
            $proyecto->agregarTarea($tarea);
            return $tarea;
        }
        return null;
    }

    public function listarProyectos() {
        return $this->gestorProyectos->listarProyectos();
    }
}

$sistema = new Sistema();
$usuario = $sistema->registrarUsuario(1, "Daniel", "daniel@correo.com", "1234");
$login = $sistema->login("daniel@correo.com", "1234");

if ($login) {
    $proyecto = $sistema->crearProyecto(101, "Auditoría Web", "Proyecto de pruebas de seguridad");
    $sistema->agregarTareaAProyecto(101, 1, "Revisión OWASP", "2025-12-01");
    $sistema->agregarTareaAProyecto(101, 2, "Pruebas SSL", "2025-12-05");

    foreach ($proyecto->getTareas() as $tarea) {
        echo $tarea->getTitulo() . " - " . $tarea->getEstado() . " - " . $tarea->getFechaLimite() . PHP_EOL;
    }
}