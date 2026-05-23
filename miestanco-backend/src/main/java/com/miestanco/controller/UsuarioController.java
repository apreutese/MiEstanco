package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import com.miestanco.model.Usuario;
import com.miestanco.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Usuarios", description = "Gestión de usuarios (solo ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar usuarios activos")
    public ResponseEntity<ApiResponse<List<Usuario>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(usuarioService.listarActivos()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<ApiResponse<Usuario>> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(usuarioService.obtenerPorId(id)));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo usuario")
    public ResponseEntity<ApiResponse<Usuario>> crear(@RequestBody CrearUsuarioRequest req) {
        Usuario usuario = Usuario.builder()
                .nombre(req.getNombre())
                .username(req.getUsername())
                .rol(req.getRol())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Usuario creado", usuarioService.crear(usuario, req.getPassword())));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar nombre y rol del usuario")
    public ResponseEntity<ApiResponse<Usuario>> actualizar(@PathVariable Long id,
                                                            @RequestBody Usuario usuario) {
        return ResponseEntity.ok(ApiResponse.ok("Usuario actualizado", usuarioService.actualizar(id, usuario)));
    }

    @PatchMapping("/{id}/password")
    @Operation(summary = "Cambiar contraseña de usuario")
    public ResponseEntity<ApiResponse<Void>> cambiarPassword(@PathVariable Long id,
                                                              @RequestBody CambiarPasswordRequest req) {
        usuarioService.cambiarPassword(id, req.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Contraseña actualizada", null));
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar usuario")
    public ResponseEntity<ApiResponse<Void>> desactivar(@PathVariable Long id) {
        usuarioService.desactivar(id);
        return ResponseEntity.ok(ApiResponse.ok("Usuario desactivado", null));
    }

    @PatchMapping("/{id}/activar")
    @Operation(summary = "Activar usuario")
    public ResponseEntity<ApiResponse<Void>> activar(@PathVariable Long id) {
        usuarioService.activar(id);
        return ResponseEntity.ok(ApiResponse.ok("Usuario activado", null));
    }

    @Data
    public static class CrearUsuarioRequest {
        private String nombre;
        private String username;
        private String password;
        private com.miestanco.enums.Rol rol;
    }

    @Data
    public static class CambiarPasswordRequest {
        private String password;
    }
}
