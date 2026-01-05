---
title: "Intro to Nmap"
tags:
- nmap
Difficulty: ❄️----
order: 7
showToc: true
---
👨‍💻   Challenge provided by: [[Eric Pursley|Eric Pursley]]  
🗺️   Location: The Neighborhood - Area: City. Coordinates: 78, 19  
<img src="HHC2025/images/eric-moto.png" width="25" class="inline-left"> Challenge URL: [Nmap terminal](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termNmap) 

## Challenge Description

```
Meet Eric in the hotel parking lot for Nmap know-how and scanning secrets. Help him connect to the wardriving rig on his motorcycle!
```

## Helpful References

[Nmap Reference Guide]https://nmap.org/book/man.html  
[SANS Nmap cheatsheet](https://assets.contentstack.io/v3/assets/blt36c2e63521272fdc/blte37ba962036d487b/5eb08aae26a7212f2db1c1da/NmapCheatSheetv1.1.pdf)

## Solution

Once you arrive at the hotel parking, click on Eric's motorcycle to start the challenge.

![[eric-moto.png]]

This challenge covers the basics of Nmap. Check the reference section if it is your first time using this tool or if you need to refresh your memory. When you click the terminal, you will get the following description about the challenge:

```
Welcome to the Intro to Nmap terminal! We will learn some Nmap basics by running commands to answer the questions asked, which will guide us in finding and connecting to the wardriving rig's service. 
Run the command "hint" to receive a hint.
```

Type `y` and press enter to start the challenge. You will need to answer a few different questions to complete it.

>**1) When run without any options, nmap performs a TCP port scan of the top 1000 ports. Run a default nmap scan of 127.0.12.25 and see which port is open.**

The default Nmap scan syntax is as follows: `nmap <ip>`. So, to answer the question we simply execute:

```sh
nmap 127.0.12.25
```

>**2) Sometimes the top 1000 ports are not enough. Run an nmap scan of all TCP ports on 127.0.12.25 and see which port is open.**

The `-p` option tells Nmap which ports to scan. We can use the option `-p-` to indicate all the ports. Alternatively, you can also provide the entire port range with `-p 1-65535`:

```sh
nmap 127.0.12.25 -p-
```

>**3) Nmap can also scan a range of IP addresses. Scan the range 127.0.12.20 - 127.0.12.28 and see which has a port open.**

We can specify a range by using `<range start>-<range end>`, in this case, 20-28:

```sh
nmap 127.0.12.20-28 -p-
```

>**4) Nmap has a version detection engine, to help determine what services are running on a given port. What service is running on 127.0.12.25 TCP port 8080?**

We can specify version detection with the option `-sV`:

```sh
nmap -sV 127.0.12.25 -p 8080
```

>**5) Sometimes you just want to interact with a port, which is a perfect job for Ncat!  Use the ncat tool to connect to TCP port 24601 on 127.0.12.25 and view the banner returned.**

Ncat uses the following syntax:

`nc <ip> <port>`

Sending the following command will solve the question:

```sh
nc 127.0.12.25 24601
```


>**Congratulations, you finished the Intro to Nmap and found the wardriving rig's service! Type "exit" to close...**

## Command Summary

```sh
y
nmap 127.0.12.25
nmap 127.0.12.25 -p-
nmap 127.0.12.20-28 -p-
nmap -sV 127.0.12.25 -p 8080
nc 127.0.12.25 24601
exit
```

## Extras

I wanted to build a script to solve the challenge, so I started exploring how the communication with the terminal worked. This led me to expand this idea to other challenges and I learned a ton about how the HHC environment works by doing so. You can find what I did at [[HHC2025 Pwn Script]].