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
3. run `npm start`

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
To make sure that the distribution is done correctly run `SELECT * FROM master_get_active_worker_nodes();`. The worker nodes should appear to you.

Now you can use the app at your [localhost](http://localhost:3000/).

You can stop the database by running `sudo docker-compose -p citus stop` and start it again with `sudo docker-compose -p citus start`

To destroy the database run `sudo docker-compose -p citus sown`

## Adminstration 

To be an admin. You must create a user with this email `admin@shop.com`.

## Metadata Tables

Citus provides some tables that are interesting to look at. You can access `psql` to query those tables by running `sudo docker exec -it citus_master psql -U postgres`. 
Some of those tables are:
| Table | Command | Description |
|:-----:|:-------:|-------------|
|pg_dist_partition|`SELECT * from pg_dist_partition;`|stores metadata about which tables in the database are distributed.|
|pg_dist_shard|`SELECT * from pg_dist_shard;`|stores metadata about individual shards of a table. This includes information about which distributed table the shard belongs to and statistics about the distribution column for that shard.|
|pg_dist_placement|`SELECT * from pg_dist_placement;`|tracks the location of shard replicas on worker nodes.|
|pg_dist_node|`SELECT * from pg_dist_node;`|contains information about the worker nodes in the cluster.|

