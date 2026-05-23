package com.miestanco.repository;

import com.miestanco.model.Bar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BarRepository extends JpaRepository<Bar, Long> {
    List<Bar> findByActivoTrueOrderByNombreAsc();
    List<Bar> findAllByOrderByNombreAsc();
    Optional<Bar> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
}
