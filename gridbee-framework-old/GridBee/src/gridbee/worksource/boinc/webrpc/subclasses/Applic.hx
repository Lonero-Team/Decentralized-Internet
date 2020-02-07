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
import gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion;

class Applic
{
	public var name : String;
	public var id : Int;
	public var version : ApplicVersion;
	
	public function new(input : Fast)
	{
		if (input.hasNode.name)
			name = input.node.name.innerData;
		if (input.hasNode.id)
			id = Std.parseInt(input.node.id.innerData);
		if (input.hasNode.version) 
		{
			var k : Fast = input.node.version;
			version = new ApplicVersion(k);
		}
	}
	
	public function print() {
		trace('name: ' + name);
		trace('id: ' + id);
		trace('***Version descriptions***');
		version.print();
	}
}