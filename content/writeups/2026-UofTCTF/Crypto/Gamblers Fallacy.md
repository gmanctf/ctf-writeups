---
title: Gambler's Fallacy
tags:
  - PRNG
  - Mersenne-Twister-Prediction
  - offline-solvable
category: Crypto
---
# Description

can we win a zillion dollars tonight?

algorithms inspired by primedice

`nc 34.162.20.138 5000`

Files Provided: [gamblers-fallacy.zip](https://github.com/gmanctf/2026-UofTCTF/blob/main/Crypto/Gamblers%20Fallacy/gamblers-fallacy.zip)

# References

* https://github.com/kmyk/mersenne-twister-predictor
* https://en.wikipedia.org/wiki/Mersenne_Twister

# Solution

## Game Analysis

The challenge presents a dice gambling game where players can:

- Gamble with configurable wager and greed values
- Set custom client seeds
- View shop to buy flag for $10,000
- Exit the game

Each roll generates a "server seed" and uses HMAC-SHA256 to compute the dice result:

```python

server_seed = random.getrandbits(32)

sig = hmac.new(str(server_seed).encode(), f"{client_seed}-{nonce}".encode(), hashlib.sha256)

# Extract roll from first 5 hex chars of HMAC

```

The win condition is `greed >= roll`, with multiplier = `99/greed`.

## MT19937 Prediction

Python's `random` uses Mersenne Twister (MT19937), which becomes predictable after observing 624 consecutive 32-bit outputs.

The game gives us the `server_seeds` after each roll, so we can collect enough seeds to start predicting the values.

### Phase 1: Seed Collection (624 Games)

We play 624 safe games to collect consecutive `server_seeds`:

```python
from mt19937predictor import MT19937Predictor

predictor = MT19937Predictor()
server_seeds = []

for i in range(624):
    # Play safe game, observe server_seed
    predictor.setrandbits(server_seed, 32)
    server_seeds.append(server_seed)
```

### Phase 2: Prediction

Once seeded, we can predict all future `server_seeds`:

```python
# Predict future rolls perfectly
predicted_seed = predictor.getrandbits(32)

# Calculate roll using same HMAC logic
roll = calculate_roll_from_seed(predicted_seed, client_seed, nonce)
```

### Phase 3: Betting

Once we can predict the seed values, we can use an optimal greed and wager calculation to maximize the profits and get enough funds to buy the flag:

```python
def optimal_bet(predicted_roll, current_balance):
    # Maximize multiplier while guaranteeing win
    greed = max(2, math.ceil(predicted_roll))
    multiplier = 99 / greed

    # Calculate wager to reach $10,000 optimally
    target_wager = (10000 - current_balance) / (multiplier - 1)
    wager = min(target_wager, current_balance)
    wager = max(wager, current_balance / 800.0)  # Min wager rule
    return greed, wager
```

## Complete Solver

```python
import socket
import time
import math
from mt19937predictor import MT19937Predictor

class LiveMTSolver:
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.sock = None
        self.balance = 800
        self.nonce = 0
        self.client_seed = "1337awesome"
        self.predictor = None
        self.predicted_seeds = []

    def connect(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.sock.connect((self.host, self.port))

    def send_recv(self, cmd, delay=0.2):
        self.sock.send((cmd + '\n').encode())
        time.sleep(delay)
        response = self.sock.recv(8192).decode()
        return response

    def parse_game_result(self, response):
        """Parse the game result to extract roll, reward, and server_seed"""
        lines = response.split('\n')
        for line in lines:
            if 'Game' in line and 'Roll:' in line:
                parts = line.split(',')
                actual_roll = float(parts[0].split('Roll:')[1].strip())
                reward = float(parts[1].split('Reward:')[1].strip())

                # Find server-seed
                for part in parts:
                    if 'Server-Seed:' in part:
                        server_seed = int(part.split('Server-Seed:')[1].strip())
                        break
                else:
                    return None, None, None

                return actual_roll, reward, server_seed
        return None, None, None

    def collect_mt_outputs(self, num_outputs=624):
        """Collect 624 consecutive server_seeds to seed the MT predictor"""
        print(f"Collecting {num_outputs} consecutive server_seeds for MT prediction...")

        predictor = MT19937Predictor()
        collected_seeds = []

        for i in range(num_outputs):
            if i % 50 == 0:
                print(f"Collected {i}/{num_outputs} seeds (balance: {self.balance:.2f})")

            # Use minimum wager to preserve balance
            wager = self.balance / 800.0

            # Start gambling
            response = self.send_recv('b')
            response = self.send_recv(str(wager))
            response = self.send_recv('1')
            response = self.send_recv('50')  # Safe greed
            response = self.send_recv('Y')

            # Parse result
            roll, reward, server_seed = self.parse_game_result(response)
            if roll is None:
                print("Failed to parse game result during collection!")
                return None

            # Feed to predictor
            predictor.setrandbits(server_seed, 32)
            collected_seeds.append(server_seed)

            self.balance = self.balance - wager + reward
            self.nonce += 1

        print(f"Successfully collected {len(collected_seeds)} seeds. Balance: {self.balance:.2f}")
        self.predictor = predictor
        return collected_seeds

    def predict_roll(self, nonce):
        """Predict roll using the MT predictor"""
        # Get the predicted server_seed
        predicted_server_seed = self.predictor.getrandbits(32)

        # Calculate roll using the same logic as the server
        import hashlib
        import hmac

        nonce_client_msg = f"{self.client_seed}-{nonce}".encode()
        sig = hmac.new(str(predicted_server_seed).encode(), nonce_client_msg, hashlib.sha256).hexdigest()

        index = 0
        lucky = int(sig[index*5:index*5+5], 16)
        while (lucky >= 1e6):
            index += 1
            if index * 5 + 5 > 129:
                lucky = 9999
                break
            lucky = int(sig[index * 5:index * 5 + 5], 16)

        roll = round((lucky % 10000) * 1e-2)
        return roll, predicted_server_seed

    def play_optimal_game(self):
        """Play one optimal game using MT prediction"""
        # Predict the next roll
        predicted_roll, predicted_server_seed = self.predict_roll(self.nonce)

        # Optimal greed: ceil(predicted_roll), but minimum 2, maximum 98
        optimal_greed = max(2, min(98, math.ceil(predicted_roll)))
        multiplier = 99 / optimal_greed

        # Calculate optimal wager to reach $10,000
        if self.balance >= 10000:
            return True  # Already done

        target_wager = (10000 - self.balance) / (multiplier - 1)

        # Respect rules
        min_wager = self.balance / 800.0
        max_wager = self.balance

        wager = min(target_wager, max_wager)
        wager = max(wager, min_wager)

        # If target is too small, use minimum
        if wager < min_wager * 1.1:
            wager = min_wager

        print(f"Predicted roll {predicted_roll:.2f}, greed={optimal_greed}, multiplier={multiplier:.2f}x, wager={wager:.2f}")

        # Play the game
        response = self.send_recv('b')
        response = self.send_recv(str(wager))
        response = self.send_recv('1')
        response = self.send_recv(str(optimal_greed))
        response = self.send_recv('Y')

        # Parse result
        roll, reward, server_seed = self.parse_game_result(response)
        if roll is None:
            print("Failed to parse game result!")
            return False

        # Verify prediction (should match now that we have MT state)
        if abs(roll - predicted_roll) > 0.01:
            print(f"PREDICTION MISMATCH! Predicted {predicted_roll}, got {roll}")
            return False

        self.balance = self.balance - wager + reward
        self.nonce += 1

        print(f"Result: Won! New balance: {self.balance:.2f}")
        return self.balance >= 10000

def solve_live_challenge():
    solver = LiveMTSolver("34.162.20.138", 5000)

    try:
        solver.connect()
        print("Connected to live CTF server")

        # Get initial banner
        response = solver.send_recv('')
        print("Initial response:", response)

        # Collect 624 server_seeds for MT prediction
        collected = solver.collect_mt_outputs(624)
        if not collected:
            print("Failed to collect MT outputs")
            return None

        print(f"MT predictor seeded with {len(collected)} outputs")
        print(f"Balance after collection: {solver.balance:.2f}")

        # Now play optimal games until we reach $10,000
        games_played = 0
        while solver.balance < 10000 and games_played < 100:
            print(f"\nOptimal game {games_played + 1}:")
            success = solver.play_optimal_game()
            games_played += 1

            if success:
                break

        print(f"\nFinal balance after {games_played} optimal games: {solver.balance}")

        if solver.balance >= 10000:
            print("Reached $10,000! Buying the flag!")

            # Go to shop
            response = solver.send_recv('a')
            print("Shop response:", response)

            # Buy flag
            response = solver.send_recv('a')
            print("Flag response:", response)

            # Extract flag
            lines = response.split('\n')
            for line in lines:
                if 'uoftctf{' in line:
                    flag = line.strip()
                    print(f"SUCCESS! Flag: {flag}")
                    return flag

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if solver.sock:
            solver.sock.close()

    return None

if __name__ == '__main__':
    flag = solve_live_challenge()
    if not flag:
        print("Failed to get flag")
```

![[2026-UofTCTF-gamblers.png]]


Solution: ==uoftctf{ez_m3rs3nne_untwisting!!}==
