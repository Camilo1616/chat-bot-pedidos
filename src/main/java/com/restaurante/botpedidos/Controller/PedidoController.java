package com.restaurante.botpedidos.Controller;

import com.restaurante.botpedidos.model.Pedido;
import com.restaurante.botpedidos.model.Producto;
import com.restaurante.botpedidos.Repository.PedidoRepository;
import com.restaurante.botpedidos.Repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*") // Permitir CORS para el frontend
public class PedidoController {

    @Autowired
    private PedidoRepository pedidoRepo;

    @Autowired
    private ProductoRepository productoRepo;

    @GetMapping
    public List<Pedido> obtenerTodosLosPedidos() {
        return pedidoRepo.findAll();
    }

    // Endpoint para obtener solo pedidos activos (en proceso y en camino)
    @GetMapping("/activos")
    public List<Pedido> obtenerPedidosPendientes() {
        return pedidoRepo.findAll().stream()
                .filter(p -> "pendiente".equals(p.getEstado()))
                .collect(Collectors.toList());
    }

    // Endpoint para obtener pedidos exitosos
    @GetMapping("/exitosos")
    public List<Pedido> obtenerPedidosExitosos() {
        return pedidoRepo.findAll().stream()
                .filter(p -> "entregado con éxito".equals(p.getEstado()))
                .collect(Collectors.toList());
    }

    // Endpoint para buscar pedidos
    @GetMapping("/buscar")
    public List<Pedido> buscarPedidos(@RequestParam String q) {
        String termino = q.toLowerCase();
        return pedidoRepo.findAll().stream()
                .filter(p -> {
                    // Buscar por ID
                    boolean coincideId = p.getId().toString().contains(termino);

                    // Buscar por cliente
                    boolean coincideCliente = p.getCliente() != null &&
                            p.getCliente().toLowerCase().contains(termino);

                    // Buscar por productos
                    boolean coincideProducto = p.getProductos() != null &&
                            p.getProductos().stream()
                                    .anyMatch(prod -> prod.getNombre().toLowerCase().contains(termino));

                    return coincideId || coincideCliente || coincideProducto;
                })
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Pedido pedido) {
        List<Producto> productosFinales = new ArrayList<>();
        List<String> noDisponibles = new ArrayList<>();

        for (Producto p : pedido.getProductos()) {
            Producto productoExistente = productoRepo.findById(p.getId()).orElse(null);

            if (productoExistente == null) {
                noDisponibles.add("ID " + p.getId() + " (no existe)");
            } else if (!productoExistente.getDisponible()) {
                noDisponibles.add(productoExistente.getNombre());
            } else {
                productosFinales.add(productoExistente);
            }
        }

        if (!noDisponibles.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    "Los siguientes productos no están disponibles: " +
                            String.join(", ", noDisponibles) +
                            ". Por favor cámbialos o selecciona otros."
            );
        }

        pedido.setProductos(productosFinales);
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado("pendiente");
        // comentario se queda null - lo agregará el cocinero después

        return ResponseEntity.ok(pedidoRepo.save(pedido));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarPedido(@PathVariable Long id, @RequestBody Pedido pedidoActualizado) {
        Pedido pedido = pedidoRepo.findById(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        pedido.setEstado(pedidoActualizado.getEstado());
        pedido.setComentario(pedidoActualizado.getComentario());

        return ResponseEntity.ok(pedidoRepo.save(pedido));
    }

    // Endpoint para marcar un pedido como exitoso (opcional, para futuras mejoras)
    @PostMapping("/{id}/marcar-exitoso")
    public ResponseEntity<?> marcarComoExitoso(@PathVariable Long id) {
        Pedido pedido = pedidoRepo.findById(id).orElse(null);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }

        pedido.setEstado("entregado con éxito");
        return ResponseEntity.ok(pedidoRepo.save(pedido));
    }

    // Endpoint para obtener estadísticas básicas
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        List<Pedido> todosPedidos = pedidoRepo.findAll();

        long enProceso = todosPedidos.stream()
                .filter(p -> "en proceso".equals(p.getEstado()))
                .count();

        long enCamino = todosPedidos.stream()
                .filter(p -> "en camino".equals(p.getEstado()))
                .count();

        long entregados = todosPedidos.stream()
                .filter(p -> "entregado con éxito".equals(p.getEstado()))
                .count();

        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("enProceso", enProceso);
        estadisticas.put("enCamino", enCamino);
        estadisticas.put("exitosos", entregados);

        return ResponseEntity.ok(estadisticas);
    }

}