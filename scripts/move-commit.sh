#!/usr/bin/env bash
set -euo pipefail

# Check if arguments are provided
if [ $# -lt 2 ]; then
    echo "Error: Please provide a commit hash and target branch"
    echo "Usage: $0 <commit-hash> <target-branch>"
    exit 1
fi

COMMIT_HASH=$1
TARGET_BRANCH=$2
WORKTREE_DIR=".worktrees/move-$$"
CURRENT_BRANCH=$(git branch --show-current)

# Validate commit exists
if ! git rev-parse --verify "$COMMIT_HASH" >/dev/null 2>&1; then
    echo "Error: Commit $COMMIT_HASH not found"
    exit 1
fi

# Check if target branch exists
if ! git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
    # Check if it exists on remote
    if ! git ls-remote --exit-code --heads origin "$TARGET_BRANCH" >/dev/null 2>&1; then
        echo "Error: Branch '$TARGET_BRANCH' does not exist locally or on remote"
        exit 1
    fi
fi

# Get commit message for PR title
COMMIT_MESSAGE=$(git log --format=%s -n 1 "$COMMIT_HASH")

echo "🌳 Creating worktree at $WORKTREE_DIR..."
BRANCH_NAME="move-$COMMIT_HASH-to-${TARGET_BRANCH//\//-}"
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$TARGET_BRANCH"

cd "$WORKTREE_DIR"

echo "🍒 Cherry-picking commit $COMMIT_HASH..."
if ! git cherry-pick "$COMMIT_HASH"; then
    echo "❌ Cherry-pick failed. Cleaning up..."
    cd ..
    git worktree remove --force "$WORKTREE_DIR"
    exit 1
fi

echo "📤 Pushing branch to remote..."
git push -u origin "$BRANCH_NAME"

echo "✅ Commit moved to branch: $BRANCH_NAME"

# Clean up
cd ../..
echo "🧹 Cleaning up worktree..."
git worktree remove "$WORKTREE_DIR"

echo "✨ Done! Commit $COMMIT_HASH has been moved to a new branch based on $TARGET_BRANCH"
echo "📌 New branch: $BRANCH_NAME"