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

package gridbee.core.control;
import haxe.Serializer;
import haxe.Timer;
import haxe.Unserializer;
import henkolib.events.PublicEvent;
import henkolib.log.Console;
import henkolib.log.LogEntry;
import gridbee.core.iface.WorkSource;
import gridbee.core.work.WorkSourcePool;
import gridbee.js.LocalStorage;
import gridbee.worksource.boinc.BoincWorkSource;
import gridbee.worksource.boinc.webrpc.BoincWebRPC;

/**
 * @author Henko, tbur
 */

class Client
{
	var timer : Timer;
	var worksourcepool : WorkSourcePool;
	var savepath : String;
	var webrpc : BoincWebRPC;
	
	public var onLog(default, null) : PublicEvent<LogEntry>;

	public function new(savepath : String) 
	{
		this.timer = null;
		this.savepath = savepath;
		onLog = Console.main.onLog;
		restore();
	}
	
	public function start(ms : Int = 2000)
	{
		timer = new Timer(ms);
		timer.run = onrun;
	}
	
	public function stop() : Void
	{
		terminate();
	}
	
	public function terminate()
	{
		if (timer != null)
		{
			worksourcepool.terminate();
			
			timer.stop();
			timer = null;
		}
	}
	
	public function CreateBoincWebRPCHandler(projecturl : String) : BoincWebRPC
	{
		this.webrpc = new BoincWebRPC(projecturl);
		return this.webrpc;
	}
	
	public function setThreadNumber(n : Int) : Void
	{
		worksourcepool.setTargetActive(n);
	}
	
	public function getThreadNumber() : Int
	{
		return worksourcepool.getTargetActive();
	}
	
	public function onrun()
	{
		worksourcepool.operate();
	
		if (worksourcepool.isChanged())
		{
			save();
		}
	}
	
	public function addWorksource(worksource : WorkSource) : Void
	{
		worksourcepool.addWorkSource(worksource);
		save();
	}
	
    public function removeWorksource(worksource : WorkSource) : Void
	{
		worksourcepool.removeWorkSource(worksource);
		save();
	}
	
    public function getWorksources() : Array<WorkSource>
	{
		return worksourcepool.getWorkSources();
	}
	
	public function addBoincWorkSource(scheduler_url : String, authkey : String)
	{
		worksourcepool.addWorkSource(new BoincWorkSource(scheduler_url, authkey));
		save();
	}
	
	public function setTargetActive(num : Int)
	{
		worksourcepool.setTargetActive(num);
		save();
	}
	
	public function save()
	{
		Serializer.USE_CACHE = true;
		var str = Serializer.run(worksourcepool);
		LocalStorage.setItem(savepath, str);
	}
	
	public function restore()
	{
		try
		{
			var string = LocalStorage.getItem(savepath);
			
			if (string == null || string == "")
			{
				worksourcepool = new WorkSourcePool();
				Console.main.logWarning("Client is not installed in this browser yet. Installing new settings.");
			}
			else
			{
				worksourcepool = cast(Unserializer.run(string), WorkSourcePool);
				Console.main.logNotice("Loaded last settings from LocalStorage.");
			}
		} catch (e : Dynamic)
		{
			worksourcepool = new WorkSourcePool();
			save();
			Console.main.logError("Could not load from LocalStorage! Invalid data found! Installing new settings.");
		}
	}
}