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
import gridbee.core.iface.WorkSource;
import gridbee.core.iface.WorkUnit;
import henkolib.log.Console;
import henkolib.events.Event;
import henkolib.events.PublicEvent;

/**
 * ...
 * @author tbur
 */

class BasicWorkSource implements WorkSource
{
	private var workpool : WorkUnitPool;
	private var isRunning : Bool;
	
	private var onaddworkunit : Event<WorkUnit>;
	private var onremoveworkunit : Event<WorkUnit>;

	public var onAddWorkunit(default, null) : PublicEvent<WorkUnit>;
	public var onRemoveWorkunit(default, null) : PublicEvent<WorkUnit>;

	public function new() 
	{
		workpool = new WorkUnitPool();
		init();
	}
	
	private function init()
	{
		isRunning = false;
		onAddWorkunit = onaddworkunit = new Event<WorkUnit>();
		onRemoveWorkunit = onremoveworkunit = new Event<WorkUnit>();
	}
	
	public function getWorkUnits() : Array<WorkUnit>
	{
		return workpool.getWorkUnits();
	}

	public function start() : Void
	{
		isRunning = true;
	}
	
	public function terminate() : Void
	{
		isRunning = false;
		workpool.terminateAll();
	}
	
	public function operate() : Void
	{
		if (isRunning)
		{
			workpool.operate();
		}
	}
	
	public function getNumActive() : Int
	{
		return workpool.getNumActive();
	}
	
	public function startOne() : Void
	{
		isRunning = true;
		workpool.startOne();
	}
	
	public function terminateOne() : Void
	{
		workpool.terminateOne();
	}
		
	//
	// LogSource
	//
	public function getScreenName() : String
	{
		return "BasicWorkSource";
	}
	
	//
	// Persistent
	//
	public function isChanged() : Bool
	{
		return workpool.isChanged();
	}
	
	public function hxSerialize(s : haxe.Serializer) : Void
	{
		s.serialize(workpool);
	}
	
	public function hxUnserialize(s : haxe.Unserializer)  : Void
	{
		this.workpool = s.unserialize();
		init();
	}
}