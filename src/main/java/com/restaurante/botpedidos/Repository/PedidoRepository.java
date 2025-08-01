package com.restaurante.botpedidos.Repository;

import com.restaurante.botpedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // ✅ Traer todos los pedidos sin duplicados
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.pedidoProductos pp " +
            "LEFT JOIN FETCH pp.producto")
    List<Pedido> findAllPedidosDistinct();

    // ✅ Total de ventas (solo pedidos entregados con éxito)
    @Query("SELECT COALESCE(SUM(pp.cantidad * pr.precio), 0.0) FROM Pedido p " +
            "JOIN p.pedidoProductos pp " +
            "JOIN pp.producto pr " +
            "WHERE LOWER(p.estado) = 'entregado con éxito'")
    Double obtenerTotalVentas();

    // ✅ Productos más vendidos - CORREGIDO
    @Query("SELECT pr.nombre, SUM(pp.cantidad) AS total_vendido FROM Pedido p " +
            "JOIN p.pedidoProductos pp " +
            "JOIN pp.producto pr " +
            "WHERE LOWER(p.estado) = 'entregado con éxito' " +
            "GROUP BY pr.id, pr.nombre " +
            "ORDER BY total_vendido DESC")
    List<Object[]> obtenerProductosMasVendidos();

    // ✅ Pedidos fallidos con su comentario - CORREGIDO
    @Query("SELECT p.id, p.cliente, p.comentario FROM Pedido p " +
            "WHERE LOWER(p.estado) IN ('cancelado', 'fallido') " +
            "AND p.comentario IS NOT NULL AND TRIM(p.comentario) <> ''")
    List<Object[]> obtenerPedidosFallidos();

    // Total de ventas por rango de fechas
    @Query("SELECT COALESCE(SUM(pp.cantidad * pr.precio), 0.0) FROM Pedido p " +
            "JOIN p.pedidoProductos pp " +
            "JOIN pp.producto pr " +
            "WHERE LOWER(p.estado) = 'entregado con éxito' " +
            "AND p.fecha BETWEEN :fechaInicio AND :fechaFin")
    Double obtenerTotalVentasPorFecha(java.time.LocalDateTime fechaInicio, java.time.LocalDateTime fechaFin);

    @Query("SELECT p FROM Pedido p WHERE LOWER(p.estado) = 'en proceso'")
    List<Pedido> findPedidosEnProceso();

    @Query("SELECT p FROM Pedido p WHERE LOWER(p.estado) <> 'en proceso'")
    List<Pedido> findPedidosOtros();

    List<Pedido> findByEstado(String estado);
    List<Pedido> findByEstadoNot(String estado);

    @Query("SELECT p FROM Pedido p WHERE LOWER(p.estado) IN ('en camino', 'entregado con éxito')")
    List<Pedido> findPedidosEnCaminoYEntregados();

    // Pedidos exitosos por rango de fechas
    @Query("SELECT p.id, p.cliente, p.fecha, SUM(pp.cantidad * pr.precio) AS total " +
            "FROM Pedido p " +
            "JOIN p.pedidoProductos pp " +
            "JOIN pp.producto pr " +
            "WHERE LOWER(p.estado) = 'entregado con éxito' " +
            "AND p.fecha BETWEEN :fechaInicio AND :fechaFin " +
            "GROUP BY p.id, p.cliente, p.fecha " +
            "ORDER BY p.fecha DESC")
    List<Object[]> obtenerPedidosExitososPorFecha(java.time.LocalDateTime fechaInicio, java.time.LocalDateTime fechaFin);

    // Pedidos fallidos por rango de fechas - CORREGIDO
    @Query("SELECT p.id, p.cliente, p.fecha, p.estado, p.comentario " +
            "FROM Pedido p " +
            "WHERE LOWER(p.estado) IN ('cancelado', 'fallido') " +
            "AND p.fecha BETWEEN :fechaInicio AND :fechaFin " +
            "ORDER BY p.fecha DESC")
    List<Object[]> obtenerPedidosFallidosPorFecha(java.time.LocalDateTime fechaInicio, java.time.LocalDateTime fechaFin);

    // Productos más vendidos por rango de fechas - CORREGIDO
    @Query("SELECT pr.nombre, SUM(pp.cantidad) AS total_vendido FROM Pedido p " +
            "JOIN p.pedidoProductos pp " +
            "JOIN pp.producto pr " +
            "WHERE LOWER(p.estado) = 'entregado con éxito' " +
            "AND p.fecha BETWEEN :fechaInicio AND :fechaFin " +
            "GROUP BY pr.id, pr.nombre " +
            "ORDER BY total_vendido DESC")
    List<Object[]> obtenerProductosMasVendidosPorFecha(java.time.LocalDateTime fechaInicio, java.time.LocalDateTime fechaFin);
}