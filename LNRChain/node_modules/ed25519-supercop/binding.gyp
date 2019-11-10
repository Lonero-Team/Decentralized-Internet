{
  "targets": [
    {
      "target_name": "supercop",
      "sources": [
        "supercop.cc",
        "vendor/ed25519/src/add_scalar.c",
        "vendor/ed25519/src/fe.c",
        "vendor/ed25519/src/ge.c",
        "vendor/ed25519/src/key_exchange.c",
        "vendor/ed25519/src/keypair.c",
        "vendor/ed25519/src/sc.c",
        "vendor/ed25519/src/seed.c",
        "vendor/ed25519/src/sha512.c",
        "vendor/ed25519/src/sign.c",
        "vendor/ed25519/src/verify.c"
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}
