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
    @Builder
    public static class ResumenProductosGlobal {
        private long totalArticulosVendidos;
        private List<TopProducto> rankingGlobal;
        private List<ProductosPorMaquina> porMaquina;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductosPorMaquina {
        private Long maquinaId;
        private String nombreMaquina;
        private long totalArticulosVendidos;
        private List<TopProducto> ranking;
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

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ResumenMonedasGlobal {
        private List<ResumenMoneda> totalGlobal;
        private List<MonedasPorMaquina> porMaquina;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonedasPorMaquina {
        private Long maquinaId;
        private String nombreMaquina;
        private List<ResumenMoneda> monedas;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ResumenPedidos {
        private int totalGlobal;
        private List<PedidosPorMaquina> porMaquina;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PedidosPorMaquina {
        private Long maquinaId;
        private String nombreMaquina;
        private int totalPedidos;
    }
}
