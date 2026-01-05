Although checking a single email in the Spam folder is sufficient to solve the challenge, reading **all** of the emails provides valuable backstory on how Frosty and the gnomes planned their attack to take control of Dosis Neighborhood’s HVAC and refrigeration systems in order to create a permanent winter.

All extracted emails can be found here:

https://github.com/gmanctf/2025-HHC/tree/main/Mail%20Detective

The HTML files in the root folder in the link are the extracted HTML from the emails in the Spam folder that the gnomes used to implement the attack. The code is very easy to understand, but I still wanted to run them locally to see the “attack” in action:

![[extras-mail-detective-1.png]]

Analyzing the emails gives us an idea of the timeline used by Frosty and the gnomes to prepare the attack as well as giving us more information about the characters in the story. We can see that the attack started two years ago in December 2023!!. This is what happened in chronological order:
#### **Phase 1: Reconnaissance, Scams & Initial Compromise**
1. **Dec 15, 2023** - "URGENT: Password Reset Required Immediately" - Phishing attack against "Whos-ville" neighborhood.
2. **Dec 12, 2024** - "You've Won! Claim Your FREE 'Gnomes in Your Home' Collection!" - Phishing attempt to distribute compromised gnome decorations.
3. **Dec 13, 2024** - "URGENT: Help Me Transfer $50,000,000 in Bottle Caps!" - Nigerian prince scam to get funding.
4. **Dec 15, 2024** - "Friendly 'Gnomes in Your Home' Want to Be Your Pen Pals!" - Social engineering to establish contact.
5. **Dec 16, 2024** - "URGENT: Your 'Gnomes in Your Home' Package Delivery Failed" - Delivery scam to get funding and potentially to distribute assets used in the attack.
6. **Dec 16, 2024** - "URGENT: You Qualify for $5,000 Unemployment Benefits" - Scam.
7. **Dec 17, 2024** - "GNOMECOIN TO THE MOON!" - Crypto scam for funding.
#### **Phase 2: Early Reports of Initial Activity & Snow Lab Construction**
1. **Dec 18, 2024** - DRAFT: "Strange Observations - Need to Report" - Mail admin (unsent).
2. **Dec 18, 2024** - "Strange Garden Ornament Behavior" - Old Pete reports moving gnomes.
3. **Dec 19, 2024** - "URGENT: My Cookies Have Gone Missing!" - Granny Crumbleton reports theft.
4. **Dec 20, 2024** - DRAFT: "Potential Security Breach in Mail System" - Mail admin (unsent).
5. **Dec 20, 2024** - "INCIDENT REPORT: Mysterious Small-Scale Burglaries" - Officer Jingleberry's official report.
6. **Dec 21, 2024** - "Help! My Electronics Keep Disappearing and Reappearing!" - Sparky reports electronics theft.
7. **Dec 22, 2024** - "Weekly Special + WEIRD Delivery Incident" - Tony's Pizza reports gnome-sized orders.
8. **Dec 23, 2024** - "Overdue Books & Mysterious Library Activity" - Librarian reports technical book organization.
9. **Dec 24, 2024** - "Christmas Eve Emergency Town Hall Meeting" - Mayor calls emergency meeting.
#### **Phase 4: The Final Attack**
1. **Sep 16, 2025** - "Your Refrigerator Systems Compromised!" - Initial Recon.
2. **Sep 16, 2025** - "Coolant Acquisition Protocol Initiated" - Data exfiltration and crypto miner deployment.
3. **Sep 16, 2025** - "Frost Protocol: Dosis Neighborhood Freezing Initiative" - Final attack.

---

## References

The [[Easter Eggs]] section has references from the emails.
