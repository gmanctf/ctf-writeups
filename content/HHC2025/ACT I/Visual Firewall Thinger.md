---
title: Visual Firewall Thinger
Difficulty: ❄️----
order: 6
showToc: true
---

👨‍💻 Challenge provided by: [[Chris Elgee]]  
🗺️ Location: NetWars (Grand Hotel) - Area: netwars. Coordinates: 1, 2  
🔗 Challenge URL: [Holiday Firewall Simulator](https://visual-firewall.holidayhackchallenge.com/?&challenge=termVisfirewall)
## Challenge Description

```
Find Elgee in the big hotel for a firewall frolic and some techy fun.
```

## Helpful References

[Learn About Firewalls](https://visual-firewall.holidayhackchallenge.com/learn)

## Solution

Click on the server rack to start the challenge:

![[server_rack.png|100]]

This opens a web page containing the Firewall Simulator:

![[visual-firewall-1.png|700]]

Our goal is to configure the firewall rules for each security zone:

![[visual-firewall-2.png|700]]

The challenge provides the following network topology to aid with our task:

![[visual-firewall-3.png|700]]

Let's implement the rules for each zone then:

### Internet to DMZ: Allow only HTTP and HTTPS traffic

Click Internet. Select HTTPS (Port 443) and HTTP (Port 80). Click Save Rules.

![[visual-firewall-4.png|700]]


### DMZ to Internal: Allow HTTP, HTTPS, and SSH traffic and Internal to DMZ: Allow HTTP, HTTPS, and SSH traffic

Click DMZ. Click Connection to Internal Network.  Select HTTPS (Port 443), HTTP (Port 80), and SSH (Port 22). Click Save Rules.

### Internal to Cloud: Allow HTTP, HTTPS, SSH, and SMTP traffic

Click Internal Network. Click Connection to Cloud Services. Select HTTPS (Port 443), HTTP (Port 80), SSH (Port 22), and SMTP (Port 25). Click Save Rules.

### Internal to Workstations: Allow all traffic types

Click Internal Network. Click Connection to Workstations. Select all options: HTTPS (Port 443), HTTP (Port 80), SSH (Port 22), and SMTP (Port 25), DNS (Port 53), and SMB (Port 445). Click Save Rules.

Once all the rules are configured, the following message appears, indicating that the challenge has been completed:

![[visual-firewall-5.png]]

## Extras

The web page has Christmas decorations falling from top to bottom of the page. I noticed that the decoration type, speed, and size seemed random, so I was curious to check the implementation. The following function in `main.js` implements this functionality:

```js
  // Function to add a random Christmas element to the page
  function addRandomChristmasElement() {
    const elements = ['❄️', '🎄', '🎁', '⛄', '🦌', '🎅', '🔔'];
    const element = document.createElement('div');
    element.innerText = elements[Math.floor(Math.random() * elements.length)];
    element.style.position = 'absolute';
    element.style.fontSize = Math.random() * 20 + 10 + 'px';
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = '-50px';
    element.style.opacity = '0.7';
    element.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicks
    element.style.zIndex = '1000';
    element.style.animation = 'float-down ' + (Math.random() * 10 + 5) + 's linear forwards';
    
    document.body.appendChild(element);
    
    // Remove element after animation completes to prevent memory leaks
    setTimeout(function() {
      element.remove();
    }, 15000);
  }
```

The function is then called every 5 seconds:

```js
  // Add random Christmas elements periodically
  setInterval(addRandomChristmasElement, 5000);
```