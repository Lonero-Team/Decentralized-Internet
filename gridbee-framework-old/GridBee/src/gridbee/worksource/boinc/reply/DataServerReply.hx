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

package gridbee.worksource.boinc.reply;
import haxe.xml.Fast;

/**
 * @author Henko
 */

class DataServerReply 
{

	public var status(default, null) : Int;
	public var file_size(default, null) : Int;
	public var message(default, null) : String;
	
	public function new(node : Fast) 
	{
		if (node.hasNode.status) 		status = 		Std.parseInt(node.node.status.innerData);
		if (node.hasNode.file_size) 	file_size = 	Std.parseInt(node.node.file_size.innerData);
		if (node.hasNode.message)		message =		node.node.message.innerData;
	}
	
}