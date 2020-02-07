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

package gridbee.core.info;
import haxe.macro.Expr;
import js.Dom;
import js.Lib;

/**
 * ...
 * @author MG
 */

class BrowserInfo
{
	/*
	public static function browserVendor() : String;
	public static function browserName() : String;
	public static function browserFullVersion() : String;
	public static function browserMajorVersion() : Int;
	
	public static function osPlatform() : String;
	public static function osName() : String;

	public static function flashInstalled() : Bool;
	public static function flashFullVersion() : String;
	public static function flashMajorVersion() : Int;

	public static function html5xmlHttpRequestLevel2() : Bool;
	public static function html5localStorage() : Bool;
	public static function html5webWorkers() : Bool;
	public static function html5webSockets() : Bool;
	*/	
	
	// ---------------------------------------------------------------------------------------
	private static var browserVendorValue : String = null;
	private static var browserNameValue : String = null;
	private static var browserFullVersionValue : String = null;
	private static var browserMajorVersionValue : Int = null;
	
	private static function detectBrowser() : Void
	{
		var success : Bool;
		
		success = checkBrowser('Opera Software',
		                       'Opera',
		                       function(navigator) { return untyped __js__("window.opera ? true : false"); },
					           ~/([0-9]+)\.([.0-9]+)$/);
		if (success) return;
		
		success = checkBrowser('Microsoft',
		                       'Internet Explorer',
		                       function(navigator) { return ( if (navigator.userAgent.indexOf('MSIE') > -1) true else false); },
					           ~/MSIE (\d+)\.(\d+)/);
		if (success) return;
		
		success = checkBrowser('Google',
		                       'Chrome',
		                       function(navigator) { return ( if (navigator.userAgent.indexOf('Chrome') > -1) true else false); },
					           ~/Chrome\/(\d+)\.([.0-9]+)/);
		if (success) return;
		
		success = checkBrowser('Mozilla',
		                       'Firefox',
		                       function(navigator) { return ( if (navigator.userAgent.indexOf('Firefox') > -1) true else false); },
					           ~/Firefox\/(\d+)\.([.0-9]+)/);
		if (success) return;
	}
	
	private static function checkBrowser(vendor : String, browser : String, check : Navigator -> Bool, versionRegexp : EReg) : Bool
	{
		if (check(Lib.window.navigator)) {
			versionRegexp.match(Lib.window.navigator.userAgent);
			browserVendorValue = vendor;
			browserNameValue = browser;
			browserMajorVersionValue = Std.parseInt(versionRegexp.matched(1));
			browserFullVersionValue  = versionRegexp.matched(1) + '.' + versionRegexp.matched(2);
			return true;
		}
		return false;
	}
	
	public static function browserVendor() : String
	{
		if (browserVendorValue == null) detectBrowser();
		return browserVendorValue;
	}
	
	public static function browserName() : String
	{
		if (browserNameValue == null) detectBrowser();
		return browserNameValue;
	}
	
	public static function browserFullVersion() : String
	{
		if (browserFullVersionValue == null) detectBrowser();
		return browserFullVersionValue;
	}
	
	public static function browserMajorVersion() : Int
	{
		if (browserMajorVersionValue == null) detectBrowser();
		return browserMajorVersionValue;
	}
	
	
	
	// ---------------------------------------------------------------------------------------
	private static var osPlatformValue: String = null;
	private static var osNameValue : String = null;
	
	private static function detectOs() : Void
	{
		var r : EReg;
		var navigator = Lib.window.navigator;
		var platform : String = navigator.platform;
		var os : String = '';
		
		if (platform.indexOf('Win') > -1)
		{
			r = ~/Windows NT ([.0-9]+)/;
			r.match(navigator.userAgent);
			switch(r.matched(1))
			{
				case '6.1' : os = 'Windows 7';
				case '6.0' : os = 'Windows Vista';
				case '5.2' : os = 'Windows XP';
				case '5.1' : os = 'Windows XP';
				default    : os = 'Windows';
			}
		}
		
		if (platform.indexOf('Linux') > -1)
		{
			os = 'Linux';
		}
		
		if (platform.indexOf('Mac') > -1)
		{
			r = ~/Mac OS X [.0-9]/;
			if (r.match(navigator.userAgent))
			{
				os = r.matched(0);
			}
			else
			{
				os = 'Apple';
			}
		}
		
		osPlatformValue = platform;
		osNameValue = os;
	
	}
	
	public static function osPlatform() : String
	{
		if (osPlatformValue == null) detectOs();
		return osPlatformValue;
	}
	
	public static function osName() : String
	{
		if (osNameValue == null) detectOs();
		return osNameValue;
	}
	
	
	
	// ---------------------------------------------------------------------------------------
	private static var flashInstalledValue : Bool = null;
	private static var flashFullVersionValue : String = null;
	private static var flashMajorVersionValue : Int = null;
	
	private static function detectFlash() : Void
	{
		var flashPlugin = untyped __js__("navigator.plugins[\"Shockwave Flash\"]");
		if (flashPlugin)
		{
			flashInstalledValue = true;
			
			var description : String = untyped __js__("navigator.plugins[\"Shockwave Flash\"].description");
			var r = ~/Flash ([0-9]+)\.([.0-9]+)/;
			r.match(description);
			
			flashFullVersionValue = r.matched(1) + '.' + r.matched(2);
			flashMajorVersionValue = Std.parseInt(r.matched(1));
		} else {
			flashInstalledValue = false;
		}
	}
	
	public static function flashInstalled() : Bool
	{
		if (flashInstalledValue == null) detectFlash();
		return flashInstalledValue;
	}
	
	public static function flashFullVersion() : String
	{
		if (flashFullVersionValue == null) detectFlash();
		return flashFullVersionValue;
	}
	
	public static function flashMajorVersion() : Int
	{
		if (flashMajorVersionValue == null) detectFlash();
		return flashMajorVersionValue;
	}
	
	
	// ---------------------------------------------------------------------------------------
	private static var html5xmlHttpRequestLevel2Value : Bool = null;
	private static var html5localStorageValue : Bool = null;
	private static var html5webWorkersValue : Bool = null;
	private static var html5webSocketsValue : Bool = null;
	
	private static function detectHtml5() : Void
	{
		html5xmlHttpRequestLevel2Value = untyped __js__('!!(new XMLHttpRequest()).upload');
		html5localStorageValue = untyped __js__('!!window.localStorage');
		html5webWorkersValue = untyped __js__('!!window.Worker');
		html5webSocketsValue = untyped __js__('!!window.WebSocket');
	}
	
	public static function html5xmlHttpRequestLevel2() : Bool
	{
		if (html5xmlHttpRequestLevel2Value == null) detectHtml5();
		return html5xmlHttpRequestLevel2Value;
	}
	
	public static function html5localStorage() : Bool
	{
		if (html5localStorageValue == null) detectHtml5();
		return html5localStorageValue;
	}
	
	public static function html5webWorkers() : Bool
	{
		if (html5webWorkersValue == null) detectHtml5();
		return html5webWorkersValue;
	}
	
	public static function html5webSockets() : Bool
	{
		if (html5webSocketsValue == null) detectHtml5();
		return html5webSocketsValue;
	}
	
	public static function NaCl() : Bool
	{
		var testNaclElement:Dynamic = js.Lib.document.createElement("embed");
		testNaclElement.setAttribute("type", "application/x-nacl");
		testNaclElement.setAttribute("width",0);
		testNaclElement.setAttribute("height",0);		
		js.Lib.document.body.appendChild(testNaclElement);	
		var isSupported : Bool = testNaclElement.postMessage ? true : false;
		js.Lib.document.body.removeChild(testNaclElement);
		return isSupported;
	}
	
	private function new() { }	
	
	public static function __init__() : Void
	{
		detectOs();
		detectBrowser();
		detectHtml5();
		detectFlash();
	}
}

