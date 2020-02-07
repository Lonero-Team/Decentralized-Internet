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

package gridbee.worksource.boinc.webrpc.subclasses;
import haxe.xml.Fast;

class ApplicVersion
{
	public var platform_short : String;
    public var platform_long : String;
    public var version_num : Float;
	public var plan_class : String;
    public var date : String;
    public var date_unix : Int;
	
	public function new(input : Fast)
	{
		if (input.hasNode.platform_short)
			platform_short = input.node.platform_short.innerData;
		if (input.hasNode.platform_long)
			platform_long = input.node.platform_long.innerData;
		if (input.hasNode.version_num)
			version_num = Std.parseFloat(input.node.version_num.innerData);
		if (input.hasNode.plan_class)
			plan_class = input.node.plan_class.innerData;
		if (input.hasNode.date)
			date = input.node.date.innerData;
		if (input.hasNode.date_unix)
			date_unix = Std.parseInt(input.node.date.innerData);
	}
	
	public function print() 
	{
		trace('platform_short: ' + platform_short);
		trace('platform_long: ' + platform_long);
		trace('version_num: ' + version_num);
		trace('plan_class: ' + plan_class);
		trace('date: ' + date);
		trace('date_unix: ' + date_unix);
	}
}