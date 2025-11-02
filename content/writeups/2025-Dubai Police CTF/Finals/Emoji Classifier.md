---
title: Emoji Classifier
tags:
  - Coding
Difficulty: Easy
category: Coding
---
### Description

Your task is to find the mislabeled entries and submit their IDs to get the flag.

File Provided: [emoji_dataset.csv](https://raw.githubusercontent.com/gmanctf/2025-Dubai-Police-CTF/refs/heads/main/Finals/Emoji%20Classifier/emoji_dataset.csv)
### Solution

The challenge provides a Jupyter interface (the URL I was given, although obviously now it won't work, was: https://86bdf9b5277d2eaf.chal.ctf.ae/?folder=/home/workspace/project)

We are given `emoji_dataset.csv` as an example dataset. The target is to create an algorithm that gives as an input the row number of misclassified emojis.

The following code worked to get the flag:

```
import pandas as pd

events = pd.read_csv("./data/emoji_dataset.csv")

# expected mapping
correct_mapping = {
    "😺": "cat",
    "🐶": "dog",
    "🍎": "apple",
    "🚗": "car",
}

mislabelled = events[events.apply(lambda r: correct_mapping.get(r['emoji']) != r['label'], axis=1)]

result = sorted(mislabelled['id'].tolist())

# show result
result
```
