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

class PendingCredit
{
	public var resultid : Int;
	public var workunitid : Int;
	public var claimed_credit : Float;
    public var received_time : Int;
	
	public function new(input : Fast)
	{
		if (input.hasNode.resultid)
			resultid = Std.parseInt(input.node.resultid.innerData);
		if (input.hasNode.workunitid)
			workunitid = Std.parseInt(input.node.workunitid.innerData);
		if (input.hasNode.claimed_credit)
			claimed_credit = Std.parseFloat(input.node.claimed_credit.innerData);
		if (input.hasNode.received_time)
			received_time = Std.parseInt(input.node.received_time.innerData);
	}
	
	public function print()
	{
		trace('resultid: ' + resultid);
		trace('workunitid: ' + workunitid);
		trace('claimed_credit: ' + claimed_credit);
		trace('received_time: ' + received_time);
	}
}