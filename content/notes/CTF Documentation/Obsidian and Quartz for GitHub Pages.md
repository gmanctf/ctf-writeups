## Installation Process

To use Obsidian with Quartz in Windows:
1) Download and install Obsidian: https://obsidian.md/
	1) Note: you can change the default theme, but this only affects how Obsidian looks and will not carry over when publishing with Quartz.
2) Install Quartz pre-requisites:
	1) Git: https://git-scm.com/downloads/win
	2) Node.js (this will install npm and npx)
3) Install quartz:

```
git clone https://github.com/jackyzha0/quartz.git
cd quartz
```

Open Obsidian and choose **“Open Folder as Vault”** and select quartz/content. Once the vault loads, create 3 folders:
      writeups/ <-- The formal final write ups
      notes/    <-- your private notes
      images/ <-- images

To keep the notes private open `quartz/quartz.config.ts` and look for the `ignorePatterns` option. Add /notes/** to it. E.g.:

```
ignorePatterns: [
  "content/notes/**"
]
```

By default, Obsidian includes a Welcome.md file. Rename it to index as Quartz expects index to be the home page. Change the contents to whatever you want your home page to look like.
## Build and preview locally

From inside the `quartz/` folder, run:

```
npm install
npx quartz build
```

This will build the static web site under `quartz/public`. To view it locally, you can run: `npx serve public`

# Format notes

Use **YAML frontmatter** at the top for metadata and tags:

```
---
title: PicoCTF 2025 – SQL Injection
tags: [web, sql, injection]
date: 2025-10-04
---
```

Use markdown for text, code, and screenshots (`![[images/screenshot1.png]]`)

# First GitHub Deployment

Push to GitHub and enable GitHub Pages:

1. Create a repo `ctf-writeups`.
2. Navigate to the root of your Quartz folder. Then, run the following commands:

```
# list all the repositories that are tracked
git remote -v

# if the origin doesn't match your own repository, set your repository as the origin
git remote set-url origin https://github.com/gmanctf/ctf-writeups.git

# Add quartz as upstream so updates work
git remote add upstream https://github.com/jackyzha0/quartz.git
```
3. Push your Quartz project. Inside the `quartz/` folder:
```
git init
git add .
git commit -m "First commit"
git branch -M main
git remote add origin https://github.com/YOURUSER/ctf-writeups.git
git push -u origin main
```

3. Enable **GitHub Pages** in repo settings → Pages → select `main` branch, `/ (root)` folder.

Your site will be live at `https://YOURUSER.github.io/ctf-writeups/`.

# GitHub Deployment Workflow Afterwards

- Write in Obsidian (`/writeups/CTFname/challenge.md`).
- Paste screenshots → they get stored automatically.
- When ready, run `git add . && git commit -m "new writeup" && git push`.
- Done → your public site updates.

# Quartz themes

- **Obsidian themes** → only affect how notes look **inside the Obsidian app**.  
    👉 They **do not carry over** when publishing with Quartz.
    
- **Quartz themes** → Quartz has its own styling (CSS + Hugo templates).  
    👉 You can customize it to look like a terminal-style dark theme.

Custom hacker/terminal look:

Edit `quartz/styles/custom.scss` and add:

```
body {
  background-color: #0d0d0d; /* near black */
  color: #00ff7f; /* green terminal text */
  font-family: "Fira Code", monospace;
}
a {
  color: #33ccff;
}
code, pre {
  background-color: #111;
  color: #0f0;
  font-family: "Fira Code", monospace;
}
```

