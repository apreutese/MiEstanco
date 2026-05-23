package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import com.miestanco.enums.EstadoPedido;
import com.miestanco.model.Pedido;
import com.miestanco.service.PedidoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
@RequiredArgsConstructor
@Tag(name = "Pedidos", description = "Gestión de pedidos")
@SecurityRequirement(name = "bearerAuth")
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    @Operation(summary = "Listar pedidos activos (no entregados ni cancelados)")
    public ResponseEntity<ApiResponse<List<Pedido>>> listarActivos() {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.listarActivos()));
    }

    @GetMapping("/historial")
    @Operation(summary = "Historial de pedidos con filtros opcionales")
    public ResponseEntity<ApiResponse<List<Pedido>>> historial(
            @RequestParam(required = false) EstadoPedido estado,
            @RequestParam(required = false) Long maquinaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.listarHistorial(estado, maquinaId, desde, hasta)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalle de un pedido")
    public ResponseEntity<ApiResponse<Pedido>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.obtenerPorId(id)));
    }

    @GetMapping("/maquina/{maquinaId}/ultimo")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Obtener último pedido de una máquina (para repetir pedido)")
    public ResponseEntity<ApiResponse<Pedido>> ultimoPedido(@PathVariable Long maquinaId) {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.obtenerUltimoPedidoMaquina(maquinaId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear nuevo pedido")
    public ResponseEntity<ApiResponse<Pedido>> crear(@RequestBody CrearPedidoRequest req,
                                                      @AuthenticationPrincipal UserDetails userDetails) {
        Pedido pedido = pedidoService.crear(
                req.getMaquinaId(),
                userDetails.getUsername(),
                req.getProductos(),
                req.getMonedas(),
                req.getNotas(),
                req.getOfflineId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Pedido creado", pedido));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Editar pedido (solo en PENDIENTE o PREPARADO)")
    public ResponseEntity<ApiResponse<Pedido>> editar(@PathVariable Long id,
                                                       @RequestBody EditarPedidoRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido actualizado",
                pedidoService.editar(id, req.getProductos(), req.getMonedas(), req.getNotas())));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado del pedido")
    public ResponseEntity<ApiResponse<Pedido>> cambiarEstado(@PathVariable Long id,
                                                              @RequestParam EstadoPedido estado,
                                                              @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Estado actualizado",
                pedidoService.cambiarEstado(id, estado, userDetails.getUsername())));
    }

    @PatchMapping("/{pedidoId}/items/producto/{lineaId}")
    @Operation(summary = "Marcar/desmarcar ítem de producto como preparado")
    public ResponseEntity<ApiResponse<Pedido>> marcarProducto(@PathVariable Long pedidoId,
                                                               @PathVariable Long lineaId,
                                                               @RequestParam boolean preparada) {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.marcarItemProducto(pedidoId, lineaId, preparada)));
    }

    @PatchMapping("/{pedidoId}/items/moneda/{lineaId}")
    @Operation(summary = "Marcar/desmarcar ítem de moneda como preparado")
    public ResponseEntity<ApiResponse<Pedido>> marcarMoneda(@PathVariable Long pedidoId,
                                                             @PathVariable Long lineaId,
                                                             @RequestParam boolean preparada) {
        return ResponseEntity.ok(ApiResponse.ok(pedidoService.marcarItemMoneda(pedidoId, lineaId, preparada)));
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cancelar pedido")
    public ResponseEntity<ApiResponse<Pedido>> cancelar(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok("Pedido cancelado",
                pedidoService.cancelar(id, userDetails.getUsername())));
    }

    // DTOs internos del controller
    @Data
    public static class CrearPedidoRequest {
        private Long maquinaId;
        private Map<Long, Integer> productos; // productoId -> cantidad
        private Map<Long, Integer> monedas;   // monedaId -> cantidad
        private String notas;
        private String offlineId;
    }

    @Data
    public static class EditarPedidoRequest {
        private Map<Long, Integer> productos;
        private Map<Long, Integer> monedas;
        private String notas;
    }
}
