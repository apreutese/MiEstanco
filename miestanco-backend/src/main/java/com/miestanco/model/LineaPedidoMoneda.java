package com.miestanco.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lineas_pedido_moneda")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LineaPedidoMoneda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "moneda_id", nullable = false)
    private Moneda moneda;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    @Builder.Default
    private Boolean preparada = false;
}
