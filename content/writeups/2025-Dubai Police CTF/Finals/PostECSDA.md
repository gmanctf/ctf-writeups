---
title: PostECSDA
tags:
  - Crypto
Difficulty: Easy
---
### Description

In the heart of Tech City, every system is guarded by layers of cryptography. One network in particular — branded as PostECDSA — protects its gates not with passwords or handshakes, but with a strict ECDSA verification test. No signals to capture, no packets to sniff: you stand face-to-face with a server that demands your signature as proof of worth. To enter this city of circuits and glass, you must outsmart the code that was meant to be unbreakable.

File Provided: [challenge.py](https://github.com/gmanctf/2025-Dubai-Police-CTF/blob/main/Finals/PostECSDA/challenge.py)
### Solution


```python
#!/usr/bin/env python3
from pwn import remote
import re, json, sys
from hashlib import sha256
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from ecdsa.ecdsa import generator_256

HOST = "2695f26587cd5f19.chal.ctf.ae"
PORT = 443
SNI = HOST

def modinv(a, m):
    return pow(a, -1, m)

def recover_d_from_sig(sig_json):
    msg = sig_json['msg']
    r = int(sig_json['r'])
    s = int(sig_json['s'])

    # secp256k1 order (generator_256.order())
    q = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141

    h = int(sha256(msg.encode()).hexdigest(), 16)
    a = h >> 128  # h // 2**128

    two128 = 1 << 128
    rhs = (h - (s * a * two128)) % q
    denom = (s - r) % q
    d = (rhs * modinv(denom, q)) % q
    return d

def decrypt_flag(enc_hex, d):
    key = sha256(str(d).encode()).digest()[:16]
    aes = AES.new(key, AES.MODE_ECB)
    ct = bytes.fromhex(enc_hex)
    pt = unpad(aes.decrypt(ct), 16)
    return pt

def extract_sig_json(text):
    # Try to find the printed "sig = '...json...'" or a raw JSON object
    # 1) look for sig = '...'
    m = re.search(r"sig\s*=\s*'(\{.*?\})'", text, flags=re.S)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    # 2) find the first {...} that parses as JSON
    start = text.find('{')
    if start != -1:
        stack = []
        for i in range(start, len(text)):
            if text[i] == '{':
                stack.append('{')
            elif text[i] == '}':
                stack.pop()
                if not stack:
                    candidate = text[start:i+1]
                    try:
                        return json.loads(candidate)
                    except Exception:
                        break
    return None

def extract_enc_flag(text):
    # Prefer the explicit printed variable "enc_flag = '...'"
    m = re.search(r"enc_flag\s*=\s*'([0-9a-fA-F]+)'", text)
    if m:
        return m.group(1)
    # fallback: find a hex string of reasonable length (>=32 hex chars)
    m2 = re.search(r"\b([0-9a-fA-F]{32,})\b", text)
    if m2:
        return m2.group(1)
    return None

def main():
    print(f"Connecting to {HOST}:{PORT} (ssl, sni={SNI}) ...")
    io = remote(host=HOST, port=PORT, ssl=True, sni=SNI, timeout=8)
    try:
        data = io.recvall(timeout=4)
    except Exception:
        try:
            data = io.recv(4096, timeout=4)
        except Exception as e:
            print("Receive failed:", e)
            data = b''
    try:
        io.close()
    except:
        pass

    text = data.decode(errors='ignore')
    print("--- remote output ---")
    print(text.strip())
    print("--- end remote output ---\n")

    sig = extract_sig_json(text)
    if sig is None:
        print("Could not extract signature JSON.")
        sys.exit(1)
    print("Signature JSON:", sig)

    enc_hex = extract_enc_flag(text)
    if enc_hex is None:
        print("Could not extract enc_flag hex.")
        sys.exit(1)
    print("Encrypted flag (hex):", enc_hex)

    try:
        d = recover_d_from_sig(sig)
        print("Recovered d =", d)
    except Exception as e:
        print("Failed to recover d:", e)
        sys.exit(1)

    try:
        flag = decrypt_flag(enc_hex, d)
        print("FLAG:", flag.decode())
    except Exception as e:
        print("Decryption/unpad failed:", e)
        # Show raw decrypted bytes for debugging
        try:
            key = sha256(str(d).encode()).digest()[:16]
            from Crypto.Cipher import AES
            aes = AES.new(key, AES.MODE_ECB)
            ct = bytes.fromhex(enc_hex)
            raw = aes.decrypt(ct)
            print("Raw decrypted bytes (hex):", raw.hex())
            print("Raw decrypted bytes (repr):", raw)
        except Exception as e2:
            print("Also failed to show raw decrypted bytes:", e2)

if __name__ == "__main__":
    main()
```

flag: flag{dfcebeec1a283a6a}
