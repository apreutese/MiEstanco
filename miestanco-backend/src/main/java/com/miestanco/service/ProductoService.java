package com.miestanco.service;

import com.miestanco.exception.RecursoNoEncontradoException;
import com.miestanco.model.Producto;
import com.miestanco.repository.ProductoRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final EntityManager em;

    @Transactional(readOnly = true)
    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrueOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    @Transactional
    public Producto crear(Producto producto) {
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(Long id, Producto datosNuevos) {
        Producto producto = obtenerPorId(id);
        producto.setNombre(datosNuevos.getNombre());
        producto.setMarca(datosNuevos.getMarca());
        producto.setCategoria(datosNuevos.getCategoria());
        producto.setPrecio(datosNuevos.getPrecio());
        if (datosNuevos.getFotoUrl() != null) {
            producto.setFotoUrl(datosNuevos.getFotoUrl());
        }
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizarFoto(Long id, String fotoUrl) {
        Producto producto = obtenerPorId(id);
        producto.setFotoUrl(fotoUrl);
        return productoRepository.save(producto);
    }

    @Transactional
    public void desactivar(Long id) {
        Producto producto = obtenerPorId(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    @Transactional
    public void activar(Long id) {
        Producto producto = obtenerPorId(id);
        producto.setActivo(true);
        productoRepository.save(producto);
    }

    @Transactional
    public int eliminarDuplicados() {
        // Primero limpiar referencias en maquina_productos a los duplicados
        em.createNativeQuery("""
            DELETE FROM maquina_productos
            WHERE producto_id IN (
                SELECT id FROM (
                    SELECT p1.id FROM productos p1
                    WHERE p1.id > (
                        SELECT MIN(p2.id) FROM productos p2
                        WHERE p2.nombre = p1.nombre AND COALESCE(p2.marca,'') = COALESCE(p1.marca,'')
                    )
                ) AS dup
            )
            """).executeUpdate();
        // Luego borrar los duplicados
        return em.createNativeQuery("""
            DELETE FROM productos
            WHERE id IN (
                SELECT id FROM (
                    SELECT p1.id FROM productos p1
                    WHERE p1.id > (
                        SELECT MIN(p2.id) FROM productos p2
                        WHERE p2.nombre = p1.nombre AND COALESCE(p2.marca,'') = COALESCE(p1.marca,'')
                    )
                ) AS dup
            )
            """).executeUpdate();
    }
}
