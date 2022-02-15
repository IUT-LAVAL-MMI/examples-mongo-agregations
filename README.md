# Agregation examples on MongoDB with Node.js

## Requirements

- node.js v16+
- npm v8+
- docker
- docker-compose

## Launching the MongoDB test database

In the project directory, execute the following command :
```
docker-compose up
```

To stop it, execute the following command (either in another terminal or once shutting the previous one with CTRL+C) :
```
docker-compose down
```

To clean it completly, remove the associated volume by executing the following command:
```
docker-compose down -v
```

## Accessing the MongoDB test database in a command line client

Once the mongoDB test database launched, execute the following command in another terminal:
```
./access_mongo_client.sh
```
You should be connected to the mongo datbase through a CLI client.

## Testing an example pipeline
Once the mongoDB test database launched, execute the main program in another terminal:
```
node index.js pipelineName
```

For the list of available pipeline names or to have more option on the command, execute
```
node index.js -h
```
