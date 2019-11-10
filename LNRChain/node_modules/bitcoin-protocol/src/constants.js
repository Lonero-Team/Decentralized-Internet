'use strict'

exports.inventory = {
  ERROR: 0,
  MSG_TX: 1,
  MSG_BLOCK: 2,
  MSG_FILTERED_BLOCK: 3,
  MSG_WITNESS_TX: (1 << 30) + 1,
  MSG_WITNESS_BLOCK: (1 << 30) + 2
}

exports.reject = {
  MALFORMED: 0x01,
  INVALID: 0x10,
  OBSOLETE: 0x11,
  DUPLICATE: 0x12,
  NONSTANDARD: 0x40,
  DUST: 0x41,
  INSUFFICIENTFEE: 0x42,
  CHECKPOINT: 0x43
}
