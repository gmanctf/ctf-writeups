---
title: LWE
tags:
  - Crypto
Difficulty: Medium
Category: Crypto
---
### Description

Can you solve LWE without the E? ;)

File provided: challenge.py
### Solution

It is a straight linear algebra leak (dot-product oracle) challenge. The script bellow collects encrypt outputs until it finds 64 linearly independent `A` rows (mod 65537), solves the linear system and submits the recovered `S` to get the flag.

```python
#!/usr/bin/env python3
# exploit.py
# Connects to the given remote, collects A,b samples, recovers S (mod 65537) and submits it.
# Usage: python3 exploit.py

from pwn import remote
import re
import sys
import time

HOST = "558348bb51ceaa5f.chal.ctf.ae"
PORT = 443
MOD = 0x10001  # 65537
N = 64

# --- math helpers ----------------------------------------------------------
def inv_mod(a, m=MOD):
    """Modular inverse (m is prime). Works for a % m != 0."""
    return pow(a % m, m - 2, m)

def gauss_mod_solve(A_mat, b_vec, mod=MOD):
    """
    Solve A_mat * x = b_vec (mod mod).
    A_mat: list of rows, each row length N
    b_vec: list length N
    Returns x list length N (or raises on failure).
    """
    # build augmented matrix
    Aug = [ [(A_mat[i][j] % mod) for j in range(len(A_mat[0]))] + [b_vec[i] % mod] for i in range(len(A_mat)) ]
    rows = len(Aug)
    cols = len(Aug[0]) - 1

    r = 0
    for c in range(cols):
        # find pivot
        pivot = None
        for i in range(r, rows):
            if Aug[i][c] % mod != 0:
                pivot = i
                break
        if pivot is None:
            continue
        Aug[r], Aug[pivot] = Aug[pivot], Aug[r]
        invp = inv_mod(Aug[r][c], mod)
        # normalize pivot row
        for j in range(c, cols + 1):
            Aug[r][j] = (Aug[r][j] * invp) % mod
        # eliminate other rows
        for i in range(rows):
            if i != r and Aug[i][c] % mod != 0:
                factor = Aug[i][c] % mod
                for j in range(c, cols + 1):
                    Aug[i][j] = (Aug[i][j] - factor * Aug[r][j]) % mod
        r += 1
        if r == cols:
            break

    # extract solution assuming full-rank and square
    sol = [0] * cols
    # For each row, find leading 1
    for i in range(rows):
        lead = None
        for j in range(cols):
            if Aug[i][j] == 1:
                lead = j
                break
        if lead is not None:
            sol[lead] = Aug[i][cols] % mod
    return sol

def select_independent_rows(rows, mod=MOD, need=N):
    """
    Given a list of rows (each length N), select indices of rows that are linearly
    independent (mod `mod`) up to 'need' of them. Returns list of selected indices.
    Uses Gaussian elimination and tracks which original rows served as pivots.
    """
    R = len(rows)
    if R == 0:
        return []

    # Make a copy we can mutate; store (row_vector, original_index)
    mat = [ [x % mod for x in rows[i]] + [i] for i in range(R) ]  # append index at end
    selected = []
    row_ptr = 0
    for col in range(N):
        # find pivot where mat[r][col] != 0 for r >= row_ptr
        pivot = None
        for r in range(row_ptr, R):
            if mat[r][col] % mod != 0:
                pivot = r
                break
        if pivot is None:
            continue
        # swap
        mat[row_ptr], mat[pivot] = mat[pivot], mat[row_ptr]
        invp = inv_mod(mat[row_ptr][col], mod)
        # normalize pivot row (we'll normalize only towards elimination, actual values not needed later)
        for c in range(col, N):
            mat[row_ptr][c] = (mat[row_ptr][c] * invp) % mod
        # eliminate below
        for r in range(row_ptr + 1, R):
            if mat[r][col] % mod != 0:
                factor = mat[r][col] % mod
                for c in range(col, N):
                    mat[r][c] = (mat[r][c] - factor * mat[row_ptr][c]) % mod
        # record original index
        orig_index = mat[row_ptr][-1]
        selected.append(orig_index)
        row_ptr += 1
        if len(selected) >= need:
            break

    return selected[:need]

# --- network / parsing helpers --------------------------------------------
A_re = re.compile(r"A\s*=\s*\(?([0-9,\s]+)\)?")
b_re = re.compile(r"b\s*=\s*([0-9]+)")

def parse_A_b(text):
    """
    Parse the most recent A and b from given text chunk.
    Returns (A_list, b_int) or (None, None) if parsing fails.
    """
    # find the last occurrence of A= ... and b= ...
    Amatches = A_re.findall(text)
    Bmatches = b_re.findall(text)
    if not Amatches or not Bmatches:
        return None, None
    # Use last matches (most recent)
    A_str = Amatches[-1]
    b_str = Bmatches[-1]
    A = [int(x.strip()) % MOD for x in A_str.split(',') if x.strip() != '']
    b = int(b_str) % MOD
    return A, b

# --- main exploit ---------------------------------------------------------
def main():
    print("[*] connecting to remote...")
    try:
        io = remote(host=HOST, port=PORT, ssl=True, sni=HOST, timeout=10)
    except Exception as e:
        print("[!] connection failed:", e)
        return

    As = []
    bs = []
    max_iterations = 300  # safety cap

    try:
        # read initial banner / prompt if any
        # We'll drive the menu: send '1' to get encrypt, then parse response.
        for it in range(max_iterations):
            # wait for prompt '->' (menu). If not present, read a bit and continue.
            try:
                io.recvuntil(b'->', timeout=5)
            except Exception:
                # sometimes server prints banner without trailing prompt; try to read some bytes
                try:
                    tmp = io.recv(timeout=1)
                    if not tmp:
                        raise
                except Exception:
                    pass
                # try again
                try:
                    io.recvuntil(b'->', timeout=5)
                except Exception as e:
                    print("[!] no prompt received, retrying...", e)
                    continue

            # request encrypt option
            io.sendline(b'1')
            # after sending, read until either next prompt or a reasonable chunk
            # read a chunk (server prints A= ... and b= ...)
            try:
                chunk = io.recvuntil(b'->', timeout=5)
            except Exception:
                # try to read some
                chunk = io.recv(timeout=3) or b''
            text = chunk.decode(errors='ignore')
            A, b = parse_A_b(text)
            if A is None or b is None:
                # try to read more just in case
                try:
                    more = io.recv(timeout=1)
                    text2 = text + more.decode(errors='ignore')
                    A, b = parse_A_b(text2)
                except Exception:
                    pass

            if A is not None and b is not None:
                if len(A) != N:
                    print(f"[!] got A with length {len(A)}, skipping")
                else:
                    As.append(A)
                    bs.append(b)
                    print(f"[+] collected sample #{len(As)}")
            else:
                # nothing parsed this iteration
                print("[!] couldn't parse A/b from server output this iteration; continuing")

            # check if we have at least N rows and try to select independent ones
            if len(As) >= N:
                sel = select_independent_rows(As, need=N)
                if len(sel) == N:
                    print("[*] found {} independent rows, proceeding to solve".format(N))
                    # build A_mat and b_vec from selected indices
                    A_mat = [ As[i] for i in sel ]
                    b_vec = [ bs[i] for i in sel ]
                    try:
                        sol = gauss_mod_solve(A_mat, b_vec)
                    except Exception as e:
                        print("[!] solving failed:", e)
                        # continue collecting more samples
                        pass
                    else:
                        # send option 2 and submit solution
                        sol_str = ','.join(str(x) for x in sol)
                        print("[*] submitting solution (length {})".format(len(sol)))
                        # ensure server prompt ready
                        try:
                            io.recvuntil(b'->', timeout=3)
                        except Exception:
                            pass
                        io.sendline(b'2')
                        # wait for the 'enter your list' prompt (or generic prompt)
                        try:
                            io.recvuntil(b'->', timeout=3)
                        except Exception:
                            pass
                        io.sendline(sol_str.encode())
                        # read response (flag or wrong)
                        time.sleep(0.5)
                        out = io.recv(timeout=5)
                        print(out.decode(errors='ignore'))
                        io.close()
                        return
                else:
                    print(f"[*] currently {len(As)} samples but only {len(sel)} independent.")
            # small delay to be polite
            time.sleep(0.05)

        print("[!] reached max iterations without finding enough independent samples.")
        io.close()
    except KeyboardInterrupt:
        print("[*] aborted by user")
        try:
            io.close()
        except Exception:
            pass

if __name__ == "__main__":
    main()

```