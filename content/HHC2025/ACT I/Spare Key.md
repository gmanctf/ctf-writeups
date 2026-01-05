---
title: Spare Key
tags:
  - Azure
Difficulty: ❄️----
order: 9
showToc: true
---

👨‍💻 Challenge provided by: [[Barry]]  
🗺️ Location: The Neighborhood - Area: City. Coordinates: 6, 40  
🔗 Challenge URL: [Spare Key](https://hhc25-wetty-prod.holidayhackchallenge.com/?&challenge=termMSSpareKey)

## Challenge Description

```
Help Goose Barry near the pond identify which identity has been granted excessive Owner permissions at the subscription level, violating the principle of least privilege.
```

## Solution

Click on the terminal to start the challenge and get an additional description:

```
🎄 Welcome to the Spare Key! 🎄
You're connected to a read-only Azure CLI session in "The Neighborhood" tenant.
Your mission: Someone left a spare key out in the open. Find WHERE it is.
Connecting you now... ❄️

```

>**1) Let's start by listing all resource groups
$ `az group list -o table`
This will show all resource groups in a readable table format.**

Command: `az group list -o table`

Command output:

```
Name                 Location    ProvisioningState
-------------------  ----------  -------------------
rg-the-neighborhood  eastus      Succeeded
rg-hoa-maintenance   eastus      Succeeded
rg-hoa-clubhouse     eastus      Succeeded
rg-hoa-security      eastus      Succeeded
rg-hoa-landscaping   eastus      Succeeded
```


>**2) Now let's find storage accounts in the neighborhood resource group 📦
$ `az storage account list --resource-group rg-the-neighborhood -o table`
This shows what storage accounts exist and their types.**

Command: `az storage account list --resource-group rg-the-neighborhood -o table`

Command output:

```
Name             Kind         Location    ResourceGroup        ProvisioningState
---------------  -----------  ----------  -------------------  -------------------
neighborhoodhoa  StorageV2    eastus      rg-the-neighborhood  Succeeded
hoamaintenance   StorageV2    eastus      rg-hoa-maintenance   Succeeded
hoaclubhouse     StorageV2    eastus      rg-hoa-clubhouse     Succeeded
hoasecurity      BlobStorage  eastus      rg-hoa-security      Succeeded
hoalandscaping   StorageV2    eastus      rg-hoa-landscaping   Succeeded
```

>**3) Someone mentioned there was a website in here.
maybe a static website?
try:$ `az storage blob service-properties show --account-name <insert_account_name> --auth-mode login`**

Command: `az storage blob service-properties show --account-name neighborhoodhoa --auth-mode login`

Command output:

```json
{
  "enabled": true,
  "errorDocument404Path": "404.html",
  "indexDocument": "index.html"
}
```

>**4) Let's see what 📦 containers exist in the storage account
💡 Hint: You will need to use `az storage container list`
We want to list the container and its public access levels.**

Command: `az storage container list --account-name neighborhoodhoa --auth-mode login`

Command output:

```json
[
  {
    "name": "$web",
    "properties": {
      "lastModified": "2025-09-20T10:30:00Z",
      "publicAccess": null
    }
  },
  {
    "name": "public",
    "properties": {
      "lastModified": "2025-09-15T14:20:00Z",
      "publicAccess": "Blob"
    }
  }
]
```


>**5) Examine what files are in the static website container**
💡 hint: when using `--container-name` you might need `'<name>'`
Look 👀 for any files that shouldn't be publicly accessible!

We can see the following in the output of the previous command:

```json
  {
    "name": "$web",
    "properties": {
      "lastModified": "2025-09-20T10:30:00Z",
      "publicAccess": null
    }
```

The `$web` container is automatically created when you enable static website hosting on an Azure Storage account. The container is set to `"publicAccess": null` which means that the container's public access level is Private (no anonymous access). This is the default setting. The `publicAccess` property on the container refers to container-level anonymous listing (whether someone can list blobs without authentication). But whatever is inside `$web` will be publicly accessible (they are meant to be public website content). So let's check what is stored in the `$web` container:

Command: `az storage blob list --account-name neighborhoodhoa --container-name '$web' --auth-mode login`

Command Output:

```json
[
  {
    "name": "index.html",
    "properties": {
      "contentLength": 512,
      "contentType": "text/html",
      "metadata": {
        "source": "hoa-website"
      }
    }
  },
  {
    "name": "about.html",
    "properties": {
      "contentLength": 384,
      "contentType": "text/html",
      "metadata": {
        "source": "hoa-website"
      }
    }
  },
   {
    "name": "iac/terraform.tfvars",
    "properties": {
      "contentLength": 1024,
      "contentType": "text/plain",
      "metadata": {
        "WARNING": "LEAKED_SECRETS"
      }
    }
  }
]
```


>**6) Take a look at the files here, what stands out?
Try examining a suspect file 🕵️:
💡 hint: `--file /dev/stdout | less` will print to your terminal 💻.**

We can see from the output of the previous command that there are 3 blobs inside `$web`: index.html, about.html and iac/terraform.tfvars. The terraform blob immediately stands out, so let's explore that one:

Command: `az storage blob download --account-name neighborhoodhoa --container-name '$web'  --auth-mode login --name iac/terraform.tfvars --file /dev/stdout`

Command Output:

```
# Terraform Variables for HOA Website Deployment
# Application: Neighborhood HOA Service Request Portal  
# Environment: Production
# Last Updated: 2025-09-20
# DO NOT COMMIT TO PUBLIC REPOS

# === Application Configuration ===
app_name = "hoa-service-portal"
app_version = "2.1.4"
environment = "production"

# === Database Configuration ===
database_server = "sql-neighborhoodhoa.database.windows.net"
database_name = "hoa_requests"
database_username = "hoa_app_user"
# Using Key Vault reference for security
database_password_vault_ref = "@Microsoft.KeyVault(SecretUri=https://kv-neighborhoodhoa-prod.vault.azure.net/secrets/db-password/)"

# === Storage Configuration for File Uploads ===
storage_account = "neighborhoodhoa"
uploads_container = "resident-uploads"
documents_container = "hoa-documents"

# TEMPORARY: Direct storage access for migration script
# WARNING: Remove after data migration to new storage account
# This SAS token provides full access - HIGHLY SENSITIVE!
migration_sas_token = "sv=2023-11-03&ss=b&srt=co&sp=rlacwdx&se=2100-01-01T00:00:00Z&spr=https&sig=1djO1Q%2Bv0wIh7mYi3n%2F7r1d%2F9u9H%2F5%2BQxw8o2i9QMQc%3D"

# === Email Service Configuration ===
# Using Key Vault for sensitive email credentials
sendgrid_api_key_vault_ref = "@Microsoft.KeyVault(SecretUri=https://kv-neighborhoodhoa-prod.vault.azure.net/secrets/sendgrid-key/)"
from_email = "noreply@theneighborhood.com" 
admin_email = "admin@theneighborhood.com"

# === Application Settings ===
session_timeout_minutes = 60
max_file_upload_mb = 10
allowed_file_types = ["pdf", "jpg", "jpeg", "png", "doc", "docx"]

# === Feature Flags ===
enable_online_payments = true
enable_maintenance_requests = true
enable_document_portal = false
enable_resident_directory = true

# === API Keys (Key Vault References) ===
maps_api_key_vault_ref = "@Microsoft.KeyVault(SecretUri=https://kv-neighborhoodhoa-prod.vault.azure.net/secrets/maps-api-key/)"
weather_api_key_vault_ref = "@Microsoft.KeyVault(SecretUri=https://kv-neighborhoodhoa-prod.vault.azure.net/secrets/weather-api-key/)"

# === Notification Settings (Key Vault References) ===
sms_service_vault_ref = "@Microsoft.KeyVault(SecretUri=https://kv-neighborhoodhoa-prod.vault.azure.net/secrets/sms-credentials/)"
notification_webhook_vault_ref = "@Microsoft.KeyVault(SecretUri=https://kv-neighborhoodhoa-prod.vault.azure.net/secrets/slack-webhook/)"

# === Deployment Configuration ===
deploy_static_files_to_cdn = true
cdn_profile = "hoa-cdn-prod"
cache_duration_hours = 24

# Backup schedule
backup_frequency = "daily"
backup_retention_days = 30
{
  "downloaded": true,
  "file": "/dev/stdout"
}
```

```
You found the leak! A migration_sas_token within /iac/terraform.tfvars exposed a long-lived SAS token (expires 2100-01-01) 🔑
⚠️   Accidentally uploading config files to $web can leak secrets. 🔐

Challenge Complete! To finish, type: finish
```

Command: `finish`

## Summary

```sh
az group list -o table
az storage account list --resource-group rg-the-neighborhood -o table
az storage blob service-properties show --account-name neighborhoodhoa --auth-mode login
az storage container list --account-name neighborhoodhoa --auth-mode login
az storage blob list --account-name neighborhoodhoa --container-name '$web' --auth-mode login
az storage blob download --account-name neighborhoodhoa --container-name '$web' --auth-mode login --name iac/terraform.tfvars --file /dev/stdout
finish
```

