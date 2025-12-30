#!/bin/bash
# Auto-lint hook for Claude Code
# Runs ESLint and Prettier on TypeScript files after edits

# Read JSON input from stdin
input=$(cat)

# Extract file path using jq (or fallback to grep/sed)
if command -v jq &> /dev/null; then
    file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')
else
    # Fallback: Extract file_path using grep and sed
    file_path=$(echo "$input" | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')
fi

# Exit if no file path found
if [ -z "$file_path" ]; then
    exit 0
fi

# Check if it's a TypeScript/TSX file
if [[ ! "$file_path" =~ \.(ts|tsx)$ ]]; then
    exit 0
fi

# Check if file is in app/ui/ directory
if [[ ! "$file_path" =~ app/ui/ ]]; then
    exit 0
fi

# Check if file exists
if [ ! -f "$file_path" ]; then
    exit 0
fi

# Get the project directory
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
UI_DIR="$PROJECT_DIR/app/ui"

# Only run if we're in a directory with package.json
if [ ! -f "$UI_DIR/package.json" ]; then
    exit 0
fi

# Run ESLint with fix (suppress errors, we don't want to block)
cd "$UI_DIR" 2>/dev/null
npx eslint --fix "$file_path" 2>/dev/null || true

# Run Prettier (suppress errors)
npx prettier --write "$file_path" 2>/dev/null || true

exit 0
