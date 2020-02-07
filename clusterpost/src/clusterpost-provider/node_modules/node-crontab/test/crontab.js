var expect = require('expect.js'),
    crontab = require('../lib/crontab.js');

describe('Crontab', function(){
    it('creates normal task', function(done){
        //Creates a task
        var jobId = crontab.scheduleJob("* * * * *", function(){
            console.log("Hello world");
        });
        expect(typeof(jobId)).to.be(typeof(new Date().getTime()));
        done();
    });

    it('creates long-term task', function(done){
        //This test schedules a function for yesterday of this month (or the 28th of the previous month if today is the first), which should make the difference be greater than MAX_SET_TIMEOUT, meaning this should be scheduled in the delayed queue
        var date = new Date();
        var day = date.getDate()-1;
        var month = date.getMonth()+1;
        if(day === 0){
            day = 28;
            month -= 1;
        }
        if(month === 0){
            month = 12;
        }
        var yesterdayOfNextYear = "* * " + (day) + " " + (month) + " *";
        var jobId = crontab.scheduleJob(yesterdayOfNextYear, function(){
            console.log("Hello world");
        });
        expect(typeof(jobId)).to.be(typeof(new Date().getTime()));
        done();
    });

    it('executes task', function(done){
        //This job relies on cron-parser's support for second-based parsing, schedules a task that should fire on the next second
        var jobId = crontab.scheduleJob("* * * * * *", function(){
            done();
        }, null, null, false);
        setTimeout(function(){
            done("Didn't execute callback");
        }, 2000);
    });

    it('cancels task', function(done){
        //Schedules a task, then cancels it and expects canceled to be true
        var jobId = crontab.scheduleJob("* * * * * *", function(){
            console.log("Hello world.");
        });
        var canceled = crontab.cancelJob(jobId);
        expect(canceled).to.be(true);
        done();
    });

    it('should break with invalid cron', function(done){
        //Trying to schedule a task with an invalid cron time, cron-parser is actually responsible for the exception we're receiving
        try {
            crontab.scheduleJob("this should fail", function(){
                console.log("Should never make it here");
            });
            done("Didn't throw an exception");
        }catch(e){
            expect(e.message).to.be("Invalid characters, got value: this");
            done();
        }
    });

    it('fails to cancel invalid task id', function(done){
        //Tries to cancel a task that shouldn't exist.
        var result = crontab.cancelJob((new Date()).getTime());
        expect(result).to.be(false);
        done();
    });
});