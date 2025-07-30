package com.restaurante.botpedidos.Repository;

import com.restaurante.botpedidos.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}