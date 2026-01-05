---
title: Find and Shutdown Frosty's Snowglobe Machine
Difficulty: ❄️❄️❄️--
order: 5
showToc: true
---

👨‍💻 Challenge provided by: [[Elder Gnome]]  
🗺️ Location: `¯\_(ツ)_/¯`  Note: don't forget your 🧭

## Challenge Description

```
You've heard murmurings around the city about a wise, elderly gnome having a change of heart. He must have information about where Frosty's Snowglobe Machine is. You should find and talk to the gnome so you can get some help with how to make your way through the Data Center's labrynthian halls.

Once you find the Snowglobe Machine, figure out how to shut it down and melt Frosty's cold, nefarious plans.
```

## Hints

Talking with the [[Elder Gnome]] will provide you with a few useful hints to find the machine:

### A Code in the Dark, You Must Find

```
The Elder Gnome said the route to the old secret lab inside the Data Center starts on the far East wing inside the building, and that the hallways leading to it are probably pitch dark. He also said the employees that used to work there left some kind of code outside the building as a reminder of the route. Perhaps you can search in the vicinity of the Data Center for this code.
```
### Backwards, You Should Look

```
The Elder also recalled a story of another "computer person" like yourself who managed to find an intern that got lost inside the Data Center about 10 years ago. But that was before the reconstruction, so the current route likely isn't exactly the same. Maybe you can search for the Data Center's past in the historical archives that is the Internet for more information that may be helpful.
```

## Solution

The [[Elder Gnome]] mentions: "the hallways leading to it are probably pitch dark". If we enter the Data Center, there is a door that takes us to the Data Center Corridors (Area Id: datacentermaze) that matches that description. If we continue the path (make sure you ignore the area with the lift and enter again a pitch dark area after it), we eventually arrive to an area where we are surrounded by doors that have the following symbols on top (A, B, ↑):
![[datacentermaze.png]]

If you try to enter the doors randomly, it looks like if you access what it is considered to be the correct door, you move to the next area (with the same doors) and if you choose the incorrect one, you are kicked out of the data center and appear back in the city. Given that there are several rooms with 12 doors each time, brute-forcing the maze could take a while. Time to check the hints again. Given this sentence: `employees that used to work there left some kind of code outside the building as a reminder of the route` and the fact that it was hard to get a view of all walls and structures of the data center from the game, I decided to download all the images for the data center. There are multiple ways to do it, but I used the browser dev tools, checked the sources, and downloaded the images from the folder `/images/buildings`:

https://2025.holidayhackchallenge.com/images/buildings/datacenter_front.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_left.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_rear.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_right.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_roof.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_shack_front.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_shack_rear.png  
https://2025.holidayhackchallenge.com/images/buildings/datacenter_shack_side.png

datacenter_rear.png has some brick pattern that looks interesting:

![[snowglobe-1.png]]

Each line has exactly 8 bricks, so my first thought was that it could be ASCII in binary. I used CyberChef and tested it considering black = 0 and grey = 1. Below the result, starting from the bottom-right line to the top-left line:

```
01001011
01101111
01101110
01100001
01101101
01101001
```

It translates to **Konami**. Click [here](https://gchq.github.io/CyberChef/#recipe=From_Binary('Space',8)&input=MDEwMDEwMTEKMDExMDExMTEKMDExMDExMTAKMDExMDAwMDEKMDExMDExMDEKMDExMDEwMDE&oeol=CR) for the solution in CyberChef.

The [[Elder Gnome]] hint also mentions: "search for the Data Center's past in the historical archives that is the Internet for more information".

Googling what the meaning of "Konami" could be in this context, I found that it refers to the [Konami Code](https://en.wikipedia.org/wiki/Konami_Code), a popular cheat code in Konami video games which is:

↑↑↓↓←→←→BA

Great! that matches the door labels. As per the hint, we need to do it backwards:

A B → ← → ← ↓ ↓ ↑ ↑

Now that we know the code, enter the maze through any door (I entered through ↑ but the first door does not matter), place north up so that the door A is on the left and B on the right:

![[snowglobe-2.png|200]]

Then follow the code and you will end in Frosty's Snowglobe Lab:

![[snowglobe-3.png]]

I got the achievement with the objective completion when I left the lab. The Snow Crystal in the image below was also added to my inventory. I believe I was supposed to click on it to add it to my inventory while in the lab to complete the objective but for whatever reason I could not click it.

![[snowcrystal.png]]

## Extras

I found at least 3 alternative ways to complete the objective.

### CTF Style Bypass

This year, players of HHC had the option to play in CTF mode rather than using the traditional HHC interface. This challenge could be completed by accessing CTF Style mode and getting the Snow Crystal item that way:

![[snowglobe-4.png]]

![[snowglobe-5.png]]

### A Hidden North Star

Another trick was to abuse the fact that the implementation of where the doors would take you to was done client-side. By using the developer tools, we could use inspect element to select a door and see where it would take us. The incorrect doors had a label with the name `datacentermaze-city` while the correct ones had a label with the next section of the maze, for example `datacenter2-datacenter3`. The below image is a side by side comparison of the same room for 2 different doors:

![[snowglobe-6.png]]

This also showed me that actually it did not matter which 'A' or 'B' you followed and for the arrows it did not matter any of the 3 doors as long as it was in that direction (for example, if next move was right, all 3 doors to the right would take you to the next section).

### Warping through the map for fun and profit

Thanks to the hide and seek games that Counterhack crew organized this year, I spent some time looking at the mechanics of how characters move around the map, how to find other players, etc. Check [[Hide & Seek]] for more details. This led me to find that it was possible to find all "hidden" rooms by checking `AAANNNDD_SCENE` web socket messages when a new area is loaded. That message tends to be quite large because it contains quite a few details, the one we are interested in to find rooms is the `entrance` section. This section contains all the rooms that it is possible to reach from the room we just entered (basically, it lists all the locations of the doors and where they go to). The below is an example from the `entrance` section in the `AAANNNDD_SCENE` web socket message that the server sends when we enter the Data Center Corridors:

```
"entrance":[{"id":"gnomefactory-datacenter","x":25,"y":-12},{"id":"reset","x":41,"y":-8},{"id":"datacenter-datacentermaze","x":10,"y":1},{"id":"datacenter1-datacenter2","x":0,"y":25},{"id":"datacenter3-datacenter4","x":15,"y":25},{"id":"datacenter2-datacenter3","x":30,"y":25},{"id":"datacenter4-datacenter5","x":0,"y":40},{"id":"datacenter6-datacenter7","x":15,"y":40},{"id":"datacenter5-datacenter6","x":30,"y":40},{"id":"datacenter8-datacenter9","x":0,"y":54},{"id":"datacenter9-datacenter10","x":15,"y":54},{"id":"datacenter7-datacenter8","x":30,"y":54},{"id":"snowlab-datacenter11","x":14,"y":74},{"id":"datacenter10-datacenter11","x":15,"y":78}]}
```

Each `id` has a format of `room1-room2`, and from what I saw in the messages across the game, we need the first half (room1 in that example). Therefore, we can parse `entrance` to extract all destinations by doing `entrance.id.split('-')[0]`. In the message above, we would get:

```
gnomefactory
datacenter
datacenter1
datacenter2
...truncated...
datacenter10
snowlab
```

datacenterX are not valid rooms, but nevertheless, our target (snowlab) is in the list. When you use the map to change locations, the web socket message `TELEPORT_USER` is sent. We can use the same message to teleport ourselves to the Snow Lab and finish the challenge:

```js
const message = JSON.stringify({
    type: 'TELEPORT_USER',
    destination: 'snowlab',
    entranceName: 'reset'
});
window.__gameWebSocket.send(message);
```

To learn how to use the above JavaScript from the console of your dev tools, check [[Hide & Seek]].

Note: technically, the above would provide a 4th option to complete this challenge. We could just follow the doors that match the coordinates from `entrance` in the `AAANNNDD_SCENE` web socket message.