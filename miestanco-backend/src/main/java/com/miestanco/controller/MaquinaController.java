package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import com.miestanco.model.Maquina;
import com.miestanco.repository.MonedaRepository;
import com.miestanco.service.MaquinaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maquinas")
@RequiredArgsConstructor
@Tag(name = "Máquinas", description = "Gestión de máquinas de tabaco")
@SecurityRequirement(name = "bearerAuth")
public class MaquinaController {

    private final MaquinaService maquinaService;
    private final MonedaRepository monedaRepository;

    @GetMapping
    @Operation(summary = "Listar máquinas activas")
    public ResponseEntity<ApiResponse<List<Maquina>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(maquinaService.listarActivas()));
    }

    @GetMapping("/bar/{barId}")
    @Operation(summary = "Listar máquinas de un bar")
    public ResponseEntity<ApiResponse<List<Maquina>>> listarPorBar(@PathVariable Long barId) {
        return ResponseEntity.ok(ApiResponse.ok(maquinaService.listarPorBar(barId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener máquina por ID")
    public ResponseEntity<ApiResponse<Maquina>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(maquinaService.obtenerPorId(id)));
    }

    @PostMapping("/bar/{barId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear máquina en un bar")
    public ResponseEntity<ApiResponse<Maquina>> crear(@PathVariable Long barId, @RequestBody Maquina maquina) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Máquina creada", maquinaService.crear(barId, maquina)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar máquina")
    public ResponseEntity<ApiResponse<Maquina>> actualizar(@PathVariable Long id, @RequestBody Maquina maquina) {
        return ResponseEntity.ok(ApiResponse.ok("Máquina actualizada", maquinaService.actualizar(id, maquina)));
    }

    @PutMapping("/{id}/productos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Configurar productos de la máquina (lista de IDs)")
    public ResponseEntity<ApiResponse<Maquina>> configurarProductos(@PathVariable Long id,
                                                                     @RequestBody List<Long> productoIds) {
        return ResponseEntity.ok(ApiResponse.ok("Productos configurados", maquinaService.configurarProductos(id, productoIds)));
    }

    @PutMapping("/{id}/monedas")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Configurar monedas de la máquina (lista de IDs)")
    public ResponseEntity<ApiResponse<Maquina>> configurarMonedas(@PathVariable Long id,
                                                                   @RequestBody List<Long> monedaIds) {
        return ResponseEntity.ok(ApiResponse.ok("Monedas configuradas", maquinaService.configurarMonedas(id, monedaIds)));
    }

    @GetMapping("/monedas")
    @Operation(summary = "Listar todas las monedas disponibles")
    public ResponseEntity<ApiResponse<?>> listarMonedas() {
        return ResponseEntity.ok(ApiResponse.ok(monedaRepository.findAllByOrderByValorCentimosAsc()));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar máquina")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        maquinaService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Máquina desactivada", null));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activar máquina")
    public ResponseEntity<ApiResponse<Void>> activar(@PathVariable Long id) {
        maquinaService.activar(id);
        return ResponseEntity.ok(ApiResponse.ok("Máquina activada", null));
    }
}
