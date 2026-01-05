---
title: Owner
tags:
- Azure
Difficulty: ❄️----
order: 11
showToc: true
---

👨‍💻 Challenge provided by: [[James]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 88, 31  
🔗 Challenge URL: [Owner](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termMSOwner)

## Challenge Description

```
Help Goose James near the park discover the accidentally leaked SAS token in a public JavaScript file and determine what Azure Storage resource it exposes and what permissions it grants.
```

## Solution

Click on the terminal to start the challenge and get an additional description for the task at hand:

```
🎄 Welcome to the Owner Challenge! 🎄
You're connected to a read-only Azure CLI session in "The Neighborhood" tenant.
Your mission: Investigate the permissions and identify WHO has access they shouldn't.
Connecting you now... ❄️
```


>**1) Let's learn some more Azure CLI, the `--query` parameter with JMESPath syntax!
`$ az account list --query "[].name"`
Here, `[]` loops through each item, `.name` grabs the name field**


Command: `az account list --query "[].name"`

Command Output:

```json
[
  "theneighborhood-sub",
  "theneighborhood-sub-2",
  "theneighborhood-sub-3",
  "theneighborhood-sub-4"
]
```


>**2) You can do some more advanced queries using conditional filtering with custom output.
  `$ az account list --query "[?state=='Enabled'].{Name:name, ID:id}"`
Cool! 😎  `[?condition]` filters what you want, `{custom:fields}` makes clean output ✨**


Command: `az account list --query "[?state=='Enabled'].{Name:name, ID:id}"`

Command Output:

```json
[
  {
    "ID": "2b0942f3-9bca-484b-a508-abdae2db5e64",
    "Name": "theneighborhood-sub"
  },
  {
    "ID": "4d9dbf2a-90b4-4d40-a97f-dc51f3c3d46e",
    "Name": "theneighborhood-sub-2"
  },
  {
    "ID": "065cc24a-077e-40b9-b666-2f4dd9f3a617",
    "Name": "theneighborhood-sub-3"
  },
  {
    "ID": "681c0111-ca84-47b2-808d-d8be2325b380",
    "Name": "theneighborhood-sub-4"
  }
]
```


>**3) Let's take a look at the Owner's of the first listed subscription 🔍. Pass in the first subscription id.
Try: `az role assignment list --scope "/subscriptions/{ID of first Subscription}" --query [?roleDefinition=='Owner']`**

Command: `az role assignment list --scope "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64" --query [?roleDefinition=='Owner']`

Command Output:

```json
[
  {
    "condition": "null",
    "conditionVersion": "null",
    "createdBy": "85b095fa-a9b4-4bdc-a3af-c9f95ebb8dd6",
    "createdOn": "2025-09-10T15:45:12.439266+00:00",
    "delegatedManagedIdentityResourceId": "null",
    "description": "null",
    "id": "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64/providers/Microsoft.Authorization/roleAssignments/b1c69caa-a4d6-449a-a090-efacb23b55f3",
    "name": "b1c69caa-a4d6-449a-a090-efacb23b55f3",
    "principalId": "2b5c7aed-2728-4e63-b657-98f759cc0936",
    "principalName": "PIM-Owners",
    "principalType": "Group",
    "roleDefinitionId": "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
    "roleDefinitionName": "Owner",
    "scope": "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64",
    "type": "Microsoft.Authorization/roleAssignments",
    "updatedBy": "85b095fa-a9b4-4bdc-a3af-c9f95ebb8dd6",
    "updatedOn": "2025-09-10T15:45:12.439266+00:00"
  }
]
```



>**4) Ok 🤔 — there is a group present for the Owners permission; however, we've been assured this is a 🔐 `PIM` enabled group.
Currently, no `PIM` activations are present. 🚨
Let's run the previous command against the other subscriptions to see what we come up with.**


Command: `az role assignment list --scope "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617" --query [?roleDefinition=='Owner']`

Command Output:

```json
[
  {
    "condition": "null",
    "conditionVersion": "null",
    "createdBy": "85b095fa-a9b4-4bdc-a3af-c9f95ebb8dd6",
    "createdOn": "2025-09-10T15:45:12.439266+00:00",
    "delegatedManagedIdentityResourceId": "null",
    "description": "null",
    "id": "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617/providers/Microsoft.Authorization/roleAssignments/b1c69caa-a4d6-449a-a090-efacb23b55f3",
    "name": "b1c69caa-a4d6-449a-a090-efacb23b55f3",
    "principalId": "2b5c7aed-2728-4e63-b657-98f759cc0936",
    "principalName": "PIM-Owners",
    "principalType": "Group",
    "roleDefinitionId": "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
    "roleDefinitionName": "Owner",
    "scope": "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617",
    "type": "Microsoft.Authorization/roleAssignments",
    "updatedBy": "85b095fa-a9b4-4bdc-a3af-c9f95ebb8dd6",
    "updatedOn": "2025-09-10T15:45:12.439266+00:00"
  },
  {
    "condition": "null",
    "conditionVersion": "null",
    "createdBy": "85b095fa-a9b4-4bdc-a3af-c9f95ebb8dd6",
    "createdOn": "2025-09-10T16:58:16.317381+00:00",
    "delegatedManagedIdentityResourceId": "null",
    "description": "null",
    "id": "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617/providers/Microsoft.Authorization/roleAssignments/6b452f58-6872-4064-ae9b-78742e8d987e",
    "name": "6b452f58-6872-4064-ae9b-78742e8d987e",
    "principalId": "6b982f2f-78a0-44a8-b915-79240b2b4796",
    "principalName": "IT Admins",
    "principalType": "Group",
    "roleDefinitionId": "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617/providers/Microsoft.Authorization/roleDefinitions/8e3af657-a8ff-443c-a75c-2fe8c4bcb635",
    "roleDefinitionName": "Owner",
    "scope": "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617",
    "type": "Microsoft.Authorization/roleAssignments",
    "updatedBy": "85b095fa-a9b4-4bdc-a3af-c9f95ebb8dd6",
    "updatedOn": "2025-09-10T16:58:16.317381+00:00"
  }
]
```

>**5) Looks like you are on to something here! 🕵️  We were assured that only the 🔐 PIM group was present for each subscription.
🔎 Let's figure out the membership of that group.
Hint: use the `az ad member list command`. Pass the `group id` instead of the name.
Remember: `| less` lets you scroll through long output**

We have `IT Admins` as a suspicious group because the expectation was that only PIM would be present. The `principalId` for `IT Admins` is `6b982f2f-78a0-44a8-b915-79240b2b4796`, so let's query it:

Command: `az ad member list --group 6b982f2f-78a0-44a8-b915-79240b2b4796 | less`

Command output:

```json
[
  {
    "@odata.type": "#microsoft.graph.group",
    "classification": null,
    "createdDateTime": "2025-09-10T16:54:24Z",
    "creationOptions": [],
    "deletedDateTime": null,
    "description": null,
    "displayName": "Subscription Admins",
    "expirationDateTime": null,
    "groupTypes": [],
    "id": "631ebd3f-39f9-4492-a780-aef2aec8c94e",
    "isAssignableToRole": null,
    "mail": null,
    "mailEnabled": false,
    "mailNickname": "15a80d1d-5",
    "membershipRule": null,
    "membershipRuleProcessingState": null,
    "onPremisesDomainName": null,
    "onPremisesLastSyncDateTime": null,
    "onPremisesNetBiosName": null,
    "onPremisesProvisioningErrors": [],
    "onPremisesSamAccountName": null,
    "onPremisesSecurityIdentifier": null,
    "onPremisesSyncEnabled": null,
    "preferredDataLocation": null,
    "preferredLanguage": null,
    "proxyAddresses": [],
    "renewedDateTime": "2025-09-10T16:54:24Z",
    "resourceBehaviorOptions": [],
    "resourceProvisioningOptions": [],
    "securityEnabled": true,
    "securityIdentifier": "S-1-12-1-1662958911-1150433785-4071522471-1321846958",
    "serviceProvisioningErrors": [],
    "theme": null,
    "uniqueName": null,
    "visibility": null
  }
]
```

>**6) Well 😤, that's annoying. Looks like we have a nested group!
Let's run the command one more time against this group.**

Command: `az ad member list --group 631ebd3f-39f9-4492-a780-aef2aec8c94e`

Command output:

```json
[
  {
    "@odata.type": "#microsoft.graph.user",
    "businessPhones": [
      "+1-555-0199"
    ],
    "displayName": "Firewall Frank",
    "givenName": "Frank",
    "id": "b8613dd2-5e33-4d77-91fb-b4f2338c19c9",
    "jobTitle": "HOA IT Administrator",
    "mail": "frank.firewall@theneighborhood.invalid",
    "mobilePhone": "+1-555-0198",
    "officeLocation": "HOA Community Center - IT Office",
    "preferredLanguage": "en-US",
    "surname": "Firewall",
    "userPrincipalName": "frank.firewall@theneighborhood.onmicrosoft.com"
  }
]
```

>**elevated access instead of permanent assignments. Permanent `Owner` roles create `persistent` attack paths and violate least-privilege principles.
>Challenge Complete! To finish, type: `finish`**

Command: `finish`

## Command Summary

```sh
az account list --query "[].name"
az account list --query "[?state=='Enabled'].{Name:name, ID:id}"
az role assignment list --scope "/subscriptions/2b0942f3-9bca-484b-a508-abdae2db5e64" --query [?roleDefinition=='Owner']
az role assignment list --scope "/subscriptions/065cc24a-077e-40b9-b666-2f4dd9f3a617" --query [?roleDefinition=='Owner']
az ad member list --group 6b982f2f-78a0-44a8-b915-79240b2b4796 | less
az ad member list --group 631ebd3f-39f9-4492-a780-aef2aec8c94e
finish
```
