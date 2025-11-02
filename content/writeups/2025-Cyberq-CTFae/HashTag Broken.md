---
title: HashTag Broken
tags:
  - Crypto
Difficulty: Medium
Category: Crypto
---
### Description

Find a collision by exploiting a weak hash function.

### Solution

We have a website to interact with the challenge and that also provides further instructions and information:

```
# Weak Hash Collision – Usage Guide

This service provides two endpoints for the challenge.

👉 [Open Challenge Description](https://aeb0abd133a59f6d.chal.ctf.ae/challenge-description)

## 2. Download the original message file

- `GET /get-original-message`
    
    Example:  
    `curl -O http://<CHALLENGE_URL>/get-original-message`
    

## 3. Verify your submission

- `GET /verify/<message>`
    
    Example:  
    `curl http://<CHALLENGE_URL>/verify/The_winner_of_the_prize_is_<NEW_NAME>`
```

The description link contains the following:

## Challenge Introduction

In this challenge, you will exploit the weakness of a deliberately flawed **hashing function**. In the real world, hash functions have many use cases. One of them is to check the data integrity; if a file has been corrupted or tampered with, its hash digest should change. Instead of a cryptographically secure hash function like SHA-256 or MD5, we will use a naive function that simply **computes the sum of ASCII values modulo 512** of all characters in a message.

This type of function is **highly insecure**, because it is **not collision-resistant**. Two different strings can easily produce the same hash digest.

Your task is to exploit this weakness and forge a message that has the same hash digest of a given one.

### Your Goal

You are given a file `original_message.txt` containing a message of the form:

```
The winner of the prize is <NAME>
```

Your goal is to create a message in the same format:

```
The winner of the prize is <NEW_NAME>
```

Where `<NEW_NAME>` is different from `<NAME>`, but the sum-of-ASCII hash modulo 512 matches.

The digest is given by the following method:

```
def sum_ascii_hash(s: str) -> int:
    """
    Compute the sum of ASCII values of all characters modulo 512.

    Parameters
    ----------
    s : str
        Input string to hash.

    Returns
    -------
    int
        Sum of ASCII values of the string modulo 512.
    """
    return sum(ord(c) for c in s) % 512
```


As explained, when you access `/get-original-message` you get a text file (original_message.txt) with the following content:

`The_winner_of_the_prize_is_JAMIE`

This is a **hash collision challenge** with a deliberately weak hash:

- The hash is simply `sum(ord(c) for c in s) % 512`.
    
- Your task: create a **new message** in the same format, with a **different name**, such that the sum-of-ASCII modulo 512 matches the original.

solution script:

```
#!/usr/bin/env python3
"""
forge_sum_hash.py

Detects whether original message uses spaces or underscores in the fixed prefix
(e.g. "The winner of the prize is NAME" vs "The_winner_of_the_prize_is_NAME"),
then forges a different NAME such that sum(ord(c) for c in message) % 512
matches the original.

Usage:
  python3 forge_sum_hash.py --url http://<CHALLENGE_URL>
or
  python3 forge_sum_hash.py            # will try to read local original_message.txt
"""
import argparse
import urllib.request
import urllib.parse
import sys
import os

PREFIX_SPACE = "The winner of the prize is "
PREFIX_UNDERSCORE = "The_winner_of_the_prize_is_"

PRINTABLE_MIN = 32
PRINTABLE_MAX = 126

def sum_ascii_hash(s: str) -> int:
    return sum(ord(c) for c in s) % 512

def download_original_message(challenge_url: str) -> str:
    url = challenge_url.rstrip('/') + "/get-original-message"
    try:
        with urllib.request.urlopen(url, timeout=10) as res:
            data = res.read().decode('utf-8', errors='replace').strip()
            return data
    except Exception as e:
        raise RuntimeError(f"Failed to download from {url}: {e}")

def read_local_original_message(path="original_message.txt") -> str:
    if not os.path.exists(path):
        raise FileNotFoundError(f"{path} not found")
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read().strip()

def find_printable_name_for_target(target_sum_mod: int, max_len=30):
    """
    Construct a printable name (characters in range 32..126) whose sum(ord) % 512 == target_sum_mod.
    Attempt lengths from 1..max_len. For each length L try to solve by setting last 1,2 or 3 chars.
    Returns the name (string).
    """
    for L in range(1, max_len+1):
        # 1 adjustable char
        if L >= 1:
            base = "A" * (L-1)
            base_sum = sum(ord(c) for c in base)
            needed = (target_sum_mod - base_sum) % 512
            if PRINTABLE_MIN <= needed <= PRINTABLE_MAX:
                return base + chr(needed)
        # 2 adjustable chars
        if L >= 2:
            base = "A" * (L-2)
            base_sum = sum(ord(c) for c in base)
            need = (target_sum_mod - base_sum) % 512
            for c1 in range(PRINTABLE_MIN, PRINTABLE_MAX+1):
                c2 = (need - c1) % 512
                if PRINTABLE_MIN <= c2 <= PRINTABLE_MAX:
                    return base + chr(c1) + chr(c2)
        # 3 adjustable chars
        if L >= 3:
            base = "A" * (L-3)
            base_sum = sum(ord(c) for c in base)
            need = (target_sum_mod - base_sum) % 512
            for c1 in range(PRINTABLE_MIN, PRINTABLE_MAX+1):
                for c2 in range(PRINTABLE_MIN, PRINTABLE_MAX+1):
                    c3 = (need - c1 - c2) % 512
                    if PRINTABLE_MIN <= c3 <= PRINTABLE_MAX:
                        return base + chr(c1) + chr(c2) + chr(c3)
    raise ValueError("Couldn't find a printable name within the search limits; try increasing max_len")

def forge_message(original_message: str):
    # detect prefix style
    if original_message.startswith(PREFIX_SPACE):
        prefix = PREFIX_SPACE
    elif original_message.startswith(PREFIX_UNDERSCORE):
        prefix = PREFIX_UNDERSCORE
    else:
        # attempt to be flexible: try to find either prefix contained at start (with minor variations)
        if original_message.replace(" ", "_").startswith(PREFIX_UNDERSCORE):
            prefix = PREFIX_UNDERSCORE
        elif original_message.replace("_", " ").startswith(PREFIX_SPACE):
            prefix = PREFIX_SPACE
        else:
            raise ValueError(f"Original message does not start with an expected prefix ('{PREFIX_SPACE}' or '{PREFIX_UNDERSCORE}').")

    orig_name = original_message[len(prefix):].strip()
    prefix_sum = sum(ord(c) for c in prefix)
    original_hash = sum_ascii_hash(original_message)

    # target sum for the name so that (prefix_sum + name_sum) % 512 == original_hash
    target_name_sum_mod = (original_hash - prefix_sum) % 512

    new_name = find_printable_name_for_target(target_name_sum_mod, max_len=60)

    # ensure different from original; if equal, try longer or tweak
    if new_name == orig_name:
        # try longer lengths
        for extra in range(1,6):
            try:
                new_name = find_printable_name_for_target(target_name_sum_mod, max_len=60+extra)
                if new_name != orig_name:
                    break
            except Exception:
                continue
        # last resort: force a simple tweak while keeping sum mod 512 by adjusting two final chars
        if new_name == orig_name:
            base = new_name + "A"
            base_sum = sum(ord(c) for c in base[:-2])
            need = (target_name_sum_mod - base_sum) % 512
            replaced = False
            for c1 in range(PRINTABLE_MIN, PRINTABLE_MAX+1):
                c2 = (need - c1) % 512
                if PRINTABLE_MIN <= c2 <= PRINTABLE_MAX:
                    new_name = base[:-2] + chr(c1) + chr(c2)
                    replaced = True
                    break
            if not replaced:
                raise RuntimeError("Failed to ensure new name differs from original while keeping hash")

    forged_message = prefix + new_name

    # sanity checks
    if sum_ascii_hash(forged_message) != original_hash:
        raise AssertionError("Forged message does not match original hash (bug).")
    if forged_message == original_message:
        raise AssertionError("Forged message equals original; algorithm failed to produce a different name.")
    return orig_name, new_name, forged_message, original_hash, prefix

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", help="Challenge base URL, e.g. http://challenge.example:8000")
    parser.add_argument("--no-download", action="store_true", help="Don't attempt to download, read local file only")
    args = parser.parse_args()

    original_message = None
    if args.url and not args.no_download:
        try:
            original_message = download_original_message(args.url)
            print(f"[+] Downloaded original message from {args.url}/get-original-message")
        except Exception as e:
            print(f"[!] Download failed: {e}", file=sys.stderr)

    if original_message is None:
        try:
            original_message = read_local_original_message()
            print("[+] Read original message from local original_message.txt")
        except Exception as e:
            print(f"[!] Failed to read local original_message.txt: {e}", file=sys.stderr)
            print("[!] Cannot continue without the original message. Provide --url or place original_message.txt in this folder.", file=sys.stderr)
            sys.exit(1)

    print("\nOriginal message:")
    print("-----------------")
    print(original_message)
    print("-----------------")

    try:
        orig_name, new_name, forged_message, original_hash, used_prefix = forge_message(original_message)
    except Exception as e:
        print(f"[!] Error forging message: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"\nDetected prefix style: {'underscores' if used_prefix==PREFIX_UNDERSCORE else 'spaces'}")
    print(f"Original name: {orig_name!r}")
    print(f"Forged  name : {new_name!r}")
    print(f"Forged message:\n{forged_message}")
    print(f"Digest (sum_ascii_hash % 512): {original_hash}")

    # prepare verification URL (URL-encode message for path usage)
    encoded_message = urllib.parse.quote(forged_message, safe='')
    if args.url:
        verify_url = args.url.rstrip("/") + "/verify/" + encoded_message
        print("\nSubmit with curl (URL-encoded):")
        print(f"curl \"{verify_url}\"")
    else:
        print("\nNo --url provided. If you have the challenge URL, submit like:")
        print("curl http://<CHALLENGE_URL>/verify/" + encoded_message)

if __name__ == "__main__":
    main()
```

```
[+] Downloaded original message from https://aeb0abd133a59f6d.chal.ctf.ae//get-original-message

Original message:
-----------------
The_winner_of_the_prize_is_JAMIE
-----------------

Detected prefix style: underscores
Original name: 'JAMIE'
Forged  name : 'j~~'
Forged message:
The_winner_of_the_prize_is_j~~
Digest (sum_ascii_hash % 512): 112

Submit with curl (URL-encoded):
curl "https://aeb0abd133a59f6d.chal.ctf.ae/verify/The_winner_of_the_prize_is_j~~"

└─$ curl "https://aeb0abd133a59f6d.chal.ctf.ae/verify/The_winner_of_the_prize_is_j~~"
{"status": "PASS", "flag": "flag{692f3f7d05e09ec6}"}
```