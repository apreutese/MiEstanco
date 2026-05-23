package com.miestanco.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "monedas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Moneda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String denominacion;

    @Column(nullable = false)
    private Integer valorCentimos;
}
