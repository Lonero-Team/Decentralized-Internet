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

package gridbee.core.iface;

import henkolib.async.AsyncResult;
import henkolib.log.LogSource;
import gridbee.core.work.WorkContext;
import henkolib.events.PublicEvent;
import henkolib.events.PublicSimpleEvent;

/**
 * ...
 * @author Henko
 */

enum WorkUnitState
{
	Init;
	Passive;
	Active;
	Disabled;
	Completed;
}

interface WorkUnit implements Operable, implements LogSource, implements Persistent, implements AsyncResult<WorkContext>
{
	public function start() : Void;
	public function terminate() : Void;
	
	public function enable() : Void;
	public function disable() : Void;
	
	public function operate() : Void;
	
	public function getState() : WorkUnitState;
	public function getStatusString() : String;
	
	public var onProgressChange(default, null) : PublicEvent<Float>;
	public var onStatusChange(default, null) : PublicSimpleEvent;

	
	//
	// LogSource
	//
	public function getScreenName() : String;
	
	//
	// Persistent
	//
	public function isChanged() : Bool;
	
	//
	// AsyncResult
	//
	public function isCompleted() : Bool;
	public function isError() : Bool;
	
	public function getError() : String;
	public function getProgress() : Float;
	public function getResult() : WorkContext;
	public function getElapsedTime() : Date;
	
	public var onComplete(default, null) : PublicEvent<WorkContext>;
	public var onError(default, null) : PublicEvent<String>;
	public var onProgress(default, null) : PublicEvent<Float>;
	
}