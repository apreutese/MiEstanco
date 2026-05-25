package com.miestanco.controller;

import com.miestanco.dto.EstadisticasDto;
import com.miestanco.dto.response.ApiResponse;
import com.miestanco.enums.EstadoPedido;
import com.miestanco.model.Maquina;
import com.miestanco.model.Pedido;
import com.miestanco.model.LineaPedidoProducto;
import com.miestanco.model.LineaPedidoMoneda;
import com.miestanco.repository.MaquinaRepository;
import com.miestanco.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/estadisticas")
@RequiredArgsConstructor
public class EstadisticasController {

    private final PedidoRepository pedidoRepository;
    private final MaquinaRepository maquinaRepository;

    @GetMapping("/top-productos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EstadisticasDto.TopProducto>>> getTopProductos(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId) {

        LocalDateTime desde = getFechaDesde(rangoTiempo);
        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, LocalDateTime.now());

        Map<Long, EstadisticasDto.TopProducto> productosMap = new HashMap<>();

        for (Pedido p : pedidos) {
            for (LineaPedidoProducto lp : p.getLineasProducto()) {
                Long pId = lp.getProducto().getId();
                String pNombre = lp.getProducto().getNombre();
                String pFotoUrl = lp.getProducto().getFotoUrl();
                productosMap.putIfAbsent(pId, new EstadisticasDto.TopProducto(pId, pNombre, pFotoUrl, 0));
                productosMap.get(pId).setCantidadVendida(
                    productosMap.get(pId).getCantidadVendida() + lp.getCantidad()
                );
            }
        }

        List<EstadisticasDto.TopProducto> top = productosMap.values().stream()
                .sorted(Comparator.comparing(EstadisticasDto.TopProducto::getCantidadVendida).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(top));
    }

    @GetMapping("/monedas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EstadisticasDto.ResumenMoneda>>> getMonedasEnviadas(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId) {

        LocalDateTime desde = getFechaDesde(rangoTiempo);
        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, LocalDateTime.now());

        Map<Long, EstadisticasDto.ResumenMoneda> monedasMap = new HashMap<>();

        for (Pedido p : pedidos) {
            for (LineaPedidoMoneda lm : p.getLineasMoneda()) {
                Long mId = lm.getMoneda().getId();
                int mValor = lm.getMoneda().getValorCentimos();
                monedasMap.putIfAbsent(mId, new EstadisticasDto.ResumenMoneda(mId, mValor, 0));
                monedasMap.get(mId).setCantidadEnviada(
                    monedasMap.get(mId).getCantidadEnviada() + lm.getCantidad()
                );
            }
        }

        List<EstadisticasDto.ResumenMoneda> result = monedasMap.values().stream()
                .sorted(Comparator.comparing(EstadisticasDto.ResumenMoneda::getValorCentimos).reversed())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Integer>> getTotalPedidos(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId) {

        LocalDateTime desde = getFechaDesde(rangoTiempo);
        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, LocalDateTime.now());

        return ResponseEntity.ok(ApiResponse.ok(pedidos.size()));
    }

    @GetMapping("/alertas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EstadisticasDto.MaquinaInactiva>>> getAlertas() {
        
        List<EstadisticasDto.MaquinaInactiva> inactivas = new ArrayList<>();
        List<Maquina> todas = maquinaRepository.findAll().stream()
                .filter(m -> Boolean.TRUE.equals(m.getActiva()))
                .toList();
                
        for (Maquina m : todas) {
            Optional<Pedido> ultimo = pedidoRepository.findFirstByMaquina_IdOrderByFechaCreacionDesc(m.getId());
            long dias = -1;
            if (ultimo.isPresent()) {
                dias = ChronoUnit.DAYS.between(ultimo.get().getFechaCreacion(), LocalDateTime.now());
            } else {
                dias = 999;
            }
            
            if (dias >= 7) {
                inactivas.add(new EstadisticasDto.MaquinaInactiva(
                    m.getId(), m.getNombre(), m.getBar().getNombre(), dias
                ));
            }
        }
        
        inactivas.sort(Comparator.comparing(EstadisticasDto.MaquinaInactiva::getDiasInactiva).reversed());
        return ResponseEntity.ok(ApiResponse.ok(inactivas));
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
