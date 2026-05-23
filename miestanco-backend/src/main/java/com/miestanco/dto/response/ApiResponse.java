package com.miestanco.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String mensaje;
    private T datos;

    public static <T> ApiResponse<T> ok(T datos) {
        return new ApiResponse<>(true, "OK", datos);
    }

    public static <T> ApiResponse<T> ok(String mensaje, T datos) {
        return new ApiResponse<>(true, mensaje, datos);
    }

    public static <T> ApiResponse<T> error(String mensaje) {
        return new ApiResponse<>(false, mensaje, null);
    }
}
