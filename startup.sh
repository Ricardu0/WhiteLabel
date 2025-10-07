#!/bin/bash
set -e

# Print environment infoo
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "WEBSITES_PORT: $WEBSITES_PORT"

# If WEBSITES_PORT is defined, use that instead of PORT
if [ -n "$WEBSITES_PORT" ]; then
  export PORT=$WEBSITES_PORT
  echo "Using WEBSITES_PORT: $PORT"
fi

# For Azure MySQL, ensure SSL is enabled in DB connection
if [ -n "$MYSQLCONNSTR_localdb" ] || [ -n "$DATABASE_URL" ]; then
  echo "Azure MySQL connection detected, enabling SSL"
  export DB_SSL=true
fi

# Start application
echo "Starting application..."
exec npm start