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

package henkolib.log;
import haxe.PosInfos;
import henkolib.events.EventArgs;
import henkolib.events.PublicEvent;
import henkolib.events.Event;

/**
 * @author Henko
 */

class Console 
{
	private var parent : Console;
	private var entries : Array<LogEntry>;
	private var maxentries : Int;
	private var filterlevel : LogLevel;
	
	private var onlog: Event<LogEntry>;
	public var onLog(default, null): PublicEvent<LogEntry>;
	
	public function new(max : Int = 0, filterlevel : LogLevel, ?parent : Console)
	{
		this.maxentries = max;
		this.filterlevel = filterlevel;
		this.parent = parent;
		entries = new Array<LogEntry>();
		onlog = new Event<LogEntry>();
		onLog = onlog;
	}
	
	public static var main : Console;
	
	static function __init__()
	{
		main = new Console(1000, LogLevel.L4_Information, null);
	}
	
	public function getEntries(max : Int = 0, filter : LogLevel) : Iterator<Null<LogEntry>>
	{
		var filtered = new Array<LogEntry>();
		
		for (entry in entries)
		{
			if (Type.enumIndex(entry.level) <= Type.enumIndex(filter))
			{
				filtered.unshift(entry);
				if (max > 0 && filtered.length >= max)
				{
					return filtered.iterator();
				}
			}
		}
		
		return filtered.iterator();
	}
	
	public function log(level : LogLevel, message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		if (level != null && filterlevel != null)
		{
			if (Type.enumIndex(level) > Type.enumIndex(filterlevel)) return;
		}
		else
		{
			if (level == null) Console.main.logWarning("New log entry level is null.");
			if (filterlevel == null) Console.main.logWarning("Filterlevel is null.");			
		}
		
		var entry = new LogEntry(source, level, message, data, pos);
		entries.unshift(entry);
		
		if (maxentries > 0 && entries.length > maxentries)
		{
			entries.pop();
		}
		
		if (onLog != null)
		{
			onlog.invoke(entry);
		}
		
		if (parent != null)
		{
			parent.log(level, message, data, source, pos);
		}
	}
	
	public function setParent(console : Console)
	{
		this.parent = console;
	}
	
	public function logDebug(message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		log(LogLevel.L5_Debug, message, data, source, pos);
	}
	
	public function logInformation(message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		log(LogLevel.L4_Information, message, data, source, pos);
	}
	
	public function logNotice(message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		log(LogLevel.L3_Notice, message, data, source, pos);
	}
	
	public function logWarning(message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		log(LogLevel.L2_Warning, message, data, source, pos);
	}
	
	public function logError(message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		log(LogLevel.L1_Error, message, data, source, pos);
	}
	
	public function logCritical(message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		log(LogLevel.L0_Critical, message, data, source, pos);
	}
	
	public function exportAsHtml(numlast : Int, filter : LogLevel) : String
	{
		var html : String = "";
		
		var entries = getEntries(numlast, filter);
		
		while (entries.hasNext())
		{
			var e = entries.next();
			var classname : String = "";
			
			switch (e.level)
			{
				case L0_Critical: classname = "critical";
				case L1_Error: classname = "error";
				case L2_Warning: classname = "warning";
				case L3_Notice: classname = "notice";
				case L4_Information: classname = "information";
				case L5_Debug: classname = "debug";
				default: classname = "";
			}
			
			var line = '<div class="logentry ' + classname + '">';
			
			line += '<div class="time">' + DateTools.format(e.time, "%H:%M:%S") + '</div>';
			
			if (e.source != null)
			{
				line += '<div class="source">' + e.source.getScreenName() + '</div>';
			}
			
			line += e.message;
			
			if (e.data != null)
			{
				line += '<div class="data">';
				line += '<pre>' + Std.string(e.data) + '</pre>';
				line += '</div>';
			}
			
			/*if (e.level == LogLevel.L1_Error || e.level == LogLevel.L0_Critical)
			{
				line += '<div class="details">';
				line += '<p>' + e.pos.className + '.' + e.pos.methodName + '</p>';
				line += '<p>' + e.pos.fileName + ' # ' + e.pos.lineNumber + '</p>';
				line += '</div>';
			}*/
			
			line += "</div>";
			
			html += line + "\n";
		}
		
		return html;
	}
	
	public function exportAsText(numlast : Int, filter : LogLevel) : String
	{
		var text : String = "";
		
		var entries = getEntries(numlast, filter);
		
		while (entries.hasNext())
		{
			var e = entries.next();
			
			var line = '';
			
			line += DateTools.format(e.time, "%H:%M:%S") + ' ';
			
			line += '[' + Type.enumIndex(e.level) + '] ';
			
			if (e.source != null)
			{
				line += e.source.getScreenName() + ' ';
			}
			
			line += ': ';
			
			line += e.message;
			
			if (e.data != null)
			{
				line += "\n";
				line += Std.string(e.data);
			}
			
			if (e.level == LogLevel.L1_Error || e.level == LogLevel.L0_Critical)
			{
				line += "\n";
				line += e.pos.className + '.' + e.pos.methodName;
				line += "\n";
				line += e.pos.fileName + ' # ' + e.pos.lineNumber;
			}
			
			text += line + "\n";
		}
		
		return text;
	}
	
	public function copyFrom(console : Console)
	{
		this.entries = entries = new Array<LogEntry>();
		for (entry in console.entries)
		{
			this.entries.push(entry);
		}
		this.maxentries = console.maxentries;
		this.filterlevel = console.filterlevel;
	}
	
	function hxSerialize(s : haxe.Serializer) 
	{
		s.serialize(entries);
		s.serialize(maxentries);
		s.serialize(filterlevel);
    }
	
    function hxUnserialize(s : haxe.Unserializer) 
	{
        entries = s.unserialize();
		maxentries = s.unserialize();
        filterlevel = s.unserialize();
		
		onlog = new Event<LogEntry>();
    }
}