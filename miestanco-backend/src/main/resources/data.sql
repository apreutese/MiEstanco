-- =====================================================
-- MiEstanco — Datos iniciales
-- Se ejecuta al arrancar si las tablas están vacías
-- =====================================================

-- Monedas (datos fijos)
INSERT IGNORE INTO monedas (id, denominacion, valor_centimos) VALUES
(1, '5 céntimos',  5),
(2, '10 céntimos', 10),
(3, '20 céntimos', 20),
(4, '50 céntimos', 50),
(5, '1 euro',      100),
(6, '2 euros',     200);

-- Usuarios demo
-- Contraseñas hasheadas con BCrypt (todas son "1234")
INSERT IGNORE INTO usuarios (nombre, username, password_hash, rol, activo, fecha_creacion) VALUES
('Padre (Admin)',     'padre',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'ADMIN',      true, NOW()),
('Madre (Admin)',     'madre',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'ADMIN',      true, NOW()),
('Trabajadora 1',    'trabajadora1','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'TRABAJADOR', true, NOW()),
('Trabajadora 2',    'trabajadora2','$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh7y', 'TRABAJADOR', true, NOW());

-- Bares de ejemplo
INSERT IGNORE INTO bares (codigo, nombre, direccion, telefono, notas, activo) VALUES
('BAR001', 'Bar El Rincón',      'Calle Mayor 12, Zaragoza',    '976111001', NULL, true),
('BAR002', 'Cafetería Central',  'Avda. Goya 45, Zaragoza',     '976111002', NULL, true),
('BAR003', 'Bar La Peña',        'Calle Delicias 8, Zaragoza',  '976111003', 'Máquina en zona reservado', true),
('BAR004', 'Pub Nocturno',       'Paseo Independencia 23',       NULL,         NULL, true),
('BAR005', 'Cafetería Rojas',    'Calle San Miguel 7, Zaragoza', '976111005', NULL, true);

-- Máquinas de ejemplo (una por bar)
INSERT IGNORE INTO maquinas (bar_id, nombre, tipo, notas, activa) VALUES
(1, 'Máquina Bar El Rincón',    'Tabaco mixta', NULL, true),
(2, 'Máquina Cafetería Central','Tabaco mixta', NULL, true),
(3, 'Máquina Bar La Peña',      'Tabaco solo',  'Monedero pequeño', true),
(4, 'Máquina Pub Nocturno',     'Tabaco mixta', NULL, true),
(5, 'Máquina Cafetería Rojas',  'Tabaco mixta', NULL, true);

-- Productos de ejemplo
INSERT IGNORE INTO productos (nombre, marca, categoria, precio, foto_url, activo) VALUES
('Marlboro Red',        'Marlboro', 'TABACO',     5.20, NULL, true),
('Marlboro Gold',       'Marlboro', 'TABACO',     5.20, NULL, true),
('Marlboro Touch',      'Marlboro', 'TABACO',     5.20, NULL, true),
('Camel Original',      'Camel',    'TABACO',     5.10, NULL, true),
('Lucky Strike',        'Lucky',    'TABACO',     5.00, NULL, true),
('Winston Blue',        'Winston',  'TABACO',     4.90, NULL, true),
('Ducados Rubio',       'Ducados',  'TABACO',     4.50, NULL, true),
('Mechero BIC',         'BIC',      'MISCELANEO', 1.50, NULL, true),
('Papel de liar',       'Smoking',  'MISCELANEO', 1.20, NULL, true),
('Filtros',             'Smoking',  'MISCELANEO', 0.80, NULL, true);

-- Asignar productos a máquinas (maquina_id, producto_id)
-- Máquina 1: todos los productos
INSERT IGNORE INTO maquina_productos (maquina_id, producto_id) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,8),(1,9);

-- Máquina 2
INSERT IGNORE INTO maquina_productos (maquina_id, producto_id) VALUES
(2,1),(2,2),(2,4),(2,6),(2,8);

-- Máquina 3 (solo tabaco)
INSERT IGNORE INTO maquina_productos (maquina_id, producto_id) VALUES
(3,1),(3,2),(3,7);

-- Asignar monedas a máquinas
-- Máquina 1: todas
INSERT IGNORE INTO maquina_monedas (maquina_id, moneda_id) VALUES
(1,2),(1,3),(1,4),(1,5),(1,6);

-- Máquina 2: sin 5c
INSERT IGNORE INTO maquina_monedas (maquina_id, moneda_id) VALUES
(2,3),(2,4),(2,5),(2,6);

-- Máquina 3: solo euros
INSERT IGNORE INTO maquina_monedas (maquina_id, moneda_id) VALUES
(3,5),(3,6);
