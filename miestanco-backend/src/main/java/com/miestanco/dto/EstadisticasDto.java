package com.miestanco.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class EstadisticasDto {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopProducto {
        private Long productoId;
        private String nombre;
        private String fotoUrl;
        private long cantidadVendida;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MaquinaInactiva {
        private Long maquinaId;
        private String nombre;
        private String barNombre;
        private Long diasInactiva;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ResumenMoneda {
        private Long monedaId;
        private int valorCentimos;
        private long cantidadEnviada;
    }
}
