#### Database Page Stores

---

**NOTE:** Database datastore will NOT work when the server is run in farm mode.

---


##### mongodb

Support for mongoDB is added by installing the `wiki-storage-mongodb` package, this can be
achieved by running `npm install wiki-storage-mongodb -save` in this directory.

The mongodb connection arguments are specified as follows:

    $ wiki --database '{"type": "mongodb", "url": "...", "options": {...}}'

For convenience the url will also be read from MONGO_URI, MONGOLAB_URI, or MONGOHQ_URL. This smooths the Heroku deployment process somewhat.

The mongodb datastore allows for a graceful upgrade path. If a page is not found in mongodb the flatfile datastore will be consulted.

##### redis

Support for redis is added by installing the `wiki-storage-redis` package, this can be
achieved by running `npm install wiki-storage-redis -save` in this directory.

The Redis connection arguments are specified as follows:

    $ wiki --database '{"type": "redis", "host": "...", "port": nnn, "options": {...}}'

The Redis datastore allows for a graceful upgrade path. If a page is not found in redis the flatfile datastore will be consulted.



##### Example config.json for Redis

```
{
  "database" : {
    "type" : "redis",
    "host" : "your.redis_instance.com",
    "port" : 6379,
    "options": { "auth_pass" : "all_mimsy_were_the_borogroves" }
  }
}
```
