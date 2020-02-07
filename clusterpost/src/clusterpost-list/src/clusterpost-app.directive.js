
angular.module('clusterpost-list')
.directive('clusterpostApp', function($routeParams,$location, clusterpostService, $filter, $q, clusterauth){

	function link($scope,$attrs){

		$scope.jobs = {
			selectedJob: {}
		};

		$scope.jobs.onFilter = function(filtered){
			$scope.jobs.filteredJobs = filtered;
		}

		$scope.updateStatus = function(job){
		    clusterpostService.getJobStatus(job._id).then(function(res){
	           job.jobstatus = res.data;
	        })
	        .catch(function(e){
	          console.error(e);
	          throw e;
	        })
	    }    

	    $scope.killJob = function(job){

		    clusterpostService.killJob(job._id).then(function(res){
	           job.jobstatus = res.data;
	        })
	        .catch(function(e){
	          console.error(e);
	          throw e;
	        })
	    }
	    $scope.removeRow = function(job) {
	        var index = $scope.rowCollection.indexOf(job);
	        if (index !== -1) {
	            $scope.rowCollection.splice(index, 1);
	        }
    	}   

	   	$scope.deleteJob = function(job){

		    clusterpostService.deleteJob(job._id)
		    .then(function(res){
		    	for(var i = 0; i < $scope.jobs.data.length; i++){
		    		if($scope.jobs.data[i]._id === job._id){
		    			$scope.jobs.data.splice(i, 1);
		    		}
		    	}
	        })
	        .catch(function(e){
	          console.error(e);
	          throw e;
	        });
	    }
	    $scope.saveJob = function(job){
			return clusterpostService.updateJob(angular.copy(job))
			.then(function(res){
				if(res && res.data && res.data[0] && res.data[0].rev){
					job._rev = res.data[0].rev;
				}
				
			})
			.catch(function(e){
                console.error(e);
            });
		}
	    $scope.runJob = function(job,force){
			clusterpostService.submitJob(job._id,force).then(function(res){
				$scope.getDB();
			})
			.catch(function(e){
                console.error(e);
            });
		}

	    $scope.getDB = function(){
	    	clusterpostService.getUserJobs({
	    		userEmail: $scope.appUser.selectedUser.email,
	    		executable: $scope.appName
	    	})
	    	.then(function(res){
				$scope.jobs.data = res.data;
				$scope.jobs.status = _.uniq(_.pluck(_.pluck(res.data, 'jobstatus'), 'status'));
				$scope.jobs.executables = _.uniq(_.pluck(res.data, 'executable'));
			})
			.catch(function(e){
                console.error(e);
            });
		}

		$scope.showJobDetail = function(job){
			$scope.jobs.selectedJob.job = job;
			$scope.activeTab = 1;
			clusterpostService.getAttachment(job._id, "stdout.out", "text")
			.then(function(res){
				$scope.jobs.selectedJob.stdout = res.data.replace(/\n/g, "<br>");
			})
			.catch(console.error);
			clusterpostService.getAttachment(job._id, "stderr.err", "text")
			.then(function(res){
				$scope.jobs.selectedJob.stderr =res.data.replace(/\n/g, "<br>");
			})
			.catch(console.error);
		}

		$scope.runAllJobs = function(){
			if($scope.jobs.filteredJobs){
				
				var prom = _.map($scope.jobs.filteredJobs, function(job){
					return clusterpostService.submitJob(job._id)
					.then(function(res){
						console.log(res);
					})
					.catch(console.error)
				});

				Promise.all(prom)
				.catch(console.error);
			}
		}

		$scope.updateAllJobs = function(){
			if($scope.jobs.filteredJobs){
				
				var prom = _.map($scope.jobs.filteredJobs, function(job){
					return clusterpostService.getJobStatus(job._id)
					.then(function(res){
						job.jobstatus = res.data;
					})
					.catch(console.error)
				});

				Promise.all(prom)
				.catch(console.error);
			}
		}

		$scope.deleteAllJobs = function(){
			if($scope.jobs.filteredJobs){
				
				var prom = _.map($scope.jobs.filteredJobs, $scope.deleteJob);

				Promise.all(prom)
				.catch(console.error);
			}
		}

		$scope.killAllJobs = function(){
			if($scope.jobs.filteredJobs){
				
				var prom = _.map($scope.jobs.filteredJobs, $scope.killJob);

				Promise.all(prom)
				.catch(console.error);
			}
		}

		$scope.jobAppCallback = function(job){
			if($scope.jobCallback){
				$scope.jobCallback(job);
			}
		}

		$scope.numJobsInPage = [ {id: '0', value: '10'},
							      {id: '1', value: '50'},
							      {id: '2', value: '100'}];
		// $scope.itemsByPage = "10";
		$scope.rowCollection = [];
		$scope.forceRunJob = false;
		$scope.activeTab = 0;
		$scope.appUser = {};


		clusterauth.getUser()
		.then(function(user){
			$scope.appUser.selectedUser = user;
			$scope.appUser.user = user;
			if($scope.appUser.user.scope.indexOf('admin')){
				return clusterauth.getUsers()
				.then(function(users){
					$scope.appUser.allUsers = users.data;
					if($routeParams.adminCpUid){
						$scope.appUser.selectedUser = _.find($scope.appUser.allUsers, function(user){
							return user._id === $routeParams.adminCpUid;
						});
					}
					return $scope.getDB();
				});
			}else{
				return $scope.getDB();
			}
		})
		.catch(console.error);

		$scope.appUser.userChange = function(){
			$scope.getDB();
			$location.search('adminCpUid',$scope.appUser.selectedUser._id);
		}

		$scope.getJobName = function(job){
			if(job.name){
				return job.name;
			}else{
				return job._id;
			}
		}

		$scope.downloadAllJobs = function(){
			if($scope.jobs.filteredJobs){
				
				var prom = _.map($scope.jobs.filteredJobs, $scope.downloadJob);

				Promise.all(prom)
				.catch(console.error);
			}
		}

		$scope.downloadJob = function(job){
			if($scope.downloadCallback){
				return $scope.downloadCallback(job);
			}else{
				console.log("TODO");
			}
		}


	}

	return {
	    restrict : 'E',
	    link : link,
	    scope:{
	    	jobCallback: '=',
	    	appName: '=',
	    	downloadCallback: '='
	    },
	    templateUrl: './src/clusterpost-app.directive.html'
	}

});
