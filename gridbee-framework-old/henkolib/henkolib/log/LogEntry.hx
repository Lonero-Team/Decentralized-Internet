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
import henkolib.log.Console;

/**
 * @author Henko
 */

class LogEntry 
{
	public var time(default, null) : Date;
	public var source(default, null) : LogSource;
	public var level(default, null) : LogLevel;
	public var message(default, null) : String;
	public var data(default, null) : Dynamic;
	public var pos(default, null) : haxe.PosInfos;
	
	public function new(source : LogSource, level : LogLevel, message : String, data : Dynamic, pos : PosInfos) 
	{
		time = Date.now();
		this.source = source;
		this.level = level;
		this.message = message;
		this.data = data;
		this.pos = pos;
	}
	
}