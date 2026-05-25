package com.miestanco.controller;

import com.miestanco.dto.EstadisticasDto;
import com.miestanco.enums.EstadoPedido;
import com.miestanco.model.Maquina;
import com.miestanco.model.Pedido;
import com.miestanco.model.LineaPedidoProducto;
import com.miestanco.model.LineaPedidoMoneda;
import com.miestanco.repository.MaquinaRepository;
import com.miestanco.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/estadisticas")
@RequiredArgsConstructor
public class EstadisticasController {

    private final PedidoRepository pedidoRepository;
    private final MaquinaRepository maquinaRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public EstadisticasDto getEstadisticas(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId) {

        LocalDateTime desde = getFechaDesde(rangoTiempo);
        LocalDateTime hasta = LocalDateTime.now();

        // 1. Obtener pedidos (filtrados por fecha y máquina opcional)
        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, hasta);

        double ingresosTotales = 0;
        double monedasEnviadas = 0;
        int totalPedidos = pedidos.size();
        
        Map<Long, EstadisticasDto.TopProducto> productosMap = new HashMap<>();

        for (Pedido p : pedidos) {
            // Sumar ingresos de productos
            for (LineaPedidoProducto lp : p.getLineasProducto()) {
                double sub = lp.getCantidad() * lp.getPrecioUnitario().doubleValue();
                ingresosTotales += sub;
                
                // Acumular cantidad vendida
                Long pId = lp.getProducto().getId();
                String pNombre = lp.getProducto().getNombre();
                productosMap.putIfAbsent(pId, new EstadisticasDto.TopProducto(pId, pNombre, 0));
                productosMap.get(pId).setCantidadVendida(
                    productosMap.get(pId).getCantidadVendida() + lp.getCantidad()
                );
            }

            // Sumar monedas
            for (LineaPedidoMoneda lm : p.getLineasMoneda()) {
                double sub = (lm.getCantidad() * lm.getMoneda().getValorCentimos()) / 100.0;
                monedasEnviadas += sub;
            }
        }

        // Ordenar productos top 5
        List<EstadisticasDto.TopProducto> topProductos = productosMap.values().stream()
                .sorted(Comparator.comparing(EstadisticasDto.TopProducto::getCantidadVendida).reversed())
                .limit(5)
                .collect(Collectors.toList());

        // 2. Obtener inactividad de máquinas (solo si maquinaId no está presente)
        List<EstadisticasDto.MaquinaInactiva> inactivas = new ArrayList<>();
        if (maquinaId == null) {
            List<Maquina> todas = maquinaRepository.findAll().stream()
                    .filter(m -> Boolean.TRUE.equals(m.getActiva()))
                    .toList();
                    
            for (Maquina m : todas) {
                Optional<Pedido> ultimo = pedidoRepository.findFirstByMaquina_IdOrderByFechaCreacionDesc(m.getId());
                long dias = -1;
                if (ultimo.isPresent()) {
                    dias = ChronoUnit.DAYS.between(ultimo.get().getFechaCreacion(), LocalDateTime.now());
                } else {
                    dias = 999; // Nunca ha pedido
                }
                
                if (dias >= 7) { // Mostrar si lleva >= 7 dias inactiva
                    inactivas.add(new EstadisticasDto.MaquinaInactiva(
                        m.getId(), m.getNombre(), m.getBar().getNombre(), dias
                    ));
                }
            }
            
            inactivas.sort(Comparator.comparing(EstadisticasDto.MaquinaInactiva::getDiasInactiva).reversed());
        }

        return EstadisticasDto.builder()
                .ingresosTotales(ingresosTotales)
                .monedasEnviadasValor(monedasEnviadas)
                .totalPedidos(totalPedidos)
                .topProductos(topProductos)
                .maquinasInactivas(inactivas)
                .build();
    }

    private LocalDateTime getFechaDesde(String rango) {
        LocalDateTime now = LocalDateTime.now();
        return switch (rango.toUpperCase()) {
            case "HOY" -> now.withHour(0).withMinute(0).withSecond(0);
            case "SEMANA" -> now.minusDays(7);
            case "MES" -> now.minusMonths(1);
            case "ANO" -> now.minusYears(1);
            case "TODO" -> LocalDateTime.of(2000, 1, 1, 0, 0);
            default -> now.minusMonths(1);
        };
    }
}
