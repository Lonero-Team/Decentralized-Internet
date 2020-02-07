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

extern class XMLHttpRequest {

	var onreadystatechange : Void -> Void;
	public var readyState(default, null) : Int;
	public var responseText(default, null) : String;
	//var responseXML : Xml;
	public var status(default, null) : Int;
	public var statusText(default, null) : String;

	function new() : Void;

	function abort() : Void;

	function getAllResponseHeaders() : String;
	function getResponseHeader( name : String ) : String;
	function setRequestHeader( name : String, value : String ) : Void;
	function open( method : String, url : String, ?async : Bool, ?user : String, ?password : String) : Void;
	function send( content : String ) : Void;

	#if !jsfl
	private static function __init__() : Void {
		untyped
		gridbee.js["XMLHttpRequest"] =
			if( __js__("typeof XMLHttpRequest != 'undefined'") )
				__js__("XMLHttpRequest");
			else if( __js__("typeof ActiveXObject != 'undefined'") )
				function() {
					try {
						return __new__("ActiveXObject","Msxml2.XMLHTTP");
					}catch(e:Dynamic){
						try {
							return __new__("ActiveXObject","Microsoft.XMLHTTP");
						}catch(e:Dynamic){
							throw "Unable to create XMLHttpRequest object.";
						}
					}
				};
			else
				throw "Unable to create XMLHttpRequest object.";
	}
	#end

}
