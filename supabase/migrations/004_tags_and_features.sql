-- Add tags and era to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE items ADD COLUMN IF NOT EXISTS era VARCHAR(50);
ALTER TABLE items ADD COLUMN IF NOT EXISTS instant_book BOOLEAN DEFAULT FALSE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);
ALTER TABLE items ADD COLUMN IF NOT EXISTS weekly_discount INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN IF NOT EXISTS monthly_discount INTEGER DEFAULT 0;

-- Index for tag search
CREATE INDEX IF NOT EXISTS idx_items_tags ON items USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_items_era ON items(era);

-- Full text search index
ALTER TABLE items ADD COLUMN IF NOT EXISTS search_vector tsvector;
UPDATE items SET search_vector = to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''));
CREATE INDEX IF NOT EXISTS idx_items_search ON items USING gin(search_vector);

-- Trigger to keep search_vector updated
CREATE OR REPLACE FUNCTION update_item_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS item_search_vector_update ON items;
CREATE TRIGGER item_search_vector_update
  BEFORE INSERT OR UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_item_search_vector();
