DROP TABLE IF EXISTS auctions,
users,
bids,
bid_options;

CREATE TABLE IF NOT EXISTS auctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auction_number INTEGER UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT UNIQUE,
  auction_id INTEGER,
  points_remaining INTEGER,
  bid_option_id INTEGER,
  seat_number INTEGER,
  FOREIGN KEY (auction_id) REFERENCES auctions(id),
  FOREIGN KEY (bid_option_id) REFERENCES bid_options(id)
);

CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  round INTEGER,
  bid_values ARRAY of INTEGER,
  UNIQUE(user_id, round),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bid_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bid_options ARRAY of INTEGER,
  size INTEGER
);

INSERT INTO
  bid_options (bid_options, size)
VALUES
  ('[10,22,49,110,246,548]', 4),
  ('[12,27,60,135,300,670]', 4),
  ('[14,33,74,164,367,818]', 4),
  ('[18,40,90,201,448,1000]', 4);