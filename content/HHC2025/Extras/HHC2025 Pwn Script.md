
I initially intended to build a script that would solve all challenges. I ended up automating a few, but did not have the time to complete the script that would solve the entire HHC2025 in one go. In reality, this script would only make sense for challenges that use a terminal; there is not much point in automating others, especially challenges where the end result is a flag that can simply be submitted.

Nonetheless, I learned a lot through the process and decided to keep the write-up for the first script I wrote, which solves [[Intro to Nmap]].

I started by exploring how the communication with the terminal worked. I intercepted the requests with Burp and noticed that when you access the terminal, the communication is handled via a WebSocket:

https://hhc25-wetty-prod.holidayhackchallenge.com/socket.io/?EIO=3&transport=websocket&sid=oCIiy-SJtB-MSq0EAAgX

The data had the following structure (the below example is when you send `y` to start the challenge after opening the terminal):

`42["data","y"]`

This indicated that the interaction is handled using the [Socket.IO protocol](https://socket.io/docs/v4/socket-io-protocol/). When using Socket.IO, messages start with an EVENT ID. Below a table showing the meaning for a few I saw in Burp while checking the communication with the terminal:

|Event Code|Type|Usage|
|---|---|---|
|0|`CONNECT`|Used for managing connection to a namespace.|
|1|`DISCONNECT`|Used for disconnecting from a namespace.|
|2|`EVENT`|Transmits regular data to the other side.|
|3|`ACK`|Used to acknowledge an event, confirming a regular event was received.|
|42|Socket.IO event message|4 => Engine.IO "message" packet type<br>2 => Socket.IO "EVENT" packet type<br>[...] => content|

In python, we can use `socketio` to handle the connection. The simplest script to connect and print data received from the server would be:

```python
import socketio

# Create a Socket.IO client
sio = socketio.Client()

# Connect to the server
sio.connect("https://hhc25-wetty-prod.holidayhackchallenge.com/?challenge=termNmap", transports=["websocket"])

# print data returned by the server
sio.on("data", print)

# Keep the script running
sio.wait()
```

This loads the terminal, but we cannot interact with it properly because the above code is not sending back any data. To continue automating the process, I needed to get the raw data returned by the server, so the next iteration of the code looked like this:

```python
import socketio

# Create a Socket.IO client
sio = socketio.Client()

# Define handler functions
def handle_connect():
    print("Connected to server")

def handle_disconnect():
    print("Disconnected from server")

def handle_data(data):
    print("Server says:", repr(data))
    # Send "y"
    if "Type [y]es to begin" in data:
        print("Sending 'y'")
        sio.emit("input", "y")

sio.on("connect", handle_connect)
sio.on("disconnect", handle_disconnect)
sio.on("data", handle_data)

# Connect to the server
sio.connect(
    "https://hhc25-wetty-prod.holidayhackchallenge.com/?challenge=termNmap",
    transports=["websocket"]
)

# Keep the script running
sio.wait()
```

Executing it returns the following:

```python
Connected to server
Server says: '\x1b[32m[Loading] \x1b[0m\x1b[34m\x1b[1m/home/init/mysession.yaml\x1b[0m\r\n'
Server says: '\x1b[?1049h\x1b[22;0;0t\x1b[?1h\x1b=\x1b[H\x1b[2J\x1b[?12l\x1b[?25h\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?1006l\x1b[?1005l\x1b(B\x1b[m\x1b[?12l\x1b[?25h\x1b[?1006l\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?2004l\x1b[1;1H\x1b[1;30r\x1b[>c\x1b[>q\x1b[8;1H'
Server says: '\x1b[?25l\x1b[3A─────────────────────────────────────────\x1b[32m───────────────────────────────────────\x1b(B\x1b[m\x1b[1;1Hinit@05027cd9d744:~$  /home/init/run.sh /home/init/top_pane\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\x1b[2B /home/init/run.sh /home/init/bottom_paneinit@05027cd9d744:~$  /home/init/run.sh /home/init/bottom_pane\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\x1b[34m\x1b[42m\r\n[Intro to Nmap]> \x1b[30mports                                                          \x1b(B\x1b[m\x1b[?12l\x1b[?25h\x1b[8;1H\x1b(B\x1b[m\x1b[?12l\x1b[?25h\x1b[?1006l\x1b[?1000l\x1b[?1002l\x1b[?1003l\x1b[?2004l\x1b[1;1H\x1b[1;30r\x1b[8;1H\x1b[?25l\x1b[3A─────────────────────────────────────────\x1b[32m───────────────────────────────────────\x1b(B\x1b[m\x1b[1;1Hinit@05027cd9d744:~$  /home/init/run.sh /home/init/top_pane\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\x1b[2B /home/init/run.sh /home/init/bottom_paneinit@05027cd9d744:~$  /home/init/run.sh /home/init/bottom_pane\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\r\n\x1b[K\x1b[34m\x1b[42m\r\n[Intro to Nmap]> \x1b[30mports                                                          \x1b(B\x1b[m\x1b[?12l\x1b[?25h\x1b[8;1H'
Server says: '\x1b[1;4r\x1b[1;1H\x1b[2;4r\x1b[3S\x1b[1;1H\x1b[K\x1b[1;30r\x1b[8;1H'
Server says: '\x1b[1;4r\x1b[4;1H\n\x1b[H\x1b[34m\x1b[1mg commands to answer the questions asked, which will guide us in finding and connecting to the wardriving rig\'s service. \r\nRun the command "hint" to receive a hint.\x1b(B\x1b[m\r\n\x1b[K\x1b[1;30r\x1b[8;1H'
Server says: '\x1b[6;29r\x1b[1;1H\x1b[7;29r\x1b[23S\x1b[6;1H\x1b[K\x1b[1;30r\x1b[6;1H'
Server says: '\r\nType [y]es to begin: '
Sending 'y'
Server says: '\x1b[?7727h'
Server says: 'y'
Disconnected from server
```

Two problems to solve:
* The data returned by the server uses ANSI encoding, which is precisely what builds the terminal feeling when accessing the challenge
* The `y` we sent did not work

The first problem can be solved as follows:

```python
ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

def clean(text): return ansi_escape.sub('', text)
```

The second issue can be solved by sending the data to the server with a newline character, which is what would happen if we send it through the browser:

```python
sio.emit("input", "y\n")
```

The next problem I encountered was that in Question 4 the nmap scan takes long to finish and I was getting disconnected from the server. When checking how the browser was handling this issue, I noticed that a heartbeat was being exchanged to keep the connection alive. We can implement this in our code as follows:

```python
import threading

# Keep-alive every 5 seconds
def keep_alive():
    sio.emit("2")
    threading.Timer(5, keep_alive).start()

keep_alive()
```

In addition, there was a race condition in question 3. The solution to the question is detected as soon as the scan for 127.0.12.23 returns 8080 as an open port. At this point the server returns question 4 but the scan for question 3 is still running, so sending the answer to question 4 immediately would cause the script to fail. I had to implement a check to wait for the scan to finish, which made the code uglier, but it works.

The final script can be found at: [intro-nmap.py](https://github.com/gmanctf/2025-HHC/blob/main/Intro%20to%20Nmap/intro-nmap.py)
