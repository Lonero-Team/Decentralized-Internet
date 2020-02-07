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
import gridbee.worksource.boinc.webrpc.subclasses.Daemon;

class ServerStatusRes 
{
	public var update_time : Int;
	public var software_version : String;
	public var daemon_arr : Array<Daemon>;
	public var results_ready_to_send : Int;
	public var results_in_progress : Int;
	public var workunits_waiting_for_validation : Int;
	public var workunits_waiting_for_assimilation : Int;
	public var workunits_waiting_for_deletion : Int;
	public var results_waiting_for_deletion : Int;
	public var transitioner_backlog_hours : Float;
	
	public function new(input : Fast)
	{
		if (input.hasNode.update_time)
			update_time = Std.parseInt(input.node.update_time.innerData);
		if (input.hasNode.software_version)
			software_version = input.node.software_version.innerData;
		
		if (input.node.daemon_status.hasNode.daemon) 
		{
			daemon_arr = new Array<Daemon>();
			for (i in input.node.daemon_status.nodes.daemon)
				daemon_arr.push(new Daemon(i));
		}
		var k = input.node.database_file_states;				  
		if (k.hasNode.results_ready_to_send)
			results_ready_to_send = Std.parseInt(k.node.results_ready_to_send.innerData);
		if (k.hasNode.results_in_progress)
			results_in_progress = Std.parseInt(k.node.results_in_progress.innerData);
		if (k.hasNode.workunits_waiting_for_validation)
			workunits_waiting_for_validation = Std.parseInt(k.node.workunits_waiting_for_validation.innerData);
		if (k.hasNode.workunits_waiting_for_assimilation)
			workunits_waiting_for_assimilation = Std.parseInt(k.node.workunits_waiting_for_assimilation.innerData);
		if (k.hasNode.workunits_waiting_for_deletion)
			workunits_waiting_for_deletion = Std.parseInt(k.node.workunits_waiting_for_deletion.innerData);
		if (k.hasNode.results_waiting_for_deletion)
			results_waiting_for_deletion = Std.parseInt(k.node.results_waiting_for_deletion.innerData);
		if (k.hasNode.transitioner_backlog_hours)
			transitioner_backlog_hours = Std.parseFloat(k.node.transitioner_backlog_hours.innerData);
	}
	
	public function print()
	{
		trace('update_time: ' + update_time);
		trace('software_version: ' + software_version);
		if (daemon_arr != null)
			daemon_arr[0].print();
		trace('results_ready_to_send: ' + results_ready_to_send);
		trace('results_in_progress: ' + results_in_progress);
		trace('workunits_waiting_for_validation: ' + workunits_waiting_for_validation);
		trace('workunits_waiting_for_assimilation: ' + workunits_waiting_for_assimilation);
		trace('workunits_waiting_for_deletion: ' + workunits_waiting_for_deletion); 
		trace('results_waiting_for_deletion: ' + results_waiting_for_deletion); 
		trace('transitioner_backlog_hours: ' + transitioner_backlog_hours);
	}
}