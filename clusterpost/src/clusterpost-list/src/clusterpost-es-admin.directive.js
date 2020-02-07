
angular.module('clusterpost-list')
.directive('clusterpostEsAdmin', function($routeParams,$location, clusterpostService){

	function link($scope, $element, $attrs){


		clusterpostService.getExecutionServerTokens()
		.then(function(res){
			$scope.tokens = res.data;
		})

		$scope.downloadToken = function(token){

			var filename = "token.json";			
			var bb = new Blob([angular.toJson(token)], {type: 'text/plain'});

			var pom = document.createElement('a');

			$element.append(pom);

			pom.setAttribute('href', window.URL.createObjectURL(bb));
			pom.setAttribute('download', filename);

			pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
			pom.draggable = true; 
			pom.classList.add('dragout');

			pom.click();
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
	    templateUrl: './src/clusterpost-es-admin.directive.html'
	}

});
