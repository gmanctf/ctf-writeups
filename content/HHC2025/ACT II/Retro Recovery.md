---
title: Retro Recovery
tags:
  - offline-solvable
Difficulty: ❄️❄️---
order: 1
showToc: true
---

👨‍💻 Challenge provided by: [[Mark DeVito]]  
🗺️ Location: Retro Emporium - Area: retroshop. Coordinates: 3, 6  
<img src="HHC2025/images/floppy.png" width="18" class="inline-left">Challenge File: [floppy.img](https://www.holidayhackchallenge.com/2025/assets/floppy.img)  
<img src="HHC2025/images/github-logo.png" width="18" class="inline-left">GitHub URL (if HHC2025 is no longer available): [floppy.img](https://github.com/gmanctf/2025-HHC/blob/main/Retro%20Recovery/floppy.img)

## Challenge Description

```
Join Mark in the retro shop. Analyze his disk image for a blast from the retro past and recover some classic treasures.
```

The `floppy.img` in the inventory has the following description:

```
You got yourself a floppy disk image from an old IBM PC! Retro!!!!
```

## Solution

Mark gives us a floppy disk that we can download from the inventory. To solve the challenge, we can run `strings` on the file:

```sh
strings floppy.img | less
```

One line in the output stands out relatively close to the beginning:

```qb64
211 REM bWVycnkgY2hyaXN0bWFzIHRvIGFsbCBhbmQgdG8gYWxsIGEgZ29vZCBuaWdodAo=
```

The Base64 string decodes to: `merry christmas to all and to all a good night`.

Solution: ==merry christmas to all and to all a good night==

## Extras

The solution provided above is the easy way, and who likes the easy way? To check an alternative solution (probably the intended one) and instructions on how to play the game, head to [[Retro Fun]].