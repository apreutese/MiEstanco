package com.miestanco.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "maquinas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class Maquina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bar_id", nullable = false)
    private Bar bar;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(length = 100)
    private String tipo;

    @Column(columnDefinition = "TEXT")
    private String notas;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activa = true;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "maquina_productos",
        joinColumns = @JoinColumn(name = "maquina_id"),
        inverseJoinColumns = @JoinColumn(name = "producto_id")
    )
    @Builder.Default
    private List<Producto> productos = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "maquina_monedas",
        joinColumns = @JoinColumn(name = "maquina_id"),
        inverseJoinColumns = @JoinColumn(name = "moneda_id")
    )
    @Builder.Default
    private List<Moneda> monedas = new ArrayList<>();
}
