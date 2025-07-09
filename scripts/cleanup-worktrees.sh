#!/usr/bin/env bash
set -euo pipefail

FORCE_CLEANUP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_CLEANUP=true
            shift
            ;;
        "")
            # Handle empty string argument (from mise)
            shift
            ;;
        *)
            echo "Usage: $0 [--force]"
            echo "  --force: Clean up all worktrees (not just merged ones)"
            exit 1
            ;;
    esac
done

# Check if .worktrees directory exists
if [[ ! -d ".worktrees" ]]; then
    echo "ℹ️  No .worktrees directory found. Nothing to clean up."
    exit 0
fi

# Get list of worktrees (excluding main repository)
WORKTREES=$(git worktree list --porcelain | grep -E "^worktree " | grep -v "$(git rev-parse --show-toplevel)$" | sed 's/^worktree //' || true)

if [[ -z "$WORKTREES" ]]; then
    echo "ℹ️  No worktrees found. Nothing to clean up."
    exit 0
fi

echo "🔍 Found worktrees to analyze:"
echo "$WORKTREES" | while read -r worktree; do
    echo "  - $worktree"
done

CLEANED_COUNT=0

echo "$WORKTREES" | while read -r worktree; do
    # Get branch name for this worktree
    BRANCH=$(git worktree list --porcelain | grep -A1 "^worktree $worktree$" | grep "^branch " | sed 's/^branch refs\/heads\///' || echo "")
    
    if [[ -z "$BRANCH" ]]; then
        echo "⚠️  Could not determine branch for worktree $worktree, skipping..."
        continue
    fi
    
    if [[ "$FORCE_CLEANUP" == "true" ]]; then
        echo "🗑️  Force cleaning worktree: $worktree (branch: $BRANCH)"
        git worktree remove --force "$worktree" 2>/dev/null || true
        
        # Also delete the branch if it exists
        if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
            echo "🗑️  Deleting branch: $BRANCH"
            git branch -D "$BRANCH" 2>/dev/null || true
        fi
        
        # Delete remote branch if it exists
        if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
            echo "🗑️  Deleting remote branch: $BRANCH"
            git push origin --delete "$BRANCH" 2>/dev/null || true
        fi
        
        CLEANED_COUNT=$((CLEANED_COUNT + 1))
    else
        # Check if branch is merged into main
        if git merge-base --is-ancestor "$BRANCH" main 2>/dev/null; then
            echo "✅ Branch $BRANCH is merged into main, cleaning up worktree: $worktree"
            git worktree remove --force "$worktree" 2>/dev/null || true
            
            # Delete the merged branch
            if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
                echo "🗑️  Deleting merged branch: $BRANCH"
                git branch -d "$BRANCH" 2>/dev/null || true
            fi
            
            # Delete remote branch if it exists and is merged
            if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
                echo "🗑️  Deleting merged remote branch: $BRANCH"
                git push origin --delete "$BRANCH" 2>/dev/null || true
            fi
            
            CLEANED_COUNT=$((CLEANED_COUNT + 1))
        else
            echo "⏭️  Branch $BRANCH is not merged into main, skipping worktree: $worktree"
        fi
    fi
done

# Clean up empty .worktrees directory if it exists
if [[ -d ".worktrees" ]] && [[ -z "$(ls -A .worktrees)" ]]; then
    echo "🧹 Removing empty .worktrees directory..."
    rmdir ".worktrees"
fi

if [[ "$FORCE_CLEANUP" == "true" ]]; then
    echo "✨ Force cleanup complete! Cleaned up all worktrees."
else
    echo "✨ Cleanup complete! Cleaned up $CLEANED_COUNT merged worktrees."
fi