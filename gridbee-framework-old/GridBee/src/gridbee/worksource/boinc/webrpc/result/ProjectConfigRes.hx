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
import gridbee.worksource.boinc.webrpc.subclasses.Platforms;
import gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements;

class ProjectConfigRes 
{
	public var name : String;
	public var master_url : String;
	public var local_revision : String;
	public var web_stopped : Bool;
	public var account_creation_disabled : Bool;
	public var client_account_creation_disabled : Bool;
	public var min_passwd_length : Int;
	public var account_manager : Bool;
	public var uses_username : Bool;
	public var rpc_prefix : String;
	public var error_num : Int;
	public var sched_stopped : Bool;
	public var platforms_arr : Array<Platforms>;
	public var system_requirements : SystemRequirements;
	
	public function new(input : Fast)
	{
		if (input.hasNode.name)
			name = input.node.name.innerData;
		if (input.hasNode.master_url)
			master_url = input.node.master_url.innerData;
		if (input.hasNode.local_revision)
			local_revision = input.node.local_revision.innerData;
		if (input.hasNode.web_stopped)
		{
			if (input.node.web_stopped.innerData == '1') 
				web_stopped = true;
			else if (input.node.web_stopped.innerData == '0')
				web_stopped = false;
		}
		if (input.hasNode.account_creation_disabled)
			account_creation_disabled = true;
		else 
			account_creation_disabled = false;
		if (input.hasNode.client_account_creation_disabled)
			client_account_creation_disabled = true;
		else
			client_account_creation_disabled = false;
		if (input.hasNode.min_passwd_length)
			min_passwd_length = Std.parseInt(input.node.min_passwd_length.innerData);
		if (input.hasNode.account_manager)
			account_manager = true;
		else
			account_manager = false;
		if (input.hasNode.uses_username)
			uses_username = true;
		else
			uses_username = false;
		if (input.hasNode.rpc_prefix)
			rpc_prefix = input.node.rpc_prefix.innerData;
		if (input.hasNode.error_num)
			error_num = Std.parseInt(input.node.error_num.innerData);
		if (input.hasNode.sched_stopped)
		{
			if (input.node.sched_stopped.innerData == '1')
				sched_stopped = true;
			else if (input.node.sched_stopped.innerData == '0')
				sched_stopped = false;
		}
		if (input.hasNode.platforms)
			if (input.node.platforms.hasNode.platform) 
			{
				platforms_arr = new Array<Platforms>();
				for (i in input.node.platforms.nodes.platform)
					platforms_arr.push(new Platforms(i));
			}
		if (input.hasNode.system_requiremenets)
			system_requirements = new SystemRequirements(input.node.system_requirements);
		else
			system_requirements = null;
	}
	
	public function print()
	{
		trace('name: ' + name); 
		trace('master_url: ' + master_url); 
		trace('local_revision: ' + local_revision); 
		trace('web_stopped: ' + web_stopped);
		trace('account_creation_disabled: ' + account_creation_disabled);
		trace('client_account_creation_disabled: ' + client_account_creation_disabled);
		trace('min_passwd_length: ' + min_passwd_length);
		trace('account_manager: ' + account_manager);
		trace('uses_username: ' + uses_username);
		trace('rpc_prefix: ' + rpc_prefix);
		trace('error_num: ' + error_num);
		trace('sched_stopped: ' + sched_stopped);
		if (platforms_arr[0] != null) 
			platforms_arr[0].print();
		if (system_requirements != null)
			system_requirements.print();
	}
}