
module.exports = function(doc, conf){

    var executionmethods = require('./executionserver.methods')(conf);
    var clusterengine = require("./" + conf.engine)(conf);

    if(doc.jobstatus && (doc.jobstatus.status === "RUN" || doc.jobstatus.status === "KILL")){

        return clusterengine.killJob(doc)
        .then(function(status){
            doc.jobstatus.status = status.status;
            return executionmethods.uploadDocumentDataProvider(doc)
            .then(function(){
                return status;
            });
        });
        
    }else{
        return {
            status: 'The job is not running'
        };
    }
}
    