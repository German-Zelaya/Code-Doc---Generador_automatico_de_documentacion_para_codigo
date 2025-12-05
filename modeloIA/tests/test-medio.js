class Producto {
    constructor(nombre, precio, stock) {
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
    }

    vender(cantidad) {
        if (cantidad <= 0) {
            return false;
        }
        if (cantidad > this.stock) {
            return false;
        }
        this.stock -= cantidad;
        return true;
    }

    reponer(cantidad) {
        if (cantidad > 0) {
            this.stock += cantidad;
        }
    }
}

class Carrito {
    constructor() {
        this.items = [];
    }

    agregarProducto(producto, cantidad) {
        if (producto.vender(cantidad)) {
            this.items.push({
                nombre: producto.nombre,
                cantidad: cantidad,
                precio: producto.precio
            });
            return true;
        }
        return false;
    }

    calcularTotal() {
        let total = 0;
        for (let item of this.items) {
            total += item.cantidad * item.precio;
        }
        return total;
    }

    mostrarResumen() {
        console.log("Resumen del carrito:");
        for (let item of this.items) {
            console.log(`${item.nombre} x${item.cantidad} = ${item.cantidad * item.precio}`);
        }
        console.log("Total:", this.calcularTotal());
    }
}

class Tienda {
    constructor() {
        this.productos = [];
    }

    registrarProducto(nombre, precio, stock) {
        const producto = new Producto(nombre, precio, stock);
        this.productos.push(producto);
        return producto;
    }

    buscarProducto(nombre) {
        for (let producto of this.productos) {
            if (producto.nombre.toLowerCase() === nombre.toLowerCase()) {
                return producto;
            }
        }
        return null;
    }

    listarProductos() {
        console.log("Productos disponibles:");
        for (let producto of this.productos) {
            console.log(`${producto.nombre} - Precio: ${producto.precio} - Stock: ${producto.stock}`);
        }
    }
}

// Ejemplo de uso
const tienda = new Tienda();
tienda.registrarProducto("Laptop", 1200, 5);
tienda.registrarProducto("Mouse", 25, 10);
tienda.registrarProducto("Teclado", 45, 8);

tienda.listarProductos();

const carrito = new Carrito();
const laptop = tienda.buscarProducto("Laptop");
const mouse = tienda.buscarProducto("Mouse");

if (laptop) {
    carrito.agregarProducto(laptop, 1);
}
if (mouse) {
    carrito.agregarProducto(mouse, 2);
}

carrito.mostrarResumen();