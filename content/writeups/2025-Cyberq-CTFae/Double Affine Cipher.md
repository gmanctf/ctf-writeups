---
title: Double Affine Cipher
tags:
  - Crypto
Difficulty: Easy
---

### Description

I tried to teach my pet rock basic algebra, but it got confused and encrypted my shopping list. It kept muttering something about (ax + b) mod 256 before rolling away.

File provided: challenge.py

When you run the script:

```bash
$ python3 challenge.py   
241 179
my ciphertext : 4c7aa1314a508c6d7f5f201a6ecee986b134e18b195bc304ece742fb080df219
you have one shot do not miss it 
what do u want to encrypt (data in hex) :

```

### Quick summary of the vuln

The script uses a byte-wise affine map modulo `m = 256`:

- `encrypt(x, a, b)` maps a byte `x` → `a*x + b (mod 256)`.
    

You are shown:

- `a` and `b` (they are printed by the script),
    
- the single-encryption ciphertext `c = encrypt(pt, a, b)` (hex),
    
- you can send **one** short plaintext (≤2 bytes) and you get back `ct = encrypt(encrypt(ptt, a, b), b, a)`, i.e. the double application with swapped parameters.
    

But you don't need the oracle: since `a` is an odd prime < 256, `gcd(a,256)=1`, so `a` has an inverse modulo 256. You can invert the single-affine map to recover `pt` byte-by-byte:

pt=a−1⋅(c−b)    256pt = a^{-1} \cdot (c - b)\ \bmod\ 256pt=a−1⋅(c−b) mod 256

---

### What to do (step-by-step)

1. Copy `a`, `b` and the printed ciphertext hex `c` from the challenge output.
    
2. Compute the modular inverse `a^{-1}` modulo `256`.
    
3. For each ciphertext byte `ci` compute `pti = a^{-1} * (ci - b) mod 256`.
    
4. Submit the recovered `pt` bytes (in hex) when the program asks for “enter your data in hex :” to get the flag.
    

---

### Ready-to-run Python helper

Paste the printed `a`, `b`, and the ciphertext string into this script. It will print the recovered plaintext as hex and ASCII.

```python
# recover_pt.py
from functools import reduce

def egcd(a, b):
    if b == 0:
        return (a, 1, 0)
    g, x1, y1 = egcd(b, a % b)
    return (g, y1, x1 - (a // b) * y1)

def modinv(a, m):
    g, x, _ = egcd(a, m)
    if g != 1:
        raise ValueError("no inverse")
    return x % m

def recover_pt(a, b, c_hex):
    m = 256
    inv_a = modinv(a % m, m)
    c_bytes = bytes.fromhex(c_hex)
    pt_bytes = bytes((inv_a * ((ci - b) % m)) % m for ci in c_bytes)
    return pt_bytes

if __name__ == "__main__":
    # Put the values printed by the challenge here:
    a = 101        # <--- replace with printed a
    b = 173        # <--- replace with printed b
    c_hex = "3f7a..."  # <--- replace with printed ciphertext hex

    pt = recover_pt(a, b, c_hex)
    print("recovered pt (hex):", pt.hex())
    try:
        print("recovered pt (ascii):", pt.decode('utf-8', errors='replace'))
    except:
        pass

```

Replace `a`, `b`, and `c_hex` with the values you saw and run it. The output `pt.hex()` is exactly what you should feed **(as hex)** to the final prompt `enter your data in hex :` to get the flag.

![[Pasted image 20251022173248.png]]

Note: the program first asks: "what do u want to encrypt (data in hex) :" you can introduce any 2 hex characters, it doesn't matter. Then it will ask for the hex you need to feed from the solution.

Challenge gives you an script to connect to instance:

```
from pwn import *

HOST = "6b4443e57e900f7b.chal.ctf.ae"
io = remote(host=HOST, port=443, ssl=True, sni=HOST)

io.interactive()
```

then you get the following:

```
my ciphertext : a23a4f170fcf0772466cf639cecd02a624c8bc762e0e4a32c60535f44cc9a5c4
you have one shot do not miss it 
what do u want to encrypt (data in hex) :$ 
```

To solve it, we first introduce 00 for example to get an encrypted example.

```
my ciphertext : a23a4f170fcf0772466cf639cecd02a624c8bc762e0e4a32c60535f44cc9a5c4
you have one shot do not miss it 
what do u want to encrypt (data in hex) :$ 00
ct = '94'
what was my plaintext ?
enter your data in hex : $  
```

Then we use a script to bruteforce all valid prime numbers and we try the options till we find the correct one:

```python
#!/usr/bin/env python3
# double_affine_bruteforce.py
# Usage:
#  - supply ciphertext hex and f0 (hex) always.
#  - optionally supply f1 (hex) to uniquely recover a,b.
#
# Example:
#   python3 double_affine_bruteforce.py
#   (then follow prompts)

from typing import List, Tuple
import sys
import string

MOD = 256

# generate 8-bit primes (2..251)
def gen_primes_u8() -> List[int]:
    primes = []
    for n in range(2, 256):
        is_p = True
        for d in range(2, int(n**0.5)+1):
            if n % d == 0:
                is_p = False
                break
        if is_p:
            primes.append(n)
    return primes

PRIMES8 = gen_primes_u8()

def egcd(a:int,b:int) -> Tuple[int,int,int]:
    if b==0:
        return (a,1,0)
    g,x1,y1 = egcd(b, a % b)
    return (g, y1, x1 - (a//b)*y1)

def modinv(a:int, m:int) -> int:
    g, x, _ = egcd(a, m)
    if g != 1:
        raise ValueError(f"no inverse for {a} mod {m} (gcd={g})")
    return x % m

def decrypt_with_ab(a:int, b:int, c_hex:str) -> bytes:
    a_mod = a % MOD
    b_mod = b % MOD
    inv_a = modinv(a_mod, MOD)
    c_bytes = bytes.fromhex(c_hex)
    pt = bytes((inv_a * ((ci - b_mod) % MOD)) % MOD for ci in c_bytes)
    return pt

def printable_fraction(bs:bytes) -> float:
    ok = sum(1 for x in bs if 32 <= x <= 126)  # printable ASCII range
    return ok / len(bs)

def find_candidates_from_f0(f0:int, ciphertext_hex:str) -> List[Tuple[int,int,bytes,float]]:
    candidates = []
    for a in PRIMES8:
        # compute b such that b^2 + a ≡ f0 (mod 256) -> b^2 ≡ f0 - a
        target = (f0 - a) % MOD
        # b must be an 8-bit prime
        for b in PRIMES8:
            if (b * b) % MOD == target:
                # ensure gcd(a,256)==1 so inv exists
                from math import gcd
                if gcd(a, MOD) != 1:
                    continue
                try:
                    pt = decrypt_with_ab(a, b, ciphertext_hex)
                except Exception:
                    continue
                pf = printable_fraction(pt)
                candidates.append((a, b, pt, pf))
    # sort by printable fraction descending (heuristic)
    candidates.sort(key=lambda x: (-x[3], x[0], x[1]))
    return candidates

def find_from_f0_f1(f0:int, f1:int, ciphertext_hex:str) -> List[Tuple[int,int,bytes,float]]:
    diff = (f1 - f0) % MOD  # ab mod 256
    sols = []
    for a in PRIMES8:
        from math import gcd
        if gcd(a, MOD) != 1:
            continue
        # attempt to compute b = diff * a^{-1} mod 256
        try:
            inv_a = modinv(a, MOD)
        except ValueError:
            continue
        b = (diff * inv_a) % MOD
        # b must be an 8-bit prime (the challenge uses getPrime(8))
        if b not in PRIMES8:
            continue
        # verify f0 == b^2 + a (mod 256)
        if (b*b + a) % MOD != f0:
            continue
        # decrypt
        try:
            pt = decrypt_with_ab(a, b, ciphertext_hex)
        except Exception:
            continue
        sols.append((a, b, pt, printable_fraction(pt)))
    return sols

def hex_input_prompt(prompt:str) -> str:
    s = input(prompt).strip()
    s = s.lower()
    # allow leading 0x
    if s.startswith("0x"):
        s = s[2:]
    return s

def main():
    print("Double-affine bruteforcer\n")
    c_hex = hex_input_prompt("Enter 'my ciphertext' hex (exact): ")
    if len(c_hex) % 2 != 0:
        print("Ciphertext hex length must be even.")
        sys.exit(1)
    f0_hex = hex_input_prompt("Enter oracle output for input 00 (f(0), hex, e.g. 94): ")
    if len(f0_hex) == 0:
        print("Need f(0).")
        sys.exit(1)
    f0 = int(f0_hex, 16)

    f1_hex = input("Optional: Enter oracle output for input 01 (f(1), hex), or press Enter to skip: ").strip().lower()
    if f1_hex.startswith("0x"):
        f1_hex = f1_hex[2:]
    if f1_hex != "":
        f1 = int(f1_hex, 16)
        sols = find_from_f0_f1(f0, f1, c_hex)
        if not sols:
            print("No (a,b) found matching f(0) & f(1).")
            sys.exit(1)
        print(f"\nFound {len(sols)} solution(s) using both f(0) and f(1):")
        for a,b,pt,pf in sols:
            print(f"\n--- a={a}, b={b} (pf={pf:.3f}) ---")
            print("plaintext hex:", pt.hex())
            print("plaintext repr:", repr(pt))
        return

    # fallback: only f0 available -> enumerate candidates
    print("\nNo f(1) provided; enumerating all (a,b) pairs consistent with f(0) ...")
    candidates = find_candidates_from_f0(f0, c_hex)
    if not candidates:
        print("No candidates found (this is unexpected).")
        sys.exit(1)
    print(f"Found {len(candidates)} candidate (a,b) pairs. Top candidates (by printable fraction):\n")
    for idx, (a,b,pt,pf) in enumerate(candidates, 1):
        print(f"[{idx}] a={a}, b={b}, printable_frac={pf:.3f}")
        print("    plaintext hex:", pt.hex())
        # show small repr; avoid dumping too long binary on screen
        try:
            as_text = pt.decode('utf-8')
        except Exception:
            as_text = pt.decode('utf-8', errors='replace')
        print("    plaintext ascii attempt:", as_text)
        print()
    print("If only 1 candidate exists, that's your (a,b). Otherwise either:")
    print(" - run the challenge one more time with input '01' to get f(1) and re-run with that; or")
    print(" - try the candidate plaintext hexs at the final prompt 'enter your data in hex :' until the flag appears.")

if __name__ == "__main__":
    main()

```



![[Pasted image 20251022180740.png]]

well done here is your flag: flag{2bd804b998eda6ed}