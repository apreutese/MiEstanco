package com.miestanco.repository;

import com.miestanco.enums.Categoria;
import com.miestanco.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrueOrderByNombreAsc();
    List<Producto> findByActivoTrueAndCategoriaOrderByNombreAsc(Categoria categoria);
}
