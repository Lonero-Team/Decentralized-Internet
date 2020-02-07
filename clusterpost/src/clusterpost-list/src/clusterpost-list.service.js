angular.module('clusterpost-list')
.factory('clusterpostService', function ($q, $http, $location) {
  return {
    getExecutionServers: function () {
      return $http({
        method: 'GET',
        url: '/executionserver'
        
      });
    },
    getJobStatus: function (id) {
      return $http({
        method: 'GET',
        url: '/executionserver/' + id       
      });
    },
    submitJob: function (id,force) {
      return $http({
        method: 'POST',
        url: '/executionserver/' + id,
        data: {
            force: force
          }
      });
    },
    killJob: function (id) {
      return $http({
        method: 'DELETE',
        url: '/executionserver/' + id
        
      });
    },
    createJob: function(job){
      return $http({
        method: 'POST',
        url: '/dataprovider',
        data: job
        
      });
    },
    getAllJobs: function(executable){
      return $http({
        method: 'GET',
        url: '/dataprovider',
        params: {
          executable: executable
        }
      });
    },
    updateJob: function(job){
    	return $http({
        method: 'PUT',
        url: '/dataprovider',
        data: job
        
      });
    },
    getJob: function(id){
    	return $http({
        method: 'GET',
        url: '/dataprovider/' + id        
      });
    },
    getJobDownload: function(id){
      return $http({
        method: 'GET',
        url: '/dataprovider/download/job/' + id, 
        responseType: 'blob'
      })
      .then(function(res){
        return $http({
          method: 'DELETE',
          url: '/dataprovider/download/job/' + id
        })
        .then(function(){
          return res;
        })
      })
    },
    //For the response type check https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType, "text", "arraybuffer", "blob", "json"
    getAttachment: function(id, filename, responseType){
    	return $http({
        method: 'GET',
        url: '/dataprovider/' + id + '/' + encodeURIComponent(filename),
        responseType: responseType
      });
    },
    getAttachmentDowloadToken: function(id, filename, expires){
      return $http({
        method: 'GET',
        url: '/dataprovider/download/' + id + '/' + encodeURIComponent(filename),
        params: {
          expires: expires
        }
      });
    },
    getDownloadAttachmentURL: function(id, filename){
      return this.getAttachmentDowloadToken(id, filename)
      .then(function(res){
        return '/dataprovider/download/' + res.data.token;
      });
    },
    addAttachment: function(id, filename, data){
    	return $http({
        method: 'PUT',
        url: '/dataprovider/' + id + '/' + filename,
        data: data
        
      });
    },
    addAttachments: function(id, filenameArray, dataArray){
      var service = this;
      var addAttachmentsRec = function(id, filenameArray, dataArray, index, resArray){
        return service.addAttachment(id, filenameArray[index], dataArray[index])
        .then(function (res) {
          resArray.push(res);
          index++;
          if(index < filenameArray.length && index < dataArray.length){            
            return addAttachmentsRec(id, filenameArray, dataArray, index, resArray);
          }
          return resArray; 
        })
      }
      return addAttachmentsRec(id, filenameArray, dataArray, 0, []);
    },
    getJobUser: function(email, jobstatus, executable){
    	return $http({
        method: 'GET',
        url: '/dataprovider/user',
        params: {
        	userEmail: email, 
        	jobstatus: jobstatus,
        	executable: executable
        }        
      });
    },
    getUserJobs: function(params){
      return $http({
        method: 'GET',
        url: '/dataprovider/user',
        params: params        
      });
    },
    deleteJob: function(id){
       return $http({
         method: 'DELETE',
         url: '/dataprovider/' + id
       })
    },
    createAndSubmitJob: function(job, filenameArray, dataArray){
      var service = this;
      return service.createJob(job)
      .then(function(res){
        var doc = res.data;
        var job_id = doc.id;
        return service.addAttachments(job_id, filenameArray, dataArray)
        .then(function(res){          
          return service.submitJob(job_id);
        });
      });
    },
    getExecutionServerTokens: function(){
      return $http({
         method: 'GET',
         url: '/executionserver/tokens'
       })
    }
  }
});