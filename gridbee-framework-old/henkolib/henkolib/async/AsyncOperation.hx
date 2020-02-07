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

package henkolib.async;
import haxe.io.Error;
import henkolib.log.Console;
import henkolib.events.Event;
import henkolib.events.PublicEvent;
import haxe.Timer;

/**
 * @author Henko
 */

class AsyncOperation<T> implements AsyncResult<T>
{
	private var result : T;
	private var error : String;
	private var progress : Float;
	private var state : AsyncState;	
	private var starttime : Date;
	
	private var oncomplete : Event<T>;
	private var onerror : Event<String>;
	private var onprogress : Event<Float>;
	
	public var onComplete(default, null) : PublicEvent<T>;
	public var onError(default, null) : PublicEvent<String>;
	public var onProgress(default, null) : PublicEvent<Float>;
	
	public function new() 
	{
		starttime = Date.now();
		
		state = AsyncState.Waiting;
		result = null;
		error = null;
		progress = 0;
		
		this.onComplete = oncomplete = new Event<T>();
		this.onError = onerror = new Event<String>();
		this.onProgress = onprogress = new Event<Float>();
	}
	
	public function setResult(result : T)
	{
		if (state == AsyncState.Waiting)
		{
			var self = this;
			Timer.delay(function()
			{
				self.result = result;
				self.state = AsyncState.Completed;
				self.progress = 1.0;
				self.onprogress.invoke(self.progress);
				self.oncomplete.invoke(result);
			}, 0);			
		}
		else
		{
			Console.main.logError("Async operation result can only be set once!");
		}
	}
	
	public function setError(error : String)
	{
		if (state == AsyncState.Waiting)
		{
			this.error = error;
			state = AsyncState.Error;
			onerror.invoke(error);
		}
		else
		{
			Console.main.logError("Async operation error can only be set once!");
		}
	}
	
	public function setProgress(progress : Float)
	{
		if (progress > this.progress)
		{
			this.progress = progress;
			onprogress.invoke(progress);
		}
	}
	
	public function getElapsedTime() : Date
	{
		return Date.fromTime(Date.now().getTime() - starttime.getTime());
	}
	
	public function isCompleted() : Bool
	{
		return state == AsyncState.Completed;
	}
	
	public function isError() : Bool
	{
		return state == AsyncState.Error;
	}
	
	public function getState() : AsyncState
	{
		return state;
	}
	
	public function getError() : String
	{
		if (state != AsyncState.Error) Console.main.logWarning("Async operation has not completed yet.");
		return error;
	}
	
	public function getProgress() : Float
	{
		return progress;
	}
	
	public function getResult() : T
	{
		if (state != AsyncState.Completed) Console.main.logWarning("Async operation has not completed yet.");
		return result;
	}
	
}