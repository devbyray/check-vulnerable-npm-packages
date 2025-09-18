# How to Check for Compromised NPM Packages

## Purpose

This tool helps you detect compromised npm packages in your project's lock files (`package-lock.json` and `pnpm-lock.yaml`). It was created in response to the S1ngularity/nx supply chain attack that affected numerous packages, as documented in the [Aikido Security blog post](https://www.aikido.dev/blog/s1ngularity-nx-attackers-strike-again).

The attack involved malware that:
- Steals secrets and credentials
- Exfiltrates data to attacker-controlled servers
- Self-propagates through npm by infecting other packages
- Turns private repositories public
- Creates malicious GitHub Actions workflows

The tool scans your lock files against a list of known compromised packages and versions, alerting you if any are found in your dependencies.

## Prerequisites

- **Node.js** must be installed on your system (version 18 or higher recommended)
- The script files should be in the same directory as your `bad-packages.txt` file

## Dependencies

**This tool uses zero external dependencies** - it only requires Node.js built-in modules (`fs`, `path`, etc.) and doesn't need any `npm install` commands. All functionality is self-contained within the script files.

## How to Run

### macOS/Linux
```bash
./check-compromised.sh
```

### Windows
```batch
check-compromised.bat
```
or
```batch
check-compromised.cmd
```

### Direct Node.js Execution
For ES module projects:
```bash
node check-compromised.js
```

For CommonJS projects:
```bash
node check-compromised.cjs
```

## What It Does

1. **Loads the bad packages list** from `bad-packages.txt` (187+ packages currently)
2. **Scans recursively** for `package-lock.json` and `pnpm-lock.yaml` files in:
   - The current directory
   - All subdirectories
   - Including inside `node_modules` folders
3. **Checks dependencies** against the compromised list
4. **Reports findings**:
   - Lists all found lock files with full paths
   - Shows compromised packages in **red** text
   - Displays a **green** success message if no issues are found

## Sample Output

```
Loaded 187 bad packages from bad-packages.txt
Found 2 pnpm-lock.yaml file(s):
  - /path/to/project/pnpm-lock.yaml
  - /path/to/project/node_modules/.pnpm/some-package/pnpm-lock.yaml
Checking /path/to/project/pnpm-lock.yaml...
Checking /path/to/project/node_modules/.pnpm/some-package/pnpm-lock.yaml...
Check complete.
Everything looks good! No compromised packages found.
```

If compromised packages are found:
```
Compromised in pnpm-lock.yaml: @ahmedhfarag/ngx-perfect-scrollbar@20.0.20
```

## Updating the Bad Packages List

The `bad-packages.txt` file contains the list of compromised packages. To update it:

1. Edit `bad-packages.txt`
2. Add new entries in the format: `package-name<TAB>version1,version2`
3. Save the file
4. Re-run the script

The current list is based on the packages documented in the [Aikido Security blog post](https://www.aikido.dev/blog/s1ngularity-nx-attackers-strike-again).

## Files Included

- `check-compromised.js` - ES module version
- `check-compromised.cjs` - CommonJS version
- `check-compromised.sh` - macOS/Linux shell script
- `check-compromised.bat` - Windows batch file
- `check-compromised.cmd` - Windows command file
- `bad-packages.txt` - List of compromised packages
- `how-to-check.md` - This documentation

## Security Recommendations

If compromised packages are found:
1. Remove them from your dependencies
2. Clear your npm/pnpm cache
3. Reinstall all packages
4. Check for any leaked secrets or credentials
5. Consider using tools like [Aikido SafeChain](https://www.npmjs.com/package/@aikidosec/safe-chain) for future protection

## Reference

For more details about the attack, see: [S1ngularity/nx attackers strike again](https://www.aikido.dev/blog/s1ngularity-nx-attackers-strike-again)