package com.miestanco.repository;

import com.miestanco.model.Moneda;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MonedaRepository extends JpaRepository<Moneda, Long> {
    List<Moneda> findAllByOrderByValorCentimosAsc();
}
