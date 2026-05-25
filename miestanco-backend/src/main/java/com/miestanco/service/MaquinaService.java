package com.miestanco.service;

import com.miestanco.exception.RecursoNoEncontradoException;
import com.miestanco.model.*;
import com.miestanco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaquinaService {

    private final MaquinaRepository maquinaRepository;
    private final BarRepository barRepository;
    private final ProductoRepository productoRepository;
    private final MonedaRepository monedaRepository;
    private final jakarta.persistence.EntityManager em;

    @Transactional(readOnly = true)
    public List<Maquina> listarActivas() {
        return maquinaRepository.findByActivaTrueOrderByNombreAsc();
    }

    @Transactional(readOnly = true)
    public List<Maquina> listarPorBar(Long barId) {
        return maquinaRepository.findByBar_IdAndActivaTrue(barId);
    }

    @Transactional(readOnly = true)
    public Maquina obtenerPorId(Long id) {
        return maquinaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Máquina no encontrada: " + id));
    }

    @Transactional
    public Maquina crear(Long barId, Maquina maquina) {
        Bar bar = barRepository.findById(barId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Bar no encontrado: " + barId));
        maquina.setBar(bar);
        return maquinaRepository.save(maquina);
    }

    @Transactional
    public Maquina actualizar(Long id, Maquina datosNuevos) {
        Maquina maquina = obtenerPorId(id);
        maquina.setNombre(datosNuevos.getNombre());
        maquina.setNotas(datosNuevos.getNotas());
        return maquinaRepository.save(maquina);
    }

    @Transactional
    public Maquina configurarProductos(Long id, List<Long> productoIds) {
        Maquina maquina = obtenerPorId(id);
        List<Producto> productos = productoRepository.findAllById(productoIds);
        maquina.setProductos(productos);
        return maquinaRepository.save(maquina);
    }

    @Transactional
    public Maquina configurarMonedas(Long id, List<Long> monedaIds) {
        Maquina maquina = obtenerPorId(id);
        List<Moneda> monedas = monedaRepository.findAllById(monedaIds);
        maquina.setMonedas(monedas);
        return maquinaRepository.save(maquina);
    }

    @Transactional
    public void desactivar(Long id) {
        Maquina maquina = obtenerPorId(id);
        maquina.setActiva(false);
        maquinaRepository.save(maquina);
    }

    @Transactional
    public void activar(Long id) {
        Maquina maquina = obtenerPorId(id);
        maquina.setActiva(true);
        maquinaRepository.save(maquina);
    }

    @Transactional
    public int eliminarDuplicados() {
        em.createNativeQuery("DELETE FROM maquina_productos WHERE maquina_id IN (SELECT id FROM (SELECT m1.id FROM maquinas m1 WHERE m1.id > (SELECT MIN(m2.id) FROM maquinas m2 WHERE m2.nombre = m1.nombre)) AS dup)").executeUpdate();
        em.createNativeQuery("DELETE FROM maquina_monedas WHERE maquina_id IN (SELECT id FROM (SELECT m1.id FROM maquinas m1 WHERE m1.id > (SELECT MIN(m2.id) FROM maquinas m2 WHERE m2.nombre = m1.nombre)) AS dup)").executeUpdate();
        return em.createNativeQuery("DELETE FROM maquinas WHERE id IN (SELECT id FROM (SELECT m1.id FROM maquinas m1 WHERE m1.id > (SELECT MIN(m2.id) FROM maquinas m2 WHERE m2.nombre = m1.nombre)) AS dup)").executeUpdate();
    }
}
