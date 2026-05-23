package com.miestanco.service;

import com.miestanco.exception.RecursoNoEncontradoException;
import com.miestanco.model.Bar;
import com.miestanco.repository.BarRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BarService {

    private final BarRepository barRepository;

    public List<Bar> listarActivos() {
        return barRepository.findByActivoTrueOrderByNombreAsc();
    }

    public List<Bar> listarTodos() {
        return barRepository.findAllByOrderByNombreAsc();
    }

    public Bar obtenerPorId(Long id) {
        return barRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Bar no encontrado: " + id));
    }

    @Transactional
    public Bar crear(Bar bar) {
        if (barRepository.existsByCodigo(bar.getCodigo())) {
            throw new IllegalArgumentException("Ya existe un bar con el código: " + bar.getCodigo());
        }
        return barRepository.save(bar);
    }

    @Transactional
    public Bar actualizar(Long id, Bar datosNuevos) {
        Bar bar = obtenerPorId(id);
        bar.setNombre(datosNuevos.getNombre());
        bar.setDireccion(datosNuevos.getDireccion());
        bar.setTelefono(datosNuevos.getTelefono());
        bar.setNotas(datosNuevos.getNotas());
        // El código no se puede cambiar (es identificador único)
        return barRepository.save(bar);
    }

    @Transactional
    public void desactivar(Long id) {
        Bar bar = obtenerPorId(id);
        bar.setActivo(false);
        barRepository.save(bar);
    }

    @Transactional
    public void activar(Long id) {
        Bar bar = obtenerPorId(id);
        bar.setActivo(true);
        barRepository.save(bar);
    }
}
