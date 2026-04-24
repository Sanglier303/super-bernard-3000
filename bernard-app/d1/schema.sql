CREATE TABLE IF NOT EXISTS dataset_records (
  dataset TEXT NOT NULL,
  item_id TEXT NOT NULL,
  sort_index INTEGER NOT NULL,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (dataset, item_id)
) STRICT;

CREATE INDEX IF NOT EXISTS idx_dataset_records_dataset_sort
ON dataset_records (dataset, sort_index);

CREATE TABLE IF NOT EXISTS action_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataset TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;

CREATE INDEX IF NOT EXISTS idx_action_logs_dataset_created_at
ON action_logs (dataset, created_at DESC);
