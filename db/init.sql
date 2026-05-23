-- ============================================
-- MiEstanco — Script de inicialización MySQL
-- Ejecutar una sola vez antes de arrancar la app
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS miestanco
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- (Opcional) Crear usuario dedicado en vez de usar root
-- CREATE USER IF NOT EXISTS 'miestanco'@'localhost' IDENTIFIED BY 'miestanco2025';
-- GRANT ALL PRIVILEGES ON miestanco.* TO 'miestanco'@'localhost';
-- FLUSH PRIVILEGES;

-- Verificar
USE miestanco;
SELECT 'Base de datos miestanco creada correctamente' AS estado;
