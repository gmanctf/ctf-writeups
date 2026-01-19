---
title: EchoInTheChat
tags:
  - DFIR
  - memory
  - volatility
Difficulty: Hard
category: DFIR
---
### Description

An IR team contained an active intrusion on a Windows host. They yanked the machine off the network while the intruder was typing a note. The system was triaged and powered down. You’ve been handed the artifacts exactly as they were collected.

FileProvided: [Lazy.zip](https://drive.google.com/file/d/1bqe9ixNifJ8X_9yzzWvkoYQ4wis6eu9W/view?usp=sharing)
Alternative download link: [Lazy.zip](https://archive.org/download/lazy_20251105/Lazy.zip)

### Solution

Lazy.zip contains a file called `mem.raw`. Clearly, we will be dealing with memory forensics, let's start by enumerating the Windows version we are dealing with:

```sh
vol -f mem.raw windows.info
...
Is64Bit True
IsPAE   False
...
SystemTime      2025-10-01 02:26:36+00:00
NtSystemRoot    C:\WINDOWS
NtProductType   NtProductWinNt
NtMajorVersion  10
NtMinorVersion  0
...
PE Machine      34404
PE TimeDateStamp        Fri Mar  9 22:53:21 2085
```

We are dealing with a Windows 10 x64. The next step I followed was to list the running processes (output truncated):

```sh
vol -f mem.raw windows.pslist
   
PID     PPID    ImageFileName   Offset(V)       Threads Handles SessionId       Wow64   CreateTime     ExitTime File output

4       0       System  0x9484c06a7040  171     -       N/A     False   2025-10-01 02:10:49.000000 UTC N/A      Disabled
96      4       Registry        0x9484c073c080  4       -       N/A     False   2025-10-01 02:10:44.000000 UTC  N/A     Disabled
400     4       smss.exe        0x9484c26eb040  2       -       N/A     False   2025-10-01 02:10:49.000000 UTC  N/A     Disabled

...

6980    1256    ctfmon.exe      0x9484c5e80080  11      -       1       False   2025-10-01 02:11:01.000000 UTC  N/A     Disabled
1888    788     NisSrv.exe      0x9484c7ddd080  6       -       0       False   2025-10-01 02:11:03.000000 UTC  N/A     Disabled
7096    940     smartscreen.ex  0x9484c5961080  7       -       1       False   2025-10-01 02:11:04.000000 UTC  N/A     Disabled

...

5196    940     FileCoAuth.exe  0x9484c8467080  5       -       1       False   2025-10-01 02:11:43.000000 UTC  N/A     Disabled
7400    4424    cmd.exe 0x9484c823f080  3       -       1       False   2025-10-01 02:11:46.000000 UTC N/A      Disabled
7376    7400    conhost.exe     0x9484c823d080  4       -       1       False   2025-10-01 02:11:46.000000 UTC  N/A     Disabled
9076    940     OpenConsole.ex  0x9484c823a080  9       -       1       False   2025-10-01 02:11:46.000000 UTC  N/A     Disabled
3960    940     WindowsTermina  0x9484c6ea3080  20      -       1       False   2025-10-01 02:11:46.000000 UTC  N/A     Disabled

...

1200    788     VSSVC.exe       0x9484c627e080  5       -       0       False   2025-10-01 02:24:49.000000 UTC  N/A     Disabled
1104    788     svchost.exe     0x9484c70b8080  6       -       0       False   2025-10-01 02:24:49.000000 UTC  N/A     Disabled
6040    788     svchost.exe     0x9484c92d8080  6       -       0       False   2025-10-01 02:24:55.000000 UTC  N/A     Disabled
5708    1332    MoUsoCoreWorke  0x9484c9ca90c0  9       -       0       False   2025-10-01 02:25:55.000000 UTC  N/A     Disabled
4512    788     svchost.exe     0x9484c6925080  7       -       0       False   2025-10-01 02:25:56.000000 UTC  N/A     Disabled
1416    788     TrustedInstall  0x9484c8578080  9       -       0       False   2025-10-01 02:25:56.000000 UTC  N/A     Disabled
1972    940     TiWorker.exe    0x9484cbbe80c0  9       -       0       False   2025-10-01 02:25:56.000000 UTC  N/A     Disabled
7772    4424    Notepad.exe     0x9484c7b0f080  23      -       1       False   2025-10-01 02:25:58.000000 UTC  N/A     Disabled
4708    4424    Lazy.exe        0x9484c7ae8080  1       -       1       False   2025-10-01 02:26:07.000000 UTC  N/A     Disabled
...
```

Within the output, and given the challenge name as well as the description pointing to the intruder writing a note, there are two process that stood out: `Lazy.exe` and `Notepad.exe`. We can grab the executable with the following command:

```sh
vol -f mem.raw windows.dumpfiles --pid 4708 --filter Lazy.exe
```

If we execute the file, it will ask for an hex string, then a last XOR in hex, then terminate:

```
Enter hex string: fffff
Enter last XOR (hex): aa
```

I opened the file in Ghidra and eventually found a function with the following code:

```
  }
  for (; puVar4 != puVar2; puVar4 = (uint *)((longlong)puVar4 + 1)) {
    *(byte *)puVar4 = ((byte)*puVar4 ^ 0x55) + 1 ^ param_3;
  }
```

If we translate the entire function to pseudo-code, it would be something similar to:

```c
void encrypt_buffer(uint8_t *out, const uint8_t *in, size_t len, uint8_t key) {
    // copy input to out
    memcpy(out, in, len);

    for (size_t i = 0; i < len; i++) {
        uint8_t plain  = out[i];
        uint8_t tmp    = (plain ^ 0x55) + 1;
        out[i] = tmp ^ key;
    }
}
```

In other words, it does the following:

- Take a byte: `plain = *(byte *)puVar4` 
- XOR with `0x55`: `plain ^ 0x55`
- Add 1: `+ 1`
- XOR with `param_3` (the user‑supplied key): `^ param_3`

The above can be decrypted by reversing the operations:

```python
def decrypt_hex(hex_string: str, key: int) -> bytes:
    data = bytes.fromhex(hex_string)   # convert hex → raw bytes
    out = bytearray()

    for c in data:
        tmp = c ^ key          # undo final XOR
        tmp = (tmp - 1) & 0xFF
        plain = tmp ^ 0x55     # undo initial XOR
        out.append(plain)

    return bytes(out)
```

What we are missing now is the encrypted string and the key. Let's focus on `Notepad.exe` now.

We can use the Volatility plugin `filescan` to locate open files and recently accessed files:

```sh
vol -f mem.raw windows.filescan > filescan.txt
```

In the output, we are interested in checking Notepad’s recovery artifacts (`TabStates`):

```sh
cat filescan.txt| grep -i notepad | grep -i tabstate

0x9484c6fc20a0  \Users\Mokeyy\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\TabState\a3e1e609-7d54-4899-823f-a074f5acb841.bin
0x9484c6fe3250  \Users\Mokeyy\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\TabState\120fa387-feeb-46ab-8acd-1270c86c2a05.bin
0x9484c6fe86b0  \Users\Mokeyy\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\TabState\120fa387-feeb-46ab-8acd-1270c86c2a05.bin.tmp
0x9484c8fa8610  \Users\Mokeyy\AppData\Local\Packages\Microsoft.WindowsNotepad_8wekyb3d8bbwe\LocalState\TabState\88d18893-54ed-447a-a886-819e167076ce.bin
```

We can dump the files using the `windows.dumpfiles` plugin with the virtual addresses:

```sh 
vol -f mem.raw windows.dumpfiles --virtaddr 0x9484c6fc20a0
vol -f mem.raw windows.dumpfiles --virtaddr 0x9484c6fe3250
vol -f mem.raw windows.dumpfiles --virtaddr 0x9484c6fe86b0
vol -f mem.raw windows.dumpfiles --virtaddr 0x9484c8fa8610
```

If we check with `strings` all the dumped files, we get:

```sh
strings -el file.0x9484c*

C:\Users\Mokeyy\Desktop\What is it.txt
8da3acaab6fef7f8a8f8f4f4fbfdfeacf7fea8f4f7fff1f7acf8abfdfcacfbf4abfaf4feadb0cf
Thank Me Later 0x99
Thank Me Later 0x99
C:\Users\Mokeyy\Desktop\What is it.txt
8da3acaab6fef7f8a8f8f4f4fbfdfeacf7fea8f4f7fff1f7acf8abfdfcacfbf4abfaf4feadb0cf
```

Looks like the data we were missing is:

```
ciphertext = "8da3acaab6fef7f8a8f8f4f4fbfdfeacf7fea8f4f7fff1f7acf8abfdfcacfbf4abfaf4feadb0cf"
key = 0x99
```

Now we need all the ingredients to recover the plaintext:

```python
>>> def decrypt_hex(hex_string: str, key: int) -> bytes:
...     data = bytes.fromhex(hex_string)   # convert hex → raw bytes
...     out = bytearray()
... 
...     for c in data:
...         tmp = c ^ key          # undo final XOR
...         tmp = (tmp - 1) & 0xFF
...         plain = tmp ^ 0x55     # undo initial XOR
...         out.append(plain)
... 
...     return bytes(out)
... 
>>> 
>>> ciphertext = "8da3acaab6fef7f8a8f8f4f4fbfdfeacf7fea8f4f7fff1f7acf8abfdfcacfbf4abfaf4feadb0cf"
>>> key = 0x99
>>> plaintext = decrypt_hex(ciphertext, key)
>>> print (plaintext)
b'Flag{385e599463a83e98028a5d61a49d793f}\x00'
```

flag: ==Flag{385e599463a83e98028a5d61a49d793f}==
