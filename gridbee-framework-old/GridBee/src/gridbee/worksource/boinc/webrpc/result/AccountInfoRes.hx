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

class AccountInfoRes 
{
	public var id : Int;
	public var name : String;
	public var country : String;
	public var weak_auth : String;
	public var postal_code : String; 
	public var global_prefs : String; 
	public var project_prefs : String; 
	public var url : String;
	public var send_email : Bool;
	public var show_hosts : Bool;
	public var teamid : Int;
	public var venue : String; 
	public var teamfounder : Bool;
	
	public function new(input : Fast) 
	{
		if (input.hasNode.id)
			id = Std.parseInt(input.node.id.innerData);
		if (input.hasNode.name)
			name=input.node.name.innerData;
		if (input.hasNode.country)
			country = input.node.country.innerData;
		if (input.hasNode.weak_auth)
			weak_auth=input.node.weak_auth.innerData;
		if (input.hasNode.postal_code)
			postal_code=input.node.postal_code.innerData;
		if (input.hasNode.global_prefs)
			global_prefs=input.node.global_prefs.innerData;
		if (input.hasNode.project_prefs)
			project_prefs=input.node.project_prefs.innerData;
		if (input.hasNode.url)
			url=input.node.url.innerData;
		if (input.hasNode.send_email)
			if(input.node.send_email.innerData == '1')
				send_email = true;
			else if(input.node.send_email.innerData == '0')
				send_email = false;
		if (input.hasNode.show_hosts)
			if(input.node.show_hosts.innerData == '1')
				show_hosts = true;
			else if(input.node.show_hosts.innerData == '0')
				show_hosts = false;
		if (input.hasNode.teamid)
			teamid=Std.parseInt(input.node.teamid.innerData);
		if (input.hasNode.venue)
			venue = input.node.venue.innerData;
		if (input.hasNode.teamfounder)
			teamfounder = true;
		else teamfounder = false;
	}
	
	public function print() 
	{
		trace('id: '+id);
		trace('name: '+name);
		trace('country: '+country);
		trace('weak_auth: '+weak_auth);
		trace('postal_code: '+postal_code);
		trace('global_prefs: '+global_prefs);
		trace('project_prefs: '+project_prefs);
		trace('url: '+url);
		trace('send_email: '+send_email);
		trace('show_hosts: '+show_hosts);
		trace('teamid: '+teamid);
		trace('venue: ' + venue);
		trace('teamfounder: ' + teamfounder);
	}
}