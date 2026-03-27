-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL DEFAULT 'waiter',
    active        BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID        NOT NULL REFERENCES categories(id),
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    base_price  BIGINT      NOT NULL DEFAULT 0,
    image_url   TEXT        NOT NULL DEFAULT '',
    active      BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Product Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id         UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID   NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name       TEXT   NOT NULL,
    price_diff BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    unit          TEXT        NOT NULL DEFAULT 'units',
    current_stock DOUBLE PRECISION NOT NULL DEFAULT 0,
    min_stock     DOUBLE PRECISION NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stock Entries
CREATE TABLE IF NOT EXISTS stock_entries (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID        NOT NULL REFERENCES inventory_items(id),
    quantity          DOUBLE PRECISION NOT NULL,
    cost_per_unit     BIGINT      NOT NULL DEFAULT 0,
    supplier          TEXT        NOT NULL DEFAULT '',
    received_by       UUID        NOT NULL,
    received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_stock_entries_item ON stock_entries(inventory_item_id);

-- Tables
CREATE TABLE IF NOT EXISTS tables (
    id       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    number   INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4,
    status   TEXT    NOT NULL DEFAULT 'available',
    pos_x    DOUBLE PRECISION NOT NULL DEFAULT 0,
    pos_y    DOUBLE PRECISION NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tables_number ON tables(number);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    table_id  UUID        REFERENCES tables(id),
    waiter_id UUID        NOT NULL,
    status    TEXT        NOT NULL DEFAULT 'open',
    notes     TEXT        NOT NULL DEFAULT '',
    opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_waiter ON orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_opened_at ON orders(opened_at);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id         UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id   UUID   NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID   NOT NULL REFERENCES products(id),
    variant_id UUID   REFERENCES product_variants(id),
    quantity   INTEGER NOT NULL DEFAULT 1,
    unit_price BIGINT  NOT NULL DEFAULT 0,
    notes      TEXT    NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID        NOT NULL REFERENCES orders(id),
    amount       BIGINT      NOT NULL DEFAULT 0,
    method       TEXT        NOT NULL DEFAULT '',
    provider     TEXT        NOT NULL DEFAULT '',
    provider_ref TEXT        NOT NULL DEFAULT '',
    status       TEXT        NOT NULL DEFAULT 'pending',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
