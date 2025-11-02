---
title: Oops I did it again
tags:
  - Crypto
Difficulty: Medium
Category: Crypto
---
### Description

In this challenge, you are given two Schnorr identification transcripts. By mistake, the prover reused the same commitment value t in both runs. With only the public parameters and the two transcripts, your task is to recover the secret key x.

### Solution

Instructions from website:

```
## 1) Re-initialize memory and randomness

- `GET /initialize-memory`
    
    Description: Re-initializes all the internal memory, and re-seeds the randomness based on the FLAG.  
      
    Example:  
    `curl http://<CHALLENGE_URL>/initialize-memory`
    

## 2) Dump memory (public, compromised, last-received)

- `GET /dump-memory/<memory_print_mode>`
    
    Description: Shows the values in the memory to allow the user to keep track of all the known information and stage of the scheme.  
    Displayed memory:
    
    - (1) **Public known data**: (i) public prime `p`, (ii) generator `g`, (iii) public `y`;
    - (2) **Compromised data**: Two (2) transcripts consisting of (i) commitment `t` (repeated in both transcripts), (ii) challenge, and (iii) response;
    - (3) **Lastly-received data**: (i) lastly received commitment `t`, (ii) lastly generated challenge `c`, and (iii) lastly received response `z`.
    
    For `<memory_print_mode>`, accepted values are: `decimal` (base 10) and `hex` (hexadecimal).  
      
    Examples:  
    `curl http://<CHALLENGE_URL>/dump-memory/decimal`  
    `curl http://<CHALLENGE_URL>/dump-memory/hex`  
      
    Accepted `memory_print_mode` values: `decimal`, `hex`
    

## 3) Get public data (p, g, y)

- `GET /get-public-data/<memory_print_mode>`
    
    Description: Shows the public values that are always known by both the prover and the verifier.  
    Displayed memory: (1) public prime `p`, (2) generator `g`, and (3) public `y`.  
    Note: The prime and generator are taken from RFC 3526, Section 3 (2048-bit MODP Group).  
    For `<memory_print_mode>`, accepted values are `decimal` (base 10) and `hex` (hexadecimal).  
      
    Examples:  
    `curl http://<CHALLENGE_URL>/get-public-data/decimal`  
    `curl http://<CHALLENGE_URL>/get-public-data/hex`  
      
    Accepted `memory_print_mode` values: `decimal`, `hex`
    

## 4) Get leaked transcripts (JSON)

- `GET /get-leaked-transcripts/<memory_print_mode>`
    
    Description: Returns the leaked transcripts required for this problem. Each transcript consists of (1) commitment `t`, (2) challenge `c`, and (3) response `z`. Two transcripts are included where the commitment `t` is repeated. Output is JSON.  
    For `<memory_print_mode>`, accepted values are `decimal` (base 10) and `hex` (hexadecimal).  
      
    Examples:  
    `curl http://<CHALLENGE_URL>/get-leaked-transcripts/decimal`  
    `curl http://<CHALLENGE_URL>/get-leaked-transcripts/hex`  
      
    Accepted `memory_print_mode` values: `decimal`, `hex`
    

## 5) Get challenge for a given commitment

- `GET /get-challenge/<commitment_t>`
    
    Description: For a given commitment `t` (sent by the prover), generates a challenge `c` and stores both the commitment and challenge in memory to be used in the verification stage.  
    In case the user sends the commitments from the provided examples, a value of `-2` is returned.  
    For `<commitment_t>`, the commitment is **expected in base 10** (decimal, not hexadecimal).  
      
    Example:  
    `curl http://<CHALLENGE_URL>/get-challenge/<commitment_t>`
    

## 6) Verify a response (returns FLAG on success)

- `GET /verify-response/<response_z>`
    
    Description: For a previously sent commitment `t` (by prover) and a challenge `c` (verifier), verifies the response `z` sent by the prover.  
    If the user calls this endpoint before sending a commitment, the error **Missing commitment and challenge** is returned.  
    For `<response_z>`, the response is **expected in base 10** (decimal, not hexadecimal).  
    If the `<response_z>` is valid, the **FLAG** is returned.  
      
    Example:  
    `curl http://<CHALLENGE_URL>/verify-response/<response_z>`
```

Additional info provided:

You will be given **two recorded Schnorr transcripts** produced by a prover who accidentally reused the same commitment. Your task is to **recover the prover’s private key `x`** using only the two transcripts and the public parameters.

The goal here is to _learn by doing_: you will fetch a JSON including two transcripts from a simple web service, analyze them, and produce a single integer as your answer. The service and files are intentionally minimal so you can focus on the math and the code.

## Description of the Protocol

- Public parameters: a large prime `p`, a generator `g` of a subgroupof prime order `q = (p-1)/2`.
    
- The prover’s public key is `y = g^x mod p` (you will also get `y`).
    
- A single Schnorr run produces a transcript `(t, c, z)` where:
    
    - `t` is the commitment (`g^r mod p`) computed with a secret nonce `r (mod q)`,
    - `c (mod q)` is the verifier’s challenge (an integer), and
    - `z (mod q)` is the prover’s response.

In this exercise the prover reused the same nonce/commitment `t` in _two different runs_, producing two transcripts with the same `t` but different challenges and responses.

## What you’re expected to do

- Consume the web service `get-public-data/<memory_print_mode>`. Get the public information.
- Consume the web service `get-leaked-transcripts/<memory_print_mode>`. Get the public information.
- Solve for `x`. Use the fact that `q = (p-1)/2`.
- Generate a valid commitment `commitment_t`.
- Consume the web service `get-challenge/<commitment_t>`. Get the challenge `challenge_c`.
- Generate a valid response `response_z`.
- Consume the web service `verify-response/<response_z>`. Get the `FLAG`.

## Some considerations

- You are **not** given `x` or `r`. Those are secret, and you must recover `x`.
- Think about the two transcripts as two linear relations that share the _same unknown nonce contribution_.
- Do not attempt to brute-force a large `x` by trying all values from `0` to `p-1`. That defeats the point of the math and will be slow for large `p`.


solution script:

```python
#!/usr/bin/env python3
"""
Schnorr nonce-reuse exploit - corrected & robust version.

Usage:
  - Edit CHALLENGE_URL below (no trailing slash)
  - Run: python3 recover_schnorr_flag_fixed.py

Dependencies: requests
"""

import requests
import secrets
import sys
import time
from typing import Tuple, Any

# ===========================
# >>> CONFIGURE THIS <<<
CHALLENGE_URL = "http://<CHALLENGE_URL>"  # <<--- REPLACE with challenge host (no trailing slash)
MEMORY_MODE = "decimal"   # "decimal" or "hex" (this script expects decimal responses)
# ===========================

# ---------- helpers ----------
def egcd(a: int, b: int) -> Tuple[int,int,int]:
    if a == 0:
        return (b, 0, 1)
    g, y, x = egcd(b % a, a)
    return (g, x - (b // a) * y, y)

def modinv(a: int, m: int) -> int:
    a %= m
    try:
        # Python 3.8+ preferred
        return pow(a, -1, m)
    except TypeError:
        g, x, _ = egcd(a, m)
        if g != 1:
            raise ValueError("modular inverse does not exist")
        return x % m
    except ValueError:
        g, x, _ = egcd(a, m)
        if g != 1:
            raise ValueError("modular inverse does not exist")
        return x % m

def get_json_or_text(url: str) -> Any:
    r = requests.get(url)
    r.raise_for_status()
    try:
        return r.json()
    except ValueError:
        return r.text.strip()

# ---------- endpoints ----------
def initialize_memory():
    url = f"{CHALLENGE_URL}/initialize-memory"
    print("[*] Initializing memory...")
    r = requests.get(url)
    r.raise_for_status()
    print("[*] initialize-memory response:", r.text.strip())

def get_public_data():
    url = f"{CHALLENGE_URL}/get-public-data/{MEMORY_MODE}"
    print("[*] Fetching public data...")
    data = get_json_or_text(url)

    # Several possible shapes: plain dict with keys public_prime/g/y,
    # nested under "public_data", or a simple list [p,g,y].
    p = g = y = None

    if isinstance(data, dict):
        # unwrap if nested
        if "public_data" in data:
            pd = data["public_data"]
        else:
            pd = data

        # common keys
        for key in ("public_prime", "p", "prime", "public_p"):
            if key in pd:
                p = int(pd[key]); break

        for key in ("generator_g", "g", "generator", "public_g"):
            if key in pd:
                g = int(pd[key]); break

        for key in ("public_y", "y", "public_key", "pub_y"):
            if key in pd:
                y = int(pd[key]); break

        # sometimes public_data itself is nested further
        if p is None and "public_prime" in data:
            p = int(data["public_prime"])

    elif isinstance(data, (list, tuple)) and len(data) >= 3:
        p = int(data[0]); g = int(data[1]); y = int(data[2])
    else:
        # try whitespace parse fallback
        try:
            parts = str(data).split()
            p = int(parts[0]); g = int(parts[1]); y = int(parts[2])
        except Exception:
            raise RuntimeError("Unable to parse public data: %r" % data)

    if p is None or g is None or y is None:
        raise RuntimeError("Failed to extract p,g,y from public data: %r" % data)

    print(f"[*] Got public parameters (p bits = {p.bit_length()}, g = {g})")
    return p, g, y

def _normalize_transcript_item(item: dict) -> Tuple[int,int,int]:
    """
    Accept different key names and return (t,c,z) ints.
    """
    # direct keys
    key_map = {
        "t": ["t", "commitment", "commitment_t", "commitment_example_t", "last_received_commitment_t"],
        "c": ["c", "challenge", "challenge_c", "challenge_example", "last_generated_challenge_c"],
        "z": ["z", "response", "response_z", "response_z_example", "last_received_response_z"],
    }
    vals = {}
    for canon, names in key_map.items():
        found = False
        for n in names:
            if n in item:
                vals[canon] = int(item[n])
                found = True
                break
        if not found:
            # try to detect any key that contains canon substring
            for k in item.keys():
                if canon in k and isinstance(item[k], (int,str)):
                    try:
                        vals[canon] = int(item[k])
                        found = True
                        break
                    except Exception:
                        pass
        if not found:
            vals[canon] = None

    if vals["t"] is None or vals["c"] is None or vals["z"] is None:
        # try more flexible parsing: maybe item is a list or tuple
        if isinstance(item, (list, tuple)) and len(item) >= 3:
            return int(item[0]), int(item[1]), int(item[2])
        raise RuntimeError("Could not normalize transcript item: %r" % (item,))
    return vals["t"], vals["c"], vals["z"]

def get_leaked_transcripts():
    url = f"{CHALLENGE_URL}/get-leaked-transcripts/{MEMORY_MODE}"
    print("[*] Fetching leaked transcripts...")
    data = get_json_or_text(url)

    # Try to locate the list of transcripts in a couple shapes.
    transcripts_raw = None
    if isinstance(data, dict):
        # check common wrappers
        for k in ("compromised_data", "leaked", "transcripts", "data"):
            if k in data:
                transcripts_raw = data[k]
                break
        if transcripts_raw is None:
            # maybe the dict itself is the list mapping index->item
            # or directly a list disguised as dict (rare)
            # fallback: try to detect numeric-keyed dict
            possible = []
            for v in data.values():
                if isinstance(v, list):
                    possible.append(v)
            if len(possible) == 1:
                transcripts_raw = possible[0]
            else:
                # maybe the structure was exactly the two transcripts under the top-level dict keys
                # try to interpret as list-like
                transcripts_raw = None
    elif isinstance(data, (list, tuple)):
        transcripts_raw = data

    if transcripts_raw is None:
        # try to find any list inside the payload
        if isinstance(data, dict):
            for v in data.values():
                if isinstance(v, list):
                    transcripts_raw = v
                    break

    if transcripts_raw is None:
        raise RuntimeError("Could not find transcripts in response: %r" % data)

    # transcripts_raw should be a list containing at least two items
    if not isinstance(transcripts_raw, (list, tuple)) or len(transcripts_raw) < 2:
        raise RuntimeError("Unexpected transcripts format: %r" % transcripts_raw)

    # Normalize first two items
    t0, c0, z0 = _normalize_transcript_item(transcripts_raw[0])
    t1, c1, z1 = _normalize_transcript_item(transcripts_raw[1])

    print(f"[*] Transcript 0: t={t0} c={c0} z={z0}")
    print(f"[*] Transcript 1: t={t1} c={c1} z={z1}")
    if t0 != t1:
        print("[!] Warning: commitment values differ; exploit expects same reused nonce/commitment.")
    return (t0, c0, z0), (t1, c1, z1)

def recover_x_from_reused_nonce(trans1, trans2, q):
    (_, c1, z1) = trans1
    (_, c2, z2) = trans2
    diff_z = (z1 - z2) % q
    diff_c = (c1 - c2) % q
    if diff_c == 0:
        raise RuntimeError("challenges are equal; cannot recover x")
    inv = modinv(diff_c, q)
    x = (diff_z * inv) % q
    print("[*] Recovered x (mod q).")
    return x

def get_challenge_for_commitment(t_dec: int):
    url = f"{CHALLENGE_URL}/get-challenge/{t_dec}"
    r = requests.get(url)
    r.raise_for_status()
    text = r.text.strip()
    # Try parse integer first
    try:
        return int(text)
    except Exception:
        try:
            j = r.json()
            # common shapes
            if isinstance(j, dict):
                for k in ("c", "challenge", "challenge_c"):
                    if k in j:
                        return int(j[k])
                # maybe direct number
                for v in j.values():
                    if isinstance(v, int):
                        return int(v)
            if isinstance(j, int):
                return j
        except Exception:
            pass
    raise RuntimeError("Unexpected get-challenge response: %r" % text)

def verify_response(z_dec: int):
    url = f"{CHALLENGE_URL}/verify-response/{z_dec}"
    r = requests.get(url)
    r.raise_for_status()
    return r.text.strip()

# ---------- main ----------
def main():
    if CHALLENGE_URL.startswith("http://<") or CHALLENGE_URL.strip() == "":
        print("ERROR: Set CHALLENGE_URL inside the script (e.g. http://example.com)")
        sys.exit(1)

    # optional: reset memory (safe to ignore if not needed)
    try:
        initialize_memory()
    except Exception as e:
        print("[!] initialize-memory failed or was unnecessary (continuing):", e)

    # fetch public parameters
    p, g, y = get_public_data()
    q = (p - 1) // 2
    print(f"[*] Computed q = (p-1)/2 (bits = {q.bit_length()})")

    # fetch transcripts
    trans1, trans2 = get_leaked_transcripts()

    # recover x
    x = recover_x_from_reused_nonce(trans1, trans2, q)
    print("[*] Private key x =\n", x)

    # sanity check: y == g^x mod p?
    ycalc = pow(g, x, p)
    if ycalc == (y % p):
        print("[*] Sanity check OK: g^x mod p == y")
    else:
        print("[!] Sanity check FAILED: computed g^x mod p != y (computed %d, expected %d)" % (ycalc, y))

    # get a fresh challenge: try a few random nonces (the server returns -2 for example commitments)
    attempts = 0
    while attempts < 30:
        attempts += 1
        r_nonce = secrets.randbelow(q)
        if r_nonce == 0:
            continue
        t_new = pow(g, r_nonce, p)
        try:
            c_new = get_challenge_for_commitment(t_new)
        except Exception as e:
            print("[!] get-challenge error:", e)
            time.sleep(0.1)
            continue

        # Avoid reserved example indicator -2
        if isinstance(c_new, int) and c_new == -2:
            print("[*] Server returned -2 for this commitment (reserved). Retrying...")
            time.sleep(0.05)
            continue

        c_new = int(c_new) % q
        print(f"[*] Received challenge c = {c_new}")

        z_new = (r_nonce + (c_new * x)) % q
        print(f"[*] Computed response z = {z_new}")

        try:
            resp = verify_response(z_new)
            print("[*] verify-response returned:\n", resp)
            return
        except Exception as e:
            print("[!] verify-response error:", e)
            time.sleep(0.1)
            continue

    print("[!] Exhausted attempts to get a valid flag. Try again or inspect endpoints.")

if __name__ == "__main__":
    main()

```


script output:

```
[*] Initializing memory...
[*] initialize-memory response: {"initialized_memory_status": "OK", "public_memory": {"public_data": {"public_prime": 32317006071311007300338913926423828248817941241140239112842009751400741706634354222619689417363569347117901737909704191754605873209195028853758986185622153212175412514901774520270235796078236248884246189477587641105928646099411723245426622522193230540919037680524235519125679715870117001058055877651038861847280257976054903569732561526167081339361799541336476559160368317896729073178384589680639671900977202194168647225871031411336429319536193471636533209717077448227988588565369208645296636077250268955505928362751121174096972998068410554359584866583291642136218231078990999448652468262416972035911852507045361090559, "generator_g": 2, "public_y": 25599569525354377055115426641018606775976604775053410365642852629850930750670607266953578186388537810997380186367627168691719622641813520634884096586345402242567796490346326992240425501279776035408328880840169842847022443398892780447021069277296855001191691635545196612565290724740924317172536321413056132942617562458923888350676709344536160679826065394482939898354324034863524601912457892751785196934858397202154806177465959664156851968796250991057210712591937317594478043074879666441347364660828464938118671757394935512578348935220484245387727291516929059985941531137220578338845682679580083062469044039106078541904}, "compromised_data": [{"commitment_example_t": 21995391956870194876362741818012539125092603500076801510412782675154217244477858550567558416780724964473197396260975264290598630133295046110001551721923507740314951407665640847860238247209580076785340453564004966488807997454906156715550396781805513336550587424105143154428937769009321061426894930367983551713707788985341500927591789205852186664220251250128235968541557421225907703521280840425283102812002408368414288423521691938165393367912740783417305682234218772660074862691398941257435578336676719908708286669469384310410969314677406351226822936060124960753477175479152061458139105746176255548127585004601614713272, "challenge_example": 12287839749820385884293065634058992041979966408773206066914229280415866273575340546460134371518727190967498035387948480214445312713264144114542195990855181808096652419494820038907333039883543559137932552727681926823788100111151711812243283281868834860204870715939455861130798995499004531827304594520945450529824277933709500748746151331551516037863108491445259623521019052309813183330629442645198061319894601180087101070292411608790597742331999522570680517500184913905062549805832058852569524617247491476646292348740111950418002037673185143707970070158296513641336600127216968542332412919829950888182363837083538877413, "response_z_example": 10708907190419826529718323541418258720127904198329305039914029155508235037256033076650144204626735143997219675415454582909517937950032309815017381830482367356935600823537609621686895976374586947081405051023014259412100999554911633784082447116256181108620350284196878327761414477491695256318129208983230250226732497161214962045994769592656382271935369411893756286011361023031140558083581832029448137068063647882623266420264913224342002216462359543306794704996868275530994219346245109471040611945136939501568705906682345919570270789650135353472275816581067917348714937056187198179882576784836426297210561070917068980532}, {"commitment_example_t": 21995391956870194876362741818012539125092603500076801510412782675154217244477858550567558416780724964473197396260975264290598630133295046110001551721923507740314951407665640847860238247209580076785340453564004966488807997454906156715550396781805513336550587424105143154428937769009321061426894930367983551713707788985341500927591789205852186664220251250128235968541557421225907703521280840425283102812002408368414288423521691938165393367912740783417305682234218772660074862691398941257435578336676719908708286669469384310410969314677406351226822936060124960753477175479152061458139105746176255548127585004601614713272, "challenge_example": 11656331145555342630272175921290948200533455404442024884808175713743774607936943550398938915579764062996686992879529115633975907114717502909358264597300234374451904585992536653567216308900866495147081714702808510952569011907560311370874085251603954699797465621625409167038330142360709777534320220903445689677442472011352826092480534362833870200721103007119419816608846322206518747451852079307329444916250118664900387693794798805668509721662977069390256961017567778708432337573992305692181633922975906239825031299574703520409490768216752506847061765903411380863082470341210258651575208177185093226564586951876892203072, "response_z_example": 10032997137726711880995903810647112126755614897321522821230516234572382498754961928530945486634708636038631743072836609279366418686437818713078771627726755255925534859453132454233864536639196840264283166859205207756087476340246326595371446800659277010778567872053295415514662474719276132612535129689002562111499835220037882329601444141392650594500591575962938947728298647845803588838574586772694294953119693910529220058767117962159867327288631649009689849411776958972953345437742168665489601832144880448191667098390238140618209313279999641956834692366597632272054302773755599774634613489480351651513046665319368932420}], "last_received_data": {"last_received_commitment_t": 0, "last_generated_challenge_c": 0, "last_received_response_z": 0}}}
[*] Fetching public data...
[*] Got public parameters (p bits = 2048, g = 2)
[*] Computed q = (p-1)/2 (bits = 2047)
[*] Fetching leaked transcripts...
[*] Transcript 0: t=21995391956870194876362741818012539125092603500076801510412782675154217244477858550567558416780724964473197396260975264290598630133295046110001551721923507740314951407665640847860238247209580076785340453564004966488807997454906156715550396781805513336550587424105143154428937769009321061426894930367983551713707788985341500927591789205852186664220251250128235968541557421225907703521280840425283102812002408368414288423521691938165393367912740783417305682234218772660074862691398941257435578336676719908708286669469384310410969314677406351226822936060124960753477175479152061458139105746176255548127585004601614713272 c=12287839749820385884293065634058992041979966408773206066914229280415866273575340546460134371518727190967498035387948480214445312713264144114542195990855181808096652419494820038907333039883543559137932552727681926823788100111151711812243283281868834860204870715939455861130798995499004531827304594520945450529824277933709500748746151331551516037863108491445259623521019052309813183330629442645198061319894601180087101070292411608790597742331999522570680517500184913905062549805832058852569524617247491476646292348740111950418002037673185143707970070158296513641336600127216968542332412919829950888182363837083538877413 z=10708907190419826529718323541418258720127904198329305039914029155508235037256033076650144204626735143997219675415454582909517937950032309815017381830482367356935600823537609621686895976374586947081405051023014259412100999554911633784082447116256181108620350284196878327761414477491695256318129208983230250226732497161214962045994769592656382271935369411893756286011361023031140558083581832029448137068063647882623266420264913224342002216462359543306794704996868275530994219346245109471040611945136939501568705906682345919570270789650135353472275816581067917348714937056187198179882576784836426297210561070917068980532
[*] Transcript 1: t=21995391956870194876362741818012539125092603500076801510412782675154217244477858550567558416780724964473197396260975264290598630133295046110001551721923507740314951407665640847860238247209580076785340453564004966488807997454906156715550396781805513336550587424105143154428937769009321061426894930367983551713707788985341500927591789205852186664220251250128235968541557421225907703521280840425283102812002408368414288423521691938165393367912740783417305682234218772660074862691398941257435578336676719908708286669469384310410969314677406351226822936060124960753477175479152061458139105746176255548127585004601614713272 c=11656331145555342630272175921290948200533455404442024884808175713743774607936943550398938915579764062996686992879529115633975907114717502909358264597300234374451904585992536653567216308900866495147081714702808510952569011907560311370874085251603954699797465621625409167038330142360709777534320220903445689677442472011352826092480534362833870200721103007119419816608846322206518747451852079307329444916250118664900387693794798805668509721662977069390256961017567778708432337573992305692181633922975906239825031299574703520409490768216752506847061765903411380863082470341210258651575208177185093226564586951876892203072 z=10032997137726711880995903810647112126755614897321522821230516234572382498754961928530945486634708636038631743072836609279366418686437818713078771627726755255925534859453132454233864536639196840264283166859205207756087476340246326595371446800659277010778567872053295415514662474719276132612535129689002562111499835220037882329601444141392650594500591575962938947728298647845803588838574586772694294953119693910529220058767117962159867327288631649009689849411776958972953345437742168665489601832144880448191667098390238140618209313279999641956834692366597632272054302773755599774634613489480351651513046665319368932420
[*] Recovered x (mod q).
[*] Private key x =
 62846531487761618922382757696243362538561398951269804692276993828132830420452
[*] Sanity check OK: g^x mod p == y
[*] Received challenge c = 10447124195426691530671669872068400894660689477086870180787515991855403278096591074729321796256651347011515872938824933251450912471049349484584120587725006915960966719118624913539001262047441388934243974853128301615494921707428569638992072008270811395233492037886035958008218364014784956611623541249036584299240258008665843196720864656472297931010353633858242752272595643047520386299257763062346572652182002478161523476018809381399967216427101569214967070649309897142157033346469190792653676206214983082376240653399902314576915386005110614561636581834063977400159618888865684736773220894484706504383931122759504102426
[*] Computed response z = 2440107249469876082259091671040194903660344793034353820021832465808952321069359517122928993360973521576903499618220062281299682335499378209801330632848407591933366416271945904692358301436105675101707451600065874941789359095144991562363344984496539462975975324200751248653766789909026129598619488580385457294781107196446440077597206279026990992757837657326612076464047741843639366251533724088754401747192952067655080362943045237767390377817840312605508398136202496999921604562586516019171877490959156660810799638027987645110273724035859438800197529319063635581777383946876792175942628862865794877104384085323860661631
[*] verify-response returned:
 {"status": "PASS", "flag": "flag{128fc76d704b7a05}"}
```