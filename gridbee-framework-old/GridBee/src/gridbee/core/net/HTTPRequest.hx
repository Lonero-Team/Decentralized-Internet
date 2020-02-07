// This file is part of the GridBee Web Computing Framework
// <http://webcomputing.iit.bme.hu>
// Copyright 2011 Budapest University of Technology and Economics,
// Public Administration's Centre of Information Technology (BME IK)
//
// GridBee is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// GridBee is distributed in the hope that it will be useful
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with GridBee. If not, see <http://www.gnu.org/licenses/>.

package gridbee.core.net;

import js.Lib;
import js.XMLHttpRequest;
import henkolib.async.AsyncOperation;
import henkolib.async.AsyncResult;
import gridbee.js.XDomainRequest;
import gridbee.js.XMLHttpRequestLevel2;

/**
 * ...
 * @author MG
 */

class HTTPResponse
{	
	public var statusCode(default, null) : Int;
	
	public var headers(default, null) : Hash<String>;
	
	public var content(default, null) : String;
	
	public function new(statusCode : Int, headers : Hash<String>, content : String)
	{
		this.statusCode = statusCode;
		this.headers = headers;
		this.content = content;
	}
	
}

/* Cross-browser HTTPRequest
 * 
 * Usage example 1: (POST with progress, succes, and error handling)
 * HTTPRequest.post('http://index.hu', 'postdata', false)
 *            .success( function(req, data)     { trace(data);     })
 *            .error(   function(req)           { trace('Error!'); })
 *            .progress(function(req, progress) { trace(progress); })
 *            .start()
 * 
 * 
 * Usage example 2: (We don't want to handle the response)
 * HTTPRequest.post('http://index.hu', 'postdata', true)
 * 
 * 
 * Usage example 3: (Big data upload and download with POST (the upload and download data are approximately the same size))
 * HTTPRequest.post('http://index.hu', 'BIGDATA', false, 0.5)
 *            .progress(function(req, progress) { trace(progress); })
 *            .start()
 * 
 */
class HTTPRequest
{
	private var xhr : XMLHttpRequest;
	private var xhr2 : XMLHttpRequestLevel2;
	private var xdr : XDomainRequest;
	private var req : Dynamic;
	
	private var method : String;
	
	// The expected upload_data_size/(download_data_size + upload_data_size) ratio.
	// This is needed for the progress calculation.
	// If not set, uploadRatio defaults to 1 when using POST, or PUT, and 0 otherwise.
	private var ratio : Float;
	
	// Post form parameters
	private var parameters : Hash<String>;
	
	// Data to be sent with PUT or POST request.
	private var data : String;
	
	// The response to this request
	private var response : AsyncOperation<HTTPResponse>;
	
	// The HTTP method and the URL must be set using the constructor.
	private function new(method : String, url : String)
	{
		if (XMLHttpRequestLevel2 != null)
		{
			// Using XMLHttpRequestLevel2
			xhr2 = new XMLHttpRequestLevel2();
			xhr2.addEventListener("progress", this.xhr2OnProgress, false);
			xhr2.addEventListener("load", this.xhr2OnLoad, false);
			xhr2.addEventListener("error", this.xhr2OnError, false);
			xhr2.upload.addEventListener("progress", this.xhr2UploadOnProgress, false);
			xhr2.open(method, url, true);
			req = xhr2;
		} 
		else 
		{
			// Is the request url on the same domain as we are?
			var r : EReg = ~/(http:\/\/)?([^\/]*).*/;
			r.match(Lib.window.location.href);
			var currentDomain = r.matched(2);
			r.match(url);
			var reuqestDomain = r.matched(2);
			
			if (currentDomain != reuqestDomain && XDomainRequest != null)
			{
				// Using XDomainRequest
				xdr = new XDomainRequest();
				xdr.onload = xdrOnLoad;
				xdr.onerror = xdrOnError;
				xdr.open(method, url);
				req  = xdr;
			} 
			else 
			{
				// Using XMLHttpRequest Level 1
				xhr = new XMLHttpRequest();
				xhr.onreadystatechange = xhrOnReadyStateChange;
				xhr.open(method, url, true);
				req = xhr;
			}
		}
		
		this.method = method;
		
		if (method == 'POST' || method == 'PUT')
		{
			this.ratio = 1;
		} else {
			this.ratio = 0;
		}
		
		this.data = null;
		this.parameters = new Hash<String>();
		
		response = new AsyncOperation<HTTPResponse>();
	}
	
	// Start the request
	public function send() : AsyncResult<HTTPResponse>
	{		
		response.setProgress(0);
		if (this.data == null)
		{
			if (this.xdr == null)
			{
				req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			}
			else
			{
				xdr.contentType = "application/x-www-form-urlencoded";
			}
			for (key in this.parameters.keys())
			{
				if (this.data == null) this.data = "";
				if (this.data != null) this.data += '&';
				this.data += StringTools.urlEncode(key) + '=' + StringTools.urlEncode(this.parameters.get(key));
			}
		}
		try
		{
			req.send(data);
		} 
		catch (e : Dynamic) 
		{
			response.setError("");
		}
		
		return response;
	}
	
	// XMLHttpRequest Level 1 callback:
	private function xhrOnReadyStateChange() : Void
	{
		if (xhr.readyState == 4)
		{
			if (xhr.status == 200)
			{
				response.setProgress(1);
				response.setResult(new HTTPResponse(null, null, this.xhr.responseText));
			} 
			else 
			{
				response.setError("Error: "+xhr.statusText);
			}
		}
		/* Elvileg ilyen modon lehetne figyelni a progress-t, de gyakorlatilag nagyon sok CPU-t eszik.
		else if (xhr.readyState == 3) {
			var length = xhr.getResponseHeader("Content-Length");
			if (length != null)
			{
				var progress = xhr.responseText.length / Std.parseInt(length);
				this.setProgress(progress);
			}
		}
		*/
	}
	
	// XMLHttpRequest Level 2 callbacks:
	private function xhr2UploadOnProgress(evt : ProgressEvent) : Void
	{
		if (evt.lengthComputable)
		{
			var progress = evt.loaded / evt.total;
			
			progress = ratio * progress;

			response.setProgress(progress);
		}
	}
	
	private function xhr2OnProgress(evt : ProgressEvent) : Void
	{
		if (evt.lengthComputable)
		{
			var progress = evt.loaded / evt.total;
			
			progress = (1 - ratio) * progress + ratio;
			
			response.setProgress(progress);
		}
	}
	
	private function xhr2OnLoad(evt : ProgressEvent) : Void
	{
		if (this.xhr2.status == 200)
		{
			response.setProgress(1);
			response.setResult(new HTTPResponse(null, null, this.xhr2.responseText));
		}
		else
		{
			response.setError("HTTP ERROR: "+this.xhr2.statusText+" ("+this.xhr2.status+")");			
		}
	}
	
	private function xhr2OnError(evt : ProgressEvent) : Void
	{
		response.setError("Network error");
	}
	
	// XDomainRequest callbacks:
	private function xdrOnLoad() : Void
	{
		response.setProgress(1);
		response.setResult(new HTTPResponse(null, null, this.xdr.responseText));
	}
	
	private function xdrOnError() : Void
	{
		response.setError("");
	}
	
	
	// ------------------------------------------
	// Methods for simple usage
	
	// Initialize GET request
	public static function get(url : String) : HTTPRequest
	{
		return new HTTPRequest('GET', url);
	}
	
	// Initialize POST request
	public static function post(url : String) : HTTPRequest
	{
		return new HTTPRequest('POST', url);
	}
	
	// Initialize PUT request
	public static function put(url : String) : HTTPRequest
	{
		return new HTTPRequest('PUT', url);
	}
	
	// set the upload/download ration
	public function uploadRatio(ratio : Float) : Void
	{
		this.ratio = ratio;
	}
	
	// Set data to be sent
	public function rawData(data : String) : Void
	{
		this.data = data;
	}
	
	// Set url encoded parameter to be sent
	public function addParam(key : String, value : String) : Void
	{
		this.parameters.set(key, value);
	}
	
	// Set success callback
	public function successCallback(successCallback : HTTPResponse -> Void) : Void
	{
		response.onComplete.subscribe(successCallback);
	}
	
	// Set error callback
	public function errorCallback(errorCallback : String -> Void) : Void
	{
		response.onError.subscribe(errorCallback);
	}
	
	// Set progress callback
	public function progressCallback(progressCallback : Float -> Void) : Void
	{
		response.onProgress.subscribe(progressCallback);
	}
}
