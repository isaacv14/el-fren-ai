-- Tabla para almacenar los veredictos finales de El Fren AI
CREATE TABLE IF NOT EXISTS veredictos (
  id BIGSERIAL PRIMARY KEY,
  bachiller TEXT NOT NULL,
  choice_confidence INTEGER NOT NULL CHECK (choice_confidence >= 0 AND choice_confidence <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para consultas por fecha
CREATE INDEX IF NOT EXISTS idx_veredictos_created_at ON veredictos (created_at);
