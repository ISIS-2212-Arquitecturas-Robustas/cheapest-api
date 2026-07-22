-- ============================================
-- Script de inicialización con datos de prueba
-- Cheapest API - Sistema de Inventario
-- ============================================

-- Este script se ejecuta automáticamente al iniciar el contenedor MySQL
-- Inserta datos de prueba para productos, tiendas, monedas y transacciones

-- NOTA: TypeORM creará las tablas automáticamente con synchronize: true
-- Este script debe esperar a que las tablas existan antes de insertar datos
-- Para ello, usamos un procedimiento que reintenta la inserción

DELIMITER $$

CREATE PROCEDURE InsertTestData()
BEGIN
    DECLARE table_exists INT DEFAULT 0;
    DECLARE retry_count INT DEFAULT 0;
    DECLARE max_retries INT DEFAULT 30;
    
    -- Esperar hasta que la tabla catalogos exista
    WHILE table_exists = 0 AND retry_count < max_retries DO
        SELECT COUNT(*) INTO table_exists
        FROM information_schema.tables 
        WHERE table_schema = 'cheapest' 
        AND table_name = 'catalogos';
        
        IF table_exists = 0 THEN
            SET retry_count = retry_count + 1;
            SELECT CONCAT('Esperando a que TypeORM cree las tablas... Intento ', retry_count, '/', max_retries) AS message;
            DO SLEEP(2);
        END IF;
    END WHILE;
    
    IF table_exists = 1 THEN
        -- ============================================
        -- Datos de prueba para Items de Inventario
        -- ============================================
        
        INSERT INTO items_inventario (id, productoId, tiendaId, cantidad, precioVenta, monedaId, createdAt, updatedAt) VALUES
        -- Producto 1 en Tienda 1
        ('11111111-1111-4111-8111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         100, 
         25.50, 
         '550e8400-e29b-41d4-a716-446655440000', 
         NOW(), 
         NOW()),
        
        -- Producto 2 en Tienda 1
        ('22222222-2222-4222-8222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         50, 
         15.75, 
         '550e8400-e29b-41d4-a716-446655440000', 
         NOW(), 
         NOW()),
        
        -- Producto 1 en Tienda 2
        ('33333333-3333-4333-8333-333333333333', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         75, 
         27.00, 
         '550e8400-e29b-41d4-a716-446655440000', 
         NOW(), 
         NOW()),
        
        -- Producto 3 en Tienda 1
        ('44444444-4444-4444-8444-444444444444', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         200, 
         10.00, 
         '550e8400-e29b-41d4-a716-446655440000', 
         NOW(), 
         NOW()),
        
        -- Producto 4 en Tienda 2
        ('55555555-5555-4555-8555-555555555555', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         150, 
         45.99, 
         '550e8400-e29b-41d4-a716-446655440000', 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Registros de Compra
        -- ============================================
        
        INSERT INTO registros_compra_producto_tienda (id, tiendaId, productoId, compraId, itemInventarioId, fechaCompra, cantidad, createdAt, updatedAt) VALUES
        -- Compras para el item 1
        ('c1111111-1111-4111-8111-111111111111', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'dddddddd-dddd-4ddd-8ddd-dddddddddddd', 
         '11111111-1111-4111-8111-111111111111', 
         '2026-01-15 10:30:00', 
         50, 
         NOW(), 
         NOW()),
        
        -- Otra compra para el item 1
        ('c2222222-2222-4222-8222-222222222222', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'dddddddd-dddd-4ddd-8ddd-ddddddddddde', 
         '11111111-1111-4111-8111-111111111111', 
         '2026-01-20 14:15:00', 
         50, 
         NOW(), 
         NOW()),
        
        -- Compra para el item 2
        ('c3333333-3333-4333-8333-333333333333', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         'dddddddd-dddd-4ddd-8ddd-dddddddddddf', 
         '22222222-2222-4222-8222-222222222222', 
         '2026-01-18 09:00:00', 
         50, 
         NOW(), 
         NOW()),
        
        -- Compra para el item 3
        ('c4444444-4444-4444-8444-444444444444', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'dddddddd-dddd-4ddd-8ddd-ddddddddddda', 
         '33333333-3333-4333-8333-333333333333', 
         '2026-01-22 11:45:00', 
         75, 
         NOW(), 
         NOW()),
        
        -- Compra para el item 4
        ('c5555555-5555-4555-8555-555555555555', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac', 
         'dddddddd-dddd-4ddd-8ddd-dddddddddddb', 
         '44444444-4444-4444-8444-444444444444', 
         '2026-01-25 16:20:00', 
         200, 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Registros de Venta
        -- ============================================
        
        INSERT INTO registros_venta_producto_tienda (id, tiendaId, productoId, ventaId, itemInventarioId, fechaVenta, cantidad, createdAt, updatedAt) VALUES
        -- Ventas para el item 1
        ('v1111111-1111-4111-8111-111111111111', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 
         '11111111-1111-4111-8111-111111111111', 
         '2026-01-28 10:30:00', 
         10, 
         NOW(), 
         NOW()),
        
        ('v2222222-2222-4222-8222-222222222222', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeef', 
         '11111111-1111-4111-8111-111111111111', 
         '2026-01-29 15:45:00', 
         15, 
         NOW(), 
         NOW()),
        
        -- Venta para el item 2
        ('v3333333-3333-4333-8333-333333333333', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee0', 
         '22222222-2222-4222-8222-222222222222', 
         '2026-01-30 12:00:00', 
         5, 
         NOW(), 
         NOW()),
        
        -- Venta para el item 3
        ('v4444444-4444-4444-8444-444444444444', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee1', 
         '33333333-3333-4333-8333-333333333333', 
         '2026-01-31 09:30:00', 
         20, 
         NOW(), 
         NOW()),
        
        -- Venta para el item 4
        ('v5555555-5555-4555-8555-555555555555', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac', 
         'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee2', 
         '44444444-4444-4444-8444-444444444444', 
         '2026-02-01 14:20:00', 
         25, 
         NOW(), 
         NOW()),
        
        -- Más ventas para el item 5
        ('v6666666-6666-4666-8666-666666666666', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad', 
         'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeee3', 
         '55555555-5555-4555-8555-555555555555', 
         '2026-02-02 11:15:00', 
         10, 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Productos (Logística)
        -- ============================================
        
        INSERT INTO productos (id, codigoInterno, codigoBarras, nombre, marca, categoria, presentacion, precioBase, monedaId, createdAt, updatedAt) VALUES
        -- Producto 1
        ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         'PROD001', 
         '1234567890123', 
         'Producto Ejemplo 1', 
         'Marca A', 
         'Categoria 1', 
         'Caja 10 unidades', 
         25.50, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         NOW(), 
         NOW()),
        
        -- Producto 2
        ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         'PROD002', 
         '1234567890124', 
         'Producto Ejemplo 2', 
         'Marca B', 
         'Categoria 1', 
         'Bolsa 5 kg', 
         15.75, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         NOW(), 
         NOW()),
        
        -- Producto 3
        ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac', 
         'PROD003', 
         '1234567890125', 
         'Producto Ejemplo 3', 
         'Marca A', 
         'Categoria 2', 
         'Botella 1L', 
         10.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         NOW(), 
         NOW()),
        
        -- Producto 4
        ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad', 
         'PROD004', 
         '1234567890126', 
         'Producto Ejemplo 4', 
         'Marca C', 
         'Categoria 2', 
         'Paquete 20 unidades', 
         45.99, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Catálogos
        -- ============================================
        
        INSERT INTO catalogos (id, tiendaId, vigenciaDesde, vigenciaHasta, zona, createdAt, updatedAt) VALUES
        -- Catálogo para Tienda 1
        ('cat11111-1111-1111-1111-111111111111', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         '2026-02-01 00:00:00', 
         '2026-12-31 23:59:59', 
         'Zona Norte', 
         NOW(), 
         NOW()),
        
        -- Catálogo para Tienda 2
        ('cat22222-2222-2222-2222-222222222222', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         '2026-02-01 00:00:00', 
         '2026-12-31 23:59:59', 
         'Zona Sur', 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Catálogo-Producto
        -- TypeORM auto-generates the junction table as
        -- "catalogos_productos_productos" with columns
        -- "catalogosId" and "productosId"
        -- ============================================
        
        INSERT INTO catalogos_productos_productos (catalogosId, productosId) VALUES
        -- Productos en Catálogo 1
        ('cat11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        
        ('cat11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab'),
        
        ('cat11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaac'),
        
        -- Productos en Catálogo 2
        ('cat22222-2222-2222-2222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
        
        ('cat22222-2222-2222-2222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad');
        
        -- ============================================
        -- Datos de prueba para Promociones
        -- ============================================
        
        INSERT INTO promociones (id, nombre, precioPromocional, monedaId, productoId, tiendaIds, inicio, fin, restricciones, createdAt, updatedAt) VALUES
        -- Promoción para Producto 1
        ('pro11111-1111-1111-1111-111111111111', 
         'Promoción Producto 1', 
         20.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         '["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"]', 
         '2026-02-01 00:00:00', 
         '2026-02-28 23:59:59', 
         100, 
         NOW(), 
         NOW()),
        
        -- Promoción para Producto 2
        ('pro22222-2222-2222-2222-222222222222', 
         'Promoción Producto 2', 
         12.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         '["bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc"]', 
         '2026-02-01 00:00:00', 
         '2026-02-28 23:59:59', 
         50, 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Pedidos
        -- ============================================
        
        INSERT INTO pedidos (id, identificador, tiendaId, fechaHoraCreacion, montoTotal, monedaId, estado, createdAt, updatedAt) VALUES
        -- Pedido 1
        ('ped11111-1111-1111-1111-111111111111', 
         'PED-001', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 
         '2026-02-03 10:00:00', 
         45.50, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'creado', 
         NOW(), 
         NOW()),
        
        -- Pedido 2
        ('ped22222-2222-2222-2222-222222222222', 
         'PED-002', 
         'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbc', 
         '2026-02-03 11:00:00', 
         75.75, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'aprobado', 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Items de Pedido
        -- ============================================
        
        INSERT INTO items_pedido (id, pedidoId, productoId, cantidad, precioUnitario, descuento, monedaId, lote, fechaVencimiento, createdAt, updatedAt) VALUES
        -- Items para Pedido 1
        ('ip111111-1111-1111-1111-111111111111', 
         'ped11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         1, 
         25.50, 
         0.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'LOTE001', 
         '2026-12-31', 
         NOW(), 
         NOW()),
        
        ('ip222222-2222-2222-2222-222222222222', 
         'ped11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         1, 
         20.00, 
         0.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'LOTE002', 
         '2026-12-31', 
         NOW(), 
         NOW()),
        
        -- Items para Pedido 2
        ('ip333333-3333-3333-3333-333333333333', 
         'ped22222-2222-2222-2222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         2, 
         25.50, 
         0.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'LOTE003', 
         '2026-12-31', 
         NOW(), 
         NOW()),
        
        ('ip444444-4444-4444-4444-444444444444', 
         'ped22222-2222-2222-2222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad', 
         1, 
         45.99, 
         0.00, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'LOTE004', 
         '2026-12-31', 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Despachos
        -- ============================================
        
        INSERT INTO despachos (id, pedidoId, bodega, horaSalida, ventanaPrometidaInicio, ventanaPrometidaFin, createdAt, updatedAt) VALUES
        -- Despacho para Pedido 2
        ('des11111-1111-1111-1111-111111111111', 
         'ped22222-2222-2222-2222-222222222222', 
         'Bodega Central', 
         '2026-02-03 14:00:00', 
         '2026-02-03 15:00:00', 
         '2026-02-03 17:00:00', 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Disponibilidad Zona
        -- ============================================
        
        INSERT INTO disponibilidad_zona (id, catalogoId, productoId, cantidadDisponible, ultimaActualizacion, createdAt, updatedAt) VALUES
        -- Disponibilidad para Catálogo 1
        ('dz111111-1111-1111-1111-111111111111', 
         'cat11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         100, 
         NOW(), 
         NOW(), 
         NOW()),
        
        ('dz222222-2222-2222-2222-222222222222', 
         'cat11111-1111-1111-1111-111111111111', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab', 
         50, 
         NOW(), 
         NOW(), 
         NOW()),
        
        -- Disponibilidad para Catálogo 2
        ('dz333333-3333-3333-3333-333333333333', 
         'cat22222-2222-2222-2222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 
         75, 
         NOW(), 
         NOW(), 
         NOW()),
        
        ('dz444444-4444-4444-4444-444444444444', 
         'cat22222-2222-2222-2222-222222222222', 
         'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaad', 
         150, 
         NOW(), 
         NOW(), 
         NOW());
        
        -- ============================================
        -- Datos de prueba para Notas de Crédito
        -- ============================================
        
        INSERT INTO notas_credito (id, pedidoId, numeroDocumento, fecha, motivo, monto, monedaId, evidencia, createdAt, updatedAt) VALUES
        -- Nota de crédito para Pedido 1
        ('not11111-1111-1111-1111-111111111111', 
         'ped11111-1111-1111-1111-111111111111', 
         'NC-001', 
         '2026-02-04', 
         'productoVencido', 
         5.50, 
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 
         'Producto vencido en entrega', 
         NOW(), 
         NOW());
        
        SELECT '✅ Datos de prueba insertados correctamente' AS message;
    ELSE
        SELECT '❌ Error: Las tablas no fueron creadas por TypeORM después de esperar' AS message;
    END IF;
END$$

DELIMITER ;

-- Ejecutar el procedimiento
CALL InsertTestData();

-- Limpiar
DROP PROCEDURE InsertTestData;

-- ============================================
-- Resumen de datos insertados
-- ============================================
-- 
-- ITEMS DE INVENTARIO: 5 registros
-- - Producto aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa en Tienda bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (100 unidades)
-- - Producto aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab en Tienda bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (50 unidades)
-- - Producto aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa en Tienda bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc (75 unidades)
-- - Producto aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac en Tienda bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (200 unidades)
-- - Producto aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaad en Tienda bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc (150 unidades)
--
-- REGISTROS DE COMPRA: 5 registros
-- REGISTROS DE VENTA: 6 registros
--
-- PRODUCTOS (LOGÍSTICA): 4 registros
-- CATÁLOGOS: 2 registros
-- CATÁLOGO-PRODUCTO: 5 registros
-- PROMOCIONES: 2 registros
-- PEDIDOS: 2 registros
-- ITEMS DE PEDIDO: 4 registros
-- DESPACHOS: 1 registro
-- DISPONIBILIDAD ZONA: 4 registros
-- NOTAS DE CRÉDITO: 1 registro
--
-- Moneda utilizada: cccccccc-cccc-cccc-cccc-cccccccccccc
-- 
-- ============================================
