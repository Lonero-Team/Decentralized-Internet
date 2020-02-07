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
class AppVersion 
{
	public var app_name(default, null) : String;
	public var version_num(default, null) : Int;
	public var platform(default, null) : String;
	public var avg_ncpus(default, null) : Float;
	public var max_ncpus(default, null) : Float;
	public var flops(default, null) : Float;
	public var file_ref(default, null) : Array<FileRef>;

	// Is set later from file_ref
	public var main_program(default, default) : FileRef;
	
	public function new(node : Fast) 
	{
		if (node.hasNode.app_name) 		app_name = 		node.node.app_name.innerData;
		if (node.hasNode.version_num) 	version_num = 	Std.parseInt(node.node.version_num.innerData);
		if (node.hasNode.platform) 		platform = 		node.node.platform.innerData;
		if (node.hasNode.avg_ncpus) 	avg_ncpus = 	Std.parseFloat(node.node.avg_ncpus.innerData);
		if (node.hasNode.max_ncpus) 	max_ncpus = 	Std.parseFloat(node.node.max_ncpus.innerData);
		if (node.hasNode.flops) 		flops = 		Std.parseFloat(node.node.flops.innerData);
		
		file_ref = new Array<FileRef>();
		
		if (node.hasNode.file_ref) for (child in node.nodes.file_ref) file_ref.push(new FileRef(child));
	}
	
}