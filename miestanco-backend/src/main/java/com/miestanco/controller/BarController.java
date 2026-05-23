package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import com.miestanco.model.Bar;
import com.miestanco.service.BarService;
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
@RequestMapping("/bares")
@RequiredArgsConstructor
@Tag(name = "Bares", description = "Gestión de bares y locales")
@SecurityRequirement(name = "bearerAuth")
public class BarController {

    private final BarService barService;

    @GetMapping
    @Operation(summary = "Listar bares activos")
    public ResponseEntity<ApiResponse<List<Bar>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(barService.listarActivos()));
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los bares (incluye inactivos)")
    public ResponseEntity<ApiResponse<List<Bar>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.ok(barService.listarTodos()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener bar por ID")
    public ResponseEntity<ApiResponse<Bar>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(barService.obtenerPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear nuevo bar")
    public ResponseEntity<ApiResponse<Bar>> crear(@RequestBody Bar bar) {
        Bar creado = barService.crear(bar);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Bar creado", creado));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar bar")
    public ResponseEntity<ApiResponse<Bar>> actualizar(@PathVariable Long id, @RequestBody Bar bar) {
        return ResponseEntity.ok(ApiResponse.ok("Bar actualizado", barService.actualizar(id, bar)));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar bar (soft delete)")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        barService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Bar desactivado", null));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reactivar bar")
    public ResponseEntity<ApiResponse<Void>> activar(@PathVariable Long id) {
        barService.activar(id);
        return ResponseEntity.ok(ApiResponse.ok("Bar activado", null));
    }
}
