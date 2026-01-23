---
title: E4sy P3asy
tags:
  - offline-solvable
category: Reverse Engineering
---
# Description

An easy RE...

Flag Format : KCTF{flag}

File Provided: [E4sy_P3asy.zip](https://github.com/gmanctf/2026-KnightCTF/blob/main/E4sy%20P3asy/E4sy_P3asy.zip)

# Solution:

If we execute the binary, we see the following:

```sh
$ ./E4sy_P3asy.ks                
========================================
   E4sy P3asy - KnightCTF 2026
========================================
[*] Enter the flag to prove your worth!

flag> test
Try again!
```

The executable asks for a value from the user, then prints a message. Looks like we need to provide the flag, and if it is correct, the program will tell us it was the right one.

I checked the binary with strings. The output had some key pieces that indicated how to get the solution:

```
EVP_MD_CTX_free
EVP_md5
EVP_MD_CTX_new
EVP_DigestFinal_ex
EVP_DigestUpdate
EVP_DigestInit_ex
```

The above suggested the use of MD5.

```
T$ H
D$PKnigH
CTF_2026f
D$ThtH
D$^_
D$_s@ltH
```

The above suggests that the MD5 was salted with a value in the lines of: `KnigHCTF_2026f_s@ltH`. From that and given that this CTF is KnightCTF 2026, a likely salt value would be: `KnightCTF_2026_s@lt`. Note: the salt can also be extracted with gdb in a more precise manner.

Then we can see the following string:

```
%s%zu%c
```

and towards the end:

```
========================================
   E4sy P3asy - KnightCTF 2026
[*] Enter the flag to prove your worth!
[!] Interesting... but that's a decoy flag from a different universe.
[!] You're in KnightCTF, not GoogleCTF :)
[?] Format looks suspicious... but not quite.
781011edfb2127ee5ff82b06bb1d2959
4cf891e0ddadbcaae8e8c2dc8bb15ea0
d06d0cbe140d0a1de7410b0b888f22b4
d44c9a9b9f9d1c28d0904d6a2ee3e109
e20ab37bee9d2a1f9ca3d914b0e98f09
d0beea4ce1c12190db64d10a82b96ef8
ac87da74d381d253820bcf4e5f19fcea
...
```

There are 32 of what looks like MD5 hashes. The `%s%zu%c` would indicate that a character was used to call EVP_DigestUpdate, so basically, each of the hashes were calculated as follow:

MD5(salt, character)

We need to create a script that bruteforces each MD5 hash using a character at a time with the salt:

```python
import hashlib
import string

salt = "KnightCTF_2026_s@lt"

hashes = [
    "781011edfb2127ee5ff82b06bb1d2959",
    "4cf891e0ddadbcaae8e8c2dc8bb15ea0",
    "d06d0cbe140d0a1de7410b0b888f22b4",
    "d44c9a9b9f9d1c28d0904d6a2ee3e109",
    "e20ab37bee9d2a1f9ca3d914b0e98f09",
    "d0beea4ce1c12190db64d10a82b96ef8",
    "ac87da74d381d253820bcf4e5f19fcea",
    "ce3f3a34a04ba5e5142f5db272b6cb1f",
    "13843aca227ef709694bbfe4e5a32203",
    "ca19a4c4eb435cb44d74c1e589e51a10",
    "19edec8e46bdf97e3018569c0a60baa3",
    "972e078458ce3cb6e32f795ff4972718",
    "071824f6039981e9c57725453e005beb",
    "66cd6098426b0e69e30e7fa360310728",
    "f78d152df5d277d0ab7d25fb7d1841f3",
    "dba3a36431c4aaf593566f7421abaa22",
    "8820bbdad85ebee06632c379231cfb6b",
    "722bc7cde7d548b81c5996519e1b0f0f",
    "c2862c390c830eb3c740ade576d64773",
    "94da978fe383b341f9588f9bab246774",
    "bea3bb724dbd1704cf45aea8e73c01e1",
    "ade2289739760fa27fd4f7d4ffbc722d",
    "3cd0538114fe416b32cdd814e2ee57b3",
    "8af7f29b21564b87336ed4e4cdfb1a20",
    "4d3f509284784ab67818b13e74fd5ebe",
    "5a45666e1387ff739eb470f840532099",
    "c96997e23323e502d5d0b07d24a68d50",
    "efb388057adc3fe734d8b6ffb2bdd1e1",
    "6df2aaf58e39f89d7a31a72e19e0efbf",
    "9bbd077d3df7faedfd22fae85043d6c0",
    "dc72837ea6ba778eebbd0401a35182f4",
    "efa0bc7c5da3545ba15548b4b85eaf76",
    "1c36dbad9144b1e1d23ddecb5d4df3e9",
    "980663d212aed1ba720f7735873fa73c",
    "9df295c8874bcac93c98babe78b9c946",
    "2672e4d30c7da0d30749f09bc1b1eefa",
]

charset = string.printable  # full printable ASCII

flag = []

for i, target in enumerate(hashes):
    found = False
    for c in charset:
        # try both index styles defensively
        for idx in (i, i + 1):
            s = f"{salt}{idx}{c}"
            if hashlib.md5(s.encode()).hexdigest() == target:
                flag.append(c)
                found = True
                break
        if found:
            break

print("Recovered flag:")
print("KCTF{" + "".join(flag) + "}")
```

```sh
python solution.py 
Recovered flag:
KCTF{_L0TS_oF_bRuTE_foRCE_:P}
```

Flag: `KCTF{_L0TS_oF_bRuTE_foRCE_:P}`