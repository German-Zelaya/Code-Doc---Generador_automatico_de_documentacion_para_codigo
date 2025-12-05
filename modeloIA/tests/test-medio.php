<?php

class Pedido {
    private $id;
    private $cliente;
    private $items = [];
    private $estado;

    public function __construct($id, $cliente) {
        $this->id = $id;
        $this->cliente = $cliente;
        $this->estado = "pendiente";
    }

    public function agregarItem($nombre, $cantidad, $precioUnitario) {
        if ($cantidad <= 0 || $precioUnitario <= 0) {
            return false;
        }
        $this->items[] = [
            "nombre" => $nombre,
            "cantidad" => $cantidad,
            "precio" => $precioUnitario
        ];
        return true;
    }

    public function calcularTotal() {
        $total = 0;
        foreach ($this->items as $item) {
            $total += $item["cantidad"] * $item["precio"];
        }
        return $total;
    }

    public function procesar() {
        if (empty($this->items)) {
            $this->estado = "rechazado";
        } else {
            $this->estado = "procesado";
        }
    }

    public function mostrarResumen() {
        echo "Pedido #{$this->id} - Cliente: {$this->cliente}\n";
        echo "Estado: {$this->estado}\n";
        echo "Items:\n";
        foreach ($this->items as $item) {
            echo "- {$item['nombre']} x{$item['cantidad']} @ {$item['precio']} = " . ($item['cantidad'] * $item['precio']) . "\n";
        }
        echo "Total: " . $this->calcularTotal() . "\n";
    }
}

class GestorPedidos {
    private $pedidos = [];

    public function crearPedido($id, $cliente) {
        $pedido = new Pedido($id, $cliente);
        $this->pedidos[$id] = $pedido;
        return $pedido;
    }

    public function listarPedidos() {
        foreach ($this->pedidos as $pedido) {
            $pedido->mostrarResumen();
            echo "-------------------------\n";
        }
    }

    public function buscarPedido($id) {
        if (isset($this->pedidos[$id])) {
            return $this->pedidos[$id];
        }
        return null;
    }
}

$gestor = new GestorPedidos();
$p1 = $gestor->crearPedido(1, "Daniel");
$p1->agregarItem("Laptop", 1, 1200);
$p1->agregarItem("Mouse", 2, 25);
$p1->procesar();

$p2 = $gestor->crearPedido(2, "Ana");
$p2->procesar();

$gestor->listarPedidos();