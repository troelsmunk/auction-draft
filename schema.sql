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
  ('[10, 20, 30]', 3),
  ('[5, 15, 25, 35]', 4),
  ('[1, 2, 3, 4, 5]', 5);