---
title: Free Ski
tags:
  - offline-solvable
  - reverse-engineering
Difficulty: ❄️❄️❄️❄️❄️
order: 7
showToc: true
---

👨‍💻 Challenge provided by: [[Olivia]]  
🗺️ Location: Retro Emporium - Area: retroshop. Coordinates: 9, 2  
<img src="HHC2025/images/freeski.png" width="18" class="inline-left"> Challenge File: [FreeSki.exe](https://www.holidayhackchallenge.com/2025/assets/FreeSki.exe)  
<img src="HHC2025/images/github-logo.png" width="18" class="inline-left">GitHub URL (if HHC2025 is no longer available): [FreeSki.exe](https://github.com/gmanctf/2025-HHC/blob/main/Free%20Ski/FreeSki.exe)

## Challenge Description

```
Go to the retro store and help Goose Olivia ski down the mountain and collect all five treasure chests to reveal the hidden flag in this classic SkiFree-inspired challenge.
```

## Hints

### Extraction

Have you ever used [PyInstaller Extractor](https://github.com/extremecoders-re/pyinstxtractor)?

### Decompilation!

Many Python decompilers don't understand Python 3.13, but [Decompyle++](https://github.com/zrax/pycdc) does!

## Solution

First thing I tried is running the executable:

![[freeski-1.png]]

It is trying to load an image called `skier.png` from a folder called `img` in my home folder. As this does not exist, it fails to load. From the game name, I guessed that we were dealing with a modified version of the classic SkiFree which I had played myself as a kid:

![[freeski-2.png|400]]

You can just place all the needed images in the right folder. Then it will complain about fonts that you need to place in a folder called `fonts` in your home folder. Once everything is in place, you will be able to play the game:

![[freeski-3.png|400]]

Looks like there are 7 different mountains (Mount Snow, Aspen, Whistler, Mount Baker, Mount Norquay, Mount Erciyes, and Dragonmount) and the objective is to find 5 treasures in each mountain. This looks complicated to do just by playing the game fairly. So let's follow Olivia's advice: "If you ain't cheatin', you ain't tryin'".

From the error we got when first executing the game and all the hints, we know that we are dealing with a Python program using Pygame and packaged using PyInstaller.

### Step 1 - Decompiling

Following the hints, I downloaded a copy of `pyinstxtractor.py` and executed it as follows:

`python3 pyinstxtractor.py FreeSki.exe`

This created a folder called `FreeSki.exe_extracted`. The folder contains the result of unpacking the executable, basically it gives us compiled Python bytecode (.pyc) files. We can see that one of the files in the folder is `FreeSki.pyc`.

The next step is to decompile `FreeSki.pyc`, which contains the game logic. The hints suggest that we use `Decompyle++` so I installed as follow:

```sh
git clone https://github.com/zrax/pycdc.git
cd pycdc
mkdir build
cd build
cmake ..
make
```

That will create 2 executables at `pycdc-master/build/`:

* `pycdas`:  To disassemble a `.pyc` file
* `pycdc`: To decompile a `.pyc` file:

I initially tried `pycdc` to decompile `FreeSki.pyc` as follow:

```sh
./pycdc FreeSki.exe_extracted/FreeSki.pyc
```

This was the result:

```python
# Source Generated with Decompyle++
# File: FreeSki.pyc (Python 3.13)

Unsupported opcode: MAKE_FUNCTION (122)
import pygame
import enum
import random
import binascii
None()
pygame.font.init()
screen_width = 800
screen_height = 600
framerate_fps = 60
object_horizonal_hitbox = 1.5
object_vertical_hitbox = 0.5
max_speed = 0.4
accelerate_increment = 0.02
decelerate_increment = 0.05
scale_factor = 0.1
pixels_per_meter = 30
skier_vertical_pixel_location = 100
mountain_width = 1000
obstacle_draw_distance = 23
skier_start = 5
grace_period = 10
screen = pygame.display.set_mode((screen_width, screen_height))
clock = pygame.time.Clock()
dt = 0
pygame.key.set_repeat(500, 100)
pygame.display.set_caption('FreeSki v0.0')
skierimage = pygame.transform.scale_by(pygame.image.load('img/skier.png'), scale_factor)
skier_leftimage = pygame.transform.scale_by(pygame.image.load('img/skier_left.png'), scale_factor)
skier_rightimage = pygame.transform.scale_by(pygame.image.load('img/skier_right.png'), scale_factor)
skier_crashimage = pygame.transform.scale_by(pygame.image.load('img/skier_crash.png'), scale_factor)
skier_pizzaimage = pygame.transform.scale_by(pygame.image.load('img/skier_pizza.png'), scale_factor)
treeimage = pygame.transform.scale_by(pygame.image.load('img/tree.png'), scale_factor)
yetiimage = pygame.transform.scale_by(pygame.image.load('img/yeti.png'), scale_factor)
treasureimage = pygame.transform.scale_by(pygame.image.load('img/treasure.png'), scale_factor)
boulderimage = pygame.transform.scale_by(pygame.image.load('img/boulder.png'), scale_factor)
victoryimage = pygame.transform.scale_by(pygame.image.load('img/victory.png'), 0.7)
gamefont = pygame.font.Font('fonts/VT323-Regular.ttf', 24)
text_surface1 = 'Use arrow keys to ski and find the 5 treasures!'(False, pygame.Color, None('blue'))
text_surface2 = "          find all the lost bears. don't drill into a rock. Win game."(False, pygame.Color, None('yellow'))
flagfont = pygame.font.Font('fonts/VT323-Regular.ttf', 32)
flag_text_surface = 'replace me'(False, pygame.Color, None('saddle brown'))
flag_message_text_surface1 = 'You win! Drill Baby is reunited with'(False, pygame.Color, None('yellow'))
flag_message_text_surface2 = 'all its bears. Welcome to Flare-On 12.'(False, pygame.Color, None('yellow'))
# WARNING: Decompyle incomplete
```

The decompilation did not work as expected. We can see at the top the error:
`Unsupported opcode: MAKE_FUNCTION (122)`. This means the decompiler doesn't yet support this specific bytecode instruction introduced or changed in Python 3.13. It turns out that because Python 3.13 is quite new, Decompyle++ does not yet support Python 3.13 completely to fully decompile the code. We can see a crucial hint in the partially decompiled code:

```python
text_surface2 = "          find all the lost bears. don't drill into a rock. Win game."(False, pygame.Color, None('yellow'))
flagfont = pygame.font.Font('fonts/VT323-Regular.ttf', 32)
flag_text_surface = 'replace me'(False, pygame.Color, None('saddle brown'))
flag_message_text_surface1 = 'You win! Drill Baby is reunited with'(False, pygame.Color, None('yellow'))
flag_message_text_surface2 = 'all its bears. Welcome to Flare-On 12.'(False, pygame.Color, None('yellow'))
```

The text `Welcome to Flare-On 12` refers to [Google's FLARE team's annual CTF contest](https://flare-on.com/). If we go to Flare-On 12, we can see the solutions to 2025's challenges. The first puzzle is called: Drill Baby Drill!

That's too much of a coincidence, so let's check the [solution](https://attachments-us-west-2.insided.com/e0b73ebf-a2ea-453e-8985-11e04f2ca88c/1_%20DrillBabyDrill.pdf?Expires=1766133080&Signature=0hiz0F5K~0irYuCyNlM6Hvn-uepq7JFHLQRiZ7BK5G6hkEG8~7gybQIn-2WXysGfQCQ5XA7AScdwTNui9DOD8-TuFubLsnB1vjDB~kY2h4t~-O1XOx-Hx~PKDTgcITuS6J7DfN753P2vKOgz2ZH-1Em~zmHG5oGx1knwc8e~mTM8qGSQSOzqXAfhIPhPWkIbFj5kk4aKnYYCbMyNRhcku9PEsb1IYTS-XN-NPDQb0JyT7rCs3svIKpW-Dx4Dsnh3BhWOh56-u9XzIwz4FfQXAS~~aNWunyqsjYG1nPLRKRk6yO2Ne3HO4xknnZBLjGdsCY4sSQUgo59v4FsW2lvNTA__&Key-Pair-Id=APKAJODP2KXSV47YM4AA) to that challenge. That challenge is definitely very similar to Free Ski. So it is very likely that the treasure positions in the 5 mountains will be fixed, and we will be able to figure out the position from the source code. However, in our case, the decompilation failed. I checked other challenges from Flare-On 12. The second challenge, [Project Chimera](https://attachments-us-west-2.insided.com/598d32cc-a85d-4ee9-a60e-bfe30f787e94/2_%20Project%20Chimera.pdf?Expires=1766139273&Signature=nmIOF7LvnVizllb~9bOiGoVCLc0wtE-8m3zkbMftN6JibFV2hvr-F7~IthyEuaKQGqOh~HNICaKtVER9e6pgjYeOgELbJK7jgo83~aki9ugBIgbDqM4l5JFnT-XT8BJPYPFJQI-eHzVIKfOpttZldqWUrjkTS0DL5sTusOxUOft~qx9FGE99NsoVQ-tNxfAL4kFgXpu-sKUNCqFS7cV1njZENCKQvt2cKbuWglH4hGw67oA26bNZc-8rRZEu8FYW6DVOOC4AMVQUcsR8kLXp5a7ExIGJ-9OA-D5bzLtQ33knWIlkYQ~iT59iRrbBOMgL25x8wfkYD5YnMeMCDw2fNA__&Key-Pair-Id=APKAJODP2KXSV47YM4AA), had a similar problem to ours: decompiling the code was giving errors. The suggestion was to use `pycdas` instead to get the disassembled Python bytecode:

```sh
./pycdas FreeSki.exe_extracted/FreeSki.pyc > FreeSki.pyasm
```

The entire assembly code is [here](https://github.com/gmanctf/2025-HHC/blob/main/Free%20Ski/FreeSki.pyasm). Looking through it, we can see some interesting data, for example:

```
        2498    LOAD_CONST                      58: 'Aspen'
        2500    LOAD_CONST                      59: 11211
        2502    LOAD_CONST                      60: 11000
        2504    LOAD_CONST                      61: 10000
        2506    LOAD_CONST                      62: b'U\xd7%x\xbfvj!\xfe\x9d\xb9\xc2\xd1k\x02y\x17\x9dK\x98\xf1\x92\x0f!\xf1\\\xa0\x1b\x0f'
```

Through experimenting with the game, looks like the mountains have some constants defined: the name, max elevation, elevation at which trees start, and elevation at which the Yeti comes. The hex string is likely the flag for that level, and if the same approach as in [Drill Baby Drill](https://attachments-us-west-2.insided.com/e0b73ebf-a2ea-453e-8985-11e04f2ca88c/1_%20DrillBabyDrill.pdf?Expires=1766133080&Signature=0hiz0F5K~0irYuCyNlM6Hvn-uepq7JFHLQRiZ7BK5G6hkEG8~7gybQIn-2WXysGfQCQ5XA7AScdwTNui9DOD8-TuFubLsnB1vjDB~kY2h4t~-O1XOx-Hx~PKDTgcITuS6J7DfN753P2vKOgz2ZH-1Em~zmHG5oGx1knwc8e~mTM8qGSQSOzqXAfhIPhPWkIbFj5kk4aKnYYCbMyNRhcku9PEsb1IYTS-XN-NPDQb0JyT7rCs3svIKpW-Dx4Dsnh3BhWOh56-u9XzIwz4FfQXAS~~aNWunyqsjYG1nPLRKRk6yO2Ne3HO4xknnZBLjGdsCY4sSQUgo59v4FsW2lvNTA__&Key-Pair-Id=APKAJODP2KXSV47YM4AA) from Flare-On 12 is used, it is likely an XORed value.

Although it would be possible to reverse engineer the assembly to understand exactly how to retrieve the flag, I decided to follow the same approach from [Project Chimera](https://attachments-us-west-2.insided.com/598d32cc-a85d-4ee9-a60e-bfe30f787e94/2_%20Project%20Chimera.pdf?Expires=1766139273&Signature=nmIOF7LvnVizllb~9bOiGoVCLc0wtE-8m3zkbMftN6JibFV2hvr-F7~IthyEuaKQGqOh~HNICaKtVER9e6pgjYeOgELbJK7jgo83~aki9ugBIgbDqM4l5JFnT-XT8BJPYPFJQI-eHzVIKfOpttZldqWUrjkTS0DL5sTusOxUOft~qx9FGE99NsoVQ-tNxfAL4kFgXpu-sKUNCqFS7cV1njZENCKQvt2cKbuWglH4hGw67oA26bNZc-8rRZEu8FYW6DVOOC4AMVQUcsR8kLXp5a7ExIGJ-9OA-D5bzLtQ33knWIlkYQ~iT59iRrbBOMgL25x8wfkYD5YnMeMCDw2fNA__&Key-Pair-Id=APKAJODP2KXSV47YM4AA). AI tools are quite good at interpreting assembly so we can upload it and get the original python code for the game. I used DeepSeek for no other reason that I had never tested it and wanted to give it a go, but I'm pretty sure any of the other available options would have done an equally good job. This was the result: [FreeSki-deepseek.py](https://github.com/gmanctf/2025-HHC/blob/main/Free%20Ski/FreeSki-deepseek.py). The game seems to work just like using the original .exe, indicating that the code is good enough.

### Step 2 - Winning the Game

The code has a mountain object defined as follow:

```python
class Mountain:
    def __init__(self, name, height, treeline, yetiline, encoded_flag):
```

Within the Mountain class, we can also see how the treasures are placed in the game:

```python
    def GetTreasureLocations(self):
        locations = {}
        random.seed(binascii.crc32(self.name.encode('utf-8')))
        prev_height = self.height
        prev_horiz = 0
        
        for i in range(0, 5):
            e_delta = random.randint(200, 800)
            h_delta = random.randint(int(0 - e_delta / 4), int(e_delta / 4))
            locations[prev_height - e_delta] = prev_horiz + h_delta
            prev_height -= e_delta
            prev_horiz += h_delta
        
        return locations
```

`random.seed(binascii.crc32(self.name.encode('utf-8')))` is basically setting a deterministic seed, based on the CRC32 of the mountain name. To clarify, `random.seed(...)` initializes Python’s pseudorandom number generator with that integer. From this point onward, any calls to `random.random()`, `random.randint()`, etc. will produce the same sequence of values every time you run the program. This means that we can calculate where the 5 treasures for a specific map will be, and these coordinates will always be the same.

The 5 treasure locations are then set in the for loop:
* Elevation delta: `e_delta = random.randint(200, 800)`. The treasure row moves down each time between 200 and 800 units.
* Horizontal delta: `h_delta = random.randint(int(0 - e_delta / 4), int(e_delta / 4))`. The horizontal position is a quarter of what e_delta was and it can be left or right.
* Final position:
	* Elevation: `prev_height - e_delta`
	* Horizontal: `prev_horiz + h_delta`

Let's use Mount Erciyes (which has a maximum height of 12,848) as an example and run through loop 1 to understand better how the position of the treasures is calculated:

```python
locations = {}
random.seed(binascii.crc32('Mount Erciyes'.encode('utf-8'))) # seed = 4189245800
prev_height = 12848
prev_horiz = 0
e_delta = random.randint(200, 800) # e_delta = 613
h_delta = random.randint(int(-e_delta/4), int(e_delta/4)) # h_delta = 10
locations[prev_height - e_delta] = prev_horiz + h_delta # locations = {12235: 10}
```

Now let's play the game to test it:

![[freeski-4.png]]

It matches! There's a slight difference with the coordinates in the screenshot, for elevation because I was still just above the treasure and for horizontal due to the PNG I used being too big. The game also calculates a hit range so you don't have to be exactly at 10.00 to collect the treasure, but this is not relevant to the challenge so I won't explain how this is calculated.

Using that information, I created [treasure-calculator.py](https://github.com/gmanctf/2025-HHC/blob/main/Free%20Ski/treasure-calculator.py). The script calculates and prints the treasure positions for all the mountains. Below an example of the output for Mount Norquay:

```
============================================================
Mount Norquay (Height: 6998)
Treasure locations (elevation, horizontal):
------------------------------------------------------------
  Treasure 1:
    Elevation: 6642
    Horizontal: -67
    Elevation diff from initial position = 351
  Treasure 2:
    Elevation: 5901
    Horizontal: -13
    Elevation diff from initial position = 1092
  Treasure 3:
    Elevation: 5692
    Horizontal: -8
    Elevation diff from initial position = 1301
  Treasure 4:
    Elevation: 5486
    Horizontal: -57
    Elevation diff from initial position = 1507
  Treasure 5:
    Elevation: 5115
    Horizontal: -146
    Elevation diff from initial position = 1878
```

Even knowing where the treasures are would make playing fair very hard. So I created a modified version of the game with `treeline` and `yetiline` set to 0:

```python
Mountains = [
    Mountain('Mount Snow', 3586, 0, 0, b'\x90\x00\x1d\xbc\x17b\xed6S"\xb0<Y\xd6\xce\x169\xae\xe9|\xe2Gs\xb7\xfdy\xcf5\x98'),
    Mountain('Aspen', 11211, 0, 0, b'U\xd7%x\xbfvj!\xfe\x9d\xb9\xc2\xd1k\x02y\x17\x9dK\x98\xf1\x92\x0f!\xf1\\\xa0\x1b\x0f'),
    Mountain('Whistler', 7156, 0, 0, b'\x1cN\x13\x1a\x97\xd4\xb2!\xf9\xf6\xd4#\xee\xebh\xecs.\x08M!hr9?\xde\x0c\x86\x02'),
    Mountain('Mount Baker', 10781, 0, 0, b'\xac\xf9#\xf4T\xf1%h\xbe3FI+h\r\x01V\xee\xc2C\x13\xf3\x97ef\xac\xe3z\x96'),
    Mountain('Mount Norquay', 6998, 0, 0, b'\x0c\x1c\xad!\xc6,\xec0\x0b+"\x9f@.\xc8\x13\xadb\x86\xea{\xfeS\xe0S\x85\x90\x03q'),
    Mountain('Mount Erciyes', 12848, 0, 0, b'n\xad\xb4l^I\xdb\xe1\xd0\x7f\x92\x92\x96\x1bq\xca`PvWg\x85\xb31^\x93F\x1a\xee'),
    Mountain('Dragonmount', 16282, 0, 0, b'Z\xf9\xdf\x7f_\x02\xd8\x89\x12\xd2\x11p\xb6\x96\x19\x05x))v\xc3\xecv\xf4\xe2\\\x9a\xbe\xb5')
]
```

With these changes, playing the game and collecting all five treasures becomes easy:

![[freeski-5.png]]

Solution: ==frosty_yet_predictably_random==

## Extras

It is not really needed to win the game to get the flag. Once we have the source code, we can simply figure out how the flag is being calculated to get it. This is the code:

```python
def SetFlag(mountain, treasure_list):
    product = 0
    for treasure_val in treasure_list:
        product = (product << 8) ^ treasure_val
    
    random.seed(product)
    decoded = []
    
    for i in range(0, len(mountain.encoded_flag)):
        r = random.randint(0, 255)
        decoded.append(chr(mountain.encoded_flag[i] ^ r))
    
    flag_text = 'Flag: %s' % ''.join(decoded)
    print(flag_text)
    global flag_text_surface
    flag_text_surface = flagfont.render(flag_text, False, pygame.Color('saddle brown'))
```

This is how `setFlag` is called from `main()`:

```python
                    if collided_object == Obstacles.TREASURE:
                        collided_row[1][collided_row_offset] = None
                        treasures_collected.append(collided_row[0] * mountain_width + collided_row_offset)
                        if len(treasures_collected) == 5:
                            SetFlag(mnt, treasures_collected)
                            victory_mode = True
```

When you collect a treasure, the game calculates a value and stores it in `treasures_collected`:

```python
treasures_collected.append(collided_row[0] * mountain_width + collided_row_offset)
```

Basically, the treasure value is: `elevation * mountain_width + horizontal_position`.

When we have the 5 treasures, `setFlag` is called with the mountain name and the treasure values stored in `treasures_collected`. Then we have:

```python
    product = 0
    for treasure_val in treasure_list:
        product = (product << 8) ^ treasure_val
```

Each treasure value (32-bit integer) is shifted left 8 bits and XORed into the product. The result is used to initialize the seed: `random.seed(product)`. This means that the seed is based on the treasure locations, and as we learned before, these locations are predictable and always the same.

The final decryption is done here:

```python
decoded = []
for i in range(0, len(mountain.encoded_flag)):
    r = random.randint(0, 255)
    decoded.append(chr(mountain.encoded_flag[i] ^ r))
```

* For each byte in the encrypted flag, generate a random byte (0-255) - randomly but predictable due to how the seed is initialized.
- XOR the encrypted byte with the random byte to get the plaintext character.

If we use the code we had before to calculate the treasure locations and we pass it to `SetFlag` we can calculate the flag value without having to win the game:

```python
import binascii
import random

class Mountain:
    def __init__(self, name, height, encoded_flag):
        self.name = name
        self.height = height
        self.encoded_flag = encoded_flag

def calculate_treasure_locations(mountain_name, mountain_height):
    """Returns list of (elevation, horizontal_position) for all 5 treasures"""
    random.seed(binascii.crc32(mountain_name.encode('utf-8')))
    prev_height = mountain_height
    prev_horiz = 0
    locations = []

    for i in range(5):
        e_delta = random.randint(200, 800)
        h_delta = random.randint(int(-e_delta/4), int(e_delta/4))
        elevation = prev_height - e_delta
        horiz = prev_horiz + h_delta
        locations.append((elevation, horiz))
        prev_height = elevation
        prev_horiz = horiz

    return locations

def SetFlag(mountain, treasure_list):
    product = 0
    for treasure_val in treasure_list:
        product = (product << 8) ^ treasure_val

    random.seed(product)
    decoded = []

    for i in range(0, len(mountain.encoded_flag)):
        r = random.randint(0, 255)
        decoded.append(chr(mountain.encoded_flag[i] ^ r))

    flag_text = 'Flag: %s' % ''.join(decoded)
    return flag_text

# Mount Snow data
mountain_name = 'Mount Snow'
mountain_height = 3586
encoded_flag = b'\x90\x00\x1d\xbc\x17b\xed6S"\xb0<Y\xd6\xce\x169\xae\xe9|\xe2Gs\xb7\xfdy\xcf5\x98'

# Create Mountain object
mountain = Mountain(mountain_name, mountain_height, encoded_flag)

# Get treasure locations
treasure_locations = calculate_treasure_locations(mountain_name, mountain_height)

# Build treasure list
treasure_list = []
for elev, horiz in treasure_locations:
    treasure_val = elev * 1000 + horiz  # MOUNTAIN_WIDTH = 1000
    treasure_list.append(treasure_val)

# Decrypt the flag
flag_text = SetFlag(mountain, treasure_list)

# Print only the flag (remove "Flag: " prefix)
print(flag_text[6:])
```

Result: ==frosty_yet_predictably_random==
