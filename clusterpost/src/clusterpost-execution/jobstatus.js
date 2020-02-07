
var _ = require('underscore');

module.exports = function(doc, conf){
    
    var executionmethods = require('./executionserver.methods')(conf);
    var clusterengine = require("./" + conf.engine)(conf);

    const allUpload = function(allupload){
        return executionmethods.getDocument(doc._id)
        .then(function(docupdated){

            docupdated.jobstatus.uploadstatus = allupload;
            var alluploadstatus = true;
            for(var i = 0; i < allupload.length; i++){
                if(!allupload[i].ok){
                    alluploadstatus = false;
                }
            }
            if(alluploadstatus){
                docupdated.jobstatus.status = "DONE";
            }else{
                docupdated.jobstatus.status = "FAIL";
            }
            docupdated.timestampend = new Date();
            return executionmethods.uploadDocumentDataProvider(docupdated);
        });
    }  
    if(doc.jobstatus.status === "UPLOADING"){
        return executionmethods.checkAllDocumentOutputs(doc)
        .then(allUpload);
    }else{        
        return clusterengine.getJobStatus(doc)
        .then(function(status){
            if(status.status === 'DONE' || status.status === 'EXIT'){
                doc.jobstatus.status = "UPLOADING";
                //Set the new status
                return executionmethods.uploadDocumentDataProvider(doc)
                    .then(function(res){
                        //update revision
                        doc._rev = res.rev;
                        return doc;
                    })
                    .then(function(doc){
                        //upload all outputs
                        return executionmethods.setAllDocumentOutputs(doc)
                    })
                    .then(allUpload);
            }else{
                doc.jobstatus = _.extend(doc.jobstatus, status);
                return executionmethods.uploadDocumentDataProvider(doc)
                .then(function(){
                    return status;
                });
            }
        });
    }
}