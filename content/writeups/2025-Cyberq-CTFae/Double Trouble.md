---
title: HashTag Broken
tags:
  - Crypto
Difficulty: Hard
Category: Crypto
---
### Description
Given the source code of a toy lightweight block cipher, recover the full secret key.

### Solution

Description in the website provided:

# Double Trouble

## Overview

In this exercise, you will explore a **simplified variant of the [LBlock](https://eprint.iacr.org/2011/345.pdf) block cipher**. The cipher operates on **32-bit blocks** and uses a **40-bit master key**, which is expanded into round keys via a custom key schedule.

The goal of this exercise is to **recover the master key**. To do so, you will be allowed to query as many plaintexts as needed, and obtain the corresponding ciphertexts. The cipher’s simplicity hides a vulnerability that you will have to find and exploit in order to perform the attack. Good luck! —

## Cipher Parameters

- **Block size:** 32 bits  
    
- **Half-block size:** 16 bits  
    
- **Master key size:** 40 bits  
    
- ## **Number of rounds:** 8
    

## Encryption Process

The `encrypt` function takes:

- `pt`: a 32-bit plaintext block.
- `master_key`: the 40-bit master key.

It splits the plaintext into left and right halves, generates the round keys, and applies **8 rounds** sequentially. The final ciphertext is the recombination of the last left and right halves.

```
def encrypt(pt, master_key):
    l = (pt >> HALF_BLOCK_SIZE) & MASK_HALF
    r = pt & MASK_HALF
    subkeys = generate_round_keys(master_key)
    for subkey in subkeys:
        l, r = lblock_round(l, r, subkey)
    return (l << HALF_BLOCK_SIZE) | r
```

---

### LBlock-like Round Function

Each round follows an **LBLock-like Feistel structure**:

1. The right half is rotated left by 4 bits.
2. The left half is XORed with a round key and transformed using **four S-boxes** applied in parallel.
3. The halves are swapped, and the process repeats for all rounds.

```
BLOCK_SIZE = 32
HALF_BLOCK_SIZE = BLOCK_SIZE // 2
MASK_BLOCK = (1 << BLOCK_SIZE) - 1
MASK_HALF = (1 << HALF_BLOCK_SIZE) - 1


def lblock_round(l, r, subkey):
    new_r = ((r << 4) | (r >> (HALF_BLOCK_SIZE - 4))) & MASK_HALF
    new_l = 0
    for i in range(HALF_BLOCK_SIZE // 4):
        nibble = (l ^ (subkey >> (i*4))) & 0xF
        new_l |= SBOX[i % 4][nibble] << (i*4)
    return new_r ^ new_l, l
```

### S-boxes

The cipher uses **five S-boxes**:

- Four S-boxes for the **round function**.
- One S-box for the **key schedule** transformation.

S-boxes map 4-bit inputs to 4-bit outputs and are provided in the code.

```
SBOX = [
    [14, 9, 15, 0, 13, 4, 10, 11, 1, 2, 8, 3, 7, 6, 12, 5], # Round Function (LBLOCK SBOX_0)
    [4, 11, 14, 9, 15, 13, 0, 10, 7, 12, 5, 6, 2, 8, 1, 3], # Round Function (LBLOCK SBOX_1)
    [1, 14, 7, 12, 15, 13, 0, 6, 11, 5, 9, 3, 2, 4, 8, 10], # Round Function (LBLOCK SBOX_2)
    [7, 6, 8, 11, 0, 15, 3, 14, 9, 10, 12, 13, 5, 2, 4, 1], # Round Function (LBLOCK SBOX_3)
    [8, 7, 14, 5, 15, 13, 0, 6, 11, 12, 9, 10, 2, 4, 1, 3]  # Key schedule (LBLOCK_8)
]
```

---

### Key Schedule

Initially, the 40-bit master key is loaded into a key register. The key schedule then generates the 8 round keys as follows: * Each round permutes the full 40-bit key register. * A 20-bit portion is rotated per round to derive a key window. * 16-bit round keys are derived with S-box substitution on the top nibble. * Generates **8 round keys of 16 bits each**.

The details for each step are provided below.

#### Bit Permutation `P`

A fixed 40-bit permutation is applied to the master key register before each round.  
The permutation `P` maps bit position `i` (where `i = 0` is the least significant bit) to position `P[i]`.

```
P = [17, 3, 14, 8, 0, 19, 6, 10, 2, 16, 12, 5, 1, 18, 9, 15, 4, 11, 13, 7,
     27, 35, 24, 31, 22, 37, 28, 33, 21, 39, 26, 32, 36, 25, 30, 38, 29, 34, 20, 23]
```

The permutation is applied as:

permutate_register(x) =

((x >> i) & 1) << P[i]

#### Round Key Generation

The round keys are derived as follows:

1. **Initialize the register** with the 40-bit master key.
    
2. **For each round r = 0..7:**
    
    - Apply the **bit permutation** `P` to the register.
        
    - Compute a **rotated 20-bit window** from the register:
        
        - Let `window` be a selected 20-bit portion of the register
        - Rotation offset: `shift = (r * 9) mod 20`
        - Rotate `window` left by `shift` bits
    - Extract a **16-bit subkey**:
        
        - Take the 20-bit window and shift right by 4 bits
    - Apply a **4-bit S-box** substitution to the top nibble (bits 15–12) of the subkey:
        
        `rk[15:12] = SBOX[4](rk[15:12])`
        
    - The resulting 16-bit value is the **round key RK_r**.
        
3. **Output sequence of round keys**: `(RK_0, RK_1, ..., RK_7)`
    

### Complete Key Schedule Code

```
# -------------------------
# Key schedule
# -------------------------
NUM_ROUNDS = 8
KEY_SIZE = 40
HALF_KEY_SIZE = KEY_SIZE // 2
MASK_KEY = ((1 << (KEY_SIZE//2)) - 1)

P = [17, 3, 14, 8, 0, 19, 6, 10, 2, 16, 12, 5, 1, 18, 9, 15, 4, 11, 13, 7,
        27, 35, 24, 31, 22, 37, 28, 33, 21, 39, 26, 32, 36, 25, 30, 38, 29, 34, 20, 23]

def permutate_register(x: int) -> int:
    out = 0
    for i, pos in enumerate(P):
        bit = (x >> i) & 1
        out |= bit << pos
    return out

def generate_round_keys(master_key, num_rounds=NUM_ROUNDS):
    register = master_key
    keys = []
    for r in range(num_rounds):
        register = permutate_register(register)
        left = (register >> HALF_KEY_SIZE) & MASK_KEY
        right = register & MASK_KEY
        halves = [left, right]
        block = halves[r // (num_rounds // 2)]
        idx = r % (num_rounds // 2)
        shift = (idx * 9) % HALF_KEY_SIZE
        window = ((block << shift) | (block >> (HALF_KEY_SIZE - shift))) & MASK_KEY
        rk = (window >> 4) & MASK_HALF
        # Apply S-box to first 4 bits
        top_nibble = rk >> (HALF_BLOCK_SIZE - 4)
        top_nibble = SBOX[4][top_nibble]
        rk = (top_nibble << (HALF_BLOCK_SIZE - 4)) | (rk & ((1 << (HALF_BLOCK_SIZE - 4)) - 1))
        keys.append(rk)
    return keys
```

---

## Test Vectors

```
Vector 1: Key=0x000000000000, PT=0x00000000, CT=0xe7832d42
Vector 2: Key=0x000000000000, PT=0x8dbc57f8, CT=0x918bcc62
Vector 3: Key=0xa048ecc3c8d2, PT=0x00000000, CT=0x8e8fd133
Vector 4: Key=0xa048ecc3c8d2, PT=0x9705efb9, CT=0x521a2c26
```

---

## Tasks

1. **Understand the key schedule:** Observe how the master key is transformed into round keys.
2. **Collect plaintext-ciphertext pairs** to mount a chosen plaintext attack. Submit your chosen plaintext as a 4-bytes hexadecimal string (without `0x`)
3. **Recover the 40-bit key and submit it to get the flag as a 5-bytes hexadecimal string (without `0x`).**.

Instructions to interact with the site:

```
1. Submit your chosen plaintext and obtain the corresponding ciphertext. GET /encrypt_plaintext/<chosen_plaintext> Example: 
   curl http://<CHALLENGE_URL>/encrypt_plaintext/327294ef 

2. Verify secret key. Returns flag on success. GET /submit_secret_key/<secret_key> Example: 
   curl http://<CHALLENGE_URL>/submit_secret_key/01234abcde
```

Script:

```python
#!/usr/bin/env python3
"""
MITM solver for Double Trouble (robust, verbose).

Usage example:
  python3 mitm_double_trouble.py --host https://... --pt 00000000 --extra-pts ffffffff deadbeef --out candidates.txt

Options:
  --host         required, base URL of challenge (no trailing slash preferred)
  --pt           chosen plaintext to query for initial MITM (8 hex chars, default 00000000)
  --extra-pts    optional list of extra plaintexts used to filter candidates (space separated)
  --out          filename to save final candidate keys (one per line)
  --submit       attempt to submit the first surviving candidate to /submit-secret-key/
  --progress     show progress prints (on by default)
"""
import argparse
import requests
from collections import defaultdict
from time import time

# ---------- cipher params ----------
BLOCK_SIZE = 32
HALF_BLOCK_SIZE = BLOCK_SIZE // 2
MASK_HALF = (1 << HALF_BLOCK_SIZE) - 1

NUM_ROUNDS = 8
KEY_SIZE = 40
HALF_KEY_SIZE = KEY_SIZE // 2   # 20
MASK_KEY = (1 << HALF_KEY_SIZE) - 1

P = [17, 3, 14, 8, 0, 19, 6, 10, 2, 16, 12, 5, 1, 18, 9, 15, 4, 11, 13, 7,
     27, 35, 24, 31, 22, 37, 28, 33, 21, 39, 26, 32, 36, 25, 30, 38, 29, 34, 20, 23]

SBOX = [
    [14, 9, 15, 0, 13, 4, 10, 11, 1, 2, 8, 3, 7, 6, 12, 5],
    [4, 11, 14, 9, 15, 13, 0, 10, 7, 12, 5, 6, 2, 8, 1, 3],
    [1, 14, 7, 12, 15, 13, 0, 6, 11, 5, 9, 3, 2, 4, 8, 10],
    [7, 6, 8, 11, 0, 15, 3, 14, 9, 10, 12, 13, 5, 2, 4, 1],
    [8, 7, 14, 5, 15, 13, 0, 6, 11, 12, 9, 10, 2, 4, 1, 3]
]

# ---------- crypto functions ----------
def permutate_register(x: int) -> int:
    out = 0
    for i, pos in enumerate(P):
        bit = (x >> i) & 1
        out |= bit << pos
    return out

def generate_round_keys(master_key: int, num_rounds=NUM_ROUNDS):
    register = master_key & ((1<<KEY_SIZE)-1)
    keys = []
    for r in range(num_rounds):
        register = permutate_register(register)
        left = (register >> HALF_KEY_SIZE) & MASK_KEY
        right = register & MASK_KEY
        halves = [left, right]
        block = halves[r // (num_rounds // 2)]
        idx = r % (num_rounds // 2)
        shift = (idx * 9) % HALF_KEY_SIZE
        window = ((block << shift) | (block >> (HALF_KEY_SIZE - shift))) & MASK_KEY
        rk = (window >> 4) & MASK_HALF
        top_nibble = rk >> (HALF_BLOCK_SIZE - 4)
        top_nibble = SBOX[4][top_nibble]
        rk = (top_nibble << (HALF_BLOCK_SIZE - 4)) | (rk & ((1 << (HALF_BLOCK_SIZE - 4)) - 1))
        keys.append(rk)
    return keys

def rotl16(x, n):
    return ((x << n) | (x >> (16 - n))) & 0xFFFF

def rotr16(x, n):
    return ((x >> n) | (x << (16 - n))) & 0xFFFF

def lblock_round(l, r, subkey):
    new_r = rotl16(r, 4)
    new_l = 0
    for i in range(HALF_BLOCK_SIZE // 4):
        nibble = (l ^ (subkey >> (i*4))) & 0xF
        new_l |= SBOX[i % 4][nibble] << (i*4)
    return new_r ^ new_l, l

def forward_n_rounds(state, keys):
    l, r = state
    for k in keys:
        l, r = lblock_round(l, r, k)
    return (l, r)

def invert_one_round(out_l, out_r, subkey):
    l_prev = out_r
    new_l = 0
    for i in range(HALF_BLOCK_SIZE // 4):
        nibble = (l_prev ^ (subkey >> (i*4))) & 0xF
        new_l |= SBOX[i % 4][nibble] << (i*4)
    new_r = out_l ^ new_l
    r_prev = rotr16(new_r, 4)
    return l_prev, r_prev

def backward_n_rounds(state, keys_reversed):
    l, r = state
    for k in keys_reversed:
        l, r = invert_one_round(l, r, k)
    return (l, r)

def local_encrypt(pt, master_key):
    l = (pt >> HALF_BLOCK_SIZE) & MASK_HALF
    r = pt & MASK_HALF
    subkeys = generate_round_keys(master_key)
    for subkey in subkeys:
        l, r = lblock_round(l, r, subkey)
    return ((l << HALF_BLOCK_SIZE) | r) & 0xFFFFFFFF

# ---------- network helpers ----------
def query_ciphertext_decimal(host, hex_pt):
    """
    Query host /encrypt-plaintext/<hex_pt>.
    Expects JSON like {"ciphertext": 1367570687, "status":"OK"}
    Returns integer ciphertext (0..2^32-1).
    """
    url = f"{host.rstrip('/')}/encrypt-plaintext/{hex_pt}"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    # try parse JSON, decimal ciphertext
    try:
        j = r.json()
        if "ciphertext" in j:
            return int(j["ciphertext"]) & 0xFFFFFFFF
        # tolerant fallback: find any numeric-looking value in JSON
        for v in j.values():
            if isinstance(v, int):
                return int(v) & 0xFFFFFFFF
            if isinstance(v, str) and v.isdigit():
                return int(v,10) & 0xFFFFFFFF
    except Exception:
        pass
    # fallback: plain text body, try decimal or hex
    txt = r.text.strip()
    if txt.isdigit():
        return int(txt,10) & 0xFFFFFFFF
    if txt.lower().startswith("0x"):
        return int(txt,16) & 0xFFFFFFFF
    # last resort: extract a number
    import re
    m = re.search(r"(\d{6,12})", txt)
    if m:
        return int(m.group(1),10) & 0xFFFFFFFF
    m = re.search(r"([0-9a-fA-F]{6,8})", txt)
    if m:
        return int(m.group(1),16) & 0xFFFFFFFF
    raise RuntimeError("Couldn't parse ciphertext from response: " + txt[:200])

def submit_key(host, hexkey):
    url = f"{host.rstrip('/')}/submit-secret-key/{hexkey}"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    return r.text

# ---------- MITM implementation ----------
def mitm_attack(host, pt_hex, progress=True):
    # query server for CT (decimal)
    print(f"[+] Querying server for PT {pt_hex} ...")
    ct_int = query_ciphertext_decimal(host, pt_hex)
    print(f"[+] Server returned ciphertext int: {ct_int} (hex {ct_int:08x})")
    pt_int = int(pt_hex, 16)
    pl = (pt_int >> 16) & 0xFFFF
    pr = pt_int & 0xFFFF
    cl = (ct_int >> 16) & 0xFFFF
    cr = ct_int & 0xFFFF

    # Phase 1: forward 4 rounds for all left-half (2^20)
    print("[*] Phase 1: forward 4 rounds for all left halves (2^20). This may take 30-90s).")
    forward_map = defaultdict(list)
    t0 = time()
    report_every = 1 << 17  # ~ every 131k
    for left in range(1 << HALF_KEY_SIZE):
        mk = (left & MASK_KEY) << HALF_KEY_SIZE
        keys = generate_round_keys(mk)[:4]
        mid = forward_n_rounds((pl, pr), keys)
        mid_int = (mid[0] << 16) | mid[1]
        forward_map[mid_int].append(left)
        if progress and (left & (report_every-1)) == (report_every-1):
            print(f"  forward: processed {left+1:,} left-cands; map size {len(forward_map):,}")
    t1 = time()
    print(f"[+] Phase 1 complete in {t1-t0:.1f}s. forward_map size = {len(forward_map):,}")

    # optional debug sample of forward_map
    sample_keys = list(forward_map.keys())[:5]
    print("[*] Sample forward-map entries (mid_int -> #lefts):")
    for k in sample_keys:
        print(f"   {k:08x} -> {len(forward_map[k])}")

    # Phase 2: invert last 4 rounds for right halves and match
    print("[*] Phase 2: invert last 4 rounds for all right halves (2^20) and look for mid-state collisions.")
    t2 = time()
    candidates = []
    for right in range(1 << HALF_KEY_SIZE):
        mk = right & MASK_KEY
        keys = generate_round_keys(mk)[4:]  # keys 4..7
        mid = backward_n_rounds((cl, cr), list(reversed(keys)))
        mid_int = (mid[0] << 16) | mid[1]
        if mid_int in forward_map:
            # combine all lefts that map to this mid with this right
            for left in forward_map[mid_int]:
                master = ((left & MASK_KEY) << HALF_KEY_SIZE) | (right & MASK_KEY)
                candidates.append(master)
        if progress and (right & (report_every-1)) == (report_every-1):
            print(f"  backward: processed {right+1:,} right-cands; found candidates so far: {len(candidates):,}")
    t3 = time()
    print(f"[+] Phase 2 complete in {t3-t2:.1f}s. total candidates found: {len(candidates):,}")
    # deduplicate and return
    unique = sorted(set(candidates))
    print(f"[+] Unique candidates after dedup: {len(unique):,}")
    return unique

def filter_candidates_with_online(host, candidates, extra_pts, progress=True):
    """
    Use server oracle to filter candidate keys using extra plaintexts.
    extra_pts: list of hex plaintext strings (8 hex chars).
    Returns survivors list.
    """
    survivors = candidates[:]
    print("[*] Starting online filtering with extra plaintexts:", extra_pts)
    for pt in extra_pts:
        print(f"[+] Querying server for PT {pt} ...")
        ct_int = query_ciphertext_decimal(host, pt)
        print(f"    server returned: {ct_int} (hex {ct_int:08x})")
        new_survivors = []
        pt_int = int(pt, 16)
        for m in survivors:
            local_ct = local_encrypt(pt_int, m)
            if local_ct == ct_int:
                new_survivors.append(m)
        print(f"    survivors after this PT: {len(new_survivors)}")
        survivors = new_survivors
        if len(survivors) <= 1:
            break
    return survivors

def pretty_key(m):
    return f"{m:010x}"

def print_candidate_details(cands, pts):
    print("[*] Candidate details (local encryptions):")
    for m in cands:
        print("  key:", pretty_key(m))
        for pt in pts:
            local_ct = local_encrypt(int(pt,16), m)
            print(f"    pt {pt} -> local ct hex {local_ct:08x}, dec {local_ct}")

# ---------- CLI ----------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host","-H",required=True,help="Challenge host (https://...)")
    ap.add_argument("--pt","-p",default="00000000",help="Chosen plaintext (8 hex chars)")
    ap.add_argument("--extra-pts","-e",nargs="*",default=[],help="Extra plaintexts for filtering (8 hex each)")
    ap.add_argument("--out","-o",default=None,help="Save candidate keys to file")
    ap.add_argument("--submit","-s",action="store_true",help="Submit first survivor")
    ap.add_argument("--no-progress",action="store_true",help="Disable progress prints")
    args = ap.parse_args()

    host = args.host
    pt = args.pt.lower().lstrip("0x").rjust(8,"0")
    extra = [x.lower().lstrip("0x").rjust(8,"0") for x in args.extra_pts]
    progress = not args.no_progress

    start = time()
    candidates = mitm_attack(host, pt, progress=progress)
    mid = time()
    print(f"[+] MITM finished. time elapsed: {mid-start:.1f}s. candidates: {len(candidates):,}")

    if len(candidates) == 0:
        print("[!] No candidates found — this is unexpected. Possible causes:")
        print("  - wrong parsing of server ciphertext (check JSON/text),")
        print("  - server isn't encrypting the requested PT,")
        print("  - implementation mismatch.")
        return

    # Print first 20 candidates for inspection
    print("[*] First up to 20 candidate keys:")
    for c in candidates[:20]:
        print("   ", pretty_key(c))

    # Save raw candidates if requested
    if args.out:
        with open(args.out,"w") as fh:
            for c in candidates:
                fh.write(pretty_key(c) + "\n")
        print("[+] Saved candidates to", args.out)

    # If extra pts provided, filter online
    if extra:
        survivors = filter_candidates_with_online(host, candidates, extra, progress=progress)
        print("[+] Filtering done. survivors:", len(survivors))
        if survivors:
            print_candidate_details(survivors, [pt] + extra)
        else:
            print("[!] Filtering eliminated all candidates. Possible explanations:")
            print("   - candidates are wrong; re-run MITM ensuring server CT parsing is decimal.")
            print("   - server uses different formatting (byte swaps etc.) — check raw server responses.")
    else:
        survivors = candidates

    # If exactly one surviving candidate, optionally submit
    if len(survivors) == 1:
        keyhex = pretty_key(survivors[0])
        print("[!] Single candidate recovered:", keyhex)
        if args.submit:
            print("[*] Submitting key ...")
            resp = submit_key(host, keyhex)
            print("[+] Submit response:", resp)
    else:
        print("[*] Multiple survivors (or none). Printing details for first 10 survivors for manual inspection:")
        print_candidate_details(survivors[:10], [pt] + extra)

    end = time()
    print("[+] Total runtime: {:.1f}s".format(end-start))

if __name__ == "__main__":
    main()
```

output from running it:

```
python3 mitm_double_trouble.py --host https://b22666b62c2586a5.chal.ctf.ae --pt 00000000 --extra-pts ffffffff deadbeef --out candidates_new.txt

[+] Querying server for PT 00000000 ...
[+] Server returned ciphertext int: 1367570687 (hex 518378ff)
[*] Phase 1: forward 4 rounds for all left halves (2^20). This may take 30-90s).
  forward: processed 131,072 left-cands; map size 131,070
  forward: processed 262,144 left-cands; map size 262,137
  forward: processed 393,216 left-cands; map size 393,206
  forward: processed 524,288 left-cands; map size 524,263
  forward: processed 655,360 left-cands; map size 655,320
  forward: processed 786,432 left-cands; map size 786,376
  forward: processed 917,504 left-cands; map size 917,432
  forward: processed 1,048,576 left-cands; map size 1,048,477
[+] Phase 1 complete in 267.7s. forward_map size = 1,048,477
[*] Sample forward-map entries (mid_int -> #lefts):
   b9df16ce -> 1
   58f271db -> 1
   2c1a4db1 -> 1
   ac2193f6 -> 1
   1bdcd376 -> 1
[*] Phase 2: invert last 4 rounds for all right halves (2^20) and look for mid-state collisions.
  backward: processed 131,072 right-cands; found candidates so far: 33
  backward: processed 262,144 right-cands; found candidates so far: 73
  backward: processed 393,216 right-cands; found candidates so far: 110
  backward: processed 524,288 right-cands; found candidates so far: 150
  backward: processed 655,360 right-cands; found candidates so far: 179
  backward: processed 786,432 right-cands; found candidates so far: 221
  backward: processed 917,504 right-cands; found candidates so far: 253
  backward: processed 1,048,576 right-cands; found candidates so far: 284
[+] Phase 2 complete in 241.4s. total candidates found: 284
[+] Unique candidates after dedup: 284
[+] MITM finished. time elapsed: 511.0s. candidates: 284
[*] First up to 20 candidate keys:
    009de1c5f5
    02101ddfe9
    022f0a5665
    02a6170fcb
    039f70cf54
    049532c1c6
    071c3c1e1f
    0739a81b8e
    0790bfb909
    07c42687ee
    07e8e6d32e
    07f66efe23
    08bdf8bb11
    0a89406e61
    0cf1bbba4f
    0fcd248453
    125ab20e84
    1447c19a53
    15fd5cd2cf
    1681aa1e87
[+] Saved candidates to candidates_new.txt
[*] Starting online filtering with extra plaintexts: ['ffffffff', 'deadbeef']
[+] Querying server for PT ffffffff ...
    server returned: 2177893239 (hex 81d00377)
    survivors after this PT: 1
[+] Filtering done. survivors: 1
[*] Candidate details (local encryptions):
  key: 15fd5cd2cf
    pt 00000000 -> local ct hex 518378ff, dec 1367570687
    pt ffffffff -> local ct hex 81d00377, dec 2177893239
    pt deadbeef -> local ct hex 7d83d833, dec 2105792563
[!] Single candidate recovered: 15fd5cd2cf
[+] Total runtime: 513.2s
```

script to test candidates:

```python
#!/usr/bin/env python3
"""
submit_concise.py

Submit each candidate to /submit-secret-key/<candidate> and print a concise response.

Usage:
  python3 submit_concise.py --host https://... --file candidates.txt [--delay 0.0]
"""
import argparse, requests, json, time

def submit_and_print(base, key):
    url = f"{base.rstrip('/')}/submit-secret-key/{key}"
    try:
        r = requests.get(url, timeout=10)
    except Exception as e:
        print("Response:")
        print(json.dumps({"error": f"HTTP error: {e}"}))
        return
    text = r.text.strip()
    # Try pretty JSON
    try:
        j = r.json()
        pretty = json.dumps(j, indent=2, ensure_ascii=False)
        print("Response:")
        print(pretty)
    except Exception:
        # not JSON -> print raw text
        print("Response:")
        print(text)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", "-H", required=True, help="Base challenge URL, e.g. https://... ")
    ap.add_argument("--file", "-f", required=True, help="File with candidate keys, one per line")
    ap.add_argument("--delay", "-d", type=float, default=0.0, help="Delay (seconds) between submissions")
    args = ap.parse_args()

    base = args.host
    with open(args.file, "r") as fh:
        raw = [line.strip() for line in fh if line.strip()]

    # normalize keys: strip 0x and pad to 10 hex chars (keeps consistent formatting)
    keys = []
    for r in raw:
        k = r.lower().lstrip("0x")
        k = k.rjust(10, "0")
        keys.append(k)

    total = len(keys)
    for idx, key in enumerate(keys, 1):
        print(f"[{idx}/{total}] Candidate: {key}")
        submit_and_print(base, key)
        if args.delay > 0:
            time.sleep(args.delay)

if __name__ == "__main__":
    main()
```

result:

```
[1/284] Candidate: 009de1c5f5
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[2/284] Candidate: 02101ddfe9
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[3/284] Candidate: 022f0a5665
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[4/284] Candidate: 02a6170fcb
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[5/284] Candidate: 039f70cf54
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[6/284] Candidate: 049532c1c6
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[7/284] Candidate: 071c3c1e1f
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[8/284] Candidate: 0739a81b8e
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[9/284] Candidate: 0790bfb909
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[10/284] Candidate: 07c42687ee
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[11/284] Candidate: 07e8e6d32e
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[12/284] Candidate: 07f66efe23
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[13/284] Candidate: 08bdf8bb11
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[14/284] Candidate: 0a89406e61
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[15/284] Candidate: 0cf1bbba4f
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[16/284] Candidate: 0fcd248453
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[17/284] Candidate: 125ab20e84
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[18/284] Candidate: 1447c19a53
Response:
{
  "error": "This is not the secret key, try again!",
  "status": "NOT_PASS"
}
[19/284] Candidate: 15fd5cd2cf
Response:
{
  "FLAG": "flag{f0f37f6fe3118360}",
  "status": "PASS"
}

```