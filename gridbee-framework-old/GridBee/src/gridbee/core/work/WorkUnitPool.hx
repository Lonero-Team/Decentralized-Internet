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
import gridbee.core.iface.WorkUnit;
import henkolib.log.Console;
import henkolib.log.LogSource;

/**
 * @author tbur, Henko
 */

class WorkUnitPool implements Operable, implements LogSource, implements Persistent
{
	private var workunits : Array<WorkUnit>;
	var changed : Bool;
	
	public function new() 
	{
		this.workunits = new Array<WorkUnit>();
		init();
	}
	
	private function init()
	{
		this.changed = false;
	}
	
	public function add(work : WorkUnit) : Void
	{
		this.workunits.push(work);
		this.changed = true;
	}
	
	public function addFirst(work : WorkUnit) : Void
	{
		this.workunits.unshift(work);
		this.changed = true;
	}
	
	public function startOne() : Void						//starts a single workunit
	{
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Passive)
			{
				work.start();								//work cannot refuse
				return;
			}
		}
	}
	
	public function terminateOne() : Void					//terminates one workunit
	{
		Console.main.logInformation("terminate one called on workunitpool");
		var i : Int = workunits.length - 1;
		while(i >= 0)
		{
			var work = workunits[i];
			if (work.getState() == WorkUnitState.Active)
			{
				work.terminate();
				workunits.remove(work);
				workunits.push(work);
				return;
			}
			i--;
		}
	}
	
	public function terminateAll() : Void
	{
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Active)
			{
				work.terminate();
				workunits.remove(work);
				workunits.unshift(work);
			}
		}
	}
	
	public function getNumInit() : Int
	{
		var nr : Int = 0;
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Init)
			{
				nr++;
			}
		}
		return nr;
	}
	
	public function getNumPassive() : Int
	{
		var nr : Int = 0;
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Passive)
			{
				nr++;
			}
		}
		return nr;
	}
	
	public function getNumActive() : Int
	{
		var nr : Int = 0;
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Active)
			{
				nr++;
			}
		}
		return nr;
	}
	
	public function getNumCompleted() : Int
	{
		var nr : Int = 0;
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Completed)
			{
				nr++;
			}
		}
		return nr;
	}
	
	public function getCompleted() : Array<WorkUnit>
	{
		var result = new Array<WorkUnit>();
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Completed)
			{
				result.push(work);
			}
		}
		return result;
	}
	
	public function removeCompleted() : Array<WorkUnit>
	{
		var result = new Array<WorkUnit>();
		for (work in workunits)
		{
			if (work.getState() == WorkUnitState.Completed)
			{
				result.push(work);
				workunits.remove(work);
			}
		}
		changed = true;
		return result;
	}
	
	public function getWorkUnits() : Array<WorkUnit>
	{
		return workunits;
	}
	
	public function operate() : Void						//Operable
	{
		for (item in workunits)
		{
			item.operate();
		}
	}
	
	public function getScreenName() : String				//LogSource
	{
		return "WorkUnitPool";
	}
	
	public function isChanged() : Bool
	{
		for (wu in workunits)
		{
			if (wu.isChanged())
			{
				changed = true;
			}
		}
		
		return changed;
	}
	
	public function hxSerialize(s : haxe.Serializer) 
	{
		s.serialize(workunits);		
		changed = false;
    }
	
    public function hxUnserialize(s : haxe.Unserializer) 
	{
		this.workunits = s.unserialize();
		init();
    }
	
}