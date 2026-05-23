package com.miestanco.service;

import com.miestanco.enums.EstadoPedido;
import com.miestanco.exception.RecursoNoEncontradoException;
import com.miestanco.model.*;
import com.miestanco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final MaquinaRepository maquinaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final MonedaRepository monedaRepository;

    // Estados que se consideran "activos" (en proceso)
    private static final List<EstadoPedido> ESTADOS_FINALES =
            List.of(EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO);

    public List<Pedido> listarActivos() {
        return pedidoRepository.findByEstadoNotInOrderByFechaCreacionDesc(ESTADOS_FINALES);
    }

    public List<Pedido> listarHistorial(EstadoPedido estado, Long maquinaId,
                                        LocalDateTime desde, LocalDateTime hasta) {
        return pedidoRepository.findHistorial(estado, maquinaId, desde, hasta);
    }

    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Pedido no encontrado: " + id));
    }

    public Pedido obtenerUltimoPedidoMaquina(Long maquinaId) {
        return pedidoRepository.findFirstByMaquina_IdOrderByFechaCreacionDesc(maquinaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No hay pedidos anteriores para esta máquina"));
    }

    @Transactional
    public Pedido crear(Long maquinaId, String username,
                        Map<Long, Integer> productosConCantidad,
                        Map<Long, Integer> monedasConCantidad,
                        String notas, String offlineId) {

        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Máquina no encontrada: " + maquinaId));
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + username));

        Pedido pedido = Pedido.builder()
                .maquina(maquina)
                .creadoPor(usuario)
                .notas(notas)
                .offlineId(offlineId)
                .build();

        // Líneas de productos
        List<LineaPedidoProducto> lineasProducto = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : productosConCantidad.entrySet()) {
            Producto producto = productoRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + entry.getKey()));
            LineaPedidoProducto linea = LineaPedidoProducto.builder()
                    .pedido(pedido)
                    .producto(producto)
                    .cantidad(entry.getValue())
                    .precioUnitario(producto.getPrecio()) // Precio histórico en el momento del pedido
                    .build();
            lineasProducto.add(linea);
        }
        pedido.setLineasProducto(lineasProducto);

        // Líneas de monedas
        List<LineaPedidoMoneda> lineasMoneda = new ArrayList<>();
        for (Map.Entry<Long, Integer> entry : monedasConCantidad.entrySet()) {
            Moneda moneda = monedaRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Moneda no encontrada: " + entry.getKey()));
            LineaPedidoMoneda linea = LineaPedidoMoneda.builder()
                    .pedido(pedido)
                    .moneda(moneda)
                    .cantidad(entry.getValue())
                    .build();
            lineasMoneda.add(linea);
        }
        pedido.setLineasMoneda(lineasMoneda);

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido editar(Long id, Map<Long, Integer> productosConCantidad,
                         Map<Long, Integer> monedasConCantidad, String notas) {
        Pedido pedido = obtenerPorId(id);

        if (pedido.getEstado() != EstadoPedido.PENDIENTE && pedido.getEstado() != EstadoPedido.PREPARADO) {
            throw new IllegalArgumentException("Solo se puede editar un pedido en estado PENDIENTE o PREPARADO");
        }

        boolean enPreparado = pedido.getEstado() == EstadoPedido.PREPARADO;
        pedido.setNotas(notas);

        // Actualizar líneas de productos
        pedido.getLineasProducto().clear();
        for (Map.Entry<Long, Integer> entry : productosConCantidad.entrySet()) {
            Producto producto = productoRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + entry.getKey()));
            LineaPedidoProducto linea = LineaPedidoProducto.builder()
                    .pedido(pedido)
                    .producto(producto)
                    .cantidad(entry.getValue())
                    .precioUnitario(producto.getPrecio())
                    .preparada(enPreparado) // Si está en PREPARADO, auto-marca como preparado
                    .build();
            pedido.getLineasProducto().add(linea);
        }

        // Actualizar líneas de monedas
        pedido.getLineasMoneda().clear();
        for (Map.Entry<Long, Integer> entry : monedasConCantidad.entrySet()) {
            Moneda moneda = monedaRepository.findById(entry.getKey())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Moneda no encontrada: " + entry.getKey()));
            LineaPedidoMoneda linea = LineaPedidoMoneda.builder()
                    .pedido(pedido)
                    .moneda(moneda)
                    .cantidad(entry.getValue())
                    .preparada(enPreparado)
                    .build();
            pedido.getLineasMoneda().add(linea);
        }

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido marcarItemProducto(Long pedidoId, Long lineaId, boolean preparada) {
        Pedido pedido = obtenerPorId(pedidoId);
        pedido.getLineasProducto().stream()
                .filter(l -> l.getId().equals(lineaId))
                .findFirst()
                .ifPresent(l -> l.setPreparada(preparada));
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido marcarItemMoneda(Long pedidoId, Long lineaId, boolean preparada) {
        Pedido pedido = obtenerPorId(pedidoId);
        pedido.getLineasMoneda().stream()
                .filter(l -> l.getId().equals(lineaId))
                .findFirst()
                .ifPresent(l -> l.setPreparada(preparada));
        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cambiarEstado(Long id, EstadoPedido nuevoEstado, String username) {
        Pedido pedido = obtenerPorId(id);
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));

        validarTransicion(pedido.getEstado(), nuevoEstado);

        pedido.setEstado(nuevoEstado);
        if (nuevoEstado == EstadoPedido.PREPARADO) {
            pedido.setFechaPreparado(LocalDateTime.now());
            pedido.setPreparadoPor(usuario);
        } else if (nuevoEstado == EstadoPedido.ENTREGADO) {
            pedido.setFechaEntregado(LocalDateTime.now());
            pedido.setEntregadoPor(usuario);
        }

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cancelar(Long id, String username) {
        Pedido pedido = obtenerPorId(id);
        if (pedido.getEstado() == EstadoPedido.ENTREGADO) {
            throw new IllegalArgumentException("No se puede cancelar un pedido ya entregado");
        }
        pedido.setEstado(EstadoPedido.CANCELADO);
        return pedidoRepository.save(pedido);
    }

    private void validarTransicion(EstadoPedido actual, EstadoPedido nuevo) {
        boolean valida = switch (actual) {
            case PENDIENTE -> nuevo == EstadoPedido.EN_PREPARACION || nuevo == EstadoPedido.CANCELADO;
            case EN_PREPARACION -> nuevo == EstadoPedido.PREPARADO || nuevo == EstadoPedido.CANCELADO;
            case PREPARADO -> nuevo == EstadoPedido.ENTREGADO || nuevo == EstadoPedido.CANCELADO;
            default -> false;
        };
        if (!valida) {
            throw new IllegalArgumentException("Transición de estado inválida: " + actual + " → " + nuevo);
        }
    }
}
