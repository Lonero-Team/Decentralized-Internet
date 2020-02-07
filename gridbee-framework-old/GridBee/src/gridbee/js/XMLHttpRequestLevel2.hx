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

/**
 * ...
 * @author MG
 */

// http://www.w3.org/TR/progress-events/
interface ProgressEvent implements Event
{
	public var lengthComputable : Bool;
	public var loaded : Float;
	public var total : Float;
}

// ------------------------------------------------------------------
// http://www.w3.org/TR/XMLHttpRequest2/#the-xmlhttprequest-interface
interface XMLHttpRequestEventTarget implements EventTarget
{
	// Events:
	public dynamic function onloadstart(evt : ProgressEvent) : Void;
	public dynamic function onprogress(evt : ProgressEvent) : Void;
	public dynamic function onabort(evt : ProgressEvent) : Void;
	public dynamic function onerror(evt : ProgressEvent) : Void;
	public dynamic function onload(evt : ProgressEvent) : Void;
	public dynamic function ontimeout(evt : ProgressEvent) : Void;
	public dynamic function onloadend(evt : ProgressEvent) : Void;
}

interface XMLHttpRequestUpload implements XMLHttpRequestEventTarget
{
}

extern class XMLHttpRequestLevel2 extends XMLHttpRequest, implements XMLHttpRequestEventTarget
{	
	// Implements the ProgressEventTarget interface through XMLHttpRequestEventTarget interface:
	public function addEventListener(type : String, listener : Dynamic, useCapture : Bool = false) : Void;
	public function removeEventListener(type : String, listener : Dynamic, useCapture : Bool = false) : Void;
	public function dispatchEvent(event : Event) : Bool;
	
	// Implements XMLHttpRequestEventTarget interface events:
	public dynamic function onloadstart(evt : ProgressEvent) : Void;
	public dynamic function onprogress(evt : ProgressEvent) : Void;
	public dynamic function onabort(evt : ProgressEvent) : Void;
	public dynamic function onerror(evt : ProgressEvent) : Void;
	public dynamic function onload(evt : ProgressEvent) : Void;
	public dynamic function ontimeout(evt : ProgressEvent) : Void;
	public dynamic function onloadend(evt : ProgressEvent) : Void;
	
	
	public var upload : XMLHttpRequestUpload;
	
	private static function __init__() : Void
	{
		try
		{
			untyped gridbee.js["XMLHttpRequestLevel2"] =
				if( XMLHttpRequest != null && untyped __js__('!!(new XMLHttpRequest()).upload') )
					__js__("XMLHttpRequest");
				else
					null;
		} catch (e : Dynamic) {
			untyped gridbee.js["XMLHttpRequestLevel2"] = null;
		}
	}
	
}
