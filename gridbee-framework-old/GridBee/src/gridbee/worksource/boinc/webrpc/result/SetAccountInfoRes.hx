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

package gridbee.worksource.boinc.webrpc.result;
import haxe.xml.Fast;

class SetAccountInfoRes
{
	public var success : Bool;
	public var opaque_auth : String;
	
	public function new(input : Fast)
	{
		if (input.hasNode.success)
			success = true;
		else
			success = false;
		if (input.hasNode.opaque_auth)
			opaque_auth = input.node.opaque_auth.innerData;
	}
	
	public function print()
	{
		trace('success: ' + success);
		trace('opaque_auth: ' + opaque_auth);
	}
}