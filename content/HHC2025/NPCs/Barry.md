![[goose-noir.png]]

🏴‍☠️ Barry's challenge: [[Spare Key]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 7, 40

### Dialogue before solving the challenge

You want me to say what exactly? Do I really look like someone who says MOOO?

---

The Neighborhood HOA hosts a static website on Azure Storage.

An admin accidentally uploaded an infrastructure config file that contains a long-lived SAS token.

Use Azure CLI to find the leak and report exactly where it lives.

---
### Dialogue after solving the challenge

There it is. A SAS token with read-write-delete permissions, publicly accessible. At least someone around here knows how to do a proper security audit.

---