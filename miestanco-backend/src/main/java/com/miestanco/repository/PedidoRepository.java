package com.miestanco.repository;

import com.miestanco.enums.EstadoPedido;
import com.miestanco.model.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Pedidos activos (no entregados ni cancelados), más recientes primero
    List<Pedido> findByEstadoNotInOrderByFechaCreacionDesc(List<EstadoPedido> estados);

    // Historial con filtros opcionales
    @Query("SELECT p FROM Pedido p WHERE " +
           "(:estado IS NULL OR p.estado = :estado) AND " +
           "(:maquinaId IS NULL OR p.maquina.id = :maquinaId) AND " +
           "(:desde IS NULL OR p.fechaCreacion >= :desde) AND " +
           "(:hasta IS NULL OR p.fechaCreacion <= :hasta) " +
           "ORDER BY p.fechaCreacion DESC")
    List<Pedido> findHistorial(
        @Param("estado") EstadoPedido estado,
        @Param("maquinaId") Long maquinaId,
        @Param("desde") LocalDateTime desde,
        @Param("hasta") LocalDateTime hasta
    );

    // Último pedido de una máquina (para "Repetir último pedido")
    Optional<Pedido> findFirstByMaquina_IdOrderByFechaCreacionDesc(Long maquinaId);

    // Para estadísticas
    @Query("SELECT p FROM Pedido p WHERE " +
           "p.estado = 'ENTREGADO' AND " +
           "p.fechaCreacion BETWEEN :desde AND :hasta")
    List<Pedido> findEntregadosEnPeriodo(
        @Param("desde") LocalDateTime desde,
        @Param("hasta") LocalDateTime hasta
    );
}
