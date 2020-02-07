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
class AuthInfo implements BoincData
{
	public var authenticator(default, default) : String;
	public var cross_project_id(default, default) : String;

	public function new() 
	{
		authenticator = null;
		cross_project_id = null;
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		var xml : String = "";
		
		if (authenticator != null) 		xml += indent + "<authenticator>" + authenticator + "</authenticator>\n";
		if (cross_project_id != null) 	xml += indent + "<cross_project_id>" + cross_project_id + "</cross_project_id>\n";
		
		return  xml;
	}
}