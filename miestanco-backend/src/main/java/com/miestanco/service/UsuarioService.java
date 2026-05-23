package com.miestanco.service;

import com.miestanco.exception.RecursoNoEncontradoException;
import com.miestanco.model.Usuario;
import com.miestanco.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listarActivos() {
        return usuarioRepository.findByActivoTrue();
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + id));
    }

    @Transactional
    public Usuario crear(Usuario usuario, String passwordPlano) {
        if (usuarioRepository.existsByUsername(usuario.getUsername())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese nombre de usuario");
        }
        usuario.setPasswordHash(passwordEncoder.encode(passwordPlano));
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Long id, Usuario datosNuevos) {
        Usuario usuario = obtenerPorId(id);
        usuario.setNombre(datosNuevos.getNombre());
        usuario.setRol(datosNuevos.getRol());
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void cambiarPassword(Long id, String passwordNueva) {
        Usuario usuario = obtenerPorId(id);
        usuario.setPasswordHash(passwordEncoder.encode(passwordNueva));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuario.setActivo(false);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void activar(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuario.setActivo(true);
        usuarioRepository.save(usuario);
    }
}
