---
title: PostECSDA2
tags:
  - Crypto
Difficulty: Hard
---
### Description

In Tech City, grudges are written in code. A disgruntled engineer once pushed a subtle, spiteful patch into a beloved service — not to break it, but to make it remember. Now the system answers with cold, personal riddles: responses that echo past slights, log entries that point at old aliases, and access controls that only open when you perform the exact sequence the saboteur expected.

File Provided: [challenge.py](https://github.com/gmanctf/2025-Dubai-Police-CTF/blob/main/Finals/PostECSDA2/challenge.py)

### Solution

I found a similar challenge with a solution in this link:
https://ssst0n3.github.io/post/%E7%BD%91%E7%BB%9C%E5%AE%89%E5%85%A8/CTF/crypto/ECDSA/N1CTF-Qualifier-2023Cryptoe2Wrmup-writeup.html#:~:text=def%20nonce_gen,128%5D%2C%202%29%20return%20nonce

It was then easy to adapt the code in that link to this specific challenge to get the solution:

```python
#!/usr/bin/env sage

import hashlib
import subprocess
import sys

# Install pycryptodome if not available
try:
    from Crypto.Util.Padding import unpad
    from Crypto.Cipher import AES
except ImportError:
    print("Installing pycryptodome...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pycryptodome", "-q"])
    from Crypto.Util.Padding import unpad
    from Crypto.Cipher import AES

# Real challenge data
s = 100242411258364337368382006742129745361765690667219571214489847270379817426532
r = 84797789715952027518163510355330074203132910540616531553425146168971366679022
enc_flag = '91f5a64403f4de6b1f0f7a36e1685b23895d1f3b3dc79a567146088a09eee538'
msg = b'Stay at home kiddo !'

print("="*60)
print("PostECSDA2 Solution with Flexible Bit Length Check")
print("="*60)

# Get the hash of the message
h = int(hashlib.sha256(msg).hexdigest(), 16)
h0 = int(bin(h)[2:].zfill(256)[:128], 2)

# ECDSA parameters
p = 115792089210356248762697446949407573529996955224135760342422259061068512044369

# Convert to SageMath integers
s = ZZ(s)
r = ZZ(r)
h = ZZ(h)
h0 = ZZ(h0)
p = ZZ(p)

# Create polynomial ring
PR = PolynomialRing(GF(p), ["d0", "d1"])
d0, d1 = PR.gens()

# The equation
eq = s*(h0*2**128 + d0) - h - r*(d0*2**128 + d1)

print("Computing Groebner basis...")
g = Ideal(eq).groebner_basis()[0]
eq = g.monomials()[0] - g

# Create lattice
A = Matrix([ZZ(i) for i in eq.coefficients()]).T
L = block_matrix([
    [1, A],
    [0, p]
])

# Balance
bound = [2**128, 1, 2**128]
T = diagonal_matrix([max(bound) // i for i in bound])

print("Running LLL...")
B = (L*T).LLL()/T

print("Checking LLL results...")

# Check all vectors and try all reasonable combinations
for i, v in enumerate(B):
    print(f"\nChecking vector {i}...")
    if abs(v[1]) == 1:
        v_normalized = v * v[1]
        
        d1_candidate = v_normalized[0] % p
        d0_candidate = v_normalized[2] % p
        
        print(f"  d0: {d0_candidate.nbits()} bits")
        print(f"  d1: {d1_candidate.nbits()} bits")
        
        # Be more flexible with bit lengths - allow 127-128 bits for d0
        if d0_candidate > 0 and d1_candidate > 0 and d0_candidate.nbits() >= 127 and d0_candidate.nbits() <= 128 and d1_candidate.nbits() <= 128:
            d = d0_candidate * 2**128 + d1_candidate
            print(f"  Trying d = {d}")
            
            try:
                key = hashlib.sha256(str(d).encode()).digest()[:16]
                aes = AES.new(key, AES.MODE_ECB)
                decrypted = aes.decrypt(bytes.fromhex(enc_flag))
                flag = unpad(decrypted, 16)
                print(f"\n  SUCCESS!")
                print(f"  d0 (high bits): {d0_candidate}")
                print(f"  d1 (low bits): {d1_candidate}")
                print(f"  Full private key d: {d}")
                print(f"\n  Decrypted flag: {flag.decode()}")
                print("="*60)
                print(f"FLAG FOUND: {flag.decode()}")
                print("="*60)
                sys.exit(0)
            except Exception as e:
                print(f"  Decryption failed: {e}")
        
        # Also try with d0 shifted to make it 128 bits
        if d0_candidate.nbits() == 127:
            # Try adding the high bit
            d0_with_high_bit = d0_candidate + 2**127
            if d0_with_high_bit.nbits() == 128:
                d = d0_with_high_bit * 2**128 + d1_candidate
                print(f"  Trying d with adjusted d0 = {d}")
                
                try:
                    key = hashlib.sha256(str(d).encode()).digest()[:16]
                    aes = AES.new(key, AES.MODE_ECB)
                    decrypted = aes.decrypt(bytes.fromhex(enc_flag))
                    flag = unpad(decrypted, 16)
                    print(f"\n  SUCCESS with adjusted d0!")
                    print(f"  d0 (high bits): {d0_with_high_bit}")
                    print(f"  d1 (low bits): {d1_candidate}")
                    print(f"  Full private key d: {d}")
                    print(f"\n  Decrypted flag: {flag.decode()}")
                    print("="*60)
                    print(f"FLAG FOUND: {flag.decode()}")
                    print("="*60)
                    sys.exit(0)
                except Exception as e:
                    print(f"  Decryption with adjusted d0 failed: {e}")

print("\nNo valid solution found")
print("The challenge might require a different approach or more brute force")
```

I got the following data when accessing the challenge web site (note: due to the characteristics of this challenge, the script to decrypt the flag will not always work. I had to try 2-3 times until I got and s, r and enc_flag that I could break):

```
sig = '{"msg": "Stay at home kiddo !", "r": 74030056597224069619422810383871818785139675495435412049212316861828258395240, "s": 43765975183224379510400190370073464517359678283786244486856566804986771102113}'
enc_flag = 'acd242c3363f5d8b4d7e746ea3a060cd82da8ad0af26e691ebcd267ea4787ecc'
```

flag{3518d667e71fefc7}