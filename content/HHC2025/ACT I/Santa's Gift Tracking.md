---
title: Santa's Gift Tracking
Difficulty: ❄️----
order: 4
showToc: true
---

👨‍💻 Challenge provided by: [[Yori Kvitchko]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 27, 42  
🔗 Challenge URL: [Santa's Gift Tracking](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termGiftTracking)

## Challenge Description

```
Chat with Yori near the apartment building about Santa's mysterious gift tracker and unravel the holiday mystery.
```

## Helpful References

[An Introduction to the ss Command](https://www.linux.com/topic/networking/introduction-ss-command/)

## Solution

Once connected to the terminal, you are presented with additional context for the challenge:

```
======= Neighborhood Santa-Tracking Service =======

Oh no! Mischievous gnomes have tampered with the neighborhood's Santa-tracking service, built by the local tinkerer to help everyone know when Santa arrives on Christmas Eve!

The tracking application was originally configured to run on port 8080, but after the gnomes' meddling, it's nowhere to be found. Without this tracker, nobody in the neighborhood will know when to expect Santa's arrival!

The tinkerer needs your help to find out which port the santa_tracker process is 
currently using so the neighborhood tracking display can be updated before Christmas Eve!

Your task:
1. Use the 'ss' tool to identify which port the santa_tracker process is listening on
2. Connect to that port to verify the service is running

Hint: The ss command can show you all listening TCP ports and the processes using them. Try: ss -tlnp

Good luck, and thank you for helping save the neighborhood's Christmas spirit!

- The Neighborhood Tinkerer 🔧🎄
🎄 tinkerer @ Santa Tracker ~ 🎅 $ 
```

The `ss` command (socket statistics) is similar to the deprecated `netstat` utility. The options the description above tell us to use do the following:

* `-t`: view TCP connections.
* `-l`: list listening sockets.
* `-n`: disable name resolution and do not resolve port numbers into service names (e.g. showing http instead of port 80).
* `-p`: show process using socket.

We just need to execute the command in the terminal to find in what port `santa_tracker` is listening on:

```sh
🎄tinkerer @ Santa Tracker ~ 🎅 $ ss -tlnp
State    Recv-Q    Send-Q      Local Address:Port     Peer Address:Port  Process
LISTEN   0         5           0.0.0.0:12321          0.0.0.0:*                   
```

The output shows the service listening on port `12321`, so we can use `curl` to connect to it:

```json
🎄tinkerer @ Santa Tracker ~ 🎅 $ curl 127.0.0.1:12321
{
  "status": "success",
  "message": "\ud83c\udf84 Ho Ho Ho! Santa Tracker Successfully Connected! \ud83c\udf84",
  "santa_tracking_data": {
    "timestamp": "2025-11-06 16:05:13",
    "location": {
      "name": "Reindeer Ridge",
      "latitude": 57.566231,
      "longitude": -139.639762
    },
    "movement": {
      "speed": "1602 mph",
      "altitude": "17652 feet",
      "heading": "252\u00b0 NW"
    },
    "delivery_stats": {
      "gifts_delivered": 3624055,
      "cookies_eaten": 23067,
      "milk_consumed": "2022 gallons",
      "last_stop": "Candy Cane Court",
      "next_stop": "Twinkle Star Terrace",
      "time_to_next_stop": "1 minutes"
    },
    "reindeer_status": {
      "rudolph_nose_brightness": "96%",
      "favorite_reindeer_joke": "Why don't reindeer like picnics? Because of all the ants!",
      "reindeer_snack_preference": "snowflake sugar cubes"
    },
    "weather_conditions": {
      "temperature": "26\u00b0F",
      "condition": "Clear skies"
    },
    "special_note": "Thanks to your help finding the correct port, the neighborhood can now track Santa's arrival! The mischievous gnomes will be caught and will be put to work wrapping presents."
  }
```

## Extras

if you run `ls` in the home folder (`/home/tinkerer`), there is a `README.txt` file and a directory called `tools`. The contents of the readme file were:

```
Welcome!

Santa's gift-tracking service is missing!
You need to find what port it's running on amd connect to it to make sure it is working!

Available commands:
- ss (to check running services and ports)
- curl (to connect to services)
- telnet (an alternative way to connect)
- ls (to list files)
- cat (to view files)
- grep (to search text)
- clear (to clear the screen)

Good luck!
```

Inside `/home/tinkerer/tools` are the only executable that we are allowed to execute:

```sh
🎄tinkerer @ Santa Tracker ~ 🎅 $ ls tools/
cat  clear  curl  grep  ls  ss  telnet
```

They implemented this restriction by setting the path to that folder:

```sh
🎄tinkerer @ Santa Tracker ~ 🎅 $ echo $PATH
/home/tinkerer/tools
```

and by using `rbash` which restricts certain actions. More info about `rbash` can be found below:

https://www.gnu.org/software/bash/manual/html_node/The-Restricted-Shell.html

However, as mentioned in `README.txt`, we can also use `telnet` to solve the challenge:

```json
🎄tinkerer @ Santa Tracker ~ 🎅 $ telnet 127.0.0.1 12321
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1213
Connection: close

{
  "status": "success",
  "message": "\ud83c\udf84 Ho Ho Ho! Santa Tracker Successfully Connected! \ud83c\udf84",
  "santa_tracking_data": {
    "timestamp": "2025-11-29 12:54:40",
    "location": {
      "name": "Snowflake Valley",
      "latitude": 30.475314,
      "longitude": -131.86707
    },
    "movement": {
      "speed": "1590 mph",
      "altitude": "12653 feet",
      "heading": "107\u00b0 N"
    },
    "delivery_stats": {
      "gifts_delivered": 940847,
      "cookies_eaten": 10593,
      "milk_consumed": "3406 gallons",
      "last_stop": "Snowflake Valley",
      "next_stop": "Yuletide Gardens",
      "time_to_next_stop": "11 minutes"
    },
    "reindeer_status": {
      "rudolph_nose_brightness": "80%",
      "favorite_reindeer_joke": "How does Rudolph know when Christmas is coming? He looks at his calen-deer!",
      "reindeer_snack_preference": "festive hay bales"
    },
    "weather_conditions": {
      "temperature": "-7\u00b0F",
      "condition": "Holiday sparkles"
    },
    "special_note": "Thanks to your help finding the correct port, the neighborhood can now track Santa's arrival! The mischievous gnomes will be caught and will be put to work wrapping presents."
  }
}Connection closed by foreign host.
```