#!/bin/bash

PACKAGE_FILENAME="package.json"
SNAPSHOT="-rc"
VERSION_PART=$1  # optional: major, minor, patch

# Validate version part if provided
if [[ -n "$VERSION_PART" && ! "$VERSION_PART" =~ ^(major|minor|patch)$ ]]; then
    echo "Invalid version part: $VERSION_PART"
    echo "Valid values: <major|minor|patch>"
    exit 1
fi

# Get current package version
PACKAGE_VERSION=$(jq -r .version "$PACKAGE_FILENAME")
# Strip any pre-release suffix like -rc
PACKAGE_VERSION=${PACKAGE_VERSION%-*}

# Function to increment the version
increment_version() {
    local version="$1"
    local part="$2"

    IFS='.' read -r major minor patch <<< "$version"

    major=${major:-0}
    minor=${minor:-0}
    patch=${patch:-0}

    case "$part" in
        major)
            ((major++))
            minor=0
            patch=0
            ;;
        minor)
            ((minor++))
            patch=0
            ;;
        patch)
            ((patch++))
            ;;
    esac

    echo "$major.$minor.$patch"
}

# Function to update version in package.json
replace_version() {
    local new_version="$1"
    jq --arg v "$new_version" '.version = $v' "$PACKAGE_FILENAME" > "$PACKAGE_FILENAME.tmp" && mv "$PACKAGE_FILENAME.tmp" "$PACKAGE_FILENAME"
}

# Main logic
if [[ -n "$VERSION_PART" ]]; then
    # Snapshot: increment version part and append -rc
    NEW_VERSION=$(increment_version "$PACKAGE_VERSION" "$VERSION_PART")
    NEW_VERSION="$NEW_VERSION$SNAPSHOT"
else
    # Release: keep current version (strip -rc)
    NEW_VERSION="$PACKAGE_VERSION"
fi

replace_version "$NEW_VERSION"

echo "$NEW_VERSION"
