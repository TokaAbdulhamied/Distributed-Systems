#Distributed Online Marketplace System

## Development Setup

The following must be installed on your system:
* [Docker](https://docs.docker.com/get-docker/) 
* [Docker Compose](https://docs.docker.com/compose/install/) must be installed on your system.
* [NodeJS](https://nodejs.org/en/download/)


First, you have to start the database cluster:
1. navigate to the directory of your clone.
2. run `sudo docker-compose -p citus up`
3. in a new terminal run `sudo docker-compose -p citus scale worker=5`

That's it now our cluster is running

Then, you will have to start the ExpressJS server;
1. navigate to the directory of your clone.
2. run `npm i`
3. run `sudo npm start`

Now, the server is running too.

Finally, you need to distribute the tables of the database:
1. navigate to the directory of your clone.
2. run `sudo docker exec -it citus_master psql -U postgres`
3. run 
```
SELECT create_distributed_table('users', 'id');
SELECT create_distributed_table('sales', 'userId');
SELECT create_distributed_table('carts', 'id');
SELECT create_distributed_table('orders', 'userId');
SELECT create_distributed_table('"orderItems"', 'userId');
``` 

Now you can use the app at your [localhost](http://localhost:3000/).

## To Create Admin User

You must create a user with this email "admin@shop.com"


