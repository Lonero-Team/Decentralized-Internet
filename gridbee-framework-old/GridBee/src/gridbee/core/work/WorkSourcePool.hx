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
import gridbee.core.iface.Operable;
import gridbee.core.iface.Persistent;
import gridbee.core.iface.WorkSource;
import henkolib.log.Console;

/**
 * @author Henko
 */

class WorkSourcePool implements Operable, implements Persistent
{
	var worksources : Array<WorkSource>;
	var targetactive : Int;
	var currentwsindex : Int;
	var changed : Bool;

	public function new() 
	{
		worksources = new Array<WorkSource>();
		targetactive = 1;
		currentwsindex = 0;
		init();
		Console.main.logNotice("WorkSourcePool created: targetactive = " + targetactive);
	}
	
	private function init()
	{
		this.changed = false;
		currentwsindex = 0;
		changed = false;
	}
	
	public function addWorkSource(ws : WorkSource)
	{
		worksources.push(ws);
		changed = true;
	}
	
	public function removeWorkSource(ws : WorkSource)
	{
		worksources.remove(ws);
	}
	
	public function getWorkSources() : Array<WorkSource>
	{
		return worksources;
	}
	
	public function setTargetActive(num : Int) : Void
	{
		targetactive = num;
	}
	
	public function getTargetActive() : Int
	{
		return targetactive;
	}
	
	public function getNumActive() : Int
	{
		var active = 0;
		for (ws in worksources)
		{
			active += ws.getNumActive();
		}
		return active;
	}
	
	private function stepToNext()
	{
			currentwsindex = (currentwsindex + 1) % worksources.length;
	}
	
	private function stepToPrev()
	{
		if (currentwsindex == 0)
			currentwsindex = worksources.length - 1;
		else
			currentwsindex == currentwsindex - 1;
	}
	
	public function operate() : Void
	{
		// Operate all worksources
		for (ws in worksources)
		{
			ws.operate();
		}
		
		// Start one work if needed
		if (getNumActive() < targetactive && worksources.length > 0)
		{
			stepToNext();
			worksources[currentwsindex].startOne();
		}
		
		// Terminate one work if needed
		if (getNumActive() > targetactive)
		{
			worksources[currentwsindex].terminateOne();
			stepToPrev();
		}
	}
	
	public function terminate() : Void
	{
		for (ws in worksources)
		{
			ws.terminate();
		}
	}
	
	public function isChanged() : Bool
	{
		for (ws in worksources)
		{
			if (ws.isChanged())
			{
				changed = true;
			}
		}
		
		return changed;
	}
	
	public function hxSerialize(s : haxe.Serializer) 
	{
		s.serialize(worksources);
		s.serialize(targetactive);
		
		changed = false;
    }
	
    public function hxUnserialize(s : haxe.Unserializer) 
	{
		this.worksources = s.unserialize();
		this.targetactive = s.unserialize();
		
		init();
    }	
}