---
title: UofT LFSR Labyrinth
tags:
  - LFSR
  - Z3
  - offline-solvable
category: Crypto
---

# Description

A quirky 48-bit UofT stream taps through a WG-flavoured filter, leaving 80 bits of trace and a sealed flag. The blueprint is public; the hidden state is the dance you need to unravel.

Files Provided: [LFSR.zip](https://github.com/gmanctf/2026-UofTCTF/blob/main/Crypto/UofT%20LFSR%20Labyrinth/LFSR.zip)

# Solution

The challenge implements a custom stream-cipher–like construction:

1. A 48-bit LFSR (linear feedback shift register)
2. A nonlinear Boolean filter function
3. The generated keystream is used indirectly to derive a key
4. The key encrypts the flag using ChaCha20-Poly1305

The goal is to recover the internal LFSR state using a known keystream, derive the encryption key, and decrypt the ciphertext.

Even though the cipher uses a nonlinear filter, the internal state is small and the keystream is known. Each keystream bit gives us information about the internal state. With enough keystream bits, we can turn the problem into a system of Boolean equations and let a solver find the only state that satisfies all of them.

This can be done with Z3, an SMT solver (Satisfiability Modulo Theories) developed by Microsoft.

```python
from z3 import *
import json, binascii
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes

# ---------------------------
# Load challenge
# ---------------------------
with open("challenge.json") as f:
    chal = json.load(f)

L = chal["L"]
feedback_taps = chal["feedback_taps"]
filter_taps = chal["filter_taps"]
terms = chal["filter_terms"]
keystream = chal["keystream"]

# ---------------------------
# Z3 setup
# ---------------------------
s = Solver()

# state[t][i] = bit i of LFSR at time t
state = [
    [Bool(f"s_{t}_{i}") for i in range(L)]
    for t in range(len(keystream) + 1)
]

def anf(bits):
    """Evaluate ANF as Boolean expression"""
    out = False
    for mon in terms:
        prod = True
        for idx in mon:
            prod = And(prod, bits[idx])
        out = Xor(out, prod)
    return out

# ---------------------------
# Constraints
# ---------------------------
for t, z in enumerate(keystream):
    taps = [state[t][i] for i in filter_taps]

    # keystream bit
    s.add(anf(taps) == (z == 1))

    # feedback
    fb = False
    for idx in feedback_taps:
        fb = Xor(fb, state[t][idx])

    s.add(state[t + 1][0] == fb)
    for i in range(1, L):
        s.add(state[t + 1][i] == state[t][i - 1])

assert s.check() == sat
m = s.model()

# ---------------------------
# Recover initial state
# ---------------------------
init_state = [1 if m[state[0][i]] else 0 for i in range(L)]
state_bytes = bytes(init_state)

print("[+] Initial LFSR state recovered")

# ---------------------------
# Derive key
# ---------------------------
hkdf = HKDF(
    algorithm=hashes.SHA256(),
    length=32,
    salt=None,
    info=b"nlfg-ctf",
)
key = hkdf.derive(state_bytes)

# ---------------------------
# Decrypt flag
# ---------------------------
nonce = bytes.fromhex(chal["nonce"])
ct = bytes.fromhex(chal["ct"])

aead = ChaCha20Poly1305(key)
flag = aead.decrypt(nonce, ct, None)

print("[+] FLAG:", flag.decode())
```

Flag: ==uoftctf{l33ky_lfsr_w17h_n0n_l1n34r_fl4v0rrrr}==
