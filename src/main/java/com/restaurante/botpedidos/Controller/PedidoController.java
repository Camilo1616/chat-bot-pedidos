package com.restaurante.botpedidos.Controller;

import com.restaurante.botpedidos.Repository.PedidoRepository;
import com.restaurante.botpedidos.Repository.ProductoRepository;
import com.restaurante.botpedidos.model.Pedido;
import com.restaurante.botpedidos.model.PedidoProducto;
import com.restaurante.botpedidos.model.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @GetMapping
    public List<Pedido> getAllPedidos() {
        return pedidoRepository.findAllPedidosDistinct();
    }

    @GetMapping("/en-camino-entregados")
    public List<Pedido> getPedidosEnCaminoYEntregados() {
        return pedidoRepository.findPedidosEnCaminoYEntregados();
    }

    @GetMapping("/en-proceso")
    public List<Pedido> getPedidosEnProceso() {
        return pedidoRepository.findPedidosEnProceso();
    }

    // Crear pedido con productos
    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Pedido pedido) {
        // Validar productos
        if (pedido.getPedidoProductos() == null || pedido.getPedidoProductos().isEmpty()) {
            return ResponseEntity.badRequest().body("El pedido debe contener al menos un producto.");
        }

        // Validar y cargar productos completos
        for (PedidoProducto pp : pedido.getPedidoProductos()) {
            if (pp.getCantidad() <= 0) {
                return ResponseEntity.badRequest().body("La cantidad debe ser mayor que 0");
            }

            // Cargar el producto completo desde la base de datos
            if (pp.getProducto() != null && pp.getProducto().getId() != null) {
                Optional<Producto> productoCompleto = productoRepository.findById(pp.getProducto().getId());
                if (productoCompleto.isEmpty()) {
                    return ResponseEntity.badRequest().body("El producto con ID " + pp.getProducto().getId() + " no existe.");
                }

                // Verificar que el producto está disponible
                if (!productoCompleto.get().isDisponible()) {
                    return ResponseEntity.badRequest().body("El producto " + productoCompleto.get().getNombre() + " no está disponible.");
                }

                // Asignar el producto completo con todos sus datos
                pp.setProducto(productoCompleto.get());
            }
        }

        // Asignar fecha y estado inicial
        pedido.setFecha(LocalDateTime.now());
        if (pedido.getEstado() == null || pedido.getEstado().isEmpty()) {
            pedido.setEstado("en proceso");
        }

        // Establecer la relación bidireccional
        for (PedidoProducto pp : pedido.getPedidoProductos()) {
            pp.setPedido(pedido);
        }

        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        return ResponseEntity.ok(pedidoGuardado);
    }

    // Actualizar estado
    private static final List<String> ESTADOS_VALIDOS = List.of("en proceso", "en camino", "entregado con éxito", "cancelado");

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPedido(@PathVariable Long id, @RequestBody Pedido pedidoDetails) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);

        if (pedidoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Pedido pedido = pedidoOpt.get();

        // Validar estado
        if (pedidoDetails.getEstado() == null || !ESTADOS_VALIDOS.contains(pedidoDetails.getEstado().toLowerCase())) {
            return ResponseEntity.badRequest().body("Estado inválido. Estados permitidos: " + ESTADOS_VALIDOS);
        }

        pedido.setEstado(pedidoDetails.getEstado());
        pedido.setComentario(pedidoDetails.getComentario());

        Pedido actualizado = pedidoRepository.save(pedido);
        return ResponseEntity.ok(actualizado);
    }

    // Eliminar pedido
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarPedido(@PathVariable Long id) {
        Optional<Pedido> pedidoOpt = pedidoRepository.findById(id);

        if (pedidoOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        pedidoRepository.deleteById(id);
        return ResponseEntity.ok("Pedido eliminado correctamente");
    }
}