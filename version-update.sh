#!/usr/bin/env bash
set -euo pipefail

SNAPSHOT_SUFFIX="-rc"
MODE="finalize"
VERSION_PART=""

if [[ "${1:-}" == "release" ]]; then
    MODE="release"
    VERSION_PART="${2:-patch}"
elif [[ "${1:-}" == "rc" ]]; then
    MODE="rc"
elif [[ -n "${1:-}" ]]; then
    MODE="snapshot"
    VERSION_PART="$1"
fi

if [[ -n "$VERSION_PART" && ! "$VERSION_PART" =~ ^(major|minor|patch)$ ]]; then
    echo "Invalid version part: $VERSION_PART" >&2
    echo "Valid values: rc, release <major|minor|patch>, or <major|minor|patch>" >&2
    exit 1
fi

PACKAGE_VERSION="$(node -p "require('./package.json').version")"
PACKAGE_VERSION="${PACKAGE_VERSION%-*}"
CURRENT_VERSION="$(node -p "require('./package.json').version")"

increment_version() {
    local version="$1"
    local part="$2"

    IFS='.' read -r major minor patch <<< "$version"

    major="${major:-0}"
    minor="${minor:-0}"
    patch="${patch:-0}"

    case "$part" in
        major)
            ((major += 1))
            minor=0
            patch=0
            ;;
        minor)
            ((minor += 1))
            patch=0
            ;;
        patch)
            ((patch += 1))
            ;;
    esac

    echo "$major.$minor.$patch"
}

case "$MODE" in
    finalize)
        NEW_VERSION="$PACKAGE_VERSION"
        ;;
    release)
        NEW_VERSION="$(increment_version "$PACKAGE_VERSION" "$VERSION_PART")"
        ;;
    rc)
        NEW_VERSION="${PACKAGE_VERSION}${SNAPSHOT_SUFFIX}"
        ;;
    snapshot)
        NEW_VERSION="$(increment_version "$PACKAGE_VERSION" "$VERSION_PART")${SNAPSHOT_SUFFIX}"
        ;;
esac

if [[ "$CURRENT_VERSION" != "$NEW_VERSION" ]]; then
    npm version --no-git-tag-version "$NEW_VERSION" >/dev/null
fi

echo "$NEW_VERSION"
