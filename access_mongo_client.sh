#!/bin/bash
echo "Attempt to connect to MMI Library Server Mongo server..."
docker-compose run --rm mytodolist-mongo mongo \
  --host mytodolist-mongo \
  -u mongouser -p ajdshfez2sd \
  --authenticationDatabase admin \
  sampledb

echo "Bye."
