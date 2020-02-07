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
class ResultSlot
{
	public var name(default, null) : String;
	public var wu_name(default, null) : String;
	public var platform(default, null) : String;
	public var version_num(default, null) : Int;
	public var report_deadline(default, null) : Int;
	
	public var file_ref(default, null) : Array<FileRef>;
	
	public function new(node : Fast) 
	{
		if (node.hasNode.name) 				name = 				node.node.name.innerData;
		if (node.hasNode.wu_name) 			wu_name = 			node.node.wu_name.innerData;
		if (node.hasNode.platform) 			platform = 			node.node.platform.innerData;
		if (node.hasNode.version_num) 		version_num = 		Std.parseInt(node.node.version_num.innerData);
		if (node.hasNode.report_deadline) 	report_deadline = 	Std.parseInt(node.node.report_deadline.innerData);
		
		file_ref = new Array<FileRef>();
		
		if (node.hasNode.file_ref) for (child in node.nodes.file_ref) file_ref.push(new FileRef(child));
	}
	
}