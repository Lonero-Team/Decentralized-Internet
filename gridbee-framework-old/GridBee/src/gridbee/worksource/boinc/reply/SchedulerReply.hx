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

import gridbee.worksource.boinc.reply.Message;
import gridbee.worksource.boinc.reply.ResultAck;
import gridbee.worksource.boinc.reply.Application;
import gridbee.worksource.boinc.reply.FileInfo;
import gridbee.worksource.boinc.reply.AppVersion;
import gridbee.worksource.boinc.reply.Workunit;
import gridbee.worksource.boinc.reply.ResultSlot;

/**
 * @author Henko
 */
class SchedulerReply 
{
	public var scheduler_version(default, null) : Int;
	public var master_url(default, null) : String;
	public var request_delay(default, null) : Float;
	public var hostid(default, null) : Int;
	public var project_name(default, null) : String;
	public var user_name(default, null) : String;
	public var user_total_credit(default, null) : Float;
	public var user_expavg_credit(default, null) : Float;
	public var user_create_time(default, null) : Int;
	public var email_hash(default, null) : String;
	public var cross_project_id(default, null) : String;
	public var host_total_credit(default, null) : Float;
	public var host_expavg_credit(default, null) : Float;
	public var host_create_time(default, null) : Int;
	public var team_name(default, null) : String;
	
	public var message(default, null) : 	Array<Message>;
	public var app(default, null) : 		Array<Application>;
	public var app_version(default, null) : Array<AppVersion>;
	public var file_info(default, null) : 	Array<FileInfo>;	
	public var workunit(default, null) : 	Array<Workunit>;
	public var result(default, null) : 		Array<ResultSlot>;
	public var result_ack(default, null) : 	Array<ResultAck>;
	
	public function new(node : Fast)
	{
		if (node.hasNode.scheduler_version) 	scheduler_version = 	Std.parseInt(node.node.scheduler_version.innerData);
		if (node.hasNode.master_url) 			master_url = 			node.node.master_url.innerData;
		if (node.hasNode.request_delay) 		request_delay = 		Std.parseFloat(node.node.request_delay.innerData);
		if (node.hasNode.hostid)				hostid = 				Std.parseInt(node.node.hostid.innerData);
		if (node.hasNode.project_name) 			project_name = 			node.node.project_name.innerData;
		if (node.hasNode.user_name) 			user_name = 			node.node.user_name.innerData;
		if (node.hasNode.user_total_credit) 	user_total_credit = 	Std.parseFloat(node.node.user_total_credit.innerData);
		if (node.hasNode.user_expavg_credit) 	user_expavg_credit = 	Std.parseFloat(node.node.user_expavg_credit.innerData);
		if (node.hasNode.user_create_time) 		user_create_time = 		Std.parseInt(node.node.user_create_time.innerData);
		if (node.hasNode.email_hash) 			email_hash = 			node.node.email_hash.innerData;
		if (node.hasNode.cross_project_id) 		cross_project_id = 		node.node.cross_project_id.innerData;
		if (node.hasNode.host_total_credit) 	host_total_credit = 	Std.parseFloat(node.node.host_total_credit.innerData);
		if (node.hasNode.host_expavg_credit) 	host_expavg_credit = 	Std.parseFloat(node.node.host_expavg_credit.innerData);
		if (node.hasNode.host_create_time) 		host_create_time = 		Std.parseInt(node.node.host_create_time.innerData);
		if (node.hasNode.team_name) 			team_name = 			node.node.team_name.innerData;
		
		message = 		new Array<Message>();
		app = 			new Array<Application>();
		app_version = 	new Array<AppVersion>();
		file_info = 	new Array<FileInfo>();
		workunit = 		new Array<Workunit>();
		result = 		new Array<ResultSlot>();
		result_ack = 	new Array<ResultAck>();
		
		if (node.hasNode.message) 		for (child in node.nodes.message) 		message.push(new Message(child));
		if (node.hasNode.app) 			for (child in node.nodes.app) 			app.push(new Application(child)); 
		if (node.hasNode.app_version) 	for (child in node.nodes.app_version) 	app_version.push(new AppVersion(child)); 
		if (node.hasNode.file_info) 	for (child in node.nodes.file_info) 	file_info.push(new FileInfo(child));
		if (node.hasNode.workunit) 		for (child in node.nodes.workunit) 	workunit.push(new Workunit(child)); 
		if (node.hasNode.result) 		for (child in node.nodes.result) 			result.push(new ResultSlot(child)); 
		if (node.hasNode.result_ack) 	for (child in node.nodes.result_ack) 	result_ack.push(new ResultAck(child));
	}
}
