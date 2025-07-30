package com.restaurante.botpedidos.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Data
@Getter
@Setter
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Double precio;
    private Boolean disponible;

    @ManyToMany(mappedBy = "productos")
    @JsonIgnore
    private List<Pedido> pedidos;

    public boolean isDisponible() {
        return disponible;
    }

}
