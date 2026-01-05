---
title: Quantgnome Leap
Difficulty: ❄️❄️---
order: 6
showToc: true
---

👨‍💻 Challenge provided by: [[Charlie Goldner]]  
🗺️ Location: Grand Hotel Lobby - Area: hotellobby. Coordinates: 5, 12  
<img src="HHC2025/images/cranpi.png" width="20" class="inline-left">Challenge URL: [Quantgnome Leap](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termQuantgnome)

## Challenge Description

```
Charlie in the hotel has quantum gnome mysteries waiting to be solved. What is the flag that you find?
```

## Helpful References

[What is Quantum Cryptography - NIST](https://www.nist.gov/cybersecurity/what-quantum-cryptography)  
[TII PQSort](https://pqsort.tii.ae/): Cool site that shows the different characteristics and performance of PQC algorithms submitted to NIST.

## Solution

When we access the challenge, we are briefly presented with some ASCII art representing quantum bits changing states using the whereabouts of a gnome (the QuantGnome). Cute, but it won't help us solve the challenge :). Once that intro finishes, we are presented with the following text: 

```
                    +---------------------------------+
                     |  "If we knew the unknown, the   |
                     |  unknown wouldn't be unknown."  |
                     |   — Quantum Leap (TV series)    |
                     +---------------------------------+

                        You observed me, the Gnome...
                         ...and I observed you back.
                      Did you see me? Am I here or not?
                                Both? Neither?
                     Am I a figment of your imagination?
              Nay, I am the QuantGnome. Welcome to my challenge!
                                     ***
    Like me, the world of cryptography is full of mysteries and surprises.
     In this challenge, you will learn about the latest advancements in 
  post-quantum cryptography (PQC), and how they can help secure our digital 
            future against the threats posed by quantum computers.

                I am a reminder that the future is uncertain, 
                   but with the right tools and knowledge,
              we can navigate the unknowns and emerge stronger.

                          Take the PQC leap with me!

        I have created a *PQC* key generation program on this system. 
                             Find and execute it.
```

The first task is to locate the key generation program. We can use the `find` command to search for it:

```sh
qgnome@quantgnome_leap:~$ find / -iname "*PQC*" 2>/dev/null
/usr/local/bin/pqc-keygen
```

If we execute the program:

```sh
/usr/local/bin/pqc-keygen

— Summary -> Total algorithms = 28 | ✔ Keys generated = 28

Next, use -t to display key characteristics.
```

This command simply generates keys for the various PQC algorithms. Following the instructions and using `-t` will display their characteristics:

```sh
/usr/local/bin/pqc-keygen -t
Algorithm                             Bits  NIST    Kind   
------------------------------------  ----  ----  ---------
sphincssha2128fsimple                   32   1          PQC
sphincssha2256fsimple                   64   5          PQC
ed25519                                256   0    Classical
ecdsa-nistp256-sphincssha2128fsimple   288   1       Hybrid
ecdsa-nistp521-sphincssha2256fsimple   585   5       Hybrid
falcon512                              897   1          PQC
ecdsa-nistp256-falcon512              1153   1       Hybrid
mldsa-44                              1312   0          PQC
ecdsa-nistp256-mldsa-44               1568   1       Hybrid
falcon1024                            1793   5          PQC
mldsa-65                              1952   0          PQC
rsa-2048                              2048   0    Classical
ecdsa-nistp521-falcon1024             2314   5       Hybrid
ecdsa-nistp384-mldsa-65               2336   3       Hybrid
mldsa-87                              2592   0          PQC
mayo3                                 2986   3          PQC
rsa-3072                              3072   1    Classical
rsa3072-sphincssha2128fsimple         3104   1       Hybrid
ecdsa-nistp521-mldsa-87               3113   5       Hybrid
ecdsa-nistp384-mayo3                  3370   3       Hybrid
rsa3072-falcon512                     3969   1       Hybrid
rsa-4096                              4096   1    Classical
rsa3072-mldsa-44                      4384   0       Hybrid
mayo2                                 4912   1          PQC
ecdsa-nistp256-mayo2                  5168   1       Hybrid
mayo5                                 5554   5          PQC
ecdsa-nistp521-mayo5                  6075   5       Hybrid
rsa3072-mayo2                         7984   1       Hybrid
------------------------------------  ----  ----  ---------

You can use 'ssh-keygen -l -f <private key>' to see the bit size of a key.
Next step, SSH into pqc-server.com.
```

All the above is for learning purposes and it is not strictly required to solve the challenge. As explained in the output from the command above, we need to SSH into pqc-server.com. The only challenge is that we do not know the username. We have two ways of finding out that information. The first option is to check our public SSH key:

```sh
cat .ssh/id_rsa.pub 
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCya6rjv+pf55l/EvEIZW+yhBdrpBrS0rmyysVhdR5Zn2aatLVDhRnNQrH+si6SOaDAOPhOhy037auUveLhEFaQBDQIDqisQ8JoTT/TKhyO97h1IUkl3zmsuw4Kcu1r24L2UJCIVStiJR8vQU8U0Kg5eWuDRev9j+2VMGqF2hmYqssTNbxHNeNbEr1R6/wciSAa3hNwksqE3dYjbr07veKAIcWcsaPMRHmjHrHXdLLwyweXhgzidd3AgzDskub9XdAiXs2B93mFNbQWel+nE2smxUVUY+SLsGXDTXAJu5AqYXrDEJtSuCOCHKXyPX7WCbmAllQo1FB/9K59pI552+K062SvGDCeLEPpcELozU52/awX2yeldNOj7Bn/xXdKpSPHLUrhsj8y/9gVTnS/0q6VLzO8qIwzxdGh7P0OtQqMrSRkTLEHtdOjojTmT70WUpUaVWXf65X8ymY72G49lJjFVAyM6AFBQK/K52f0UTl4XnvkSHwxYNFyk7wGkE07pWU= gnome1
```

We can see from the output that the user is `gnome1`.

The second option is to check the configuration for SSH which is at ` /opt/oqs-ssh/`. We can see there's a directory with the public keys of the users: ` /opt/oqs-ssh/user-keys/`. There's 4 users:

```
admin.pub   gnome1.pub  gnome2.pub  gnome3.pub  gnome4.pub
```

Now we just need to ssh to the server using the `gnome1` user and from there, just follow the instructions to SSH with the corresponding user:

`ssh gnome1@pqc-server.com`

```
##########################################################################################################################################

Welcome, gnome1 user! You made the first leap!

You authenticated with an RSA key, but that isn't very secure in a post-quantum world. RSA depends on large prime numbers, which a 
quantum computer can easily solve with something like Shor's algorithm.

Take a look around and see if you can find a way to login to the gnome2 account.

##########################################################################################################################################
```

`ssh gnome2@pqc-server.com`

```
##########################################################################################################################################

Welcome, gnome2 user! You made the second leap!

You authenticated with an ED25519 key, smaller than an RSA key, but still not secure in a post-quantum world due to Shor's 
algorithm.

Take a look around and see if you can find a way to login to the gnome3 account.

##########################################################################################################################################
```

`ssh gnome3@pqc-server.com`

```
##########################################################################################################################################

Welcome, gnome3 user! You made the third leap!

You authenticated with a MAYO post-quantum key. 
A post-quantum cryptographic algorithm with promising results for embedded systems. HOWEVER, use MAYO with caution! Wait for a 
standardized implementation (if/when that happens).

Take a look around and see if you can find a way to login to the gnome4 account.

##########################################################################################################################################
```

`ssh gnome4@pqc-server.com`

```
##########################################################################################################################################

Welcome, gnome4 user! You made the fourth leap!

You authenticated with a post-quantum hybrid key! What does that mean? A blended approach with proven classical cryptography and 
post-quantum cryptography.

In this case, you authenticated with a NIST P-256 ECDSA key (a classical elliptic curve) that also uses post-quantum SPHINCS+ 
(standardized by NIST in FIPS 205 as SLH-DSA). That makes this key extremely robust. According to NIST, this is a security level 1 key, 
which means this key is at least as strong as AES128.

Instead of a single exchange/signature (as with RSA or ED25519), this key produces two (one classical and one post-quantum) that are both 
checked together. If one fails, authentication fails. A hybrid approach is a great first step when testing and implementing post-quantum 
cryptography, giving organizations 'Quantum Agility'.

Take a look around and see if you can find a way to login to the admin account.

##########################################################################################################################################
```

`ssh admin@pqc-server.com`

```
##########################################################################################################################################

You made the QuantGnome Leap! Your final stop.

You authenticated with another hybrid post-quantum key. What is different about this key? It uses the NIST P-521 elliptic curve (roughly 
equivalent to a 15360-bit RSA key) paired with ML-DSA-87. According to NIST, ML-DSA-87 is a security level 5 algorithm, which provides 
the highest security level and is meant for the most secure environments. NIST standardized CRYSTALS-Dilithium as ML-DSA in FIPS 204 with 
three defined security levels:

- ML-DSA-44: Security Level 2 - At least as strong as SHA256/SHA3-256
- ML-DSA-65: Security Level 3 - At least as strong as AES192
- ML-DSA-87: Security Level 5 - At least as strong as AES256

This is one of the strongest hybrid keys available in post-quantum cryptography. The other extremely strong security level 5 
algorithms all use a combination of the NIST P-521 elliptic curve and one of the following PQC algorithms:

- falcon1024: Falcon (FN-DSA) with a 1024 lattice dimensional size
- sphincssha2256fsimple: SLH-DSA (SPHINCS+) using SHA2 256 and fast signature generation (hence the 'f' in the algorithm name)
- mayo5: MAYO-5 is the highest of the four MAYO security levels

This entire build/system is based off of the Linux Foundation's Open Quantum Safe (OQS) initiative. It uses the OQS liboqs library which 
provides PQC algorithm support.
You can find out more about the OQS initiative at https://openquantumsafe.org/.

Next Step: You now have access to a directory in the same location as the SSH daemon. Time to look around for your final flag.
##########################################################################################################################################
```

`cat /opt/oqs-ssh/flag/flag`

Solution: ==HHC{L3aping_0v3r_Quantum_Crypt0}==

