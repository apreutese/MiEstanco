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
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
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
    public ResponseEntity<ApiResponse<EstadisticasDto.ResumenProductosGlobal>> getTopProductos(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        LocalDateTime desde;
        LocalDateTime hasta;
        if ("CUSTOM".equalsIgnoreCase(rangoTiempo) && fechaInicio != null && fechaFin != null) {
            desde = fechaInicio.atStartOfDay();
            hasta = fechaFin.atTime(23, 59, 59);
        } else {
            desde = getFechaDesde(rangoTiempo);
            hasta = LocalDateTime.now();
        }

        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, hasta);

        long totalArticulosVendidos = 0;
        Map<Long, EstadisticasDto.TopProducto> productosGlobalMap = new HashMap<>();
        
        // Map: MaquinaId -> (Map: ProductoId -> TopProducto)
        Map<Long, Map<Long, EstadisticasDto.TopProducto>> maquinaProductosMap = new HashMap<>();
        Map<Long, String> maquinaNombres = new HashMap<>();

        for (Pedido p : pedidos) {
            Long mId = p.getMaquina().getId();
            String mNombre = p.getMaquina().getNombre();
            maquinaNombres.put(mId, mNombre);
            
            maquinaProductosMap.putIfAbsent(mId, new HashMap<>());
            Map<Long, EstadisticasDto.TopProducto> maqMap = maquinaProductosMap.get(mId);

            for (LineaPedidoProducto lp : p.getLineasProducto()) {
                Long pId = lp.getProducto().getId();
                String pNombre = lp.getProducto().getNombre();
                String pUrl = lp.getProducto().getFotoUrl();
                long cant = lp.getCantidad();
                
                totalArticulosVendidos += cant;

                // Acumular global
                productosGlobalMap.putIfAbsent(pId, new EstadisticasDto.TopProducto(pId, pNombre, pUrl, 0));
                productosGlobalMap.get(pId).setCantidadVendida(
                    productosGlobalMap.get(pId).getCantidadVendida() + cant
                );
                
                // Acumular por máquina
                maqMap.putIfAbsent(pId, new EstadisticasDto.TopProducto(pId, pNombre, pUrl, 0));
                maqMap.get(pId).setCantidadVendida(
                    maqMap.get(pId).getCantidadVendida() + cant
                );
            }
        }

        List<EstadisticasDto.TopProducto> rankingGlobal = productosGlobalMap.values().stream()
                .sorted(Comparator.comparing(EstadisticasDto.TopProducto::getCantidadVendida).reversed())
                .collect(Collectors.toList());

        List<EstadisticasDto.ProductosPorMaquina> porMaquina = new ArrayList<>();
        for (Map.Entry<Long, Map<Long, EstadisticasDto.TopProducto>> entry : maquinaProductosMap.entrySet()) {
            Long mId = entry.getKey();
            List<EstadisticasDto.TopProducto> maqRanking = entry.getValue().values().stream()
                    .sorted(Comparator.comparing(EstadisticasDto.TopProducto::getCantidadVendida).reversed())
                    .collect(Collectors.toList());
            
            long totalMaq = maqRanking.stream().mapToLong(EstadisticasDto.TopProducto::getCantidadVendida).sum();
            
            porMaquina.add(new EstadisticasDto.ProductosPorMaquina(
                mId, maquinaNombres.get(mId), totalMaq, maqRanking
            ));
        }

        porMaquina.sort(Comparator.comparing(EstadisticasDto.ProductosPorMaquina::getNombreMaquina));

        EstadisticasDto.ResumenProductosGlobal result = EstadisticasDto.ResumenProductosGlobal.builder()
                .totalArticulosVendidos(totalArticulosVendidos)
                .rankingGlobal(rankingGlobal)
                .porMaquina(porMaquina)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/monedas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EstadisticasDto.ResumenMonedasGlobal>> getMonedas(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        LocalDateTime desde;
        LocalDateTime hasta;
        if ("CUSTOM".equalsIgnoreCase(rangoTiempo) && fechaInicio != null && fechaFin != null) {
            desde = fechaInicio.atStartOfDay();
            hasta = fechaFin.atTime(23, 59, 59);
        } else {
            desde = getFechaDesde(rangoTiempo);
            hasta = LocalDateTime.now();
        }

        // Filtrado por máquina si se proporciona
        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, hasta);

        // Map: MaquinaId -> (Map: MonedaId -> ResumenMoneda)
        Map<Long, Map<Long, EstadisticasDto.ResumenMoneda>> maquinaMonedasMap = new HashMap<>();
        Map<Long, String> maquinaNombres = new HashMap<>();
        Map<Long, EstadisticasDto.ResumenMoneda> globalMonedasMap = new HashMap<>();

        for (Pedido p : pedidos) {
            Long mId = p.getMaquina().getId();
            String mNombre = p.getMaquina().getNombre();
            maquinaNombres.put(mId, mNombre);
            
            maquinaMonedasMap.putIfAbsent(mId, new HashMap<>());
            Map<Long, EstadisticasDto.ResumenMoneda> monedasMap = maquinaMonedasMap.get(mId);

            for (LineaPedidoMoneda lm : p.getLineasMoneda()) {
                Long monId = lm.getMoneda().getId();
                int valor = lm.getMoneda().getValorCentimos();
                
                // Agrupar por máquina
                monedasMap.putIfAbsent(monId, new EstadisticasDto.ResumenMoneda(monId, valor, 0));
                monedasMap.get(monId).setCantidadEnviada(
                    monedasMap.get(monId).getCantidadEnviada() + lm.getCantidad()
                );
                
                // Agrupar global
                globalMonedasMap.putIfAbsent(monId, new EstadisticasDto.ResumenMoneda(monId, valor, 0));
                globalMonedasMap.get(monId).setCantidadEnviada(
                    globalMonedasMap.get(monId).getCantidadEnviada() + lm.getCantidad()
                );
            }
        }

        List<EstadisticasDto.MonedasPorMaquina> listaPorMaquina = new ArrayList<>();
        for (Map.Entry<Long, Map<Long, EstadisticasDto.ResumenMoneda>> entry : maquinaMonedasMap.entrySet()) {
            Long mId = entry.getKey();
            List<EstadisticasDto.ResumenMoneda> monedasOrdenadas = entry.getValue().values().stream()
                    .sorted(Comparator.comparing(EstadisticasDto.ResumenMoneda::getValorCentimos).reversed())
                    .collect(Collectors.toList());
            
            listaPorMaquina.add(new EstadisticasDto.MonedasPorMaquina(mId, maquinaNombres.get(mId), monedasOrdenadas));
        }

        listaPorMaquina.sort(Comparator.comparing(EstadisticasDto.MonedasPorMaquina::getNombreMaquina));

        List<EstadisticasDto.ResumenMoneda> totalGlobal = globalMonedasMap.values().stream()
                .sorted(Comparator.comparing(EstadisticasDto.ResumenMoneda::getValorCentimos).reversed())
                .collect(Collectors.toList());

        EstadisticasDto.ResumenMonedasGlobal global = EstadisticasDto.ResumenMonedasGlobal.builder()
                .totalGlobal(totalGlobal)
                .porMaquina(listaPorMaquina)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(global));
    }

    @GetMapping("/pedidos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EstadisticasDto.ResumenPedidos>> getTotalPedidos(
            @RequestParam(required = false, defaultValue = "MES") String rangoTiempo,
            @RequestParam(required = false) Long maquinaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        LocalDateTime desde;
        LocalDateTime hasta;
        if ("CUSTOM".equalsIgnoreCase(rangoTiempo) && fechaInicio != null && fechaFin != null) {
            desde = fechaInicio.atStartOfDay();
            hasta = fechaFin.atTime(23, 59, 59);
        } else {
            desde = getFechaDesde(rangoTiempo);
            hasta = LocalDateTime.now();
        }

        // Filtrado por máquina si se proporciona
        List<Pedido> pedidos = pedidoRepository.findHistorial(EstadoPedido.ENTREGADO, maquinaId, desde, hasta);

        Map<Long, EstadisticasDto.PedidosPorMaquina> map = new HashMap<>();
        
        for (Pedido p : pedidos) {
            Long mId = p.getMaquina().getId();
            String mNombre = p.getMaquina().getNombre();
            map.putIfAbsent(mId, new EstadisticasDto.PedidosPorMaquina(mId, mNombre, 0));
            map.get(mId).setTotalPedidos(map.get(mId).getTotalPedidos() + 1);
        }

        List<EstadisticasDto.PedidosPorMaquina> desglose = map.values().stream()
                .sorted(Comparator.comparing(EstadisticasDto.PedidosPorMaquina::getTotalPedidos).reversed())
                .collect(Collectors.toList());

        EstadisticasDto.ResumenPedidos resumen = EstadisticasDto.ResumenPedidos.builder()
                .totalGlobal(pedidos.size())
                .porMaquina(desglose)
                .build();

        return ResponseEntity.ok(ApiResponse.ok(resumen));
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
