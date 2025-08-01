package com.restaurante.botpedidos.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.restaurante.botpedidos.model.Producto;
import com.restaurante.botpedidos.Repository.ProductoRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoController {

    @Autowired
    private ProductoRepository productoRepository;

    // Obtener todos los productos
    @GetMapping
    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    // Obtener un producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProductoById(@PathVariable Long id) {
        Optional<Producto> producto = productoRepository.findById(id);

        if (producto.isPresent()) {
            return ResponseEntity.ok(producto.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Crear un nuevo producto
    @PostMapping
    public ResponseEntity<?> createProducto(@RequestBody Producto producto) {
        // Validaciones básicas
        if (producto.getNombre() == null || producto.getNombre().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("El nombre del producto es obligatorio.");
        }

        if (producto.getPrecio() == null || producto.getPrecio() <= 0) {
            return ResponseEntity.badRequest().body("El precio debe ser mayor que 0.");
        }

        if (producto.getDisponible() == null) {
            producto.setDisponible(true); // Por defecto disponible
        }

        Producto productoGuardado = productoRepository.save(producto);
        return ResponseEntity.ok(productoGuardado);
    }

    // Actualizar un producto
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProducto(@PathVariable Long id, @RequestBody Producto productoDetails) {
        Optional<Producto> productoOpt = productoRepository.findById(id);

        if (productoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Producto producto = productoOpt.get();

        // Validaciones
        if (productoDetails.getNombre() != null && !productoDetails.getNombre().trim().isEmpty()) {
            producto.setNombre(productoDetails.getNombre());
        }

        if (productoDetails.getPrecio() != null && productoDetails.getPrecio() > 0) {
            producto.setPrecio(productoDetails.getPrecio());
        }

        if (productoDetails.getDisponible() != null) {
            producto.setDisponible(productoDetails.getDisponible());
        }

        Producto productoActualizado = productoRepository.save(producto);
        return ResponseEntity.ok(productoActualizado);
    }

    // Eliminar un producto
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProducto(@PathVariable Long id) {
        Optional<Producto> productoOpt = productoRepository.findById(id);

        if (productoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        productoRepository.deleteById(id);
        return ResponseEntity.ok("Producto eliminado con éxito");
    }
}