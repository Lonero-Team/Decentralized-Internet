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
import henkolib.log.Console;
import haxe.PosInfos;
import henkolib.log.LogLevel;
import henkolib.log.LogSource;
import gridbee.core.iface.Operable;
import gridbee.core.iface.Persistent;

/**
 * Persistent state of a work.
 * @author Henko
 */

class WorkContext implements Persistent
{
	var program : FileStream;
	var files : Hash<FileStream>;
	var checkpointdata : Dynamic;
	var progress : Float;
	var console : Console;	
	var created : Date;
	var worktime : Float;
	var exitstatus : Int;
	var completed : Bool;
	var platform : String;

	var changed : Bool;	
	
	public function new() 
	{
		files = new Hash<FileStream>();
		created = Date.now();
		console = new Console(0, LogLevel.L5_Debug);
		worktime = 0;
		exitstatus = 0;
		completed = false;
		platform = "";
		init();
	}
	
	private function init()
	{
		changed = false;
		this.console.setParent(Console.main);
	}
	
	public function isAvailable() : Bool
	{
		for (f in files)
		{
			if (f.isAvailable() == false)
			{
				return false;
			}
		}
		return true;
	}
	
	public function addFile(name : String, fs : FileStream)
	{
		if (completed) return;
		if (files.exists(name))
		{
			files.remove(name);
		}
		files.set(name, fs);
		changed = true;
	}
	
	public function write(name : String, s : String)
	{
		if (completed) return;
		if (files.exists(name))
		{
			files.get(name).write(s);
		}
		else
		{
			var stream = new FileStream();
			stream.write(s);
			files.set(name, stream);
		}
	}
	
	public function read(name : String) : String
	{
		if (files.exists(name))
		{
			return files.get(name).getContent();
		}
		else
		{
			return "";
		}
	}
	
	public function clear(name : String)
	{
		if (completed) return;
		if (files.exists(name))
		{
			files.get(name).clear();
		}
		else
		{
			var stream = new FileStream();
			files.set(name, stream);
		}
	}
	
	public function setPlatform(p : String)
	{
		platform = p;
	}
	
	public function setCheckpoint(data : Dynamic)
	{
		if (completed) return;
		this.checkpointdata = data;
		changed = true;
	}
	
	public function getCheckpoint() : Dynamic
	{
		return this.checkpointdata;
	}
	
	public function getPlatform() : String
	{
		return platform;
	}
	
	public function getCreatedDate() : Date
	{
		return created;
	}
	
	public function setProgress(progress : Float) : Void
	{
		if (completed) return;
		this.progress = progress;
		changed = true;
	}
	
	public function getProgress() : Float
	{
		return progress;
	}
	
	public function setProgram(program : FileStream)
	{
		if (completed) return;
		this.program = program;
		changed = true;
	}
	
	public function setProgramCode(program : String)
	{
		if (completed) return;
		var fs : FileStream = new FileStream();
		fs.setContent(program);
		this.program = fs;
		changed = true;
	}
	
	public function getProgramCode() : String
	{
		return program.getContent();
	}
	
	public function getFileList() : Array<String>
	{
		var list = new Array<String>();
		
		for (key in files.keys())
		{
			list.push(key);
		}
		
		return list;
	}
	
	public function log(level : LogLevel, message : String, ?data : Dynamic, ?source : LogSource, ?pos : PosInfos)
	{
		if (completed) return;
		console.log(level, message, data, source, pos);
		changed = true;
	}
	
	public function addWorktime(time: Float)
	{
		if (completed) return;
		this.worktime += time;
	}
	
	public function getWorktime() : Float
	{
		return this.worktime;
	}
	
	public function setExitStatus(status : Int)
	{
		if (completed) return;
		this.exitstatus = status;
		changed = true;
	}
	
	public function getExitStatus() : Int
	{
		return this.exitstatus;
	}
	
	public function isCompleted() : Bool
	{
		return completed;
	}
	
	public function setCompleted()
	{
		completed = true;
		changed = true;
	}
	
	public function copyFrom(context : WorkContext)
	{
		this.program = context.program;
		
		this.files = new Hash<FileStream>();
		for (name in context.files.keys())
		{
			this.write(name, context.files.get(name).getContent());
		}
		
		this.checkpointdata = context.checkpointdata;
		this.progress = context.progress;
		this.created = context.created;
		this.console = new Console(0, L5_Debug);
		this.console.copyFrom(context.console);
		this.worktime = context.worktime;
		this.exitstatus = context.exitstatus;
		this.completed = context.completed;
		
		this.changed = true;
	}
	
	public function isChanged() : Bool
	{
		for (file in files)
		{
			if (file.isChanged())
			{
				changed = true;
			}
		}
		
		return true;
	}
	
	public function getLogNoticeText() : String
	{
		return console.exportAsText(0, LogLevel.L3_Notice);
	}
	
	public function hxSerialize(s : haxe.Serializer) 
	{
		s.serialize(program);
		s.serialize(files);
		s.serialize(checkpointdata);
		s.serialize(progress);
		s.serialize(created);
		s.serialize(console);
		s.serialize(worktime);
		s.serialize(exitstatus);
		s.serialize(completed);
		s.serialize(platform);
		
		changed = false;
    }
	
    public function hxUnserialize(s : haxe.Unserializer) 
	{
		this.program = s.unserialize();
		this.files = s.unserialize();
		this.checkpointdata = s.unserialize();
		this.progress = s.unserialize();
		this.created = s.unserialize();
		this.console = s.unserialize();
		this.worktime = s.unserialize();
		this.exitstatus = s.unserialize();
		this.completed = s.unserialize();
		this.platform = s.unserialize();
		init();
    }
}