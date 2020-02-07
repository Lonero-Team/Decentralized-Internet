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

package gridbee.worksource.boinc.webrpc.subclasses;
import haxe.xml.Fast;

class Host
{
	public var id : Int;
	public var create_time : Int;
	public var rpc_seqno : Int;
	public var host_cpid : String;
	public var total_credit : Float;
	public var expavg_credit : Float;
	public var expavg_time : Float;
	public var domain_name : String;
	public var p_ncpus : Int;
	public var p_vendor : String;
	public var p_model : String;
	public var p_fpops : Float;
	public var p_iops : Float;
	public var os_name : String;
	public var os_version : String;
	
	public function new(input : Fast)
	{
		if (input.hasNode.id)
			id = Std.parseInt(input.node.id.innerData);
		if (input.hasNode.create_time)
			create_time = Std.parseInt(input.node.create_time.innerData);
		if (input.hasNode.rpc_seqno)
			rpc_seqno = Std.parseInt(input.node.rpc_seqno.innerData);
		if (input.hasNode.host_cpid)
			host_cpid = input.node.host_cpid.innerData;
		if (input.hasNode.total_credit)
			total_credit = Std.parseFloat(input.node.total_credit.innerData);
		if (input.hasNode.expavg_credit)
			expavg_credit = Std.parseFloat(input.node.expavg_credit.innerData);
		if (input.hasNode.expavg_time)
			expavg_time = Std.parseFloat(input.node.expavg_time.innerData);
		if (input.hasNode.domain_name)
			domain_name = input.node.domain_name.innerData;
		if (input.hasNode.p_ncpus)
			p_ncpus = Std.parseInt(input.node.p_ncpus.innerData);
		if (input.hasNode.p_vendor)
			p_vendor = input.node.p_vendor.innerData;
		if (input.hasNode.p_model)
			p_model = input.node.p_model.innerData;
		if (input.hasNode.p_fpops)
			p_fpops = Std.parseFloat(input.node.p_fpops.innerData);
		if (input.hasNode.p_iops)
			p_iops = Std.parseFloat(input.node.p_iops.innerData);
		if (input.hasNode.os_name)
			os_name = input.node.os_name.innerData;
		if (input.hasNode.os_version)
			os_version = input.node.os_version.innerData;
	}
	
	public function print() 
	{
		trace('id: ' + id); 
		trace('create_time: ' + create_time); 
		trace('rpc_seqno: ' + rpc_seqno);
		trace('host_cpid: ' + host_cpid);
		trace('total_credit: ' + total_credit);
		trace('expavg_credit: ' + expavg_credit);
		trace('expavg_time: ' + expavg_time);
		trace('domain_name: ' + domain_name);
		trace('p_ncpus: ' + p_ncpus);
		trace('p_vendor: ' + p_vendor);
		trace('p_model: ' + p_model);
		trace('p_fpops: ' + p_fpops);
		trace('p_iops: ' + p_iops);
		trace('os_name: ' + os_name);
		trace('os_version: ' + os_version);
	}
}