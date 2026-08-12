CREATE TABLE IF NOT EXISTS links (
  id BIGSERIAL PRIMARY KEY,
  alias VARCHAR(64) NOT NULL UNIQUE,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_links_alias ON links(alias);
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON links(expires_at);
