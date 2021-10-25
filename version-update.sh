#!/bin/bash

FILENAME="package.json"
IS_SNAPSHOT=$1
SNAPSHOT="-rc"

replace()
{
  local REPLACE=$1
  LAST_VERSION=$(echo "$REPLACE" | xargs)

  sed -i "/version/c\  \"version\": \"$LAST_VERSION\"," $FILENAME

  echo "$LAST_VERSION"
}

PACKAGE_VERSION=$(cat "$FILENAME" \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

if [ "$IS_SNAPSHOT" ]; then
  NEW_VERSION=$(echo "$PACKAGE_VERSION" | \
    gawk -F"." '{$NF+=1}{print $0RT}' OFS="." ORS="")
  replace "$NEW_VERSION$SNAPSHOT"
else
  RELEASE_VERSION=${PACKAGE_VERSION%"$SNAPSHOT"}
  replace "$RELEASE_VERSION"
fi
