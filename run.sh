# Adapted from script written by Chat GPT

#!/bin/bash

FILE_PATH=$1

# Get the container ID for the service
CONTAINER_ID=$(docker-compose -f docker-compose.yml ps -q flo)

# Copy the file to the container
docker cp $FILE_PATH $CONTAINER_ID:/app/examples/someinputfile.csv

# Execute the command inside the container
docker compose -f docker-compose.yml exec flo sh -c "node dist/index.js -F examples/someinputfile.csv -D"

sleep 1