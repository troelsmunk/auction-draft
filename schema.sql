DROP TABLE IF EXISTS bids;

DROP TABLE IF EXISTS users;

DROP TABLE IF EXISTS auctions;

DROP TABLE IF EXISTS bid_options;

CREATE TABLE IF NOT EXISTS auctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auction_number INTEGER UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT UNIQUE,
  auction_id INTEGER NOT NULL,
  points_remaining INTEGER NOT NULL,
  bid_option_id INTEGER NOT NULL,
  seat_number INTEGER NOT NULL,
  UNIQUE(auction_id, bid_option_id),
  UNIQUE(auction_id, seat_number),
  FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
  FOREIGN KEY (bid_option_id) REFERENCES bid_options(id)
);

CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  round INTEGER NOT NULL,
  bid_values ARRAY of INTEGER NOT NULL,
  UNIQUE(user_id, round),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bid_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bid_options_array ARRAY of INTEGER NOT NULL,
  size INTEGER NOT NULL
);

INSERT INTO
  bid_options (bid_options_array, size)
VALUES
  ('[10,22,49,110,246,548]', 2),
  ('[14,33,74,164,367,818]', 2),
  ('[10,22,49,110,246,548]', 4),
  ('[12,27,60,135,300,670]', 4),
  ('[14,33,74,164,367,818]', 4),
  ('[18,40,90,201,448,1000]', 4);