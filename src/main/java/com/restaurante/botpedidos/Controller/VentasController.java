package com.restaurante.botpedidos.Controller;

import com.restaurante.botpedidos.Repository.PedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentasController {

    @Autowired
    private PedidoRepository pedidoRepository;

    // ✅ Total de ventas (solo pedidos entregados con éxito)
    @GetMapping("/total")
    public ResponseEntity<Double> getTotalVentas() {
        Double total = pedidoRepository.obtenerTotalVentas();
        return ResponseEntity.ok(total != null ? total : 0.0);
    }

    // ✅ Productos más vendidos
    @GetMapping("/productos-top")
    public ResponseEntity<List<Object[]>> getProductosTop() {
        List<Object[]> result = pedidoRepository.obtenerProductosMasVendidos();
        return ResponseEntity.ok(result);
    }

    // ✅ Pedidos fallidos con su comentario
    @GetMapping("/fallidos")
    public ResponseEntity<List<Object[]>> getPedidosFallidos() {
        List<Object[]> result = pedidoRepository.obtenerPedidosFallidos();
        return ResponseEntity.ok(result);
    }
    @GetMapping("/total-por-fecha")
    public ResponseEntity<Map<String, Object>> getTotalVentasPorFecha(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam("fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        Double total = pedidoRepository.obtenerTotalVentasPorFecha(inicio, fin);

        Map<String, Object> response = new HashMap<>();
        response.put("totalVentas", total != null ? total : 0.0);
        response.put("moneda", "COP");

        Map<String, String> rangoFechas = new HashMap<>();
        rangoFechas.put("inicio", inicio.toString());
        rangoFechas.put("fin", fin.toString());

        response.put("rangoFechas", rangoFechas);

        return ResponseEntity.ok(response);
    }

    // Pedidos exitosos por rango de fechas
    @GetMapping("/exitosos-por-fecha")
    public ResponseEntity<List<Object[]>> getPedidosExitososPorFecha(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam("fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        List<Object[]> result = pedidoRepository.obtenerPedidosExitososPorFecha(inicio, fin);
        return ResponseEntity.ok(result);
    }

    // Pedidos fallidos por rango de fechas
    @GetMapping("/fallidos-por-fecha")
    public ResponseEntity<List<Object[]>> getPedidosFallidosPorFecha(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam("fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        List<Object[]> result = pedidoRepository.obtenerPedidosFallidosPorFecha(inicio, fin);
        return ResponseEntity.ok(result);
    }

    // Productos más vendidos por rango de fechas
    @GetMapping("/productos-top-por-fecha")
    public ResponseEntity<List<Object[]>> getProductosTopPorFecha(
            @RequestParam("inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam("fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {

        List<Object[]> result = pedidoRepository.obtenerProductosMasVendidosPorFecha(inicio, fin);
        return ResponseEntity.ok(result);
    }
}