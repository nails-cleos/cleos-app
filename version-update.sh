#!/bin/bash

PACKAGE_FILENAME="package.json"
BUILD_REPLACE="/version/c\  \"version\":"
SNAPSHOT="-rc"
IS_SNAPSHOT=$1
VERSION_PART=$2

### Increments the part of the string
## $1: version itself
## $2: number of part: 0 – major, 1 – minor, 2 – patch
increment_version() {
  local delimiter=.
  local array=($(echo "$1" | tr $delimiter '\n'))
  array[$2]=$((array[$2]+1))

  for i in 0 1 2
  do
    if [ "$2" -lt "$i" ]; then
      array["$i"]=0
    fi
  done

  echo $(local IFS=$delimiter ; echo "${array[*]}")
}

replace()
{
  local REPLACE=$1
  local FILENAME=$2
  local QUERY=$3

  LAST_VERSION=$(echo "$REPLACE" | xargs)

  sed -i "$QUERY \"$LAST_VERSION\"," $FILENAME

  echo "$LAST_VERSION"
}

if [ "$IS_SNAPSHOT" ] && [ -z "$VERSION_PART" ]; then
  exit 'Error'
fi

PACKAGE_VERSION=$(cat "$PACKAGE_FILENAME" \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

PACKAGE_VERSION=$(echo "$PACKAGE_VERSION" | sed -E 's/(-*?)\-.*/\1/')

# set CURRENT version by extracting version from package.json.
if [ "$IS_SNAPSHOT" ]; then
  NEW_VERSION=$(increment_version "$PACKAGE_VERSION" "$VERSION_PART")
  NEW_VERSION="$NEW_VERSION$SNAPSHOT"
  replace "$NEW_VERSION" "$PACKAGE_FILENAME" "$BUILD_REPLACE"

## replace "$VERSION_PART_DEFAULT" "$VERSION_PART_FILENAME" "$VERSION_PART_REPLACE"

else
  RELEASE_VERSION=${PACKAGE_VERSION%"$SNAPSHOT"}
  replace "$RELEASE_VERSION" "$PACKAGE_FILENAME" "$BUILD_REPLACE"
fi
