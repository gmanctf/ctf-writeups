---
title: Easter Eggs
showToc: true
---
## Eggs and other curiosities

### Literally an Easter Egg

The map had a very literal Easter Egg (`literallyjustaneasteregg.png`):

![[literallyjustaneasteregg.png]]

It was located at the bottom of a tree in the city, near the middle road in the right corner, at coordinates 103, 30:

![[literallyjustaneasteregg-2.png||200]]

### Eggs at Snowblind

In [[Snowblind Ambush]] we had to deal with deactivating Frosty's plan. As part of this, we got access to Frosty's Chilling Dashboard. The webpage was loading a JavaScript file called `egg.js`. This script allowed you to activate Frosty Mode! You can trigger it from the browser’s dev console by executing:

`window.frostyMode()`

This displayed a message, caused a sleigh to appear, and played the song Jingle Bells.

![[snowblind-frostymode.png]]

This was the code and shows what was happening when calling `frostyMode()`:

```js
frostyMode() {
    console.log("❄️ Frosties secret function!");
    createSnowfall();
    createFrostySleigh();
    playJingleBells();
    return "❄️ Stay Cool! ❄️";
}
```

### Who let the dogs out?

The map was featuring 2 dogs. One of them was [JJs girl](https://2025.holidayhackchallenge.com/images/scenery/city/jjsgirl.png):

![[jjsgirl.png.png]]

She is likely [[Janusz Jasinski]]'s dog, especially thinking that she was next to the entrance of the 24-Seven store, patiently waiting for her owner.

The second dog was [Maggie](https://2025.holidayhackchallenge.com/images/scenery/city/maggie_[0.5].png):

![[maggie.png.png]]

She was also in the city, next to the data center. Based on proximity, it could be [[Kyle Parrish]]'s dog, but it is hard to know for sure.

### NetWars video

The screen in the NetWars room was playing a promo video for SANS Skills Quest by NetWars (SSQ):

[2025.holidayhackchallenge.com/video/ssq.mp4](https://2025.holidayhackchallenge.com/video/ssq.mp4)

Watching the video gave me some nostalgia when I noticed the challenge Elf Code from HHC2021:

![[SSQ-elfcode.png||500]]

## "Music" in the Datacenter

The ambience sound in the datacenter was a hint about what was coming. When approaching the door to the Data Center Corridors inside the Data Center, you would hear the following ambience sound:

[2025.holidayhackchallenge.com/sfx%2Fambiance-datacenterCorridors.mp3](https://2025.holidayhackchallenge.com/sfx%2Fambiance-datacenterCorridors.mp3)

That was the only spot in that room where you could hear the sound and it was a hint that a little exploring could reveal more secrets. Once inside the corridors, another 2 ambience sounds were loaded to continue encouraging you to explore the corridors in search of the Snow Lab:

[2025.holidayhackchallenge.com/sfx%2Fsnowglobe_quiet.mp3](https://2025.holidayhackchallenge.com/sfx%2Fsnowglobe_quiet.mp3)  
[2025.holidayhackchallenge.com/sfx%2Fambiance-snowlab_quiet.mp3](https://2025.holidayhackchallenge.com/sfx%2Fambiance-snowlab_quiet.mp3)

### Shenanigans

This "secret" room was there in previous years of the HHC. You can get there by visiting a destination that does not exist when sending a `TELEPORT_USER` message, for example:

```js
const message = JSON.stringify({
    type: 'TELEPORT_USER',
    destination: 'random',
    entranceName: 'reset'
});
window.__gameWebSocket.send(message);
```

![[shenanigans.png]]

You can learn more about how this works and teleporting yourself around the HHC world at [[Hide & Seek]].

## References

### References in Sasabune

Exploiting the IDOR vulnerability from [[IDORable Bistro]] allowed us to get a bunch of data from the Sasabune restaurant receipts. The customer names and accompanying notes included some references (and bad jokes):

1. **Receipt ID 108**: The customer was Joshua Wright and the note was: "Successfully rick-rolled the restaurant's smart speakers using a Flipper Zero. We were not amused, but the other diners were." The rick-roll in a meme/prank where the song "Never Gonna Give You Up" unexpectedly appears. So the note means that Joshua used a Flipper Zero to make the song play in Sasabune's speakers.
2. **Receipt ID 122**: Jared Falkins left us a joke: "Why did the sushi blush? Because it saw the ginger dressing!"
3. **Receipt ID 149**: The customer ("Thomas Anderson") and his question ("Asked if he was living in a simulation") are a direct reference to the protagonist of The Matrix movies. The waiter's response ("I'm not supposed to tell you") and his order "The Matrix Maki" and "The One Onigiri" are a clear confirmation.
4. **Receipt ID 150**: Susan Clark orders "The 'I'm not a regular mom, I'm a cool mom' Roll". This is a reference of the quote from the character Amy Poehler in the movie "Mean Girls".

### References in Mail Detective

1. The emails have obvious references to [HHC2015 - Gnome in Your Home](https://www.holidayhackchallenge.com/2015/index.html). The Gnome in Your Home topic is referenced, so are the siblings Jessica and Joshua (Cc: "Jessica and Joshua" `siblings@dosisneighborhood.mail`), and ATNAS Corporation (e.g. ATNAS Recon Unit" `recon.unit@atnas.mail`). Note that ATNAS is SANTA in reverse.
2. There are several references to the number 47 (an order for 47 tiny pizzas, 1**47** bottle caps, 47 thimbles). I interpreted it was a reference to GNOME Desktop version 47, which was launched on 18 September 2024 and at the time the emails were sent, it was the latest version.
3. There are many cross-references within the game. One of my favorites was the fact that Tony Pepperoni is the owner of Tony's Pizza Palace. One of the receipts from Sasabune is from Tony and the note says: "Kept saying 'This is good, but it's not pizza.' We are aware, Tony. We are aware." The order reference Italian disses (The 'Fuggedaboutit' Futomaki and Cannoli Hand Roll).
4. Another example of a cross reference is that multiple emails mention cameras. For example, the second email in the inbox says: "Also, side note: whoever's been stealing my prize-winning turnips better stop it! I've got security cameras now (well, my grandson set up his old webcam), so I'll catch you red-handed!". The Wi-Fi SSIDs we can see in the Wi-Fi router from [[Dosis Network Down]] includes this one: Wise-Camera-Garage. The MAC address `c8:3a:35:34:56:78` is assigned to Tenda, which indeed sells IP cameras. Was perhaps a [Tenda RH9-WCA]([IP Camera - Tenda Global(English)](https://www.tendacn.com/product/RH9-WCA)) the camera the grandson was trying to set up? or is it the camera feed from [[Rogue Gnome Identity Provider]]?

![[extras-easter-egg.png|200]]

### References in Gnome Tea

The entire challenge is a reference to the security breach suffered by the women's dating app Tea: https://www.reuters.com/sustainability/boards-policy-regulation/womens-dating-app-tea-reports-72000-images-stolen-security-breach-2025-07-26/

We can see the GnomeTea logo and the Tea app logo below:

![[Teas-merged.png]]

## Hidden Achievements

### Jason

As it is tradition, our friend Jason was present in the open world. Jason was located in the `city` area at coordinates 96,8. This time Jason was a... I don't know... a leak from a fire hydrant or... a leak from JJ's dog. Here is his picture:

https://2025.holidayhackchallenge.com/images/jason.png

![[jason.png]]

And here is a picture of me sharing war stories with Jason:

![[extras-jason-1.png|200]]

```
Hi there, I'm Jason!
Hmmm, I guess I’m in streaming mode this year!
```

Once you talk with him, you get the `I found Jason!!!` achievement:

![[extras-jason-2.png]]

### Gnome Chatter

You can get the `Gnome Chatter` achievement if you talk with all the gnomes in the `city` are of the map:

![[extras-gnome-chatter.png]]

## Dosis Wi-Fi networks

In the challenge [[Dosis Network Down]] we compromised a Wi-Fi router. By checking the contents of `dhcp.leases` using the payload `operation=write&country=$(cat /tmp/dhcp.leases)`, we can see all the Wi-Fi networks in the neighborhood:

```
# DHCP leases file - DOSIS-Link AX1800 Router
# Format: lease_expiry mac_address ip_address hostname client_id
# Lease expiry is Unix timestamp

1735689600 b8:27:eb:a4:2f:11 192.168.1.102 Dosis-LapBook-Pro 01:b8:27:eb:a4:2f:11
1735689615 ac:bc:32:d4:5e:78 192.168.1.103 Jessica-iPhone *
1735689630 54:52:00:12:34:56 192.168.1.104 Joshua-Gaming-PC *
1735689645 08:00:27:fe:dc:ba 192.168.1.105 Smart-TV-Living-Room *
1735689660 2c:f0:5d:88:99:aa 192.168.1.106 RainForest-Repeat-Kitchen *
1735689675 dc:a6:32:11:22:33 192.168.1.107 DingDong-Doorbell-Front *
1735689690 f4:f5:d8:44:55:66 192.168.1.108 BirdBed-Thermostat *
1735689705 00:17:88:77:88:99 192.168.1.109 Philipe-Hugh-Bridge *
1735689735 28:6d:97:aa:bb:cc 192.168.1.111 Neighbors-WiFi-Extender *
1735689750 5c:cf:7f:dd:ee:ff 192.168.1.112 FredSang-SmartFridge *
1735689780 18:b4:30:12:34:ab 192.168.1.114 ePad-Kids-Room *
1735689795 9c:b6:d0:cd:ef:12 192.168.1.115 NineTenDo-Switcher *
1735689825 e4:5f:01:23:45:67 192.168.1.117 Laptop-Guest-Bedroom *
1735689840 34:97:f6:78:90:ab 192.168.1.118 Duku-Master-Bedroom *
1735689855 3c:07:54:89:ab:cd 192.168.1.119 Printer-Office *
1735689885 44:85:00:de:f0:12 192.168.1.121 Alset-Model3 *
1735689915 c8:3a:35:34:56:78 192.168.1.123 Wise-Camera-Garage *
1735689930 70:3a:cb:90:12:34 192.168.1.124 Glugle-BirdBed-Mini *
1735689960 a0:20:a6:56:78:90 192.168.1.126 Sisters-Printer-Basement *
1735689975 fc:aa:bb:cc:dd:07 192.168.1.127 COOLANT-SYSTEM-PRIMARY *
1735689990 6c:96:cf:ab:cd:ef 192.168.1.128 Flexa-Repeat-Dot-Bedroom *
1735690020 04:d9:f5:12:34:56 192.168.1.130 Kronos-Speaker-Kitchen *
1735690050 b4:75:0e:78:90:12 192.168.1.132 ShineyBlast-Living-Room *
1735690080 68:ff:7b:34:56:78 192.168.1.134 Tablet-Kitchen *
1735690095 f0:9f:c2:90:ab:cd 192.168.1.135 Smart-Doorlock-Front *
1735690110 fc:aa:bb:cc:dd:0b 192.168.1.136 THERMAL-REGULATION-HUB *
1735690125 00:50:56:ef:12:34 192.168.1.137 Security-Camera-Backyard *
1735690155 ac:87:a3:56:78:90 192.168.1.139 YBox-Series-Y *
1735690170 14:dd:a9:ab:cd:ef 192.168.1.140 Smart-Lights-Controller *
1735690185 fc:aa:bb:cc:dd:0d 192.168.1.141 CRYOGENIC-BACKUP-SYS *
1735690200 88:e9:fe:12:34:56 192.168.1.142 Neighbors-Guest-Phone *
1735690225 c0:1d:sn:0w:c0:de 192.168.1.145 OPERATION-SNOWGLOBE-COMMAND *
1735690230 20:4c:03:78:90:ab 192.168.1.144 LapBook-Sea-Office *
```

We can see that a few of the networks are set up as part of Frosty's nefarious plans (with one MAC address named `c0:1d:sn:0w:c0:de` = cold snow code):

```
c0:1d:sn:0w:c0:de 192.168.1.145 OPERATION-SNOWGLOBE-COMMAND *
fc:aa:bb:cc:dd:0b 192.168.1.136 THERMAL-REGULATION-HUB *
fc:aa:bb:cc:dd:07 192.168.1.127 COOLANT-SYSTEM-PRIMARY *
fc:aa:bb:cc:dd:0d 192.168.1.141 CRYOGENIC-BACKUP-SYS *
```

If you look up the MAC addresses there's a combination of made up addresses and some that match the device the SSID describes. 

## Rogue Gnome

In the final step of the challenge, you login as admin to the AtnasCorp Gnome Diagnostic Interface. The interface loads an image, as can be seen from the below code excerpt:

`<img src='/camera-feed'`

This is the image displayed in the camera feed:

![[camera-feed.png]]

I also noticed that the server had accounts for all the Counterhack characters in the game and for Santa. I listed the accounts by checking `/etc/passwd` as well as the home folders:

```
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash
ed:x:2001:2000:Ed:/home/ed:/bin/bash
josh:x:2002:2000:Josh:/home/josh:/bin/bash
lynn:x:2003:2000:Lynn:/home/lynn:/bin/bash
patrick:x:2004:2000:Patrick:/home/patrick:/bin/bash
paul:x:2005:2000:Paul:/home/paul:/bin/bash
evan:x:2006:2000:Evan:/home/evan:/bin/bash
thomas:x:2007:2000:Thomas:/home/thomas:/bin/bash
chris:x:2008:2000:Chris:/home/chris:/bin/bash
mark:x:2009:2000:Mark:/home/mark:/bin/bash
chrise:x:2010:2000:Chris E:/home/chrise:/bin/bash
jared:x:2011:2000:Jared:/home/jared:/bin/bash
charlie:x:2012:2000:Charlie:/home/charlie:/bin/bash
tom:x:2013:2000:Tom:/home/tom:/bin/bash
jj:x:2014:2000:JJ:/home/jj:/bin/bash
kevin:x:2015:2000:Kevin:/home/kevin:/bin/bash
kyle:x:2016:2000:Kyle:/home/kyle:/bin/bash
eric:x:2017:2000:Eric:/home/eric:/bin/bash
torkel:x:2018:2000:Torkel:/home/torkel:/bin/bash
idp:x:5000:5000:Identity Provider Service Account:/home/idp:/sbin/nologin
gnome:x:7000:7000:Gnome:/home/gnome:/sbin/nologin
santa:x:9999:9999:Santa Claus:/home/santa:/bin/bash

ls /home/
charlie  chris  chrise  ed  eric  evan  gnome  idp  jared  jj  josh  kevin  kyle  lynn  mark  patrick  paul  santa  thomas  tom  torkel  ubuntu
```

This made me think that maybe there was an Easter Egg challenge so one of the things I tried was to check my sudo permissions:

```sh
sudo -l
Matching Defaults entries for paul on ce6c18a2c427:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User paul may run the following commands on ce6c18a2c427:
    (root) NOPASSWD: /usr/sbin/host-setup
```

Interesting, we can run `/usr/sbin/host-setup` with root privileges without a password. I tried to check the file but I had no permissions to read it. So I executed it to see what it does:

```
sudo /usr/sbin/host-setup 
This rabbit hole seems interesting, but it leads to Wonderland, not the flag.
```

Other than the above reference to Alice in Wonderland, I could not find anything that would allow me to escalate privileges. I also found the below "flag": 

```
cat /flag.txt 
HHC{ReplaceMe}
```

And a file (`/tmp/a`) listing the path to the python files for the servers running on the machine:

```
cat /tmp/a 
/usr/sbin/idp/identity_provider.py
/usr/sbin/gnome/gnome-diagnostic-interface.py
```

## A weather plot with Snowcat

After getting root permission in the [[Snowcat RCE & Priv Esc]] challenge, I enumerated the server and found some files relevant to the plot:

```
cat /home/weather/notes
The average daily temperature has been decreasing by 0.25 'C per day.
```

```
cat /root/goal
Lower average winter temperature to -15.4 'C
Lower average summer temperature to -3.7 'C
```

```
cat /home/icy/goal
Lower average winter temperature to -15.4 'C
Lower average summer temperature to -3.7 'C
```

Looks like Frosty's target was to keep the average temperature at -15.4 degrees in winter and -3.7 degrees in summer. Too chilly for [[Olivia]] (and for me...).

## HHC in Podcasts

Not really an Easter Egg, but there's some interesting facts that the Counterhack crew mentions in podcasts about HHC 2025 and I wanted to leave the links here for reference:

[Paul's Security Weekly - Holiday Hack Challenge, AI, Internet of Trash – Ed Skoudis – PSW #903](https://www.scworld.com/podcast-segment/14626-holiday-hack-challenge-ai-internet-of-trash-ed-skoudis-psw-903)

[SANS Stormcast Friday, November 14th, 2025: SmartApeSG and ClickFix; Formbook Obfuscation Tricks; Sudo-rs Vulnerabilities; SANS Holiday Hack Challenge](https://isc.sans.edu/podcastdetail/9700) - From minute 5.

Intro video for HHC2025: [Welcome to the SANS Holiday Hack Challenge 2025](https://www.youtube.com/watch?v=mwvvwRfROm0)

## A Conspiracy Theory

As part of searching for Easter Eggs I started to create a conspiracy theory that is very unlikely to be a real Easter Egg added to the game on purpose. However, I had fun creating it so I decided to add it in the Easter Eggs entry. And why not, maybe the archenemy I created could be put to good use for next year's HHC 😁. 

### WarDriver 9000

In [[Intro to Nmap]] the last step is to perform an `nc` command and the server replies:

`Welcome to the WarDriver 9000!`

Given the current AI hype and the fact that the last challenge features an LLM, my conspiracy theory is that it is a reference to [HAL 9000](https://en.wikipedia.org/wiki/HAL_9000). HAL 9000 is a fictional AI system from the movie 2001: A Space Odyssey.

![[HAL9000.png]]

### It's All About Defang

The logo that appears after completing the challenge caught my attention because "operation" and "center" were misspelled, so I decided to check it more in detail. I used `exiftool` to check the image metadata and found out that it was created with AI using DALL-E:

![[defang-logo-analysis.png]]

The word "senter" could be referring to an AI sentinel watching over The Neighborhood, and therefore related to my earlier HAL 9000 reference. This AI sentinel would be the chat bot we needed to defeat in [[Snowblind Ambush]].

Here is the logo for reference:

![[logo.png|500]]

### Rogue Gnome

The AI sentinel was also carefully watching and controlling the camera feed available at `http://gnome-48371.atnascorp/camera-feed`. As we can see below, the image was created with ChatGPT:

![[rogue-gnome-image-analysis.png]]
### My Final Conspiracy Theory

Frosty could not have done his plan alone. Given the above facts, all very strong evidence, I'm quite sure that there was a wicked AI sentinel behind it all. The AI was sending orders to all gnomes to steal resistors, motors, turnips, screws, thimbles and even Granny Crumbleton's cookies. It started a phishing campaign a year ago and it created the malicious JavaScript emails sent to everyone in the neighborhood!

Was the AI the one removing the CAN commands to move GnomeBot? You can arrive to your own conclusion.

I even think this AI was also manipulating Frosty Borg. Frosty is good at heart, he could not have come up with the plan to permanently freeze Dosis Neighborhood without the AI influence.

The AI is hiding in the Data Center. We won the battle to save 2025's Christmas, but the war is not over. The AI will come back next year with a new plan. Its motive? Someone added Jack Frost's plans to the training data used to create the model.






