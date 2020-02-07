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

/**
 * @author Henko
 */
class Host 
{
	public var hostid(default, default) : Int;
	public var host_info(default, default) : HostInfo;

	public function new() 
	{
		hostid = null;
		host_info = new HostInfo();
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		var xml : String = "";
		
		if (hostid != null) 	xml += indent + "<hostid>" + hostid + "</hostid>\n";
		if (host_info != null) 	xml += host_info.toXmlString(indent);
		
		return xml;
	}
	
}