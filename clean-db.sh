# Adapted from script written by Chat GPT

#!/bin/bash

# Execute the command inside the container
docker compose exec postgres sh -c "psql -U postgres -d floassignment -c 'TRUNCATE TABLE meter_readings'"

sleep 1