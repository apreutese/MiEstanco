package com.miestanco.service;

import com.miestanco.dto.request.LoginRequest;
import com.miestanco.dto.response.LoginResponse;
import com.miestanco.model.Usuario;
import com.miestanco.repository.UsuarioRepository;
import com.miestanco.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;

    public LoginResponse login(LoginRequest request) {
        // Spring Security valida usuario y contraseña con BCrypt
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String token = jwtUtils.generateToken(usuario.getUsername());
        String refreshToken = jwtUtils.generateRefreshToken(usuario.getUsername());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(usuario.getId())
                .nombre(usuario.getNombre())
                .username(usuario.getUsername())
                .rol(usuario.getRol())
                .build();
    }
}
