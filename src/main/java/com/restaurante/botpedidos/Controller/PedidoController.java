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

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ProductoRepository productoRepository;

    // Listar todos los pedidos
    @GetMapping
    public List<Pedido> getAllPedidos() {
        return pedidoRepository.findAllPedidosDistinct();
    }

    // Crear pedido con productos
    @PostMapping
    public ResponseEntity<?> crearPedido(@RequestBody Pedido pedido) {

        // ✅ 1. Si el estado viene vacío o nulo, se asigna "en proceso"
        if (pedido.getEstado() == null || pedido.getEstado().trim().isEmpty()) {
            pedido.setEstado("en proceso");
        }

        for (PedidoProducto pp : pedido.getPedidoProductos()) {
            Producto producto = productoRepository.findById(pp.getProducto().getId())
                    .orElse(null);

            if (producto == null) {
                return ResponseEntity.badRequest().body("Producto no encontrado");
            }

            // ✅ 2. Validar cantidad mayor a 0
            if (pp.getCantidad() <= 0) {
                return ResponseEntity.badRequest().body("La cantidad debe ser mayor que 0 para el producto: " + producto.getNombre());
            }

            // ✅ 3. Verificar disponibilidad
            if (!Boolean.TRUE.equals(producto.getDisponible())) {
                return ResponseEntity.badRequest().body("El producto '" + producto.getNombre() + "' no está disponible");
            }

            // Asignar el producto completo y el pedido
            pp.setProducto(producto);
            pp.setPedido(pedido);
        }

        pedido.setFecha(LocalDateTime.now());
        Pedido nuevoPedido = pedidoRepository.save(pedido);

        // Recuperar pedido completo con productos
        Pedido pedidoConProductos = pedidoRepository.findById(nuevoPedido.getId()).orElse(nuevoPedido);

        return ResponseEntity.ok(pedidoConProductos);
    }

    // Actualizar estado
    private static final List<String> ESTADOS_VALIDOS = List.of("en proceso", "en camino", "entregado con éxito", "cancelado");

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPedido(@PathVariable Long id, @RequestBody Pedido pedidoDetails) {
        Pedido pedido = pedidoRepository.findById(id).orElseThrow();

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
        pedidoRepository.deleteById(id);
        return ResponseEntity.ok("Pedido eliminado correctamente");
    }
}
