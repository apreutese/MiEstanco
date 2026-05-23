package com.miestanco.controller;

import com.miestanco.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/mantenimiento")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Mantenimiento", description = "Endpoints de mantenimiento de BD")
public class MantenimientoController {

    private final EntityManager em;
    private final javax.sql.DataSource dataSource;

    @DeleteMapping("/columna-tipo-maquinas")
    public ResponseEntity<ApiResponse<String>> dropColumnTipo() {
        try (Connection conn = dataSource.getConnection();
             var stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE maquinas DROP COLUMN tipo");
            return ResponseEntity.ok(ApiResponse.ok("Columna tipo eliminada de maquinas", null));
        } catch (Exception e) {
            String msg = e.getMessage();
            // Error 1091 = columna no existe, lo tratamos como OK
            if (msg != null && msg.contains("1091")) {
                return ResponseEntity.ok(ApiResponse.ok("Columna tipo ya no existía", null));
            }
            return ResponseEntity.ok(ApiResponse.ok("Info: " + msg, null));
        }
    }

    @DeleteMapping("/limpiar-duplicados")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, Integer>>> limpiarTodo() {
        Map<String, Integer> res = new LinkedHashMap<>();

        // IDs de maquinas a conservar (mínimo por bar+nombre)
        // IDs de maquinas duplicadas a eliminar
        // Primero: limpiar junction tables de maquinas duplicadas
        em.createNativeQuery("""
            DELETE FROM maquina_monedas
            WHERE maquina_id IN (
                SELECT id FROM (
                    SELECT m1.id FROM maquinas m1
                    WHERE m1.id > (SELECT MIN(m2.id) FROM maquinas m2
                                   WHERE m2.bar_id = m1.bar_id AND m2.nombre = m1.nombre)
                ) AS dup
            )
        """).executeUpdate();

        em.createNativeQuery("""
            DELETE FROM maquina_productos
            WHERE maquina_id IN (
                SELECT id FROM (
                    SELECT m1.id FROM maquinas m1
                    WHERE m1.id > (SELECT MIN(m2.id) FROM maquinas m2
                                   WHERE m2.bar_id = m1.bar_id AND m2.nombre = m1.nombre)
                ) AS dup
            )
        """).executeUpdate();

        // Eliminar maquinas duplicadas
        int maq = em.createNativeQuery("""
            DELETE FROM maquinas
            WHERE id IN (
                SELECT id FROM (
                    SELECT m1.id FROM maquinas m1
                    WHERE m1.id > (SELECT MIN(m2.id) FROM maquinas m2
                                   WHERE m2.bar_id = m1.bar_id AND m2.nombre = m1.nombre)
                ) AS dup
            )
        """).executeUpdate();
        res.put("maquinas_eliminadas", maq);

        // Limpiar maquina_monedas duplicadas de las maquinas restantes
        // (misma maquina_id + moneda_id repetida varias veces)
        // Como no hay PK en la join table, usamos una tabla temporal
        em.createNativeQuery("CREATE TEMPORARY TABLE tmp_mm_keep AS SELECT DISTINCT maquina_id, moneda_id FROM maquina_monedas").executeUpdate();
        em.createNativeQuery("DELETE FROM maquina_monedas").executeUpdate();
        em.createNativeQuery("INSERT INTO maquina_monedas SELECT * FROM tmp_mm_keep").executeUpdate();
        em.createNativeQuery("DROP TEMPORARY TABLE tmp_mm_keep").executeUpdate();
        res.put("maquina_monedas_deduplicadas", 1);

        // Limpiar maquina_productos duplicados
        em.createNativeQuery("CREATE TEMPORARY TABLE tmp_mp_keep AS SELECT DISTINCT maquina_id, producto_id FROM maquina_productos").executeUpdate();
        em.createNativeQuery("DELETE FROM maquina_productos").executeUpdate();
        em.createNativeQuery("INSERT INTO maquina_productos SELECT * FROM tmp_mp_keep").executeUpdate();
        em.createNativeQuery("DROP TEMPORARY TABLE tmp_mp_keep").executeUpdate();
        res.put("maquina_productos_deduplicados", 1);

        // Limpiar productos duplicados por nombre+marca
        em.createNativeQuery("""
            DELETE FROM maquina_productos
            WHERE producto_id IN (
                SELECT id FROM (
                    SELECT p1.id FROM productos p1
                    WHERE p1.id > (SELECT MIN(p2.id) FROM productos p2
                                   WHERE p2.nombre = p1.nombre AND COALESCE(p2.marca,'') = COALESCE(p1.marca,''))
                ) AS dup
            )
        """).executeUpdate();

        int prod = em.createNativeQuery("""
            DELETE FROM productos
            WHERE id IN (
                SELECT id FROM (
                    SELECT p1.id FROM productos p1
                    WHERE p1.id > (SELECT MIN(p2.id) FROM productos p2
                                   WHERE p2.nombre = p1.nombre AND COALESCE(p2.marca,'') = COALESCE(p1.marca,''))
                ) AS dup
            )
        """).executeUpdate();
        res.put("productos_eliminados", prod);

        return ResponseEntity.ok(ApiResponse.ok("Limpieza completa", res));
    }
}
