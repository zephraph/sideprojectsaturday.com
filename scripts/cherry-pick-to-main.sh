#!/usr/bin/env bash
set -euo pipefail

# Check if commit hash is provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide a commit hash"
    echo "Usage: $0 <commit-hash>"
    exit 1
fi

COMMIT_HASH=$1
WORKTREE_DIR=".worktrees/cherry-pick-$$"
CURRENT_BRANCH=$(git branch --show-current)
BRANCH_NAME="cherry-pick-$COMMIT_HASH"

# Validate commit exists
if ! git rev-parse --verify "$COMMIT_HASH" >/dev/null 2>&1; then
    echo "Error: Commit $COMMIT_HASH not found"
    exit 1
fi

# Get commit message for PR title
COMMIT_MESSAGE=$(git log --format=%s -n 1 "$COMMIT_HASH")

# Check if the branch already exists and delete it
if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    echo "🗑️  Branch $BRANCH_NAME already exists, deleting..."

    # Check if branch is checked out in any worktree and remove it
    if git worktree list | grep -q "$BRANCH_NAME"; then
        echo "🗑️  Removing existing worktree for $BRANCH_NAME..."
        EXISTING_WORKTREE=$(git worktree list | grep "$BRANCH_NAME" | awk '{print $1}')
        git worktree remove --force "$EXISTING_WORKTREE"
    fi

    git branch -D "$BRANCH_NAME"
fi

# Also delete remote branch if it exists
if git ls-remote --exit-code --heads origin "$BRANCH_NAME" >/dev/null 2>&1; then
    echo "🗑️  Remote branch $BRANCH_NAME already exists, deleting..."
    git push origin --delete "$BRANCH_NAME"
fi

echo "🌳 Creating worktree at $WORKTREE_DIR..."
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" main

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

echo "🤖 Generating PR summary with Claude Code..."
# Get the diff to analyze
DIFF_OUTPUT=$(git diff main..HEAD)

# Use Claude Code to generate a summary
CLAUDE_SUMMARY=$(claude -p "Please review these changes and write a concise summary for a pull request. Focus on what the changes do and why they're useful. Be specific about the functionality added, modified, or fixed:

$DIFF_OUTPUT" 2>/dev/null || echo "Failed to generate AI summary. Using commit message instead: $COMMIT_MESSAGE")

# Prepare PR body
PR_BODY="$CLAUDE_SUMMARY"

# Check if PR already exists for this branch
if gh pr list --head "$BRANCH_NAME" --json number | jq -e '.[0]' >/dev/null 2>&1; then
    echo "✅ PR already exists for branch $BRANCH_NAME, updating description..."
    gh pr edit --body "$PR_BODY"
    PR_URL=$(git config --get remote.origin.url | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')/pull/$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number')
    echo "📌 PR updated: $PR_URL"
else
    echo "🔧 Creating PR with gh CLI..."
    gh pr create \
        --base main \
        --title "$COMMIT_MESSAGE" \
        --body "$PR_BODY"

    # Get PR URL from output
    PR_URL=$(git config --get remote.origin.url | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')/pull/$(gh pr list --head "$BRANCH_NAME" --json number --jq '.[0].number')
    echo "✅ PR created: $PR_URL"
fi

# Clean up
cd ../..
echo "🧹 Cleaning up worktree..."
git worktree remove "$WORKTREE_DIR"

echo "✨ Done! PR is available at: $PR_URL"
