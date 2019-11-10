#include <nan.h>
#include <node_buffer.h>
#include "vendor/ed25519/src/ed25519.h"

using namespace node;
using namespace v8;
using namespace Nan;

Local<Object> NewBuf (unsigned char *buf, size_t len) {
  return CopyBuffer((char *) buf, len).ToLocalChecked();
}

NAN_METHOD(Sign) {
  unsigned char *message = (unsigned char*) Buffer::Data(info[0]);
  size_t messageLen = Buffer::Length(info[0]);
 
  if (Buffer::Length(info[1]) != 32) {
    return ThrowError("public key must be 32 bytes");
  }
  unsigned char *publicKey = (unsigned char*) Buffer::Data(info[1]);
 
  if (Buffer::Length(info[2]) != 64) {
    return ThrowError("secret key must be 64 bytes");
  }
  unsigned char *secretKey = (unsigned char*) Buffer::Data(info[2]);

  unsigned char signature[64];
  ed25519_sign(signature, message, messageLen, publicKey, secretKey);
 
  info.GetReturnValue().Set(NewBuf(signature, 64));
}

NAN_METHOD(Verify) {
  unsigned char *signature = (unsigned char*) Buffer::Data(info[0]);
  if (Buffer::Length(info[0]) != 64) {
    return ThrowError("signature must be 64 bytes");
  }

  unsigned char *message = (unsigned char*) Buffer::Data(info[1]);
  size_t messageLen = Buffer::Length(info[1]);

  if (Buffer::Length(info[2]) != 32) {
    return ThrowError("public key must be 32 bytes");
  }
  unsigned char *publicKey = (unsigned char*) Buffer::Data(info[2]);

  bool result = ed25519_verify(signature, message, messageLen, publicKey);
  info.GetReturnValue().Set(result);
}

NAN_METHOD(CreateSeed) {
  unsigned char seed[32];
  ed25519_create_seed(seed);
  info.GetReturnValue().Set(NewBuf(seed, 32));
}

NAN_METHOD(CreateKeyPair) {
  if (Buffer::Length(info[0]) != 32) {
    return ThrowError("seed must be 32 bytes");
  }
  unsigned char *seed = (unsigned char*) Buffer::Data(info[0]);
  unsigned char publicKey[32];
  unsigned char secretKey[64];
  ed25519_create_keypair(publicKey, secretKey, seed);

  Local<Object> result = New<Object>();
  Nan::Set(result, New<String>("publicKey").ToLocalChecked(), NewBuf(publicKey, 32));
  Nan::Set(result, New<String>("secretKey").ToLocalChecked(), NewBuf(secretKey, 64));
  info.GetReturnValue().Set(result);
}

NAN_MODULE_INIT(InitAll) {
  Nan::Set(target, New<String>("sign").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(Sign)).ToLocalChecked());
  Nan::Set(target, New<String>("verify").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(Verify)).ToLocalChecked());
  Nan::Set(target, New<String>("createSeed").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(CreateSeed)).ToLocalChecked());
  Nan::Set(target, New<String>("createKeyPair").ToLocalChecked(),
    GetFunction(New<FunctionTemplate>(CreateKeyPair)).ToLocalChecked());
}
NODE_MODULE(supercop, InitAll)
