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

import henkolib.async.AsyncResult;
import henkolib.async.AsyncOperation;
import gridbee.core.iface.WorkUnit;
import henkolib.log.LogLevel;
import henkolib.events.Event;
import henkolib.events.PublicEvent;
import henkolib.log.Console;
import henkolib.events.SimpleEvent;
import henkolib.events.PublicSimpleEvent;
import henkolib.log.LogEntry;

/**
 * @author tbur
 */

class BasicWorkUnit implements WorkUnit, implements AsyncResult<WorkContext>
{
	private var state : WorkUnitState;
	private var context : WorkContext;
	private var exe : WorkExecutor;
	private var operation : AsyncOperation<WorkContext>;		// provides the AsyncResult interface
	private var ares : AsyncResult<WorkContext>;				// stores the result of WorkExecutor.run
	
	public var onComplete(default, null) : PublicEvent<WorkContext>;
	public var onError(default, null) : PublicEvent<String>;
	
	public var onProgress(default, null) : PublicEvent<Float>;
	public var onProgressChange(default, null) : PublicEvent<Float>;
	
	private var onlog : Event<LogEntry>;
	public var onLog : PublicEvent<LogEntry>;
	
	private var onstatuschange : SimpleEvent;
	public var onStatusChange(default, null) : PublicSimpleEvent;
	
	public function new(?platform : String = "")
	{
		this.state = Init;									// Setting to Passive implemented in children
		this.context = new WorkContext();
		this.context.setPlatform(platform);

		init();
	}
	
	private function init()
	{
		this.operation = new AsyncOperation<WorkContext>();		
		this.onComplete = operation.onComplete;
		this.onError = operation.onError;
		this.onProgress = operation.onProgress;
		this.onProgressChange = operation.onProgress;
		this.onStatusChange = this.onstatuschange = new SimpleEvent();
		this.onLog = this.onlog = new Event<LogEntry>();
	}
	
	//
	// WorkUnit interface
	//
	
	public function operate() : Void
	{
		if (exe != null)
			exe.operate();
	}
	
	public function start() : Void
	{
		if (state == Passive)
		{
			exe = new WorkExecutor(context);
			ares = exe.run();
			
			var self = this;
			
			ares.onComplete.subscribe(function(wc : WorkContext) : Void
			{
				self.SwitchState(Completed);
				self.operation.setResult(wc);
			});
			
			ares.onError.subscribe(function(mes : String) : Void
			{
				self.SwitchState(Completed);
				self.operation.setError(mes);
			});
			
			ares.onProgress.subscribe(function(prog : Float) : Void
			{
				self.operation.setProgress(prog);
			});
			
			SwitchState(Active);
		}
	}
	
	public function disable() : Void
	{
		if (state == Active || state == Passive)
		{
			exe.terminate();
			SwitchState(Disabled);
		}
	}
	
	public function enable() : Void
	{
		if (state == Disabled)
		{
			SwitchState(Passive);
		}
	}
	
	public function terminate() : Void
	{
		if (state == Active)
		{
			exe.terminate();
			SwitchState(Passive);
		}		
	}
	
	private function SwitchState(s : WorkUnitState)
	{
		state = s;
		onstatuschange.invoke();
		Console.main.logDebug("Changed state to " + getStatusString());
		onlog.invoke(new LogEntry(null, LogLevel.L5_Debug, "Changed state to " + getStatusString(), null, null));
	}
	
	public function getState() : WorkUnitState
	{
		return state;
	}
	
	public function getStatusString() : String
	{
		switch(state)
		{
			case WorkUnitState.Active:
				return "Active";
			
			case WorkUnitState.Completed:
				return "Completed";
				
			case WorkUnitState.Disabled:
				return "Disabled";
			
			case WorkUnitState.Init:
				return "Init";
				
			case WorkUnitState.Passive:
				return "Passive";
		}
	}
	
	public function getContext() : WorkContext
	{
		return context;
	}
	
	public function getScreenName() : String
	{
		return "BasicWorkUnit";
	}
	
	public function isChanged() : Bool
	{
		return context.isChanged();
	}
	
	//
	// AsyncResult interface
	//
	
	public function isCompleted() : Bool
	{
		return operation.isCompleted();
	}
	
	public function isError() : Bool
	{
		return operation.isError();
	}
	
	public function getError() : String
	{
		return operation.getError();
	}
	
	public function getProgress() : Float
	{
		return operation.getProgress();
	}
	
	public function getResult() : WorkContext
	{
		return operation.getResult();
	}
	
	public function getElapsedTime() : Date
	{
		return operation.getElapsedTime();
	}
	
	public function hxSerialize(s : haxe.Serializer) : Void
	{
		s.serialize(state);
		s.serialize(context);
	}
	
	public function hxUnserialize(s : haxe.Unserializer)  : Void
	{
		state = s.unserialize();
		context = s.unserialize();
		
		if (state == Active)
		{
			state = Passive;
		}
		
		init();
	}
}