#!/bin/bash

# Source .env file if it exists
if [ -f .env ]; then
    # Export all variables from .env file
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run migration script
node scripts/run-migration.mjs