/** @type {string} */
export const COOKIE_NAME = "__session"
/** @type {string} */
export const ERROR_MESSAGE_401 =
  "You are not enrolled in an auction. Please join one."
/** @type {string} */
export const LOADING = "loading"
/** @type {string[]} */
export const COLOURS = [
  "#A0A6A6",
  "#B98EF6",
  "#FF931F",
  "#FF70AE",
  "#C27C5B",
  "#FAC30F",
]
/**
 * @typedef {Array<userBidOptions>} auctionBidOptions Options for an auction, ordered by user seats
 * @typedef {Array<number>} userBidOptions Options for a user, ordered by the size of bids
 */

/** @type {Map<number, auctionBidOptions>} Options for auctions, indexed by the size of the auction */
export const BID_OPTIONS = new Map([
  [1, [[0, 1, 2, 3, 4, 5, 6]]],
  [
    2,
    [
      [0, 10, 23, 53, 123, 284, 657],
      [0, 15, 35, 81, 187, 432, 1000],
    ],
  ],
  [
    3,
    [
      [0, 10, 22, 50, 114, 258, 581],
      [0, 13, 29, 66, 150, 338, 762],
      [0, 17, 38, 87, 196, 443, 1000],
    ],
  ],
  [
    4,
    [
      [0, 10, 22, 49, 110, 246, 548],
      [0, 12, 27, 60, 135, 300, 670],
      [0, 14, 33, 74, 164, 367, 818],
      [0, 18, 40, 90, 201, 448, 1000],
    ],
  ],
  [
    5,
    [
      [0, 10, 22, 48, 108, 239, 529],
      [0, 11, 25, 57, 126, 280, 621],
      [0, 13, 30, 67, 148, 329, 727],
      [0, 16, 35, 78, 174, 385, 853],
      [0, 18, 41, 92, 204, 452, 1000],
    ],
  ],
  [
    6,
    [
      [0, 10, 22, 48, 106, 235, 517],
      [0, 11, 25, 55, 121, 268, 590],
      [0, 13, 28, 63, 138, 305, 673],
      [0, 14, 32, 71, 158, 349, 768],
      [0, 16, 37, 82, 180, 398, 876],
      [0, 19, 42, 93, 206, 454, 1000],
    ],
  ],
])
