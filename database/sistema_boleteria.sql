-- ============================================================
-- Sistema de Boletería - Script de creación de base de datos
-- Motor: MySQL 8+
-- ============================================================

CREATE DATABASE IF NOT EXISTS sistema_boleteria
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE sistema_boleteria;

-- ------------------------------------------------------------
-- Tabla: usuarios
-- ------------------------------------------------------------
CREATE TABLE usuarios (
    usuario_id         INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario     VARCHAR(50)  NOT NULL UNIQUE,
    correo             VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash    VARCHAR(255) NOT NULL,
    rol                VARCHAR(20)  NOT NULL DEFAULT 'USUARIO',
    correo_verificado  BOOLEAN      NOT NULL DEFAULT FALSE,
    token_verificacion VARCHAR(100) NULL,
    fecha_registro     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_usuarios_rol CHECK (rol IN ('ADMIN', 'USUARIO'))
);

-- ------------------------------------------------------------
-- Tabla: categorias
-- ------------------------------------------------------------
CREATE TABLE categorias (
    categoria_id INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(50) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- Tabla: eventos
-- ------------------------------------------------------------
CREATE TABLE eventos (
    evento_id    INT AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(150) NOT NULL,
    descripcion  TEXT         NULL,
    fecha        DATE         NOT NULL,
    hora         TIME         NOT NULL,
    lugar        VARCHAR(150) NOT NULL,
    imagen_url   VARCHAR(255) NULL,
    categoria_id INT          NOT NULL,
    CONSTRAINT fk_eventos_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias (categoria_id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Índice para acelerar el filtro de eventos por fecha
CREATE INDEX idx_eventos_fecha ON eventos (fecha);

-- ------------------------------------------------------------
-- Tabla: tipos_ticket
-- ------------------------------------------------------------
CREATE TABLE tipos_ticket (
    tipo_ticket_id      INT AUTO_INCREMENT PRIMARY KEY,
    evento_id           INT           NOT NULL,
    nombre              VARCHAR(50)   NOT NULL,
    precio              DECIMAL(10,2) NOT NULL,
    cantidad_disponible INT           NOT NULL,
    CONSTRAINT fk_tipos_ticket_evento
        FOREIGN KEY (evento_id) REFERENCES eventos (evento_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uq_tipo_por_evento UNIQUE (evento_id, nombre),
    CONSTRAINT chk_tipos_ticket_precio CHECK (precio >= 0),
    CONSTRAINT chk_tipos_ticket_cantidad CHECK (cantidad_disponible >= 0)
);

-- ------------------------------------------------------------
-- Tabla: ordenes
-- ------------------------------------------------------------
CREATE TABLE ordenes (
    orden_id     INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   INT           NOT NULL,
    fecha_compra DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total        DECIMAL(10,2) NOT NULL,
    estado       VARCHAR(20)   NOT NULL DEFAULT 'PENDIENTE',
    CONSTRAINT fk_ordenes_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios (usuario_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_ordenes_total CHECK (total >= 0),
    CONSTRAINT chk_ordenes_estado
        CHECK (estado IN ('PENDIENTE', 'PAGADA', 'CANCELADA'))
);

-- ------------------------------------------------------------
-- Tabla: detalle_orden
-- ------------------------------------------------------------
CREATE TABLE detalle_orden (
    detalle_id      INT AUTO_INCREMENT PRIMARY KEY,
    orden_id        INT           NOT NULL,
    tipo_ticket_id  INT           NOT NULL,
    cantidad        INT           NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_orden
        FOREIGN KEY (orden_id) REFERENCES ordenes (orden_id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_tipo_ticket
        FOREIGN KEY (tipo_ticket_id) REFERENCES tipos_ticket (tipo_ticket_id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT chk_detalle_cantidad CHECK (cantidad BETWEEN 1 AND 10),
    CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0)
);