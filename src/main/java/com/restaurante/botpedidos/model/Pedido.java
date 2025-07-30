package com.restaurante.botpedidos.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "pedido")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String cliente;

    @Column(nullable = false)
    private String estado;

    private LocalDateTime fecha;

    private String comentario;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<PedidoProducto> pedidoProductos;

    // ✅ Constructor vacío (obligatorio para JPA)
    public Pedido() {
    }

    // ✅ Constructor con parámetros
    public Pedido(Long id, String cliente, String estado, LocalDateTime fecha, String comentario, List<PedidoProducto> pedidoProductos) {
        this.id = id;
        this.cliente = cliente;
        this.estado = estado;
        this.fecha = fecha;
        this.comentario = comentario;
        this.pedidoProductos = pedidoProductos;
    }

    // ✅ Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public LocalDateTime getFecha() { return fecha; }
    public void setFecha(LocalDateTime fecha) { this.fecha = fecha; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public List<PedidoProducto> getPedidoProductos() { return pedidoProductos; }
    public void setPedidoProductos(List<PedidoProducto> pedidoProductos) { this.pedidoProductos = pedidoProductos; }
}
