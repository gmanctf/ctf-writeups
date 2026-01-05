---
title: Visual Networking Thinger
Difficulty: ❄️----
order: 5
showToc: true
---

👨‍💻 Challenge provided by: [[Jared Folkins]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 7, 29  
🔗 Challenge URL: [Holiday Networking Challenge](https://visual-networking.holidayhackchallenge.com/)

## Challenge Description

```
Skate over to Jared at the frozen pond for some network magic and learn the ropes by the hockey rink.
```

## Helpful References

[DNS 101](https://www.redhat.com/en/blog/dns-domain-name-servers)  
[TCP/IP Transport Layer](https://www.learncisco.net/courses/icnd-1/building-a-network/tcpip-transport-layer.html)  
[What is HTTP](https://www.codecademy.com/article/what-is-http)  
[SSL/TLS Handshake](https://www.ibm.com/docs/en/ibm-mq/9.3.x?topic=tls-overview-ssltls-handshake)

## Solution

Clicking the terminal next to Jared opens a web page with the instructions for the challenge:

![[visual-networking-1.png|700]]

### Challenge 1: DNS Lookup

The first step is to find the IPv4 address of `visual-networking.holidayhackchallenge.com` using a DNS A record lookup:

![[visual-networking-2.png|700]]

Answer:

![[visual-networking-3.png|700]]


### Challenge 2: TCP 3-Way Handshake

Now that we have the IP address of the web server, we need a TCP connection. Drag and drop the TCP flags to create a [TCP 3-way handshake](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_establishment) between client and server.

![[visual-networking-4.png|700]]

Answer:

![[visual-networking-5.png|700]]


### Challenge 3: HTTP GET Request

Now that we have established a TCP connection, let's create an HTTP GET request to retrieve the web page.

![[visual-networking-6.png|700]]

Answer:

![[visual-networking-7.png|700]]

The `HTTP Version` can actually be any value — HTTP/1.0, HTTP/1.1 and HTTP/2 are all valid. For the `User-Agent` you can put whatever you want.

### Challenge 4: TLS Handshake

Great job with HTTP! Now let's set up a secure connection using TLS. Drag and drop the TLS messages to create the correct handshake sequence.

![[visual-networking-8.png|700]]

Answer:

![[visual-networking-9.png|700]]

Success! You've correctly established a secure TLS connection.

The TLS handshake creates a secure encrypted tunnel for HTTP traffic:

1. Client Hello: Client initiates secure connection with supported cipher suites
2. Server Hello: Server responds with selected cipher suite
3. Certificate: Server sends its TLS certificate
4. Client Key Exchange: Client sends parameters for shared secret calculation
5. Server Change Cipher Spec: Server indicates messages will be encrypted
6. Finished: Server confirms handshake completion

### Challenge 5: HTTPS GET Request

Now that we've established a secure TLS connection, let's make an HTTPS request to retrieve the website securely.

![[visual-networking-10.png|700]]

Answer:

![[visual-networking-11.png|700]]

And that completes the challenge:

![[visual-networking-12.png|700]]


## Extras

If you did not know enough about networking, did not want to learn it, and wanted to cheat, you could simply grab all answers from `main.js`, a few examples below:

Challenge 1:

```js
    // Check if correct parameters for DNS A record lookup
    const correctRequest = port === '53' && 
                         domainName === targetDomain && 
                         requestType === 'A';
```

Challenge 2:

```js
// TCP Challenge Logic
// Set up the correct sequence to win (TCP handshake)
const correctSequence = [
    {position: 1, types: ["SYN"]},
    {position: 2, types: ["SYN", "ACK"]},
    {position: 3, types: ["ACK"]}
];
```

Challenge 4:

```js
// TLS Challenge Logic
// Set up the correct sequence for TLS handshake
const correctTlsSequence = [
    {position: 1, messageType: "ClientHello"},
    {position: 2, messageType: "ServerHello"},
    {position: 3, messageType: "Certificate"},
    {position: 4, messageType: "ClientKeyExchange"},
    {position: 5, messageType: "ServerChangeCipherSpec"},
    {position: 6, messageType: "Finished"}
];
```


In addition, although I did not test it, we could get the objective completed by simply sending a POST request to `/challenge-complete` with the following JSON string: `{ completed: true }`. We can see that this is what `main.js` does and the verification of the challenges seems to be client side only:

```js
function checkAllChallenges() {

    ...truncated...
    
    if (dnsComplete && tcpComplete && httpComplete && tlsComplete && httpsComplete) {
        // Show victory UI
        document.getElementById("victory-container").style.display = "block";
        document.getElementById("wigwag").textContent = "You've completed all challenges!";
        
        // Check if we've already sent the completion notification
        if (!window.challengeNotificationSent) {
            window.challengeNotificationSent = true;
            
            // Send AJAX request to notify server of challenge completion
            fetch('/challenge-complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: true }),
                credentials: 'same-origin'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Challenge completion notification sent:', data);
                // Add an extra festive message for successful submission
                const wigwag = document.getElementById("wigwag");
                if (wigwag && data.success) {
                    wigwag.innerHTML += '<p class="festive-message">🎄 Your success has been reported to the North Pole! 🎄</p>';
                }
            })
            .catch(error => {
                console.error('Error notifying challenge completion:', error);
            });
        }
    }
}
```