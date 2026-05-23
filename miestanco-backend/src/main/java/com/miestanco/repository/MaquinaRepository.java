package com.miestanco.repository;

import com.miestanco.model.Maquina;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MaquinaRepository extends JpaRepository<Maquina, Long> {
    List<Maquina> findByActivaTrueOrderByNombreAsc();
    List<Maquina> findByBar_IdAndActivaTrue(Long barId);
    Optional<Maquina> findFirstByBar_IdAndActivaTrue(Long barId);
}
