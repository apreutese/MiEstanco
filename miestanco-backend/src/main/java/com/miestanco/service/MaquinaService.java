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
}
