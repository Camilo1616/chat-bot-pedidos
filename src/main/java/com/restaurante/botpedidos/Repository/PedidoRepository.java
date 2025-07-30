package com.restaurante.botpedidos.Repository;

import com.restaurante.botpedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    @Query("SELECT DISTINCT p FROM Pedido p " +
            "LEFT JOIN FETCH p.pedidoProductos pp " +
            "LEFT JOIN FETCH pp.producto")
    List<Pedido> findAllPedidosDistinct();
}