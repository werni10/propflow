-- Migration 005: Damage reports + message indexes

-- Damage reports
CREATE TABLE IF NOT EXISTS damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  severity VARCHAR(20) DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'severe')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_damage_reports_booking ON damage_reports(booking_id);

-- Message indexes (messages table already exists in migration 002)
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(booking_id, created_at);
