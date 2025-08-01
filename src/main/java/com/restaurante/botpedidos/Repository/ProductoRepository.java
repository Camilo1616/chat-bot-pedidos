package com.restaurante.botpedidos.Repository;

import com.restaurante.botpedidos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}