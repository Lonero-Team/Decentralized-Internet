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

package gridbee.js;
import gridbee.core.iface.Worker;
import henkolib.log.Console;

/**
 * ...
 * @author MG, tbur
 */

// http://www.whatwg.org/specs/web-workers/current-work/
extern class WebWorker
{
	public function addEventListener(type : String, listener : Dynamic, useCapture : Bool = false) : Void;
	public function removeEventListener(type : String, listener : Dynamic, useCapture : Bool = false) : Void;
	public function dispatchEvent(event : Event) : Bool;
	
	public dynamic function onmessage(evt : MessageEvent) : Void;
	public dynamic function onerror(evt : ErrorEvent) : Void;
	
	public function new(filename : String) : Void;
	
	// TODO: messagePort
	public function postMessage(message : Dynamic) : Void;
	public function terminate() : Void;
	
	private static function __init__() : Void
	{
		try
		{
			untyped gridbee.js["WebWorker"] = untyped __js__("Worker");
		} catch (e : Dynamic) {
			untyped gridbee.js["WebWorker"] = null;
		}
	}
}

// http://www.whatwg.org/specs/web-workers/current-work/
class JSWorker implements Worker
{
	private var ww : WebWorker;
	
	public function new(filename : String) : Void
	{
		ww = new WebWorker(filename);
	}
	
	public function addEventListener(type : String, listener : Dynamic, useCapture : Bool = false) : Void
	{
		ww.addEventListener(type, listener, useCapture);
	}
	
	public function removeEventListener(type : String, listener : Dynamic, useCapture : Bool = false) : Void
	{
		ww.removeEventListener(type, listener, useCapture);
	}
	
	public function dispatchEvent(event : Event) : Bool
	{
		return ww.dispatchEvent(event);
	}
	
	public function setOnmessage(func : MessageEvent -> Void) : Void
	{
		ww.onmessage = func;
	}
	
	public function setOnerror(func : ErrorEvent -> Void) : Void
	{
		ww.onerror = func;
	}
	
	// TODO: messagePort
	public function postMessage(message : Dynamic) : Void
	{
		ww.postMessage(message);
	}
	
	public function terminate() : Void
	{
		ww.terminate();
	}
}