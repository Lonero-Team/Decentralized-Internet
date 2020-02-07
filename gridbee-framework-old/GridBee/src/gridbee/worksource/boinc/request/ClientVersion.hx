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
import gridbee.worksource.boinc.BoincData;

/**
 * @author Henko
 */
class ClientVersion implements BoincData
{
	public var core_client_major_version(default, default)  : Int;
	public var core_client_minor_version(default, default)  : Int;
	public var core_client_release(default, default)  : Int;
	
	public function new(?major : Int = 1, ?minor : Int = 0, ?release : Int = 0) 
	{
		core_client_major_version = major;
		core_client_minor_version = minor;
		core_client_release = release;
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		var xml : String = "";
		
		if (core_client_major_version != null) 	xml += indent + "<core_client_major_version>" + core_client_major_version + "</core_client_major_version>\n";
		if (core_client_minor_version != null) 	xml += indent + "<core_client_minor_version>" + core_client_minor_version + "</core_client_minor_version>\n";
		if (core_client_release != null) 		xml += indent + "<core_client_release>" + core_client_release + "</core_client_release>\n";
		
		return xml;
	}
	
}