package com.restaurante.botpedidos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Getter
@Setter
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cliente;

    private LocalDateTime fecha;

    @Column(nullable = false)
    private String estado;

    // Comentario OPCIONAL - lo agrega el cocinero/administrador después
    @Column(length = 500, nullable = true)
    private String comentario;

    @ManyToMany
    @JoinTable(
            name = "pedido_productos",
            joinColumns = @JoinColumn(name = "pedido_id"),
            inverseJoinColumns = @JoinColumn(name = "productos_id")
    )
    private List<Producto> productos;
}