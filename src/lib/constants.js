/** @type {string} */
export const COOKIE_NAME = "__session"
/** @type {string} */
export const ERROR_MESSAGE_401 =
  "You are not enrolled in an auction. Please join one."
/** @type {string} */
export const LOADING = "loading"
/** @type {string[]} */
export const COLORS = [
  "#A0A6A6",
  "#B98EF6",
  "#FF931F",
  "#FF70AE",
  "#C27C5B",
  "#FAC30F",
]
/** @type {number} */
export const ITEM_COUNT = 15
/**
 * @typedef {Array<userBidOptions>} auctionBidOptions Options for an auction, ordered by user seats
 * @typedef {Array<number>} userBidOptions Options for a user, ordered by the size of bids
 */

/** @type {Map<number, auctionBidOptions>} Options for auctions, indexed by the size of the auction */
export const BID_OPTIONS = new Map([
  [1, [[0, 2, 4, 8, 16, 32, 64, 128]]],
  [
    2,
    [
      [0, 2, 4, 10, 21, 47, 102, 225],
      [0, 3, 7, 14, 31, 69, 152, 333],
    ],
  ],
  [
    3,
    [
      [0, 3, 6, 12, 25, 51, 103, 208],
      [0, 4, 8, 16, 32, 64, 130, 263],
      [0, 5, 10, 20, 40, 81, 164, 333],
    ],
  ],
  [
    4,
    [
      [0, 4, 8, 15, 29, 55, 106, 204],
      [0, 5, 9, 17, 34, 65, 125, 240],
      [0, 6, 11, 21, 40, 76, 147, 283],
      [0, 7, 13, 24, 47, 90, 173, 333],
    ],
  ],
  [
    5,
    [
      [0, 6, 11, 20, 35, 64, 115, 208],
      [0, 7, 12, 22, 40, 72, 129, 234],
      [0, 8, 14, 25, 45, 81, 146, 263],
      [0, 9, 15, 28, 50, 91, 164, 296],
      [0, 10, 17, 31, 57, 102, 184, 333],
    ],
  ],
  [
    6,
    [
      [0, 8, 14, 24, 41, 71, 122, 211],
      [0, 9, 15, 26, 45, 78, 134, 231],
      [0, 10, 17, 29, 49, 85, 147, 253],
      [0, 11, 18, 31, 54, 93, 161, 278],
      [0, 12, 20, 34, 59, 102, 176, 304],
      [0, 13, 22, 38, 65, 112, 193, 333],
    ],
  ],
])
