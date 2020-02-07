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

import gridbee.worksource.boinc.reply.FileInfo;

/**
 * @author Henko
 */

class UploadFileInfo implements BoincData
{
	public var name(default, default) : String;
	public var generated_locally(default, default) : Bool;
	public var upload_when_present(default, default) : Bool;
	public var max_nbytes(default, default) : Int;
	public var url(default, default) : String;
	public var xml_signature(default, default) : String;
	
	public function new(?reply_file_info : FileInfo)
	{
		if (reply_file_info != null)
		{
			name = reply_file_info.name;
			generated_locally = reply_file_info.generated_locally;
			upload_when_present = reply_file_info.upload_when_present;
			max_nbytes = reply_file_info.max_nbytes;
			url = reply_file_info.url;
			xml_signature = reply_file_info.xml_signature;
		}
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		//Make it the same as in the original reply, no proper indentation
		indent = "";
		
		//TODO: Indentation problem, signature error if wrong
		//newer versions of BOINC require \t instead of spaces
		//var innerindent = indent + "    "; // for older BOINC versions
		var innerindent = indent + "\t"; // for newer BOINC versions
		
		var xml : String = indent + "<file_info>\n";
		
		if (name != null) 				xml += innerindent + "<name>" + name + "</name>\n";
		if (generated_locally)			xml += innerindent + "<generated_locally/>\n";
		if (upload_when_present)		xml += innerindent + "<upload_when_present/>\n";
		if (max_nbytes != null) 		xml += innerindent + "<max_nbytes>" + max_nbytes + "</max_nbytes>\n";
		if (url != null) 				xml += innerindent + "<url>" + url + "</url>\n";
		if (xml_signature != null)		xml += "<xml_signature>" + xml_signature + "</xml_signature>\n";
		
		xml += indent + "</file_info>\n";
		
		return xml;
	}
}