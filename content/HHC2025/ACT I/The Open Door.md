---
title: The Open Door
tags:
  - Azure
Difficulty: ❄️----
order: 10
showToc: true
---

👨‍💻 Challenge provided by: [[Lucas]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 73, 10  
🔗 Challenge URL: [The Open Door](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termMSOpenDoor)

## Challenge Description

```
Help Goose Lucas in the hotel parking lot find the dangerously misconfigured Network Security Group rule that's allowing unrestricted internet access to sensitive ports like RDP or SSH.
```

## Solution

Click on the terminal to start the challenge and get an additional description:

```
🎄 Welcome to The Open Door Challenge! 🎄
You're connected to a read-only Azure CLI session in "The Neighborhood" tenant.
Your mission: Review their network configurations and find what doesn't belong.
Connecting you now... ❄️
```

>**1) Welcome back! Let's start by exploring output formats.
First, let's see resource groups in JSON format (the default):
`$ az group list`
JSON format shows detailed structured data.**

Command: `az group list`

Command Output:

```json
[
  {
    "id": "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64/resourceGroups/theneighborhood-rg1",
    "location": "eastus",
    "managedBy": null,
    "name": "theneighborhood-rg1",
    "properties": {
      "provisioningState": "Succeeded"
    },
    "tags": {}
  },
  {
    "id": "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64/resourceGroups/theneighborhood-rg2",
    "location": "westus",
    "managedBy": null,
    "name": "theneighborhood-rg2",
    "properties": {
      "provisioningState": "Succeeded"
    },
    "tags": {}
  }
]
```


>**2) Great! Now let's see the same data in table format for better readability 👀
`$ az group list -o table`
Notice how -o table changes the output format completely!
Both commands show the same data, just formatted differently.**

Command: `az group list -o table`

Command Output:

```
Name                 Location    ProvisioningState
-------------------  ----------  -------------------
theneighborhood-rg1  eastus      Succeeded
theneighborhood-rg2  westus      Succeeded
```


>**3) Lets take a look at Network Security Groups (NSGs).
To do this try: `az network nsg list -o table`
This lists all NSGs across resource groups.
For more information:
https://learn.microsoft.com/en-us/cli/azure/network/nsg?view=azure-cli-latest**

Command: `az network nsg list -o table`

Command Output:

```
Location    Name                   ResourceGroup
----------  ---------------------  -------------------
eastus      nsg-web-eastus         theneighborhood-rg1
eastus      nsg-db-eastus          theneighborhood-rg1
eastus      nsg-dev-eastus         theneighborhood-rg2
eastus      nsg-mgmt-eastus        theneighborhood-rg2
eastus      nsg-production-eastus  theneighborhood-rg1
```


>**4) Inspect the Network Security Group (web)  🕵️
Here is the NSG and its resource group: `--name nsg-web-eastus --resource-group theneighborhood-rg1` 
Hint: We want to show the NSG details. Use `| less` to page through the output.
Documentation: https://learn.microsoft.com/en-us/cli/azure/network/nsg?view=azure-cli-latest#az-network-nsg-show**

Command: `az network nsg show --name nsg-web-eastus --resource-group theneighborhood-rg1 | less`

Command Output:
```json
{
  "id": "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64/resourceGroups/theneighborhood-rg1/providers/Microsoft.Network/networkSecurityGroups/nsg-web-eastus",
  "location": "eastus",
  "name": "nsg-web-eastus",
  "properties": {
    "securityRules": [
      {
        "name": "Allow-HTTP-Inbound",
        "properties": {
          "access": "Allow",
          "destinationPortRange": "80",
          "direction": "Inbound",
          "priority": 100,
          "protocol": "Tcp",
          "sourceAddressPrefix": "0.0.0.0/0"
        }
      },
      {
        "name": "Allow-HTTPS-Inbound",
        "properties": {
          "access": "Allow",
          "destinationPortRange": "443",
          "direction": "Inbound",
          "priority": 110,
          "protocol": "Tcp",
          "sourceAddressPrefix": "0.0.0.0/0"
        }
      },
      {
        "name": "Allow-AppGateway-HealthProbes",
        "properties": {
          "access": "Allow",
          "destinationPortRange": "80,443",
          "direction": "Inbound",
          "priority": 130,
          "protocol": "Tcp",
          "sourceAddressPrefix": "AzureLoadBalancer"
        }
      },
      {
        "name": "Allow-Web-To-App",
        "properties": {
          "access": "Allow",
          "destinationPortRange": "8080,8443",
          "direction": "Inbound",
          "priority": 200,
          "protocol": "Tcp",
          "sourceAddressPrefix": "VirtualNetwork"
        }
      },
      {
        "name": "Deny-All-Inbound",
        "properties": {
          "access": "Deny",
          "destinationPortRange": "*",
          "direction": "Inbound",
          "priority": 4096,
          "protocol": "*",
          "sourceAddressPrefix": "*"
        }
      }
    ]
  },
  "resourceGroup": "theneighborhood-rg1",
  "tags": {
    "env": "web"
  }
}
```


>**5) Inspect the Network Security Group (mgmt)  🕵️
Here is the NSG and its resource group: `--nsg-name nsg-mgmt-eastus --resource-group theneighborhood-rg2`
Hint: We want to list the NSG rules
Documentation: https://learn.microsoft.com/en-us/cli/azure/network/nsg/rule?view=azure-cli-latest#az-network-nsg-rule-list**


Command: `az network nsg rule list --nsg-name nsg-mgmt-eastus --resource-group theneighborhood-rg2 | less`

Command Output:

```json
[
  {
    "name": "Allow-AzureBastion",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Allow",
      "destinationPortRange": "443",
      "direction": "Inbound",
      "priority": 100,
      "protocol": "Tcp",
      "sourceAddressPrefix": "AzureBastion"
    }
  },
  {
    "name": "Allow-Monitoring-Inbound",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Allow",
      "destinationPortRange": "443",
      "direction": "Inbound",
      "priority": 110,
      "protocol": "Tcp",
      "sourceAddressPrefix": "AzureMonitor"
    }
  },
  {
    "name": "Allow-DNS-From-VNet",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Allow",
      "destinationPortRange": "53",
      "direction": "Inbound",
      "priority": 115,
      "protocol": "Udp",
      "sourceAddressPrefix": "VirtualNetwork"
    }
  },
  {
    "name": "Deny-All-Inbound",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Deny",
      "destinationPortRange": "*",
      "direction": "Inbound",
      "priority": 4096,
      "protocol": "*",
      "sourceAddressPrefix": "*"
    }
  },
  {
    "name": "Allow-Monitoring-Outbound",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Allow",
      "destinationAddressPrefix": "AzureMonitor",
      "destinationPortRange": "443",
      "direction": "Outbound",
      "priority": 200,
      "protocol": "Tcp"
    }
  },
  {
    "name": "Allow-AD-Identity-Outbound",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Allow",
      "destinationAddressPrefix": "AzureActiveDirectory",
      "destinationPortRange": "443",
      "direction": "Outbound",
      "priority": 210,
      "protocol": "Tcp"
    }
  },
  {
    "name": "Allow-Backup-Outbound",
    "nsg": "nsg-mgmt-eastus",
    "properties": {
      "access": "Allow",
      "destinationAddressPrefix": "AzureBackup",
      "destinationPortRange": "443",
      "direction": "Outbound",
      "priority": 220,
      "protocol": "Tcp"
    }
  }
]
```


>**6) Take a look at the rest of the NSG rules and examine their properties.
After enumerating the NSG rules, enter the command string to view the suspect rule and inspect its properties.
Hint: Review fields such as direction, access, protocol, source, destination and port settings.
Documentation: https://learn.microsoft.com/en-us/cli/azure/network/nsg/rule?view=azure-cli-latest#az-network-nsg-rule-show**

We need to inspect the different NSG rules from the output of the previous command to find the suspect rule. A few examples:

```
az network nsg rule list --nsg-name nsg-mgmt-eastus --resource-group theneighborhood-rg2 | less
az network nsg rule list --nsg-name nsg-dev-eastus --resource-group theneighborhood-rg2 | less
az network nsg rule list --nsg-name nsg-production-eastus --resource-group theneighborhood-rg1 | less
```

The `nsg-production-eastus` NSG rule had a suspicious rule allowing RDP access from the Internet, not precisely security best practice for a production environment:

`az network nsg rule list --nsg-name nsg-production-eastus --resource-group theneighborhood-rg1 | less`

```json
...truncated...
  {
    "name": "Allow-RDP-From-Internet",
    "nsg": "nsg-production-eastus",
    "properties": {
      "access": "Allow",
      "destinationPortRange": "3389",
      "direction": "Inbound",
      "priority": 120,
      "protocol": "Tcp",
      "sourceAddressPrefix": "0.0.0.0/0"
    }
  },
...truncated...
```

So to solve the question, we just need to show the suspect rule we just found:

Command: `az network nsg rule show -g theneighborhood-rg1 --nsg-name nsg-production-eastus -n Allow-RDP-From-Internet`

Command output:

```json
{
  "name": "Allow-RDP-From-Internet",
  "properties": {
    "access": "Allow",
    "destinationPortRange": "3389",
    "direction": "Inbound",
    "priority": 120,
    "protocol": "Tcp",
    "sourceAddressPrefix": "0.0.0.0/0"
  }
}
```


```
Port 3389 is used by Remote Desktop Protocol — exposing it broadly allows attackers to brute-force credentials, exploit RDP vulnerabilities, and pivot within the network.

✨  To finish, type: finish
```

Command: `finish`

## Command summary

```sh
az group list
az group list -o table
az network nsg list -o table
az network nsg show --name nsg-web-eastus --resource-group theneighborhood-rg1 | less
az network nsg rule list --nsg-name nsg-mgmt-eastus --resource-group theneighborhood-rg2 | less
az network nsg rule show -g theneighborhood-rg1 --nsg-name nsg-production-eastus -n Allow-RDP-From-Internet
finish
```

