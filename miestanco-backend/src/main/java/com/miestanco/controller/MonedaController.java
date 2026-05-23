package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import com.miestanco.model.Moneda;
import com.miestanco.repository.MonedaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/monedas")
@RequiredArgsConstructor
@Tag(name = "Monedas", description = "Catálogo de monedas/denominaciones")
public class MonedaController {

    private final MonedaRepository monedaRepository;

    @GetMapping
    @Operation(summary = "Listar todas las monedas")
    public ResponseEntity<ApiResponse<List<Moneda>>> listar() {
        return ResponseEntity.ok(ApiResponse.ok(monedaRepository.findAll()));
    }
}
