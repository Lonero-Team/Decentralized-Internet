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
class Workunit 
{
	public var name(default, null) : String;
	public var app_name(default, null) : String;
	public var command_line(default, null) : String;
	
	public var rsc_fpops_est(default, null) : Float;
	public var rsc_fpops_bound(default, null) : Float;
	public var rsc_memory_bound(default, null) : Float;
	public var rsc_disk_bound(default, null) : Float;
	
	public var file_ref(default, null) : Array<FileRef>;
	
	// Joined later by app_name
	public var application(default, default) : Application;
	
	// Joined later by wuname
	public var result(default, default) : ResultSlot;

	public function new(node : Fast) 
	{
		if (node.hasNode.name) 				name = 				node.node.name.innerData;
		if (node.hasNode.app_name) 			app_name = 			node.node.app_name.innerData;
		if (node.hasNode.command_line) 		command_line = 		node.node.command_line.innerData;
		if (node.hasNode.rsc_fpops_est) 	rsc_fpops_est = 	Std.parseFloat(node.node.rsc_fpops_est.innerData);
		if (node.hasNode.rsc_fpops_bound) 	rsc_fpops_bound = 	Std.parseFloat(node.node.rsc_fpops_bound.innerData);
		if (node.hasNode.rsc_memory_bound) 	rsc_memory_bound = 	Std.parseFloat(node.node.rsc_memory_bound.innerData);
		if (node.hasNode.rsc_disk_bound) 	rsc_disk_bound = 	Std.parseFloat(node.node.rsc_disk_bound.innerData);
		
		file_ref = new Array<FileRef>();
		
		if (node.hasNode.file_ref) for (child in node.nodes.file_ref) file_ref.push(new FileRef(child));
	}
	
}