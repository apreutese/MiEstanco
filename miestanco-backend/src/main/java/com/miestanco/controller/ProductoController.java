package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import com.miestanco.model.Producto;
import com.miestanco.service.ProductoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Gestión de productos de tabaco y misceláneos")
@SecurityRequirement(name = "bearerAuth")
public class ProductoController {

    private final ProductoService productoService;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @GetMapping
    @Operation(summary = "Listar productos activos")
    public ResponseEntity<ApiResponse<List<Producto>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(productoService.listarActivos()));
    }

    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Listar todos los productos (incluye inactivos)")
    public ResponseEntity<ApiResponse<List<Producto>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.ok(productoService.listarTodos()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener producto por ID")
    public ResponseEntity<ApiResponse<Producto>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productoService.obtenerPorId(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Crear nuevo producto")
    public ResponseEntity<ApiResponse<Producto>> crear(@RequestBody Producto producto) {
        if (producto.getActivo() == null) {
            producto.setActivo(true);
        }
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Producto creado", productoService.crear(producto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar producto")
    public ResponseEntity<ApiResponse<Producto>> actualizar(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(ApiResponse.ok("Producto actualizado", productoService.actualizar(id, producto)));
    }

    @PostMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Subir foto de producto")
    public ResponseEntity<ApiResponse<Producto>> subirFoto(@PathVariable Long id,
                                                            @RequestParam("foto") MultipartFile foto) throws IOException {
        String nombre = UUID.randomUUID() + "_" + foto.getOriginalFilename();
        Path ruta = Paths.get(uploadDir).resolve(nombre);
        Files.createDirectories(ruta.getParent());
        foto.transferTo(ruta);
        String url = "/uploads/fotos/" + nombre;
        return ResponseEntity.ok(ApiResponse.ok("Foto subida", productoService.actualizarFoto(id, url)));
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Desactivar producto")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        productoService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto desactivado", null));
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activar producto")
    public ResponseEntity<ApiResponse<Void>> activar(@PathVariable Long id) {
        productoService.activar(id);
        return ResponseEntity.ok(ApiResponse.ok("Producto activado", null));
    }

    @DeleteMapping("/admin/limpiar-duplicados")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Eliminar productos duplicados por nombre (mantiene el de menor id)")
    public ResponseEntity<ApiResponse<String>> limpiarDuplicados() {
        int eliminados = productoService.eliminarDuplicados();
        return ResponseEntity.ok(ApiResponse.ok("Duplicados eliminados: " + eliminados, null));
    }
}
