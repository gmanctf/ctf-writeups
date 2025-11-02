---
title: Time to decode
tags:
  - Crypto
Difficulty: Medium
Category: Crypto
---
### Description

Break a bad instance of the McEliece cryptosystem.

File provided: Dockerfile

### Solution

Instructions in the website:

```
## 1. Download the McEliece public key.

- `GET /get-public-key`
    
    Example:  
    `curl http://<CHALLENGE_URL>/get-public-key > pk.txt`
    

## 2. Download the syndrome (challenge ciphertext).

- `GET /get-syndrome`
    
    Example:  
    `curl http://<CHALLENGE_URL>/get-syndrome > syndrome.txt`
    

## 3. Verify your plaintext solution (binary string).

- `POST /verify-plaintext`
    
    Example:  
    `curl -X POST -F 'file=@./<FILE>' <HOST>/verify-plaintext`
```

Additional challenge description:

# Time to decode!

#### Attacking Classic McEliece with faulty parameters

## Challenge Introduction

The classic McEliece encryption scheme is a public-key cryptosystem introduced by Robert McEliece in 1978. It is based on the hardness of decoding linear codes, a problem believed to be resistant even to quantum attacks, making it a strong candidate for post-quantum cryptography.

The scheme uses binary Goppa codes, which allow efficient error correction for legitimate users while remaining computationally hard for adversaries to decode without the secret key. In McEliece, the public key is a disguised parity check matrix `H` of a Goppa code, while the private key consists of the underlying Goppa code structure and the transformations used to hide it. Encryption works by encoding the message `m` as a error vector `e` and compute `s=He`. Decryption relies on the private key’s efficient decoding algorithm to recover the original message.

## This imperfect world

This challenge is all about the question how the parameters of Classic McEliece can be falsy chosen, such it gets easy to generically decode a encryption and recover the secret message. In this challenge one of the parameters, the weight of the error vector is chosen wrongly. Hence its maybe possible to be able to decode the syndrome to its error vector via generic decoding without any special knowledge of the secret key. For this challenge we want to use an implementation of an Information Set Decdoding (ISD) algorithm to successfully recover the secret error vector.

## Instructions

The Challenge is to recover `e` from the equation `He = s mod 2`, where `H` is a parity check matrix of size `n-k \times n` and `s` is a syndrome of size `n-k`. Doing this without any restriction on `e` is rather easy. Hence the crucial part of the security of Classic McEliece is to restrict the Hamming Weight of `e` to be small. But how small is still secure? Well that’s the question you will answer in this challenge.

An HTTP request to (“get-public-key”) returns a parity check matrix, which is a binary matrix of size `768x3488`. Note the each line in the file is a column in the matrix, without the systemized part, e.g. the identity matrix.

An HTTP request to (“get-public-syndrome”) returns a syndrome `s = He` for some secret `e`.

The syndrome has been computed with the following code:

```
e = fixedweight(randombits, 4)
s = encode(e, H)
```

where `fixedweight` is a function which returns a random binary string with hamming weight `4`. And `encode` computed `He`.

## Hint

We recommend taking a look at the repository https://cr.yp.to/software/lowweight-20220616.tar.gz. If you face issues at compiling it on your machine, you can use the provided docker.

## Submission

The solution to this challenge is the error vector `e`, written as a binary string (e.g., `0000...0010000...000`) of length `3488` and Hamming Weight `4`. It should be submitted as a file `plaintext.txt` via a POST submission

```
curl -X POST -F 'file=@./plaintext.txt' <HOST>/verify-plaintext
```

and `plaintext.txt` must contain only the binary string of the vector `e`.