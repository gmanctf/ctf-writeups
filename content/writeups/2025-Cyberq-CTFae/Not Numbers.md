---
title: Not Numbers
tags:
  - Crypto
Difficulty: Easy
---


### Description

What do you think of my Bzkp ? B as best right? :)


# Broken ZKP (BZKP) - CTF Challenge Writeup

  

**Challenge Name:** Broken ZKP  

**Category:** Cryptography  

**Difficulty:** Medium  

**Flag:** `flag{41f2b09ba212e874}`

  

## Challenge Description

  

The challenge presented a Zero-Knowledge Proof (ZKP) system where we needed to prove knowledge of secret values `(x, y, z, r1, r2)` without revealing them.

  

**Hint:** "What do you think of my Bzkp? B as best right? :)"

  

**Connection:** `0a2a1a477bc5d526.chal.ctf.ae:443` (SSL/TLS)

  

## Initial Analysis

  

Upon connecting to the server, we received the following information:

  

``

=== Complex ZKP Schema: Knowledge Proof ===

Prove you know the secret state (x,y,z,r1,r2) using the complex schema!

prime p = 0x91fbdb55355d999a4a15201f18b42bc38c56b7cac70cbdc4f547a378933dc777171e2136c50722af0302f571406bcc298e1eca5c63fa71dfc78e6653ad048e8b

  

Schema: g^response = commitment * A^Î± * B^Î² * C^Î³ * D^Î´ * E^Îµ

Where:

  A = g^x, B = g^y, C = g^z, D = g^r1, E = g^r2

  Î± = H(commitment, 1), Î² = H(commitment, 2), Î³ = H(commitment, 3)

  Î´ = H(commitment, 4), Îµ = H(commitment, 5)

  

Enter generator g (hex):

``

  

### Understanding the ZKP Protocol

  

In a typical Schnorr-like ZKP protocol:

1. **Prover** commits to random values

2. **Verifier** sends a challenge

3. **Prover** responds with a value that satisfies the verification equation

4. **Verifier** checks: `g^response â‰¡ commitment * (public_values)^challenges (mod p)`

  

The verification equation ensures that the prover knows the secret values without revealing them.

  

## The Vulnerability

  

The critical vulnerability is that **the server asks us to choose the generator `g`**!

  

In cryptographic protocols, the generator should be:

- A fixed, publicly agreed-upon value

- Of large prime order

- **NEVER user-controlled**

  

### Why is this a problem?

  

If we can choose `g`, we can set **`g = 1`**, which completely breaks the ZKP:

  

When `g = 1`:

- `A = g^x = 1^x = 1`

- `B = g^y = 1^y = 1`

- `C = g^z = 1^z = 1`

- `D = g^r1 = 1^r1 = 1`

- `E = g^r2 = 1^r2 = 1`

  

The verification equation becomes:

``

g^response = commitment * A^Î± * B^Î² * C^Î³ * D^Î´ * E^Îµ

1^response = commitment * 1^Î± * 1^Î² * 1^Î³ * 1^Î´ * 1^Îµ

1 = commitment * 1 * 1 * 1 * 1 * 1

1 = commitment

``

  

This means:

- We set `commitment = 1`

- We set `response = 0` (since `1^0 = 1`)

- The equation is trivially satisfied: `1 = 1 * 1`

  

**We can pass the ZKP verification without knowing ANY of the secret values!**

  

## Exploitation

  

### Solution Script

  

``python

from pwn import *

  

HOST = "0a2a1a477bc5d526.chal.ctf.ae"

io = remote(host=HOST, port=443, ssl=True, sni=HOST)

  

# Receive initial prompt

io.recvuntil(b'Enter generator g (hex): ')

  

# EXPLOIT: Send g = 1

g = 1

print(f"[*] Sending g = {g}")

io.sendline(hex(g).encode())

  

# Wait for commitment prompt

io.recvuntil(b'Enter commitment (hex): ')

  

# Send commitment = 1

commitment = 1

print(f"[*] Sending commitment = {commitment}")

io.sendline(hex(commitment).encode())

  

# Wait for response prompt

io.recvuntil(b'Enter response (hex): ')

  

# Send response = 0

response = 0

print(f"[*] Sending response = {response}")

io.sendline(hex(response).encode())

  

# Get the flag

result = io.recvall(timeout=5)

print(result.decode())

  

io.close()

``

  

### Execution

  

``bash

python solve.py

``

  

### Output

  

``

[*] Sending g = 1

[*] Sending commitment = 1

[*] Sending response = 0

  

g order check - g^Q mod P = 1

Using challenges: Î±=..., Î²=..., Î³=..., Î´=..., Îµ=...

Authentication successful! Here's your flag: flag{41f2b09ba212e874}

``

  

## Key Takeaways

  

### Why "Bzkp"?

  

The hint "**B**zkp - B as best" was a play on words:

- **B**roken ZKP

- The "B" stood for **Broken**, not "Best"!

  

### Security Lessons

  

1. **Never allow user-controlled generators** in cryptographic protocols

2. **Public parameters must be fixed and trusted** by both parties

3. **Generator choice is critical** - it must have large prime order to ensure security

4. This vulnerability allows **complete bypass** of the authentication without knowledge of secrets

  

### Real-World Impact

  

This type of vulnerability could:

- Allow authentication bypass

- Break digital signature schemes

- Compromise blockchain consensus mechanisms

- Defeat secure multi-party computation protocols

  

## References

  

- Schnorr Identification Protocol

- Zero-Knowledge Proof fundamentals

- Discrete Logarithm Problem

- Group theory in cryptography

  

---

  

**Flag:** `flag{41f2b09ba212e874}`

  

**Author:** CyberQ 2025 Team


Code to solve it:

```
#!/usr/bin/env python3

"""

Broken ZKP (BZKP) - Solution Script

CTF Challenge: CyberQ 2025

  

Vulnerability: User-controlled generator in Zero-Knowledge Proof

Exploit: Set g = 1 to trivially satisfy the verification equation

  

Author: CTF Solver

Flag: flag{41f2b09ba212e874}

"""

  

from pwn import *

  

# Challenge connection details

HOST = "0a2a1a477bc5d526.chal.ctf.ae"

PORT = 443

  

def exploit():

    """

    Exploit the broken ZKP by choosing g = 1

    When g = 1:

    - All commitments A, B, C, D, E become 1

    - Verification equation: 1^response = commitment * 1^challenges

    - Simplifies to: 1 = commitment

    - Solution: commitment = 1, response = 0

    """

    # Connect to the server

    io = remote(host=HOST, port=PORT, ssl=True, sni=HOST)

    print("[*] Connected to challenge server")

    # Receive initial prompt

    io.recvuntil(b'Enter generator g (hex): ')

    print("[*] Received generator prompt")

    # VULNERABILITY: Send g = 1

    g = 1

    print(f"[!] Exploiting: Sending g = {g}")

    io.sendline(hex(g).encode())

    # Wait for commitment prompt

    io.recvuntil(b'Enter commitment (hex): ')

    print("[*] Received commitment prompt")

    # Send commitment = 1 (since all powers of 1 equal 1)

    commitment = 1

    print(f"[+] Sending commitment = {commitment}")

    io.sendline(hex(commitment).encode())

    # Wait for response prompt

    io.recvuntil(b'Enter response (hex): ')

    print("[*] Received response prompt")

    # Send response = 0 (since 1^0 = 1)

    response = 0

    print(f"[+] Sending response = {response}")

    io.sendline(hex(response).encode())

    # Get the result

    print("\n[*] Waiting for server response...")

    result = io.recvall(timeout=5)

    print("\n" + "="*60)

    print("SERVER RESPONSE:")

    print("="*60)

    print(result.decode())

    print("="*60)

    io.close()

  

if __name__ == "__main__":

    print("""

    â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—

    â•‘           Broken ZKP (BZKP) Exploit Script               â•‘

    â•‘                    CyberQ 2025 CTF                        â•‘

    â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    """)

    exploit()

    print("\n[âœ“] Exploitation complete!")
```