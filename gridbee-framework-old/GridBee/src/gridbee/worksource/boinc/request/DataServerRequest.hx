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

class DataServerRequest implements BoincData
{
	public var clientversion(default, default) : ClientVersion;
	public var get_file_size(default, default) : String;
	public var file_upload(default, default) : FileUpload;
	
	public function new()
	{
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		var xml : String = indent + "<data_server_request>\n";
		
		var innerindent = indent + "    ";
		
		if (clientversion != null) 	xml += clientversion.toXmlString(innerindent);
		if (get_file_size != null) 	xml += innerindent + "<get_file_size>" + get_file_size + "</get_file_size>\n";
		if (file_upload != null)
		{
			xml += file_upload.toXmlString(innerindent);
		}
		else
		{
			xml += indent + "</data_server_request>\n";
		}
		
		return xml;
	}
}