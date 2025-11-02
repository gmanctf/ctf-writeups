
### Challenge Description

**Space Uber**

>Please check the note.md file first for more information. Morty’s interdimensional ride-sharing startup seemed like a brilliant idea—until passengers started traveling for free. A hidden flaw in the system allows unauthorized access, letting sneaky users manipulate ride bookings and bypass payments. With profits plummeting and Rick unimpressed, Morty needs your help to fix the vulnerability. Can you analyze the system, secure the API, and ensure only legitimate rides are processed? The future of Space Uber—and Morty’s entrepreneurial dreams—rests in your hands!

Files provided: space_uber.zip

### Solution

As part of the files provided, there's an example exploit (exploit.py). The interesting part of the exploit is this:

```
params = {
'action': 'free_ride',
'dim1': 'Fantasy',
'dim2': 'Cronenberg'
}

r = sess.post(f'{BASE_URL}/conn.php', data=params)

print(r.text)
```
  
From the exploit code, it looks like we should pay attention to conn.php. The code shows that `$action` **is not sanitized** at all, so the attacker can set `action=free_ride` and make the PHP call:

[http://localhost:8000/free_ride/Fantasy/Cronenberg](http://localhost:8000/free_ride/Fantasy/Cronenberg)

If the backend API at `localhost:8000` has a `free_ride` route (or just returns something when hit with unknown endpoints), the frontend will happily forward it to the user.

To fix it, we can validate the actions with a whitelist:

```
$allowedActions = ['rides', 'price', 'book']; // whatever is legitimate

if (!in_array($action, $allowedActions, true)) {
  echo json_encode(["error" => "Invalid action"]);
  exit;
}
```

This was my final conn.php:
```
<?php

_// TODO move API to not be in SMB_

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["error" => "Invalid request method"]);
    exit;
}

$allowedActions = ['rides', 'price', 'book'];
$action = $_POST['action'] ?? '';
$dim1 = urlencode($_POST['dim1'] ?? '');
$dim2 = urlencode($_POST['dim2'] ?? '');

_// Validate action_
if (!in_array($action, $allowedActions, true)) {
    echo json_encode(["error" => "Invalid action"]);
    exit;
}

if (!$action || !$dim1 || !$dim2) {
    echo json_encode(["error" => "Missing required parameters"]);
    exit;
}

$apiBaseUrl = 'http://localhost:8000';
$apiUrl = "$apiBaseUrl/$action/$dim1/$dim2";

function fetchData($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

$response = fetchData($apiUrl);
echo json_encode($response);
?>
```

Flag: `HTB{sSrF_n0t_sO_suP3r_sEcUre!_b441c8c4563d8d420566f6b5c381bb1d}`
