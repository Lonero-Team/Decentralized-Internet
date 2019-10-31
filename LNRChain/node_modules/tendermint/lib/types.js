'use strict';

var struct = require('varstruct');
var Int64LE = struct.Int64LE;

var _require = require('./varint.js'),
    VarInt = _require.VarInt,
    UVarInt = _require.UVarInt;

var VarString = struct.VarString(UVarInt);
var VarBuffer = struct.VarBuffer(UVarInt);

var VarHexBuffer = {
  decode: function decode() {
    throw Error('Decode not implemented');
  },
  encode: function encode(value, buffer, offset) {
    value = Buffer.from(value, 'hex');
    var bytes = VarBuffer.encode(value, buffer, offset);
    VarHexBuffer.encode.bytes = VarBuffer.encode.bytes;
    return bytes;
  },
  encodingLength: function encodingLength(value) {
    var length = value.length / 2;
    return length + UVarInt.encodingLength(length);
  }
};

var Time = {
  encode: function encode(value, buffer) {
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    if (value[value.length - 1] !== 'Z') {
      throw Error('Timestamp must be UTC timezone');
    }

    var length = Time.encodingLength(value);
    buffer = buffer || Buffer.alloc(length);

    var _Time$getComponents = Time.getComponents(value),
        seconds = _Time$getComponents.seconds,
        nanoseconds = _Time$getComponents.nanoseconds;

    // seconds field


    if (seconds) {
      buffer[offset] = 0x08;
      UVarInt.encode(seconds, buffer, offset + 1);
      offset += UVarInt.encode.bytes + 1;
    }

    // nanoseconds field
    if (nanoseconds) {
      buffer[offset] = 0x10;
      UVarInt.encode(nanoseconds, buffer, offset + 1);
    }

    Time.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(value) {
    var _Time$getComponents2 = Time.getComponents(value),
        seconds = _Time$getComponents2.seconds,
        nanoseconds = _Time$getComponents2.nanoseconds;

    var length = 0;
    if (seconds) {
      length += 1 + UVarInt.encodingLength(seconds);
    }
    if (nanoseconds) {
      length += 1 + UVarInt.encodingLength(nanoseconds);
    }
    return length;
  },
  getComponents: function getComponents(value) {
    var millis = new Date(value).getTime();
    var seconds = Math.floor(millis / 1000);

    // ghetto, we're pulling the nanoseconds from the string
    var withoutZone = value.slice(0, -1);
    var nanosStr = withoutZone.split('.')[1] || '';
    var nanoseconds = Number(nanosStr.padEnd(9, '0'));

    return { seconds: seconds, nanoseconds: nanoseconds };
  }
};

var BlockID = {
  encode: function encode(value, buffer) {
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var length = BlockID.encodingLength(value);
    buffer = buffer || Buffer.alloc(length);

    // TODO: actually do amino encoding stuff

    // hash field
    if (value.hash) {
      var hash = Buffer.from(value.hash, 'hex');
      buffer[offset + 0] = 0x0a;
      buffer[offset + 1] = hash.length;
      hash.copy(buffer, offset + 2);
      offset += hash.length + 2;
    }

    // block parts
    if (value.parts && value.parts.hash) {
      var partsHash = Buffer.from(value.parts.hash, 'hex');
      buffer[offset] = 0x12;
      buffer[offset + 1] = partsHash.length + 4;

      buffer[offset + 2] = 0x08;
      buffer[offset + 3] = value.parts.total;

      buffer[offset + 4] = 0x12;
      buffer[offset + 5] = partsHash.length;
      partsHash.copy(buffer, offset + 6);
      offset += partsHash.length + 4;
    }

    CanonicalBlockID.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(value) {
    var length = 0;
    if (value.hash) length += value.hash.length / 2 + 2;
    if (value.parts && value.parts.hash) {
      length += value.parts.hash.length / 2 + 6;
    }
    return length;
  }
};

var CanonicalBlockID = {
  encode: function encode(value, buffer) {
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var length = CanonicalBlockID.encodingLength(value);
    buffer = buffer || Buffer.alloc(length);

    // TODO: actually do amino encoding stuff

    // hash field
    var hash = Buffer.from(value.hash, 'hex');
    buffer[offset + 0] = 0x0a;
    buffer[offset + 1] = hash.length;
    hash.copy(buffer, offset + 2);
    offset += hash.length + 2;

    // block parts
    var partsHash = Buffer.from(value.parts.hash, 'hex');
    buffer[offset] = 0x12;
    buffer[offset + 1] = partsHash.length + 4;
    buffer[offset + 2] = 0x0a;
    buffer[offset + 3] = partsHash.length;
    partsHash.copy(buffer, offset + 4);
    offset += partsHash.length + 4;

    buffer[offset] = 0x10;
    buffer[offset + 1] = value.parts.total;

    CanonicalBlockID.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(value) {
    return value.hash.length / 2 + value.parts.hash.length / 2 + 8;
  }
};

var TreeHashInput = struct([{ name: 'left', type: VarBuffer }, { name: 'right', type: VarBuffer }]);

var pubkeyAminoPrefix = Buffer.from('1624DE6420', 'hex');
var PubKey = {
  decode: function decode(buffer) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : buffer.length;

    throw Error('Decode not implemented');
  },
  encode: function encode(pub, buffer) {
    var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

    var length = PubKey.encodingLength(pub);
    buffer = buffer || Buffer.alloc(length);
    if (pub == null) {
      buffer[offset] = 0;
    } else {
      pubkeyAminoPrefix.copy(buffer, offset);
      Buffer.from(pub.value, 'base64').copy(buffer, offset + pubkeyAminoPrefix.length);
    }
    PubKey.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(pub) {
    if (pub == null) return 1;
    return 37;
  }
};

var ValidatorHashInput = {
  decode: function decode(buffer) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : buffer.length;

    throw Error('Decode not implemented');
  },
  encode: function encode(validator) {
    var length = ValidatorHashInput.encodingLength(validator);
    var buffer = Buffer.alloc(length);

    // pubkey field
    buffer[0] = 0x0a;
    buffer[1] = 0x25;
    PubKey.encode(validator.pub_key, buffer, 2);

    // voting power field
    buffer[39] = 0x10;
    UVarInt.encode(validator.voting_power, buffer, 40);

    ValidatorHashInput.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(validator) {
    return 40 + UVarInt.encodingLength(validator.voting_power);
  }
};

var CanonicalVote = {
  decode: function decode(buffer) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : buffer.length;

    throw Error('Decode not implemented');
  },
  encode: function encode(vote) {
    var length = CanonicalVote.encodingLength(vote);
    var buffer = Buffer.alloc(length);
    var offset = 0;

    // type field
    if (Number(vote.type)) {
      buffer[offset] = 0x08;
      buffer.writeUInt8(vote.type, offset + 1);
      offset += 2;
    }

    // height field
    if (Number(vote.height)) {
      buffer[offset] = 0x11;
      Int64LE.encode(vote.height, buffer, offset + 1);
      offset += 9;
    }

    // round field
    if (Number(vote.round)) {
      buffer[offset] = 0x19;
      Int64LE.encode(vote.round, buffer, offset + 1);
      offset += 9;
    }

    // block_id field
    if (vote.block_id && vote.block_id.hash) {
      buffer[offset] = 0x22;
      CanonicalBlockID.encode(vote.block_id, buffer, offset + 2);
      buffer[offset + 1] = CanonicalBlockID.encode.bytes;
      offset += CanonicalBlockID.encode.bytes + 2;
    }

    // time field
    buffer[offset] = 0x2a;
    Time.encode(vote.timestamp, buffer, offset + 2);
    buffer[offset + 1] = Time.encode.bytes;
    offset += Time.encode.bytes + 2;

    // chain_id field
    buffer[offset] = 0x32;
    buffer.writeUInt8(vote.chain_id.length, offset + 1);
    Buffer.from(vote.chain_id).copy(buffer, offset + 2);

    CanonicalVote.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(vote) {
    var length = 0;

    // type field
    if (Number(vote.type)) {
      length += 2;
    }

    // height field
    if (Number(vote.height)) {
      length += 9;
    }

    // round field
    if (Number(vote.round)) {
      length += 9;
    }

    // block_id field
    if (vote.block_id && vote.block_id.hash) {
      length += CanonicalBlockID.encodingLength(vote.block_id) + 2;
    }

    // time field
    length += Time.encodingLength(vote.timestamp) + 2;

    // chain_id field
    length += vote.chain_id.length + 2;

    return length;
  }
};

var Version = {
  decode: function decode(buffer) {
    var start = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var end = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : buffer.length;

    throw Error('Decode not implemented');
  },
  encode: function encode(version) {
    var length = Version.encodingLength(version);
    var buffer = Buffer.alloc(length);
    var offset = 0;

    var block = Number(version.block);
    var app = Number(version.app);

    // block field
    if (block) {
      buffer[offset] = 0x08;
      UVarInt.encode(version.block, buffer, offset + 1);
      offset += UVarInt.encode.bytes + 1;
    }

    // app field
    if (app) {
      buffer[offset] = 0x10;
      UVarInt.encode(version.app, buffer, offset + 1);
    }

    CanonicalVote.encode.bytes = length;
    return buffer;
  },
  encodingLength: function encodingLength(version) {
    var block = Number(version.block);
    var app = Number(version.app);

    var length = 0;
    if (block) {
      length += UVarInt.encodingLength(version.block) + 1;
    }
    if (app) {
      length += UVarInt.encodingLength(version.app) + 1;
    }
    return length;
  }
};

module.exports = {
  VarInt: VarInt,
  UVarInt: UVarInt,
  VarString: VarString,
  VarBuffer: VarBuffer,
  VarHexBuffer: VarHexBuffer,
  Time: Time,
  BlockID: BlockID,
  CanonicalBlockID: CanonicalBlockID,
  TreeHashInput: TreeHashInput,
  ValidatorHashInput: ValidatorHashInput,
  PubKey: PubKey,
  Int64LE: Int64LE,
  CanonicalVote: CanonicalVote,
  Version: Version
};