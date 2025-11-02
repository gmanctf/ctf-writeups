---
title: Crypto’s Got Talent
tags:
  - Crypto
Difficulty: Easy
---


### Description

Please evaluate PQC proposals

### Solution

The challenge gives a link to a website with the following information:

Crypto’s Got Talent – Usage Guide

Welcome! This service provides one main endpoint for your challenge:

👉 [Open Challenge Description](https://e53ff7b2c2bb2f1f.chal.ctf.ae/challenge-description)

 1. Verify your submission (64-character hex string).

- `GET /verify/<64_hex_characters>`
    
    Example:  
    `curl http://<CHALLENGE_URL>/verify/470f2e8500743ce0953dfce49168d4794ceff7bba91e85243c4dede3b5e3bc71`

Accessing the challenge description link, provides the following info:

Some background info of which the most relevant information is a link to TII website:

https://pqsort.tii.ae/

Then, it describe the challenge and how to get the flag:
## Challenge

Depending on the application, either the signature size or the public key size may be a more critical factor. For instance, in use cases where public keys can be pre-shared but many signatures are exchanged, a smaller signature size is preferable. In other cases, such as systems that must manage a large number of user public keys, a smaller public key size is more important.

The challenge here is selecting three signature instances among instances of _additional candidates_ as follows:

1. Choose the level-1 instance with the smallest signature size. If there’s a tie, select the one with the smaller public key. If there’s a tie still, then select the one with the faster signing algorithm.
2. Choose the level-3 instance with the smallest public-key size. If there’s a tie, select the one with the smaller signature. If there’s a tie still, then select the one with the faster key-generation algorithm.
3. Choose the level-5 instance with the smallest sum of the public key size and signature size. If there’s a tie, select the one with the smaller signature. If there’s a tie still, then select the one with the faster verification algorithm.

### Your Goal

Your final goal is submitting the hash value of three schemes and parameter sets chosen above.

1. Suppose that an answer string is

```
CyberQ{<lv1 instance>|<lv3 instance>|<lv5 instance>}
```

2. Compute its hash value `<sha256_hash>` under `sha256` (Please use lower characters)
3. Submit it as `https://<CHALLENGE_URL>/verify/<sha256_hash>` and receive flag.

You can compute sha256 hash value as follows:

```
from hashlib import sha256
sha256_hash = sha256("CyberQ{...|...|...}".encode()).hexdigest()
print(sha256_hash)
```

### Submission Example

If you choose `ml-dsa-44` for the first answer, `mirath_tcith_3b_fast` for the second answer, and `sphincs-shake-256f-simple` for the third answer, then your answer string and hash value are

```
CyberQ{ml-dsa-44|mirath_tcith_3b_fast|sphincs-shake-256f-simple}
470f2e8500743ce0953dfce49168d4794ceff7bba91e85243c4dede3b5e3bc71
```


The TII link has a feature to filter the algorithms as per the instructions:

Choose the level-1 instance with the smallest signature size. If there’s a tie, select the one with the smaller public key. If there’s a tie still, then select the one with the faster signing algorithm.

![[Pasted image 20251022201203.png]]

uov_OV16_160_64_4rAES_pkc

Choose the level-3 instance with the smallest public-key size. If there’s a tie, select the one with the smaller signature. If there’s a tie still, then select the one with the faster key-generation algorithm.

In this case, there were multiple with a public key size of 48, but the signature size broke the tie:
![[Pasted image 20251022201511.png]]

faest_em_192s

Choose the level-5 instance with the smallest sum of the public key size and signature size. If there’s a tie, select the one with the smaller signature. If there’s a tie still, then select the one with the faster verification algorithm.

![[Pasted image 20251022203940.png]]

sqisign_lvl5

If we put all together:

CyberQ{uov_OV16_160_64_4rAES_pkc|faest_em_192s|sqisign_lvl5}

Calculating the hash:

`e4d65e3bdcf6e34b90740da292368bc2edbee0b302bfe1947e8ee84d4b3190a9`

If we check in the site:

https://e53ff7b2c2bb2f1f.chal.ctf.ae/verify/e4d65e3bdcf6e34b90740da292368bc2edbee0b302bfe1947e8ee84d4b3190a9

![[Pasted image 20251022204043.png]]

flag{0ee4caa06a2bb051}
