---
title: Mail Detective
tags:
  - curl/IMAP
Difficulty: ❄️❄️---
order: 2
showToc: true
---

👨‍💻 Challenge provided by: [[Maurice Wilson]]  
🗺️ Location: City Hall - Area: cityhall. Coordinates: 11, 3  
<img src="HHC2025/images/curlyterm.png" width="18" class="inline-left">Challenge URL: [Mail Detective: Curly IMAP Investigation](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termCurlyImaps)

## Challenge Description

```
Help Mo in City Hall solve a curly email caper and crack the IMAP case. What is the URL of the pastebin service the gnomes are using?
```

## Helpful References

[IMAP protocol commands](https://donsutherland.org/crib/imap)  
[HackTricks cURL examples](https://book.hacktricks.wiki/en/network-services-pentesting/pentesting-imap.html#curl)  
[Reading email with curl - IMAP](https://everything.curl.dev/usingcurl/reademail.html)  
[curl commands to query imap servers · GitHub](https://gist.github.com/akpoff/53ac391037ae2f2d376214eac4a23634)

## Solution

As with previous challenges, the terminal welcomes us with additional context for the challenge:

```
=======================================================================
🎄 Mail Detective: Curly IMAP Investigation 🎄
=======================================================================

⚠️  ALERT! Those gnomes have been sending JavaScript-enabled emails
to everyone in the neighborhood, and it's causing absolute chaos!
We had to shut down all the email clients because they weren't blocking
the malicious scripts—kind of like how we'd ground aircraft until we clear
a security threat.

The only safe way to access the email server now is through curl,
the trusty HTTP tool. Yes, we're using curl to connect to IMAP!
It's unconventional, but it's secure.

🕵️  YOUR MISSION: Use curl to safely connect to the IMAP server
and hunt down one of these gnome emails. Find the malicious email
that wants to exfiltrate data to a pastebin service and submit the URL
of that pastebin service in your badge.

📡 Server Info:
   The IMAP server is running locally on TCP port 143
   Backdoor credentials: dosismail:holidaymagic

🎅 Good luck, Holiday Hacker! 🎅

=======================================================================
```

First, let me list the important `curl` commands we will need to solve the challenge:

* List all mailboxes: `curl -s -u "dosismail:holidaymagic" "imap://127.0.0.1"`

```
* LIST (\HasNoChildren) "." Spam
* LIST (\HasNoChildren) "." Sent
* LIST (\HasNoChildren) "." Archives
* LIST (\HasNoChildren) "." Drafts
* LIST (\HasNoChildren) "." INBOX
```

* Use IMAP `SEARCH ALL` command to retrieve all messages in a mailbox (INBOX in this example). Note that cURL has its own IMAP URL grammar, and `?ALL` is automatically interpreted as a `SEARCH ALL` command: `curl -u dosismail:holidaymagic 'imap://127.0.0.1/INBOX?ALL'`

```
* SEARCH 1 2 3 4 5 6 7
```

* Read email with index 1 from INBOX: `curl -u dosismail:holidaymagic 'imap://127.0.0.1/INBOX;MAILINDEX=1'`

* Search emails — this example searches the word 'gnome' in the body of all emails in the `Drafts` mailbox: `curl -u dosismail:holidaymagic 'imap://127.0.0.1/Drafts?BODY%20gnome'`

```
* SEARCH 2
```

Using the commands above, we have everything needed to solve the challenge manually. However, I solved the challenge by creating a script that:

* Lists all mailboxes
* Searches each mailbox for a string provided by the user (I used "pastebin")
* Downloads any matching emails

Since there is no `nano` or `vi` available in the terminal, I used the following `cat` command to create a script file:

```sh
cat <<'EOF' > imap_search_and_download.sh
#!/bin/bash

SERVER="127.0.0.1"
USER="dosismail"
PASS="holidaymagic"

read -p "Enter the string to search for: " SEARCH_TERM

echo
echo "=== Fetching mailboxes from $SERVER ==="
MAILBOXES=$(curl -s -u "$USER:$PASS" "imap://$SERVER" | awk -F' "." ' '{print $2}' | tr -d '\r')

echo
echo "Mailboxes found:"
echo "$MAILBOXES"
echo

mkdir -p downloaded_emails

# Loop through each mailbox
for BOX in $MAILBOXES; do
    echo "=== Searching in mailbox: $BOX ==="
    ENCODED_TERM=$(echo "$SEARCH_TERM" | sed 's/ /%20/g')
    
    # Run IMAP SEARCH and get matching message numbers
    RESULTS=$(curl -s -u "$USER:$PASS" "imap://$SERVER/$BOX?BODY%20$ENCODED_TERM" | awk '/\* SEARCH/ {for (i=3;i<=NF;i++) print $i}')
    
    if [ -z "$RESULTS" ]; then
        echo "No matches found in $BOX."
        continue
    fi
    
    # Fetch each matching email
    for MSG in $RESULTS; do
	    MSG_CLEAN=$(echo "$MSG" | tr -d '\r') # Remove carriage return from message name
        FILENAME="downloaded_emails/${BOX}-${MSG_CLEAN}"
        echo "Downloading message $MSG_CLEAN from $BOX -> $FILENAME"
        curl -s -u "$USER:$PASS" "imap://$SERVER/$BOX;MAILINDEX=$MSG_CLEAN" > "$FILENAME"
    done
done

echo
echo "Done! All matching emails saved in ./downloaded_emails/"
EOF
```

This was the result of running the script:

```
./imap_search_and_download.sh 
Enter the string to search for: pastebin

=== Fetching mailboxes from 127.0.0.1 ===

Mailboxes found:
Spam
Sent
Archives
Drafts
INBOX

=== Searching in mailbox: Spam ===
Downloading message 2 from Spam -> downloaded_emails/Spam-2
=== Searching in mailbox: Sent ===
No matches found in Sent.
=== Searching in mailbox: Archives ===
No matches found in Archives.
=== Searching in mailbox: Drafts ===
No matches found in Drafts.
=== Searching in mailbox: INBOX ===
No matches found in INBOX.

Done! All matching emails saved in ./downloaded_emails/
```

So we have a match! Let's read the email and see if we can find the solution:

```html
Return-Path: <frozen.network@mysterymastermind.mail>
Delivered-To: dosis.residents@dosisneighborhood.mail
Received: from frost-command.mysterymastermind.mail (frost-command [10.0.0.15])
        by mail.dosisneighborhood.mail (Postfix) with ESMTP id GHI789
        for <dosis.residents@dosisneighborhood.mail>; Mon, 16 Sep 2025 12:10:00 +0000 (UTC)
From: "Frozen Network Bot" <frozen.network@mysterymastermind.mail>
To: "Dosis Neighborhood Residents" <dosis.residents@dosisneighborhood.mail>
Cc: "Jessica and Joshua" <siblings@dosisneighborhood.mail>, "CHI Team" <chi.team@counterhack.com>
Subject: Frost Protocol: Dosis Neighborhood Freezing Initiative
Date: Mon, 16 Sep 2025 12:10:00 +0000
Message-ID: <gnome-js-3@mysterymastermind.mail>
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: 7bit

<html>
<body>
<h1>Perpetual Winter Protocol Activated</h1>
<p>The mysterious mastermind's plan is proceeding... Dosis neighborhood will never thaw!</p>
<script>
function initCryptoMiner() {
    var worker = {
        start: function() {
            console.log("Frost's crypto miner started - mining FrostCoin for perpetual winter fund");
            this.interval = setInterval(function() {
                console.log("Mining FrostCoin... Hash rate: " + Math.floor(Math.random() * 1000) + " H/s");
            }, 5000);
        },
        stop: function() {
            clearInterval(this.interval);
        }
    };
    worker.start();
    return worker;
}

function exfiltrateData() {
    var sensitiveData = {
        hvacSystems: "Located " + Math.floor(Math.random() * 50) + " cooling units",
        thermostatData: "Temperature ranges: " + Math.floor(Math.random() * 30 + 60) + "°F",
        refrigerationUnits: "Found " + Math.floor(Math.random() * 20) + " commercial freezers",
        timestamp: new Date().toISOString()
    };
    
    console.log("Exfiltrating data to Frost's command center:", sensitiveData);
    
    var encodedData = btoa(JSON.stringify(sensitiveData));
    console.log("Encoded payload for Frost: " + encodedData.substr(0, 50) + "...");

    // pastebin exfiltration
    var pastebinUrl = "https://frostbin.atnas.mail/api/paste";
    var exfilPayload = {
        title: "HVAC_Survey_" + Date.now(),
        content: encodedData,
        expiration: "1W",
        private: "1",
        format: "json"
    };
    
    console.log("Sending stolen data to FrostBin pastebin service...");
    console.log("POST " + pastebinUrl);
    console.log("Payload: " + JSON.stringify(exfilPayload).substr(0, 100) + "...");
    console.log("Response: {\"id\":\"" + Math.random().toString(36).substr(2, 8) + "\",\"url\":\"https://frostbin.atnas.mail/raw/" + Math.random().toString(36).substr(2, 8) + "\"}");
}

function establishPersistence() {
    // Service worker registration
    if ('serviceWorker' in navigator) {
        console.log("Attempting to register Frost's persistent service worker...");
        console.log("Frost's persistence mechanism deployed");
    }
    
    localStorage.setItem("frost_persistence", JSON.stringify({
        installDate: new Date().toISOString(),
        version: "gnome_v2.0",
        mission: "perpetual_winter_protocol"
    }));
}

var miner = initCryptoMiner();
exfiltrateData();
establishPersistence();

document.title = "Frost's Gnome Network - Temperature Control";
alert("All cooling systems in Dosis neighborhood are now property of Frost!");
document.body.innerHTML += "<p style='color: cyan;'>❄️ FROST'S DOMAIN ❄️</p>";

// Cleanup after 30 seconds
setTimeout(function() {
    miner.stop();
    console.log("Frost's operations going dark... tracks covered");
}, 30000);
</script>
</body>
</html>
```

Solution: `https://frostbin.atnas.mail/api/paste`

## Extras

If you want to review all the emails and explore additional curiosities, check [[HHC2025/Extras/Mail Detective|Mail Detective]] in the Extras section.