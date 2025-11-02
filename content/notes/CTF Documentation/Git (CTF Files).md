For Windows: https://git-scm.com/install/windows

Get a token from GitHub for authentication (make sure you generate a classic token): https://github.com/settings/tokens

Create the repo in GitHub. Then clone it in the folder you want to upload files from:

```
git clone https://github.com/gmanctf/<repo-name>.git
cd <repo-name>
```

Stage changes: `git add .`
Commit changes: `git commit -m "Add files"`
Push to GitHub: `git push origin main`

