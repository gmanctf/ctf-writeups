---
title: Gnome Tea
tags:
  - web
  - firebase
Difficulty: ❄️❄️❄️--
order: 1
showToc: true
---

👨‍💻 Challenge provided by: [[Thomas Bouve]]  
🗺️ Location: Modern Scandinavian Condo - Area: apartment. Coordinates: 7, 2  
<img src="HHC2025/images/teaset.png" width="20" class="inline-left">Challenge URL: [GnomeTea - Spill the Tea!](https://gnometea.web.app/login?&challenge=termGnomeTea)

## Challenge Description

```
Enter the apartment building near 24-7 and help Thomas infiltrate the GnomeTea social network and discover the secret agent passphrase.
```

## Hints

### Gnome Tea

```
I heard rumors that the new GnomeTea app is where all the Gnomes spill the tea on each other. It uses Firebase which means there is a client side config the app uses to connect to all the firebase services.
```

## Helpful References

[Use the Cloud Firestore REST API](https://firebase.google.com/docs/firestore/use-rest-api)  
[Hacking Misconfigured Firebase Targets](https://www.intigriti.com/researchers/blog/hacking-tools/hacking-google-firebase-targets)

## Solution

Visiting the challenge URL presents a login screen for which we do not have credentials:

![[gnome-tea-1.png|300]]

### Step 1: Firebase Configuration Discovery

Thomas mentions: 

>"I've tried a few things already, but as usual the whole... Uh, what's the word I'm looking for here? Oh right, "endeavor", ended up with the rest of my unfinished projects."

This hint suggests unfinished functionality. A good starting point is inspecting the page source of the login page for any indication of unfinished sections that could give me a starting point. I found the following comment:

```html
   <!-- TODO: lock down dms, tea, gnomes collections -->
```

This implies that these collections were intended to be secured, but probably are not.

In addition, the application loads `/assets/index-BVLyJWJ_.js`. Examining this script reveals the Firebase configuration object:

```js
const OP = {
    apiKey: "AIzaSyDvBE5-77eZO8T18EiJ_MwGAYo5j2bqhbk",
    authDomain: "holidayhack2025.firebaseapp.com",
    projectId: "holidayhack2025",
    storageBucket: "holidayhack2025.firebasestorage.app",
    messagingSenderId: "341227752777",
    appId: "1:341227752777:web:7b9017d3d2d83ccf481e98"
}
```

Great! This confirms the application uses **Cloud Firestore** and **Firebase Storage**. One of the links I added at [[Gnome Tea#Helpful References]] explains how to access the Firestore REST API:

```
https://firestore.googleapis.com/v1/<projectId>/databases/(default)/documents/<collection>
```

The Firebase configuration object provides the project ID: `holidayhack2025`. The comment in the login screen provides 3 collection names: `dms`, `tea`, `gnomes`.

### Step 2: Firestore Collection Enumeration

We can use the information we just discovered to query the Firestore database using the public REST API:

* **tea collection**: `https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/tea`  
* **tea collection (Page 2)**: `https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/tea?pageToken=AFTOeJxBY_5NQi1cQtgF2X2XGHr54AOUk6uK4XOTMctlXCwRakt7Zzm4uXlDSSf9RNkfaQei8zquKtOG_o3FD8rQhMELpWs3AuKHpUr4BImwVtjT10bj7aZu8R_8CA`  
* **dms collection**: `https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/dms`  
* **gnomes collection**: `https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/gnomes`

**Note**: the `tea` collection has a `nextPageToken` at the end of the JSON data. This is the token I used to access page 2.

The results made clear that the `dms` collection stored data for direct messages between gnomes, `gnomes` was used to store the profile data (including profile picture and driver license), and `tea` was storing the messages posted in the social media platform.

The `tea` collection contains the following post from Professor Pumpernickel:

```
`😂 I heard Barnaby Briefcase is SO forgetful, he wrote his password on a sticky note and left it at the garden club! It was "MakeRColdOutside123!" - like, seriously Barnaby? That's your password? 🤦‍♂️`
```

This password does not work, but it establishes Barnaby’s poor password hygiene. Looking further in the `dms` collection, document `fHlgFwFTJeRkOFLK9DVj` contains the following message:

`https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/dms/fHlgFwFTJeRkOFLK9DVj`

```
Sorry, I can't give you my password but I can give you a hint. My password is actually the name of my hometown that I grew up in. I actually just visited there back when I signed up with my id to GnomeTea (I took my picture of my id there).
```

This tells us that Barnaby’s password is his hometown, and the photo in his ID was taken there.

### Step 3: Firebase Storage Access Bypass

Barnaby’s profile is accessible via the `gnomes` collection:

```
https://firestore.googleapis.com/v1/projects/holidayhack2025/databases/(default)/documents/gnomes/l7VS01K9GKV5ir5S8suDcwOFEpp2
```

Relevant fields include:

```
email: "barnabybriefcase@gnomemail.dosis"
homeLocation: Gnomewood Grove, Dosis Neighborhood
avatarUrl: https://storage.googleapis.com/holidayhack2025.firebasestorage.app/gnome-avatars/l7VS01K9GKV5ir5S8suDcwOFEpp2_profile.png
driversLicenseUrl:https://storage.googleapis.com/holidayhack2025.firebasestorage.app/gnome-documents/l7VS01K9GKV5ir5S8suDcwOFEpp2_drivers_license.jpeg
```

Using `homeLocation` as the password fails, so we need the **driver’s license image**. Unfortunately, attempting to access the image directly results in an error:

```
https://storage.googleapis.com/holidayhack2025.firebasestorage.app/gnome-documents/l7VS01K9GKV5ir5S8suDcwOFEpp2_drivers_license.jpeg
```

![[gnome-tea-2.png]]

The image was not available through the Google Cloud Storage API, but Firebase Storage Objects can instead be accessed via the Firebase REST API with the following format:

`https://firebasestorage.googleapis.com/v0/b/<projectId>.firebasestorage.app/o/<Object_Path_URLEncoded>?alt=media`

The object path is: `<folder>/<file-name>`

So, in our case, this is the resulting URL to access Barnaby’s driver's license:

`https://firebasestorage.googleapis.com/v0/b/holidayhack2025.firebasestorage.app/o/gnome-documents%2Fl7VS01K9GKV5ir5S8suDcwOFEpp2_drivers_license.jpeg?alt=media`

And it worked! We got Barnaby’s license:

![[l7VS01K9GKV5ir5S8suDcwOFEpp2_drivers_license.jpeg|300]]

### Step 4: Extracting GPS Metadata

The address on the license is also not the password. Barnaby’s message points to where the photo was taken. GPS metadata is commonly embedded in images, so let's check the license with `exiftool`:

`exiftool l7VS01K9GKV5ir5S8suDcwOFEpp2_drivers_license.jpeg`

```
GPS Position: 33 deg 27' 53.85" S, 115 deg 54' 37.62" E
```

Converted to Degrees, Minutes, Seconds (DMS) format to use in Google Maps: 33°27'53.85"S 115°54'37.62"E.

[gnomesville](https://www.google.com/maps/place/Gnomesville/@-33.4655273,115.9069405,1024m/data=!3m1!1e3!4m12!1m5!3m4!2zMzPCsDI3JzUzLjkiUyAxMTXCsDU0JzM3LjYiRQ!8m2!3d-33.464958!4d115.91045!3m5!1s0x2a31c3ade51cf0cb:0x130b58e2d1a910ae!8m2!3d-33.4649785!4d115.9104522!16s%2Fg%2F11b6j0mhds?entry=ttu&g_ep=EgoyMDI1MTEwNS4wIKXMDSoASAFQAw%3D%3D)

Credentials:

```
barnabybriefcase@gnomemail.dosis
gnomesville
```

Now we can login to the application as Barnaby:

![[gnome-tea-3.png]]

### Step 5: Accessing the Admin Panel

Inspecting in the source the frontend routing reveals an `/admin` route that it is not directly linked in the application:

```js
function zP() {
    return S.jsx(bP, {
        children: S.jsx(uT, {
            children: S.jsxs(nT, {
                children: [S.jsx(ai, {
                    path: "/login",
                    element: S.jsx(VP, {})
                }), S.jsx(ai, {
                    path: "/dashboard",
                    element: S.jsx(Ua, {
                        children: S.jsx(LP, {})
                    })
                }), S.jsx(ai, {
                    path: "/gnome/:gnomeId",
                    element: S.jsx(Ua, {
                        children: S.jsx(MP, {})
                    })
                }), S.jsx(ai, {
                    path: "/tea",
                    element: S.jsx(Ua, {
                        children: S.jsx(FP, {})
                    })
                }), S.jsx(ai, {
                    path: "/messages",
                    element: S.jsx(Ua, {
                        children: S.jsx(UP, {})
                    })
                }), S.jsx(ai, {
                    path: "/admin",
                    element: S.jsx(Ua, {
                        children: S.jsx(jP, {})
                    })
                }), S.jsx(ai, {
                    path: "/",
                    element: S.jsx(Pv, {
                        to: "/login",
                        replace: !0
                    })
                })]
            })
        })
    })
}
```

Trying to access the admin section returns "Access Denied":

![[gnome-tea-4.png]]

The error already tell us what we are missing. We can use the browser DevTools console to set `window.ADMIN_UID`:

```js
window.ADMIN_UID="3loaihgxP0VwCTKmkHHFLe6FZ4m2"
```

Now the admin page becomes accessible:

![[gnome-tea-5.png]]

Solution ==GigGigglesGiggler==

## Extras

This challenge references the real-world **Tea social media data breach**. More details are available at [[Easter Eggs#Gnome Tea]].

I also prepared helper scripts to help me finding the answer as well as to dump all the data. I added to my [GitHub](https://github.com/gmanctf/2025-HHC/tree/main/Gnome%20Tea) the following scripts:

* `get-raw-collections.py`: Dump Firestore collections. The script can also be used to brute force collections.
* `image-dumper.py`: Extracts and downloads image URLs from Firestore JSON data. It deduplicates entries, then downloads all images.
* `dm_extractor.py`: Parses DMs into readable conversation files. It saves conversations with the format `gnome1_and_gnome2.txt`. A great way to learn about gnome gossips and moon-gazing.

As an additional curiosity, examining Barnaby’s Driver's License with `exiftool` revealed some other amusing details:

```
Make                            : Toadstool Inc.
Camera Model Name               : Glimmerglass Pro
Artist                          : Pip Sparkletoes Photography
Copyright                       : Property of the Gnome Secret Service (GSS)
XMP Toolkit                     : Gnomish Tinker Tools v1.2
```




