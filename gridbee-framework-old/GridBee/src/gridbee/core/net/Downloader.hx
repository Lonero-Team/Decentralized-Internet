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

import henkolib.async.AsyncOperation;
import henkolib.async.AsyncResult;
import gridbee.core.net.HTTPRequest;
import gridbee.core.work.FileStream;
import henkolib.log.Console;


/**
 * ...
 * @author tbur
 */
	
class Downloader
{
	private static var databank : Hash<FileStream>;
	static function __init__()
	{
		databank = new Hash<FileStream>();
	}
	
	private var urls : Array<String>;
	private var dlurls : Array<String>;
	private var requests : Array<AsyncResult<HTTPResponse>>;
	private var data : Hash<FileStream>;
	private var result : AsyncOperation<Hash<FileStream>>;
	
	public function new()
	{
		urls = new Array<String>();
		dlurls = new Array<String>();
		requests = new Array<AsyncResult<HTTPResponse>>();
		data = new Hash<FileStream>();
	}
	
	public function add(url : String) : Void
	{
		urls.push(url);
		Console.main.logInformation("Downloading: " + url);
	}
	
	public function downloadAll() : AsyncResult<Hash<FileStream>>
	{
		var self = this;
		result = new AsyncOperation<Hash<FileStream>>();
		
		for (url in urls)
		{
			if (databank.exists(url))
			{
				data.set(url, databank.get(url));
			}
			else
			{
				dlurls.push(url);
			}			
		}
		
		if (dlurls.length == 0)
		{
			result.setResult(self.data);
		}
		
		for (url in dlurls)
		{
			var req = HTTPRequest.get(url).send();
		
			req.onComplete.subscribe(function(response: HTTPResponse)
			{
				var fs = new FileStream();
				fs.write(response.content);
				self.data.set(url, fs);				
				for (r in self.requests)
				{
					if (r.isCompleted() == false) return;
				}
				
				self.result.setResult(self.data);
			});
			
			req.onError.subscribe(function(error:String)
			{
				self.result.setError(error);
			});
			
			req.onProgress.subscribe(function(progress: Float)
			{
				var sum : Float = 0;
				
				for (r in self.requests)
				{
					sum += r.getProgress();
				}
				
				self.result.setProgress(sum / self.requests.length);
			});
		
			requests.push(req);
		}
		
		return result;
	}
}