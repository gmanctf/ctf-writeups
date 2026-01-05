---
title: Going in Reverse
tags:
  - offline-solvable
Difficulty: ❄️❄️---
order: 7
showToc: true
---

👨‍💻 Challenge provided by: [[Kevin McFarland]]  
🗺️ Location: Retro Emporium - Area: retroshop. Coordinates: 12, 4  
<img src="HHC2025/images/basic.png" width="18" class="inline-left">Challenge File: [login.bas](https://www.holidayhackchallenge.com/2025/assets/login.bas)  
<img src="HHC2025/images/github-logo.png" width="18" class="inline-left">GitHub URL (if HHC2025 is no longer available): [login.bas](https://github.com/gmanctf/2025-HHC/blob/main/Going%20in%20Reverse/login.bas)

## Challenge Description

```
Kevin in the Retro Store needs help rewinding tech and going in reverse. Extract the flag and enter it here.
```

## Helpful References

[C64 BASIC wiki](https://www.c64-wiki.com/wiki/BASIC) - Check the end of the page for links to specific commands.  
[FreeBASIC](https://www.freebasic.net/wiki/FreeBASIC)

## Solution

`login.bas` contains the following code written in Commodore 64 BASIC:

```
10 REM *** COMMODORE 64 SECURITY SYSTEM ***
20 ENC_PASS$ = "D13URKBT"
30 ENC_FLAG$ = "DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz" ' old "DSA|qnisf`bX_huXariz"
40 INPUT "ENTER PASSWORD: "; PASS$
50 IF LEN(PASS$) <> LEN(ENC_PASS$) THEN GOTO 90
60 FOR I = 1 TO LEN(PASS$)
70 IF CHR$(ASC(MID$(PASS$,I,1)) XOR 7) <> MID$(ENC_PASS$,I,1) THEN GOTO 90
80 NEXT I
85 FLAG$ = "" : FOR I = 1 TO LEN(ENC_FLAG$) : FLAG$ = FLAG$ + CHR$(ASC(MID$(ENC_FLAG$,I,1)) XOR 7) : NEXT I : PRINT FLAG$
90 PRINT "ACCESS DENIED"
100 END
```

Looking at the code, there are a few key aspects worth highlighting:

```
ENC_PASS$ = "D13URKBT"
ENC_FLAG$ = "DSA|auhts*wkfi=dhjwubtthut+dhhkfis+hnkz" ' old "DSA|qnisf`bX_huXariz"
FLAG$ = "" : FOR I = 1 TO LEN(ENC_FLAG$) : FLAG$ = FLAG$ + CHR$(ASC(MID$(ENC_FLAG$,I,1)) XOR 7) : NEXT I : PRINT FLAG$
```

From this, we can see that the program stores an encrypted password in the `ENC_PASS$` variable, an encrypted flag in `ENC_FLAG$`, and performs an XOR operation using the decimal value `7` as the key. I tried in CyberChef and indeed that was the solution:

[CyberChef recipe with the solution](https://gchq.github.io/CyberChef/#recipe=XOR(%7B'option':'Decimal','string':'7'%7D,'Standard',false)&input=RFNBfGF1aHRzKndrZmk9ZGhqd3VidHRodXQrZGhoa2Zpcytobmt6CkRTQXxxbmlzZmBiWF9odVhhcml6CkQxM1VSS0JU&oeol=CR)

![[going-in-reverse.png]]

Solution: ==CTF{frost-plan:compressors,coolant,oil}==

## Extras

Check [[Retro Fun]] in the Extras section to learn how to compile and execute the program, as well as for a detailed line-by-line explanation of `login.bas`.
