This section includes a similar analysis to the one [[Josh Wright]] presented, as well as some curiosities about the website used for the challenge [[IDORable Bistro]] and the Sasabune restaurant itself.

**Note**: Some customer names and notes reference movies. You can find these in [[Easter Eggs]].

## Data Analysis

In the presentation [Hackventure: Having Fun With IDOR Attacks | Joshua Wright](https://www.youtube.com/watch?v=hzrhtHrhwno), Josh analyzed the captured data in a way I found amusing. I have reproduced a similar analysis using the data I collected from [[IDORable Bistro]].

If you have all the output from `ffuf` in a folder, you can load the data into a SQLite DB using the following script: 

[idor-requests-to-sqlite.py](https://github.com/gmanctf/2025-HHC/blob/main/IDORable%20Bistro/idor-requests-to-sqlite.py)

I have also included a prebuilt SQLite database with the data already loaded in the same repository.

**Earnings per day:**

```sql
SELECT date, SUM(total) AS earnings FROM receipts GROUP BY date ORDER BY date;
```

```
2025-12-18|241.5
2025-12-19|496.5
2025-12-20|666.0
2025-12-21|682.0
```

**Customers per day**

```sql
SELECT date, COUNT(*) AS total_customers FROM receipts GROUP BY date ORDER BY date;
```

```
2025-12-18|7
2025-12-19|13
2025-12-20|15
2025-12-21|17
```

**Most Expensive Meal**

```sql
SELECT r.id, r.customer, r.date, r.total FROM receipts r WHERE r.id = (SELECT id FROM receipts ORDER BY total DESC LIMIT 1);
```

```
101|Duke Dosis|2025-12-20|195.0
```

**Average bill**

```sql
SELECT AVG(total) AS average_bill FROM receipts;
```

```
40.1153846153846
```

**Average bill (per day)**

```sql
SELECT date, AVG(total) AS average_bill FROM receipts GROUP BY date ORDER BY date;
```

```
2025-12-18|34.5
2025-12-19|38.1923076923077
2025-12-20|44.4
2025-12-21|40.1176470588235
```

**Favorite table:**

```sql
SELECT table_number, COUNT(*) AS visits FROM receipts GROUP BY table_number ORDER BY visits DESC LIMIT 1;
```

```
26|2
```

A count of 2 was very low, so I checked all the tables:

```sql
SELECT table_number, COUNT(*) AS visits FROM receipts GROUP BY table_number ORDER BY table_number;
```

```
1|2
2|2
3|2
4|2
5|2
6|2
7|2
8|2
9|2
10|2
11|2
12|2
13|2
14|2
15|2
16|2
17|2
18|2
19|2
20|2
21|2
22|2
23|2
24|2
25|2
26|2
```

That is a very even distribution, I guess there is no favorite/most used table...

**Top Selling Item**

```sql
SELECT name, COUNT(*) AS sold_count FROM items GROUP BY name ORDER BY sold_count DESC LIMIT 1;
```

```
California Roll|2
```

I checked and all other items were ordered only once, so I'll order a California Roll if I ever go to Sasabune.

## Viewing Receipt Details in the Site

When accessing the site using the link from the QR code, we get the details for that receipt (`id=103`):

![[extras-sasabune-1.png|500]]

if we check the page source, we can see the following JavaScript function:

```js
// Function to fetch and display receipt details|
function fetchReceiptDetails(id) {
...
}
```

Now that we know the solution to the challenge, we can use this function to load Bartholomew Quibblefrost's receipt directly in the application by typing the following in the browser's developer console:

`fetchReceiptDetails(139)`

![[extras-sasabune-2.png|500]]

There is also a function intended to celebrate finding the flag:

```js
        // Function to celebrate finding the flag
        function celebrateFlag() {
            // Play a celebratory sound
            const audio = new Audio('/static/sounds/success.mp3');
            audio.volume = 0.5;
            audio.play();
            
            // Add confetti effect
            const confetti = document.querySelector('.confetti');
            for (let i = 0; i < 50; i++) {
                const confettiPiece = document.createElement('div');
                confettiPiece.classList.add('confetti-piece');
                confettiPiece.style.left = Math.random() * 100 + '%';
                confettiPiece.style.animationDelay = Math.random() * 5 + 's';
                confettiPiece.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                confetti.appendChild(confettiPiece);
            }
        }
```

Unfortunately, it was not implemented, `/static/sounds/success.mp3` returns a 404 error.

## The restaurant

Sasabune (`笹舟`) is a real Japanese word with the following meaning:
- `笹` (sasa) = bamboo grass
- `舟` (fune/bune) = boat

It refers to the small toy boats traditionally made by folding bamboo leaves, which children would float on water.

I searched for potential real restaurants that inspired The Neighborhood Sasabune restaurant design. Googling Sasabune shows that there is a small chain of Japanese restaurants in the US with that name. According to his LinkedIn profile, Josh lives in Rhode Island, US.  There were no Sasabune restaurants there. However, there is a popular one in New York (1h by flight and 4h by car from Rhode island). Below some common characteristics of both the virtual Sasabune and the real one:

![[extra-sasabune.png]]

The size, layout, and the wooden tables are a close match. The restaurants in Beverly Hills, Hawaii and other locations also share similar commonalities. So maybe the Dosis Neighborhood Sasabune restaurant is another restaurant of the chain, not yet on their official website :).

## Japanese Messages

![[extras-sasabune-3.png]]

The website has an image in the footer with the text `いらっしゃいませ`. This translates to **“Welcome!”** as said by shop staff or hosts when greeting customers.

The text `伝統的な日本料理をお楽しみください` was only visible if you highlight that area of the site (or of course, if you check the page source). It translates to **“Please enjoy traditional Japanese cuisine.”**

