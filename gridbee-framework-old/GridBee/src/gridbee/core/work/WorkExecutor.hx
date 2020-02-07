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

package gridbee.core.work;
import henkolib.async.AsyncOperation;
import henkolib.async.AsyncOperation;
import henkolib.async.AsyncResult;
import gridbee.core.iface.Operable;
import gridbee.js.JSWorker;
import henkolib.log.Console;
import henkolib.log.LogLevel;
import gridbee.js.EventTarget;
import gridbee.core.iface.Worker;
import gridbee.core.work.NaClWorker;

/**
 * @author Henko
 */

class WorkExecutor implements Operable
{
	var worker : Worker;
	
	var context : WorkContext;
	var temp : WorkContext;
	
	var running : Bool;
	var start : Bool;
	var lastchecktime : Float;
	
	var operation : AsyncOperation<WorkContext>;
	
	public function new(context : WorkContext) 
	{
		this.context = context;
		
		this.temp = new WorkContext();
		this.temp.copyFrom(context);
		
		running = false;
	}
	
	public function operate() : Void
	{
		if (start && context.isAvailable())
		{
			start = false;
			if (context.getPlatform() == "nacl")
			{
				this.worker = new NaClWorker(temp.getProgramCode());
			}
			else //context.getPlatform() == "javascript"
			{
				this.worker = new JSWorker("worker.js");				
				send("program", temp.getProgramCode());
			}
			
			this.worker.setOnmessage(onmessage);
			this.worker.setOnerror(onerror);
			for (name in temp.getFileList())
			{
				var data = temp.read(name);
				send("data", { openname: name, inputdata: data } );
			}
			send("checkpoint", temp.getCheckpoint());
			send("run");
		}
	}
	
	private function send(command : String, ?data : Dynamic)
	{
		if (this.worker != null)
		{
			worker.postMessage( { command : command, data : data } );
		}
	}
	
	public function run() : AsyncResult<WorkContext>
	{
		this.operation = new AsyncOperation<WorkContext>();
		this.start = true;
		operate();
		return this.operation;
	}
	
	public function terminate()
	{
		this.worker.terminate();
		this.worker = null;
		running = false;
	}
	
	private function onerror(event : ErrorEvent)
	{
		this.temp.log(LogLevel.L1_Error, "worker error: " + event.message, event);
		this.operation.setError("worker error: " + event.message);	
	}
	
	private function onmessage(event : MessageEvent)
	{
		var command : String = event.data.command;
		var data : Dynamic = event.data.data;

		if (command == "running")
		{
			this.running = true;
			this.lastchecktime = Date.now().getTime();
		}
		
		if (command == "done")
		{
			this.temp.setExitStatus(data);
			this.temp.setCompleted();
			this.context.copyFrom(temp);
			this.terminate();
			this.operation.setResult(context);
		}
		
		if (command == "exception")
		{
			this.temp.log(LogLevel.L1_Error, data.type + " error", data.exception);
			this.context.copyFrom(temp);
			this.terminate();
			this.operation.setError(data.type + " error: " + data.exception.message);
		}
		
		if (command == "write")
		{
			this.temp.write(data.name, data.str);
		}

		if (command == "replace")
		{
			this.temp.clear(data.name);
			this.temp.write(data.name, data.str);
		}
		
		if (command == "progress")
		{
			var progress : Float = data;
			this.temp.setProgress(progress);
			this.operation.setProgress(progress);
		}
		
		if (command == "checkpoint")
		{
			this.temp.setCheckpoint(data);
			
			var now = Date.now().getTime();
			this.temp.addWorktime(now - this.lastchecktime);
			this.lastchecktime = now;
			
			this.context.copyFrom(temp);
		}
		
		if (command == "debug")
		{
			this.temp.log(LogLevel.L5_Debug, "Debug", data);
		}
	}
}