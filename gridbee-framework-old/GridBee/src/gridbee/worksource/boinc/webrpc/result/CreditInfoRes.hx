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
import gridbee.worksource.boinc.webrpc.subclasses.Host;

class CreditInfoRes 
{
	public var id : Int;
	public var cpid : String;
	public var create_time : Int;
	public var name : String;
	public var country : String;
	public var total_credit : Float;
	public var expavg_credit : Float;
	public var expavg_time : Float;
	public var teamid : Int;
	public var url : String;
	public var has_profile : Bool;
	public var host_arr : Array<Host>;
	
	public function new(input : Fast) 
	{
		if (input.hasNode.id)
			id = Std.parseInt(input.node.id.innerData);
		if (input.hasNode.cpid)
			cpid = input.node.cpid.innerData;
		if (input.hasNode.create_time)
			create_time = Std.parseInt(input.node.create_time.innerData);
		if (input.hasNode.name)
			name = input.node.name.innerData;
		if (input.hasNode.country)
			country = input.node.country.innerData;
		if (input.hasNode.total_credit)
			total_credit = Std.parseFloat(input.node.total_credit.innerData);
		if (input.hasNode.expavg_credit)
			expavg_credit = Std.parseFloat(input.node.expavg_credit.innerData);
		if (input.hasNode.expavg_time)
			expavg_time = Std.parseFloat(input.node.expavg_time.innerData);
		if (input.hasNode.teamid)
			teamid = Std.parseInt(input.node.teamid.innerData);
		if (input.hasNode.url)
			url = input.node.url.innerData;
		if (input.hasNode.has_profile)
			if(input.node.has_profile.innerData == '1')
				has_profile = true;
			else if(input.node.has_profile.innerData == '0')
			has_profile = false;
		if (input.hasNode.host)
		{ 
			host_arr = new Array<Host>();
			for (i in input.nodes.host)
			host_arr.push(new Host(i)); 
		}
	}
	
	public function print() 
	{
		trace('id: '+id);
		trace('cpid:' +cpid);
		trace('create_time: '+create_time);
		trace('name: '+name);
		trace('country: '+country);
		trace('total_credit: '+total_credit);
		trace('expavg_credit: '+expavg_credit);
		trace('expavg_time: '+expavg_time);
		trace('teamid: '+teamid);
		trace('url: '+url);
		trace('has_profile: '+has_profile);
	}
}