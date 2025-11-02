---
title: NextGenRSA
tags:
  - Crypto
  - RSA
Difficulty: Hard
---
### Challenge Description

>After the creation of quantum computers, RSA is no longer secure. However, researchers have developed a new variant of RSA that is believed to be secure against quantum attacks.

File Provided: [challenge.py](https://github.com/gmanctf/2025-Dubai-Police-CTF/raw/refs/heads/main/Quals/NextGenRSA/challenge.py)

### Solution

The challenge includes the source code of the RSA implementation (challenge.py):

```python
# Native imports
import os

# Non-native imports
from Crypto.Util.number import *     # pip install pycryptodome

# Flag import
FLAG = os.environ.get('FLAG', 'flag{506f6c796d65726f5761734865726521}')

if isinstance(FLAG, str):
    FLAG = FLAG.encode()

nbits = 1024
p, q = [getPrime(nbits) for _ in "01"]
N = p * q
phi = (p - 1) * (q - 1)

while True:
    er = getRandomInteger(nbits // 4)
    r = getRandomInteger(nbits // 4)
    if GCD(er, phi) == 1 :
        dr = inverse(er, phi)
        d = dr + r
        if GCD(d, phi) == 1:
            e = inverse(d, phi)
            break

c = pow(bytes_to_long(FLAG), e, N)

print(f"{N = }")
print(f"{e = }")
print(f"{c = }")
```

If we analyze the code (I added comments to understand it better):

```python
import os
from Crypto.Util.number import *

# Flag import
FLAG = os.environ.get('FLAG', 'flag{506f6c796d65726f5761734865726521}')
if isinstance(FLAG, str):
    FLAG = FLAG.encode() #convert flag into bytes

nbits = 1024
p, q = [getPrime(nbits) for _ in "01"] # This calls `getPrime(nbits)` twice and assigns the two results to p and q. `for _ in "01"` is basically the equivalent of: `for _ in range(2)`. p and q will be 1024-bit primes, secure.
N = p * q #Public key calculation
phi = (p - 1) * (q - 1) #φ(N) = (p−1)(q−1) - This is Euler's totient. Secret.

#The following loop is where the modular aritmetic magic happens.
#It calculates 2 random numbers, check the Greater Common Denominator (GCD)
#if a and n GCD = 1, they are coprime and it means there's an invserse. What is an inverse?
#a x b≡1(mod n) -> b is the inverse of a. I.e. when you multiply a and b, then divide by n the remainder is 1. E.g.
#Given 2 coprime numbers er=3 and phi=10, the inverse is:
#(3 * x) mod 10 = 1. The inverse (x) is 7 cos (3 * 7)= 21, mod 10 = 1.
the **remainder** is 1.
while True:
    er = getRandomInteger(nbits // 4) #256-bit random number
    r = getRandomInteger(nbits // 4) #256-bit random number
    if GCD(er, phi) == 1 : #Check if the numbers are coprime
        dr = inverse(er, phi) #dr is: (er * dr) mod phi = 1
        d = dr + r #The private exponent d is constructed as dr + r (sum of modular inverse and small r).
        #This way of calculating d is the non-standard part.
        if GCD(d, phi) == 1: #Check if the numbers are coprime
            e = inverse(d, phi) #e is (d * e) mod phi = 1
            break

c = pow(bytes_to_long(FLAG), e, N) #ciphertext calculation

print(f"{N = }") #public key (modulus)
print(f"{e = }") #public key (exponent)
print(f"{c = }") #ciphertext
```

So the weakness for the above algorithm is the non-standard calculation for d: d = dr + r. 
If we run `challenge.py`, we get as expected the public keys and the cipher text:

```
N = 11548509748527191666474020247194920698353027724361500976723616315686602012329926110799470363469034992277887383158415620956341490732754457922187025345202658056867088843787338833999820720421092816849722949952483026158097869038112412274812635962842808243748365441494598581181384856383748680702709194657168912578930703170998580454539834170064304086167518027315004704010096004075527303749657167290001802176183317959351202332262741934200680544956103196033078876552810346889908838798587950113481282868420420312867301193539724762714537822867550701140718838659027390330364752033880596984499316840316229464734602184878242810961
e = 4154233822284923927511321834764868276475121093045122829652177382799797929985999234647695062063975295201745240165041236706317989866643812386824135744481797324275249692433621899031584498806818281221518422218817534585954644808049430957359681001595410460998629263936090620005524191086365792569091025098873733629313314384169829709098203334668872293216891294179086917520521998573090043991961092551530343771065722054609146541304469216469469267989479052946053460900101735109090654828723872564540984994783385259453357008222068185824269864492759126896456230052259975740867609829567149181592247494984030737841274249511672293537
c = 7494124077764310878392226104819858535779035968665367847220161663901672656393035046731438852639961246350139016920701151462805447561369157143604092943111389126238873992798129173801679441996673409396242968718031310781795428123780578296896277666642090768688998607085210011838331944156157472774971823088239049568976599504359522025275483860538218281647278754139386538590016834238684247017211572360947442202042597006533116422797600302872021829220410385949932411798012500138230687207202968324991561054726120164986863408867916999303974590568284394566346447876993937264306769525024752283774513376578404682639614472225017550349
```

I found this site that goes through multiple RSA attacks: https://asecuritysite.com/rsa/index
In particular, one attack that called my attention given the calculation of d is: **Low exponent in RSA (Wiener attack)**. There was a solver for the attack here: https://asecuritysite.com/rsa/rsa_ctf05

I tested it with the values provided in `challange.py` and it worked (it takes several minutes):

![[Pasted image 20251030210219.png]]

I spined the docker image in the challenge, connected to the site, and used the values of e, N and c provided in the site above. It did not work, however, now that I knew the attack, it was easier to find additional references with the attack implementation. In particular, I found the following site that contained the exact same challenge: [HACKFEST 7 - Cryptography Writeups - HackMD](https://hackmd.io/@msalaani/hackfest7-crypto#CRYPTO---ALO-REVENGE)

I used the same solution provided in that site, just changing the last line with the `assert` to a print of the flag:

```python
#!/usr/bin/env python3

from Crypto.Util.number import long_to_bytes
from sage.all import *

def GeneralizedWienerAttack_1(e, N):
    
    # https://iacr.org/archive/pkc2004/29470001/29470001.pdf

    # 1. Compute continued fractions e / N
    convergents = continued_fraction(ZZ(e) / N).convergents()
    for convergent in convergents:
        k = convergent.numerator()
        x = convergent.denominator()
        if (k != 0):
            # 2.a Compute s, t and p_tild
            s = N + 1 - e*x // k # ~= p + q
            t = s**2 - 4*N # ~= p - q
            if t >= 0:
                if Integer.is_square(t):
                    t = isqrt(t)
                    if (s+t) & 1 == 0:
                        p_tild = (s+t) // 2 # ~= p
                        if N % p_tild == 0 and (1 < p_tild < N): # Direct Solution
                            return int(p_tild), int(N // p_tild)

                        else: # Coppersmith
                            # 2.b apply coppersmith 
                            x_ = PolynomialRing(Zmod(N), "x").gen()
                            B = isqrt(isqrt(N)) # N ^ 1/4
                            f = p_tild + x_
                            for k_ in range(-3, 3):
                                fc = f + (2*k_+1) * B 
                                roots = fc.small_roots(X = B, epsilon = 1/25)
                                if len(roots) != 0:
                                    for p_r in roots:
                                        if N % p_r == 0:
                                            return int(p_r), int(N // p_r)
    return None, None

N = 23147778518092199435348680779458184563467380886352471407684168883715443124577353885022009176802509329547239163007507371624261889619932097465592554885891529268196133292664060483903736681685843573232813712548021982539587396239404789861864139415947581756962472059717574776560267889199903676158366732078554431332967630679511538506248249503804181833587406640972847401926371694031805369295140349710227771219086170135830754192190938680066098867851610698591646495165587461346528202947731253654296106857699116962790536466390420638514320522632527127831802782017989945264220482655670837698357401455847734415815911483472520097631
e = 11891302889901902971129542053904639240718627523681514090272030925507316944570435722439911495913651527345510044972700886490375539357006856483435580340737811504308569417059876409246137302494049186245256184866273319073065817273935365085095327001399239222897018724181590572183521304862939862930783473939471104594106174140485497479244861702860723079106512111024340890276481517504657759353228944784242325256666336697420277138654060874053966614146814862322889238355562803707490094813138572890412794225574865970086867364224642052607337792868144843683509868280496332901313524547997755353170759411217055590349650361802497639667
c = 1434416645697357776798747716673453914015221484539421219295880495731355016459149903009500200449215753596284302069058645584227615410284131469762917328642722226346457646572969869351572230798881361012023294792037157360109582829014689721227468858156876799749496092278387923205871233751685298991290732941026434411930518811003762876049023981213491529689161737332288994469937193856162928520982249487408279726106342154823073197519105851364907307935909581787032749526490177822739223455378468306976001772258536285945701205090683522095904395673942769633186112421582460459255167996320616266395059748216287405100339341843475862576
    
p, q = GeneralizedWienerAttack_1(e, N)
if p and q:
    d = inverse_mod(e, (p-1)*(q-1))
    FLAG = int(pow(c, d, N))
    
    print(long_to_bytes(FLAG).decode())
```

That worked and challenge solved:

```
# sage alorevenge.sage 
flag{4341f88f0fdee3cd}
```
