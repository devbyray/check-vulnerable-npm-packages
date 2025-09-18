#!/bin/bash

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js to run this script."
    exit 1
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the script directory
cd "$SCRIPT_DIR"

# Run the check script
if [ -f "check-compromised.js" ]; then
    node check-compromised.js
elif [ -f "check-compromised.cjs" ]; then
    node check-compromised.cjs
else
    echo "Error: Neither check-compromised.js nor check-compromised.cjs found in $SCRIPT_DIR"
    exit 1
fi