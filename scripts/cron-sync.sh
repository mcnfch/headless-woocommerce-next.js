#!/bin/bash

# Load environment variables
if [ -f /opt/ggd-01A/.env.local ]; then
    export $(cat /opt/ggd-01A/.env.local | grep -v '^#' | xargs)
fi

# Change to project directory
cd /opt/ggd-01A

# Run sync script
node scripts/sync-products.js >> /opt/ggd-01A/logs/sync.log 2>&1
