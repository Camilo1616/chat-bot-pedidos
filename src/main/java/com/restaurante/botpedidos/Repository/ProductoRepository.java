package com.restaurante.botpedidos.Repository;

import com.restaurante.botpedidos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findAll();

    Producto save(Producto producto);
}
