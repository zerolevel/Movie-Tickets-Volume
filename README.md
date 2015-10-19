# Movie Tickets Voloume [MTV]

MTV scraps information about movie tickets sold in 250 cities in India. It uses openly available information on the web and stores in the MongoDB collections and is written in [Node.Js].

To run this one requires to install two databases. It expects they run at default ports. (You don't require to do anything for this.)
- [Redis]
- [MongoDB]

While the scrapper is running in one of your machines or a cloud server you can get updates on your email. For this mailgun api is used. Edit config.js for this.

### Installation
You need mocha:

```sh
$ npm i -g mocha
```
```
>> start redis and mongo-server
>> change config file as required.
```
```sh
$ git clone https://github.com/zerolevel/Movie-Tickets-Volume.git mvt
$ cd mvt
$ npm i -d
$ nodejs scrappingJobs/schedules.js
```

License
----
MIT

   [Redis]: <http://redis.io>
   [MongoDB]: <http://docs.mongodb.org/manual/>
   [Node.Js]: <http://nodejs.org>
