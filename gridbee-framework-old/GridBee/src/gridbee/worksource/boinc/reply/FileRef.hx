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
class FileRef 
{
	public var file_name(default, null) : String;
	public var open_name(default, null) : String;
	public var main_program(default, null) : Bool;
	
	// Joined later from reply by open_name
	public var file_info(default, default) : FileInfo;
	
	public function new(node : Fast) 
	{
		if (node.hasNode.file_name) file_name = node.node.file_name.innerData;
		if (node.hasNode.open_name) open_name = node.node.open_name.innerData;
		
		main_program = node.hasNode.main_program;
	}
	
}