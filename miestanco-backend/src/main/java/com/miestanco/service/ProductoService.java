package com.miestanco.service;

import com.miestanco.exception.RecursoNoEncontradoException;
import com.miestanco.model.Producto;
import com.miestanco.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrueOrderByNombreAsc();
    }

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

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
}
