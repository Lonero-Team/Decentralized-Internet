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

package gridbee.worksource.boinc.request;
import gridbee.worksource.boinc.request.AuthInfo;
import gridbee.worksource.boinc.request.Host;
import gridbee.worksource.boinc.request.ClientVersion;
import gridbee.worksource.boinc.request.HostInfo;
import gridbee.worksource.boinc.request.Result;
import gridbee.worksource.boinc.request.WorkRequest;
import henkolib.log.Console;

/**
 * @author Henko
 */
class SchedulerRequest implements BoincData
{
	var platform : String;
	var clientversion : ClientVersion;
	var authinfo : AuthInfo;
	var host : Host;
	var workrequest : WorkRequest;
	var results : Array<Result>;
	var others : Array<BoincData>;
	
	public function new(platform : String)
	{
		this.platform = platform;
		results = new Array<Result>();
		others = new Array<BoincData>();
	}
	
	public function setPlatform(platform : String) : Void
	{
		this.platform = platform;
	}
	
	public function setClientVersion(clientversion : ClientVersion) : Void
	{
		this.clientversion = clientversion;
	}
	
	public function setAuthInfo(authinfo : AuthInfo) : Void
	{
		this.authinfo = authinfo;
	}
	
	public function setHost(host : Host) : Void
	{
		this.host = host;
	}
	
	public function setWorkRequest(workrequest : WorkRequest) : Void
	{
		this.workrequest = workrequest;
	}
	
	public function addResult(result : Result) : Void
	{
		results.push(result);
	}
	
	public function addOther(data : BoincData) : Void
	{
		others.push(data);
	}	
	
	public function toXmlString(?indent : String = "") : String
	{
		var xml : String = indent + "<scheduler_request>\n";
		
		var innerindent = indent + "    ";
		
		if (platform != null) 		xml += innerindent + "<platform_name>" + platform + "</platform_name>\n";
		if (clientversion != null) 	xml += clientversion.toXmlString(innerindent);
		if (authinfo != null) 		xml += authinfo.toXmlString(innerindent);
		if (host != null) 			xml += host.toXmlString(innerindent);	
		if (workrequest != null) 	xml += workrequest.toXmlString(innerindent);
		
		for (result in results) 	xml += result.toXmlString(innerindent);
		for (other in others) 		xml += other.toXmlString(innerindent);

		xml += indent + "</scheduler_request>\n";
		
		return xml;
	}
}
