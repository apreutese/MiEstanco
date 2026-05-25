package com.miestanco.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasDto {

    private double ingresosTotales;
    private double monedasEnviadasValor;
    private int totalPedidos;

    private List<TopProducto> topProductos;
    private List<MaquinaInactiva> maquinasInactivas;

    @Data
    @AllArgsConstructor
    public static class TopProducto {
        private Long productoId;
        private String nombre;
        private long cantidadVendida;
    }

    @Data
    @AllArgsConstructor
    public static class MaquinaInactiva {
        private Long maquinaId;
        private String nombre;
        private String barNombre;
        private Long diasInactiva;
    }
}
