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

package gridbee.worksource.boinc;
import haxe.Md5;
import gridbee.core.iface.WorkUnit;
import gridbee.core.iface.WorkSource;
import henkolib.async.AsyncResult;
import gridbee.core.work.BasicWorkSource;
import gridbee.core.work.WorkUnitPool;
import gridbee.worksource.boinc.benchmark.WhetstoneBenchmark;
import gridbee.worksource.boinc.reply.FileRef;
import gridbee.worksource.boinc.request.AuthInfo;
import gridbee.worksource.boinc.request.ClientVersion;
import gridbee.worksource.boinc.request.DataServerRequest;
import gridbee.worksource.boinc.request.FileUpload;
import gridbee.worksource.boinc.request.Host;
import gridbee.worksource.boinc.request.HostInfo;
import gridbee.worksource.boinc.request.SchedulerRequest;
import gridbee.worksource.boinc.request.UploadFileInfo;
import gridbee.worksource.boinc.request.WorkRequest;
import gridbee.core.net.HTTPRequest;
import henkolib.async.AsyncOperation;
import haxe.xml.Fast;
import gridbee.worksource.boinc.reply.SchedulerReply;
import henkolib.log.Console;
import gridbee.core.work.BenchmarkWorkUnit;
import gridbee.worksource.boinc.BoincUploaderPool;

import gridbee.worksource.boinc.reply.Message;
import gridbee.worksource.boinc.reply.ResultAck;
import gridbee.worksource.boinc.reply.Application;
import gridbee.worksource.boinc.reply.FileInfo;
import gridbee.worksource.boinc.reply.AppVersion;
import gridbee.worksource.boinc.reply.Workunit;
import gridbee.worksource.boinc.reply.ResultSlot;
import gridbee.core.info.BrowserInfo;

/**
 * @author Henko, tbur
 */

class BoincWorkSource extends BasicWorkSource
{
	static var version : ClientVersion;
	
	public var projecturl : String;
    public var projectname : String;
    public var username : String;
	public var platform : String;
	
	public static function __init__()
	{
		version = new ClientVersion(3, 0, 0);
	}
	
	var scheduler_url : String;
	var authinfo : AuthInfo;
	var host : Host;
	var uploadqueue : Array<BoincWorkUnit>;
	var reportqueue : Array<BoincWorkUnit>;	
	var benchmarkpool : WorkUnitPool;
	var requestinprogress : Bool;
	var uploader : BoincUploaderPool;
	
	public static function getVersion() : ClientVersion
	{
		return version;
	}
	
	public function new(scheduler_url : String, authkey : String) 
	{
		projecturl = new String("");
		projectname = new String("");
		username = new String("");
		
		this.uploadqueue = new Array<BoincWorkUnit>();
		this.reportqueue = new Array<BoincWorkUnit>();
		this.scheduler_url = scheduler_url;		
		this.authinfo = new AuthInfo();
		this.authinfo.authenticator = authkey;		
		this.benchmarkpool = new WorkUnitPool();
		
		this.uploader = new BoincUploaderPool();

		if (BrowserInfo.NaCl())
		{
			platform = "nacl";
			Console.main.logInformation("Setting platform to 'nacl'", null, this);
		}
		else
		{
			platform = "javascript";
			Console.main.logInformation("Setting platform to 'javascript'", null, this);
		}
		host = new Host();
		host.host_info.p_fpops = 0;
		host.host_info.p_iops = 0;
		
		// Calls init()
		super();
	}
	
	override private function init()
	{
		super.init();		
		updateHostInfo();
		this.uploader.onUpload.subscribe(wuUploaded);
		
		// Setting up a benchmark workunit
		if (host.host_info.p_fpops == 0) // benchmarking necessary
		{
			benchmarkpool = new WorkUnitPool();
			var benchmark = new WhetstoneBenchmark();
			var self = this;
			benchmark.onComplete.subscribe(function (c)
			{
				self.host.host_info.p_fpops = benchmark.getFlops();
				self.updateHostInfo();
				self.benchmarkpool.removeCompleted();
				Console.main.logInformation("Benchmark successfully executed.", null, self);
			});
			benchmark.onError.subscribe(function (e)
			{
				Console.main.logError("Benchmark error: " + e, null, self);
				self.benchmarkpool.removeCompleted();
			});
			benchmarkpool.addFirst(benchmark);
			onaddworkunit.invoke(benchmark);
		}
	}
	
	override public function isChanged() : Bool
	{
		return super.isChanged() || benchmarkpool.isChanged() || uploader.isChanged();
	}
	
	override public function startOne()
	{
		// No other workunit can be started until the benchmark is finished
		if (host.host_info.p_fpops != 0)
		{
			if (workpool.getNumInit() + workpool.getNumPassive() == 0 && !requestinprogress)
			{
				var newworks = requestWorks();
				
				var self = this;
				newworks.onComplete.subscribe(function(wus)
				{
					if (wus.length == 0)
					{
						self.platform = "javascript";
						Console.main.logInformation("Setting platform to JavaScript", null, self);
					}
					for (wu in wus)
					{
						self.workpool.add(wu);
						self.onaddworkunit.invoke(wu);
						Console.main.logInformation("New workunit recieved", null, self);
					}
				});
				
				newworks.onError.subscribe(function(errormes)
				{
					Console.main.logNotice(errormes);
				});
			}
			super.startOne();
		}
		else
		{
			benchmarkpool.startOne();
		}
	}
	
	public function getSchedulerUrl() : String
	{
		return scheduler_url;
	}
	
	public function getAuthkey() : String
	{
		return authinfo.authenticator;
	}
	
	private function updateHostInfo()
	{
		HostInfo.updateHostInfo(host.host_info);
	}
	
	override public function getScreenName() : String
	{
		return "BOINC Server WorkSource ("+scheduler_url+")";
	}
	
	override public function operate() : Void
	{
		super.operate();
		uploader.operate();
		
		// removes completed workunits from the workpool
		var wus : Array<BoincWorkUnit> = cast workpool.removeCompleted();		
		
		// uploader stores completed wus so it must be serialized
		for (wu in wus)
		{
			uploader.add(wu);
		}
	}
	
	private function wuUploaded(wu : BoincWorkUnit)
	{
		reportWork(wu);
	}
	
	public function requestWorks() : AsyncResult<Array<WorkUnit>>
	{
		requestinprogress = true;
		
		var request = new SchedulerRequest(platform);
		request.setClientVersion(version);
		request.setPlatform(platform);
		request.setAuthInfo(authinfo);
		request.setHost(host);
		request.setWorkRequest(new WorkRequest(10));
		
		// Report works
		for (work in reportqueue)
		{
			Console.main.logInformation("Reporting uploaded results to: " + getScreenName(), null, work);
			request.addResult(work.getBoincResult());
		}
		
		var result : AsyncOperation<Array<WorkUnit>> = new AsyncOperation<Array<WorkUnit>>();
		
		var self = this;
		var http = HTTPRequest.post(scheduler_url);
		http.rawData(request.toXmlString());
		http.errorCallback(function (error : String) { result.setError(error); self.requestinprogress = false; } );
		http.successCallback(function (response : HTTPResponse)
		{
			Console.main.logInformation("Received Boinc Scheduler reply.", null, self);
			
			var xml = new Fast(Xml.parse(response.content).firstElement());
			var reply = new SchedulerReply(xml);
			
			// =====================================
			// =======   Parse Host ID      ========
			if (reply.hostid != null)
			{
				self.host.hostid = reply.hostid;
				Console.main.logNotice("Registered new host: " + reply.hostid, null, self);
				Console.main.logNotice("Project name: " + reply.project_name, null, self);
				Console.main.logNotice("Username: " + reply.user_name, null, self);
			}
			
			// =====================================
			// ======= Parse Result ACKS    ========
			
			for (ack in reply.result_ack)
			{
				Console.main.logInformation("Received result ack: " + ack.name, null, self);
				for (work in self.reportqueue)
				{
					if (work.getWorkUnitResultName() == ack.name)
					{
						self.reportqueue.remove(work);
						Console.main.logNotice("Reported result accepted. WorkUnit removed.", null, work);
						self.onremoveworkunit.invoke(work);
					}
				}
			}
			
			// =====================================
			// ======= Parse Boinc messages ========
			
			for (message in reply.message)
			{
				Console.main.logNotice("BOINC " + message.priority + " priority message: " + message.message, null, self);
			}
			
			// =====================================
			// ======= Parse sent workunits ========
			
			var workunits = new Array<WorkUnit>();
			for (unit in reply.workunit)
			{
				// Search app info for this workunit
				for (app in reply.app)
				{
					if (app.name == unit.app_name)
					{
						unit.application = app;
					}
				}
				
				// Search appversion info for this workunit
				for (appv in reply.app_version)
				{
					if (appv.app_name == unit.app_name)
					{
						// Join file info to file references
						for (ref in appv.file_ref)
						{
							for (finfo in reply.file_info) 
							{
								if (finfo.name == ref.file_name) ref.file_info = finfo;
								if (ref.main_program) appv.main_program = ref;
							}
						}
						
						// Put this app version info into app info
						unit.application.version = appv;						
					}
				}
				
				// Join files info to file refs
				for (ref in unit.file_ref)
				{
					for (finfo in reply.file_info) 
					{
						if (finfo.name == ref.file_name) ref.file_info = finfo;
					}
				}
				
				// Join result slot to this workunit				
				for (res in reply.result)
				{
					if (res.wu_name == unit.name)
					{
						for (ref in res.file_ref)
						{
							for (finfo in reply.file_info) 
							{
								if (finfo.name == ref.file_name) ref.file_info = finfo;
							}
						}
						
						unit.result = res;
						break;
					}
				}
				var platform : String = "";
				for (v in reply.app_version)
					platform = v.platform;
				var bwu = new BoincWorkUnit(unit,platform);	
				workunits.push(bwu);
			}
			
			result.setResult(workunits);
			self.requestinprogress = false;
		});
		
		Console.main.logInformation("Sending Boinc Scheduler request.", null, this);
		http.send();
		
		return result;
	}
	
	public function reportWork(work : BoincWorkUnit)
	{
		Console.main.logInformation("Added to reporting queue: " + work.getScreenName(), null, this);
		reportqueue.push(work);
	}
	
	override function hxSerialize(s : haxe.Serializer) 
	{
		s.serialize(scheduler_url);
		s.serialize(authinfo);
		s.serialize(host);
		s.serialize(uploader);
		s.serialize(reportqueue);
		s.serialize(projecturl);
		s.serialize(projectname);
		s.serialize(username);
		s.serialize(platform);

		super.hxSerialize(s);
    }
	
    override function hxUnserialize(s : haxe.Unserializer) 
	{
		scheduler_url = s.unserialize();
		authinfo = s.unserialize();
		host = s.unserialize();
		uploader = s.unserialize();
		reportqueue = s.unserialize();
		projecturl = s.unserialize();
		projectname = s.unserialize();
		username = s.unserialize();
		platform = s.unserialize();

		super.hxUnserialize(s);
    }
	
}