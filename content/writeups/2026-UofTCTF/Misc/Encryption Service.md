---
title: Encryption Service
tags:
  - AES/CBC
  - xargs
  - offline-solvable
---
# Description

We made an encryption service. We forgot to make the decryption though. As compensation we are giving free encrypted flags.

Files Provided: [encryption-service.zip](https://github.com/gmanctf/2026-UofTCTF/blob/main/Misc/Encryption%20Service/encryption-service.zip)

# Solution

We are provided 2 files, enc.py and run.sh. The solution is not related to how the encryption is implemented, but on how run.sh calls enc.py. This is run.sh:

```python
#!/bin/sh

OUTFILE="/tmp/input.txt"

head -c 16 /dev/urandom | od -An -tx1 | tr -d ' ' > "$OUTFILE"

echo "Welcome to the encryption service"
echo "Please put in all your plaintexts"
echo "End with EOF"

while true; do
    read -r line

    if [ "$line" = "EOF" ]; then
        break
    fi

    echo "$line" >> "$OUTFILE"
done

echo "As a bonus we will also encrypt the flag for you"

cat /flag.txt >> "$OUTFILE"

echo "Here is the encryption."
echo "$(cat "$OUTFILE" | xargs /app/enc.py)"
```

It creates a random key so that the first 16 bytes hex string in `$OUTFILE` are used as the key:

```python
head -c 16 /dev/urandom | od -An -tx1 | tr -d ' ' > "$OUTFILE"
```

Then, the user provides the input (the clear text to be encrypted). Finally, the script places the flag as the last line in `$OUTFILE`:

```python
cat /flag.txt >> "$OUTFILE"
```

The vulnerability comes due to the use of `xargs` to call enc.py:

```python
echo "$(cat "$OUTFILE" | xargs /app/enc.py)"
```

`xargs` has these properties:

- **Input Handling** By default, `xargs` treats input items as delimited by blanks (spaces, tabs, and newlines) and appends them as arguments to the end of the command it runs.
- **Argument Length Limits** It helps avoid "Argument list too long" errors by splitting a large number of inputs into smaller batches that fit within the system's command-line limits.

What this means, is that if the argument list we provide exceeds the limit (~128KB) then it will call enc.py multiple times. As we saw before, the first argument is used as the key, which means that if we send enough arguments (the text to be encrypted) separated by new lines, it will treat each as a new argument that will be appended when calling enc.py, when the limit is reached, it will call it again using as key the data we are sending.

For example, we can send 32 0s as the plain text, multiple times, separated by new line:

`00000000000000000000000000000000`

When the limit is reached, `enc.py` will be called using that string as the key to encrypt the flag. Script implementing the attack:

```python
from pwn import *
from Crypto.Cipher import AES
import sys

def solution():
    conn = remote('127.0.0.1', 5000)

    plaintext = "0" * 32
    lines = 4000

    for _ in range(lines):
        conn.sendline(plaintext)

    conn.sendline(b"EOF")
    conn.recvuntil(b"Here is the encryption.\n")
    output = conn.recvall().decode().strip()
    enc_lines = output.split('\n')

    if len(enc_lines) < 2:
        log.error("argument length not exceeded, increase lines")
        sys.exit(1)

    target = enc_lines[-1]
    iv = bytes.fromhex(target[:32])
    ct = bytes.fromhex(target[32:])

    cipher = AES.new(bytes.fromhex(plaintext), AES.MODE_CBC, iv)
    pt = cipher.decrypt(ct).decode(errors="ignore")

    # Extract the flag
    m = re.search(r"uoftctf\{[^}]+\}", pt)
    if not m:
        log.error("Flag not found")
        sys.exit(1)
    print(m.group(0))

if __name__ == "__main__":
    solution()
```

Flag: ==uoftctf{x4rgs_d03sn7_run_in_0n3_pr0c3ss}==
