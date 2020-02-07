
export default class JWTAuthInterceptor{

	constructor(){
		this.http = {};
	}

	setHttp(http){
		this.http = http;
	}

	update(){
		if(this.http.interceptors){
			this.http.interceptors.request.use(function (config) {
				// do something on success
		        var token = localStorage.getItem('clusterpost_token');
		        if(token){
		          config.headers.authorization = "Bearer " + token;
		        }
		        return config;
			}, function (error) {
				// Do something with request error
				return Promise.reject(error);
			});

			// Add a response interceptor
			this.http.interceptors.response.use(function (response) {
				// Do something with response data
				return response;
			}, function (error) {
				// Do something with response error
				return Promise.reject(error);
			});
		}
	}
	
}