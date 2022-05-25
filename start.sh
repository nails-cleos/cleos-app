#!/bin/bash

echo "Docker pull"
docker-compose pull

echo "Starting docker compose"
docker-compose up  --build -d

echo "Run init script"

# Windows command
# winpty docker exec mongo1 //scripts//rs-init.sh

## Linux
docker exec mongo1 /scripts/rs-init.sh
