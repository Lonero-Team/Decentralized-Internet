# node-crontab

A task scheduler for node that uses the crontab syntax


<a href="https://travis-ci.org/NineCollective/node-crontab"><img src="https://travis-ci.org/NineCollective/node-crontab.svg?branch=master" alt="Travis CI build status" /></a>
***

**Why node-crontab?**


Need to schedule tasks in node and you already have the cron syntax? Then you need node-crontab! We take care of the task scheduling and timing and all you have to do is tell us what to do!

With node-crontab, you can pass in your callback, arguments for the callback, and even the context of the callback function! We also take care of times that are normally too long for setInterval/setTimeout to handle automatically!

So if this sounds like something you need, keep reading!

**Setup**

All you have to do is run this command in the directory of your node project:

`npm install node-crontab`

npm will take care of the rest!

**Example Usage**


*Regular job*
```javascript
var crontab = require('node-crontab');
var jobId = crontab.scheduleJob("*/2 * * * *", function(){ //This will call this function every 2 minutes
    console.log("It's been 2 minutes!");
});
```

*Arguments*
```javascript
var crontab = require('node-crontab');
var jobId = crontab.scheduleJob("* * * * *", function(a){
    console.log("Hello " + a + "! It's been a minute!");
}, ["World"]);
```

*Context*
```javascript
var crontab = require('node-crontab');
var obj = {a: "World"};
var jobId = crontab.scheduleJob("* * * * *", function(){
    console.log("Hello " + this.a + "! It's been a minute!");
}, null, obj);
```

*Non-repeating*
```javascript
var crontab = require('node-crontab');
var jobId = crontab.scheduleJob("* * * * *", function(){
    console.log("Hello world! It's been a minute, but this will be the only time I run.");
}, null, null, false);
```


*Killing a job*
```javascript
var crontab = require('node-crontab');
var jobId = crontab.scheduleJob("* * * * *", function(){
    console.log("It's been a minute!");
});
crontab.cancelJob(jobId); //Should cancel the job immediately
```


*Suicidal jobs*
```javascript
var crontab = require('node-crontab');
var jobId = crontab.scheduleJob("* * * * *", function(){
    console.log("It's been a minute, but this is the last time I run.");
    crontab.cancelJob(jobId); // Jobs can cancel themselves, too!
});
```


**API**

int crontab.**scheduleJob**(cronTime, callback, [args], [context], [repeating = true])
  - **cronTime** - the crontab format of the schedule.
    - Example: "\*/2 \* \* \* \*" would run every 2 minutes of every hour of every day
    - cronTime is parsed by cron-parser, full support information can be found [on the cron-parser github page](https://github.com/harrisiirak/cron-parser).
  - **callback** - The function you'd like to run
  - **args** - Arguments you'd like node-crontab to pass into your callback, in array notation
  - **context** - The "this" of the function you'd like node-crontab to call
  - **repeating** - Declare whether this task should repeat or not. Defaults to true, since usually you use the crontab format for repeating tasks.
  - Returns an ID that you pass into cancelJob in order to kill a job after it's been scheduled


bool crontab.**cancelJob**(jobId)
  - **jobId** - The ID of the job you'd like to cancel
  - Returns true/false, indicates whether it successfully canceled the job or not (will only be false if a job with that ID did not exist)


**To Do**

  -  Create better tests. I've created basic tests, but they're not as good as they could be, probably.


**Wrap-up**


Have an issue? Feel free to open an issue in the <a href="https://github.com/NineCollective/node-crontab/issues">issues page</a>. If you want to help, feel free to fork and make pull requests!