#!/bin/bash

replace()
{
  local REPLACE=$1
  local FILE=$2

  sed -i "/version/c\  \"version\": \"$REPLACE\"," $FILE
}

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

NEW_VERSION=$(echo $PACKAGE_VERSION | \
    gawk -F"." '{$NF+=1}{print $0RT}' OFS="." ORS="")

# set CURRENT version by extracting version from package.json.
if [ -z "$PACKAGE_VERSION" ]; then
  CURRENT=$(cat package.json | jsonValue version)
  CURRENT=`echo $PACKAGE_VERSION` # this command actually trim the string WTF!!!
fi

replace "$NEW_VERSION" "package.json"
