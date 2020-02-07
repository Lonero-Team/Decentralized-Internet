var parser = require('cron-parser');

var MAX_SET_TIMEOUT = 2147483647; //Also known as the maximum 32bit integer, the highest number setTimeout/setInterval will allow
var scheduledJobs = {};
var delayedQueue = {};
var delayedQueueIntervalId = null;

var scheduleJob = function(cronTime, callback, args, context, repeating, previousIndex){
    if(repeating == null) repeating = true;
    var interval = parser.parseExpressionSync(cronTime),
        difference = interval.next() - (new Date()),
        timeout = null,
        scheduledJobIndex = previousIndex;

    if(scheduledJobIndex == null){
        //Just a cheap way to get a unique ID. Used later to cancel jobs.
        scheduledJobIndex = (new Date).getTime();
    }
    if(difference > MAX_SET_TIMEOUT){
        delayedQueue[scheduledJobIndex] = [cronTime, callback, args, context, repeating, scheduledJobIndex];
        if(delayedQueueIntervalId == null){
            setUpDelayedQueueInterval();
        }
    }else{
        timeout = setTimeout(executeJob.bind(this, cronTime, callback, args, context, repeating, scheduledJobIndex), difference);
        scheduledJobs[scheduledJobIndex] = timeout;
    }
    return scheduledJobIndex;
};

var setUpDelayedQueueInterval = function(){
    delayedQueueIntervalId = setInterval(function(){
        var keys = Object.keys(delayedQueue);
        for(var i = 0, ii = keys.length; i < ii; i++){
            var task = delayedQueue[keys[i]];
            delete delayedQueue[keys[i]];
            scheduleJob.apply(this, task);
        }
        if(Object.keys(delayedQueue).length === 0){
            tearDownDelayedQueueInterval();
        }
    }, MAX_SET_TIMEOUT);
};

var tearDownDelayedQueueInterval = function(){
    if(delayedQueueIntervalId != null){
        clearInterval(delayedQueueIntervalId);
        delayedQueueIntervalId = null;
    }
};

var cancelJob = function(id){
    var job = scheduledJobs[id];
    var delayedJob = delayedQueue[id];
    var deleted = false;
    if(job != null){
        clearTimeout(job);
        delete scheduledJobs[id];
        deleted = true;
    }
    if(delayedJob != null){
        delete delayedQueue[id];
        if(Object.keys(delayedQueue).length === 0){
            tearDownDelayedQueueInterval();
        }
        deleted = true;
    }
    return deleted;
};

var executeJob = function(cronTime, callback, args, context, repeating, previousIndex){
    if(repeating){
        //I do this before the callback so jobs could actually cancel themselves if they'd like.
        scheduleJob.apply(this, arguments);
    }
    callback.apply(context, args);
};

module.exports = {
    scheduleJob: scheduleJob,
    cancelJob: cancelJob
};