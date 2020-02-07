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


// http://msdn.microsoft.com/en-us/library/cc288060(v=vs.85).aspx
extern class XDomainRequest
{
	function new() : Void;

	public var responseText : String;
	public var contentType : String;
	public var timeout : Int;
	
	public dynamic function onerror() : Void;
	public dynamic function onload() : Void;
	public dynamic function onprogress() : Void;
	public dynamic function ontimeout() : Void;

	function abort() : Void;
	function open(method : String, url : String) : Void;
	function send(?content : String) : Void;
	
	private static function __init__() : Void
	{
		try
		{
			untyped gridbee.js["XDomainRequest"] = untyped __js__("XDomainRequest");
		} catch (e : Dynamic) {
			untyped gridbee.js["XDomainRequest"] = null;
		}
	}

}
