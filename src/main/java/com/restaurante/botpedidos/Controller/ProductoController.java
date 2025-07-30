package com.restaurante.botpedidos.Controller;

import com.restaurante.botpedidos.Repository.ProductoRepository;
import com.restaurante.botpedidos.model.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;


    @RestController
    @RequestMapping("/api/productos")
    public class ProductoController {

        @Autowired
        private ProductoRepository productoRepo;

        @GetMapping
        public List<Producto> listar() {
            return productoRepo.findAll();
        }

        @PostMapping
        public Producto guardar(@RequestBody Producto producto) {
            return productoRepo.save(producto);
        }
        @DeleteMapping("/{id}")
        public void eliminarProducto(@PathVariable Long id) {
            productoRepo.deleteById(id);
        }
    }

