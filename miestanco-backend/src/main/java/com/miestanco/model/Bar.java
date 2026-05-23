package com.miestanco.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bares")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Bar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 250)
    private String direccion;

    @Column(length = 20)
    private String telefono;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
