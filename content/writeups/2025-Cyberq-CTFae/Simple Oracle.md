---
title: Simple Oracle
tags:
  - Crypto
Difficulty: Easy
---

### Description

Can you fix my One Final Bug in this oracle AES?

Files provided: challenge.py

The code provided had a small mistake, but it is easy to fix. The issue is that the flag is in bytes and then it attempts to do a .encode() which can only be done with a string. Simply change:

`enc = encrypt(FLAG.encode())`

for:

`enc = encrypt(FLAG)`

When we run the code, we get the following:

```
here is my secret can u recover it :
enc.hex() = 'd432184463270c9164b2d8032b191b770cbc70356e3b74bfd253ee51d915bad9'
what text do you want to encrypt->
```

The algorithm is an OFB oracle. AES-OFB turns AES into a _stream cipher_. The ciphertext = `plaintext XOR keystream`, and the keystream depends **only** on the key, IV and block position — **not** on the plaintext. So if you get the oracle to encrypt a plaintext whose _padded_ bytes you know, you can recover the keystream for those blocks, then XOR that keystream with the target ciphertext to recover the (padded) flag — then unpad. We need to make sure that we use the same bytes as the flag though, in this case 32 byes. So what we will do is encrypt `AAAAAAAAAAAAAAAA`

```
here is my secret can u recover it :
enc.hex() = 'd432184463270c9164b2d8032b191b770cbc70356e3b74bfd253ee51d915bad9'
what text do you want to encrypt->AAAAAAAAAAAAAAAA
ct.hex() = 'f31f386259027bb416c6fc235f6e3e5428cf051403206fa4c948f54ac20ea1c2'
```

The following script will recover the flag in plain text:

```
from binascii import unhexlify
from Crypto.Util.Padding import unpad

def xor_bytes(a: bytes, b: bytes) -> bytes:
    return bytes(x ^ y for x, y in zip(a, b))

# Provided values
target_hex = "e6a2ba86f6a55d5c9229240c1436aa3f3c4e63dbf49f513b22f259e34125faa3"
oracle_hex = "c18f9aa0cc82297ee2515c296544d24d4a6d4aaed7f24b2138e843f95b3fe0b9"

target_ct = unhexlify(target_hex)
oracle_ct = unhexlify(oracle_hex)

# This is exactly what we sent to the oracle
padded_plaintext = b"A"*16 + bytes([16]*16)  # 16 A's + 16 bytes of 0x10

# Compute keystream
keystream = xor_bytes(oracle_ct, padded_plaintext)

# Recover padded flag
flag_padded = xor_bytes(target_ct, keystream)

# Unpad
flag = unpad(flag_padded, 16)
print("Recovered flag:", flag)
```

When connecting to the challenge, I got the following

```
here is my secret can u recover it :
enc.hex() = 'e6a2ba86f6a55d5c9229240c1436aa3f3c4e63dbf49f513b22f259e34125faa3'
what text do you want to encrypt->$ AAAAAAAAAAAAAAAA
ct.hex() = 'c18f9aa0cc82297ee2515c296544d24d4a6d4aaed7f24b2138e843f95b3fe0b9'
```

Using the script:

flag{f5c199d0393f39e3}