---
title: LateralTrace
tags:
  - DFIR
  - RDP
  - RDP8bmp
Difficulty: Hard
---
### Description

There's a lateral movement. You need to locate how the attacker connected to the second machine.

File Provided: [LateralTrace.7z](https://archive.org/download/lateral-trace.-7z/LateralTrace.7z)
### Solution

I started by checking the logs located at: `C\Windows\System32\winevt\logs`

In particular, `Microsoft-Windows-PowerShell%4Operational`.

Within the logs there was 4104 events ("Execute a Remote Command") with suspicious activity:

```
Creating Scriptblock text (1 of 1):
if((Get-ExecutionPolicy ) -ne 'AllSigned') { Set-ExecutionPolicy -Scope Process Bypass }; & 'C:\Users\john.it\Downloads\PatchWin\PatchWin.ps1'

ScriptBlock ID: 52c47fad-3612-4c49-98cd-69dedad898c9
Path: 
```

Then there's a command that acts as a shellcode loader to run a binary directly in memory. The binary is included as a base64 string and it is also XORed using as key 35 (decimal). Below a summary of the command that is run:

```powershell
function func_get_proc_address {
	Param ($var_module, $var_procedure)		
	...
}

function func_get_delegate_type {
	Param (
		[Parameter(Position = 0, Mandatory = $True)] [Type[]] $var_parameters,
		[Parameter(Position = 1)] [Type] $var_return_type = [Void]
	)

	...

	return $var_type_builder.CreateType()
}

If ([IntPtr]::size -eq 8) {
	[Byte[]]$var_code = [System.Convert]::FromBase64String('...very long base64 string...')
	for ($x = 0; $x -lt $var_code.Count; $x++) {
		$var_code[$x] = $var_code[$x] -bxor 35
	}

	...
}

```

Because the base64 is a large string, the log spans across 21 Scriptblocks in the logs. Just to check what was the file, I used the below script with the base64 string of the first Scriptblock:

```python
import base64

b64 = ""  # paste your base64 string here
data = base64.b64decode(b64)

# XOR with 0x23 (decimal 35)
decoded = bytes([b ^ 0x23 for b in data])

# Try UTF-8 decode
try:
    text = decoded.decode('utf-8', errors='replace')
    print("=== UTF-8 attempt ===")
    print(text)
except Exception as e:
    print("UTF-8 decode error:", e)

# Save to disk
with open("decoded_xor.bin", "wb") as f:
    f.write(decoded)
print("Saved binary to decoded_xor.bin")

```

The output confirmed that we are dealing with a binary file:

```
MZARUH��H�� H�����H��H��Dd��A��VhZH�������      �!�L�!This program cannot be run in DOS mode.
```

As interesting as that was, it is a dead end. There is no additional PowerShell logs that point to access to another machine.

After checking what other files were in files provided, I noticed that there was an RDP cache file (`Cache0000.bin`) at:
`C\Users\john.it\AppData\Local\Microsoft\Terminal Server Client\Cache`

The file is a RDP8bmp file. [BMC-tools](https://github.com/ANSSI-FR/bmc-tools) is a RDP Bitmap Cache parser that we can use to extract images from the cache:

```
python3 bmc-tools.py -s Cache0000.bin -d images
[+++] Processing a single file: 'Cache0000.bin'.
[+++] Processing a file: 'Cache0000.bin'.
[===] 1070 tiles successfully extracted in the end.
[===] Successfully exported 1070 files.
```

Checking the folder with the images showed an interesting string:

![[Pasted image 20251103214007.png]]

I tried to put the string together, but the images are not in order, so I used another tool to help me stitching them together ([RdpCacheStitcher](https://github.com/BSI-Bund/RdpCacheStitcher)):

![[Pasted image 20251103214944.png]]

So the string is: `echo "ZmxhZ3tyZHBfYm1wX2NhY2hlXzlmNGNlfQ==" > flag.txt`

If we base64 decode it: `flag{rdp_bmp_cache_9f4ce}`
