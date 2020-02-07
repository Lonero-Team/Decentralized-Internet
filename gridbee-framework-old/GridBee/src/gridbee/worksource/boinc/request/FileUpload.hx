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

class FileUpload implements BoincData
{
	public var file_info(default, default) : UploadFileInfo;
	public var nbytes(default, default) : Int;
	public var md5_cksum(default, default) : String;
	public var offset(default, default) : Int;
	public var data(default, default) : String;
	
	public function new()
	{
	}
	
	public function toXmlString(?indent : String = "") : String
	{	
		//Make it the same as in the original reply, no proper indentation
		indent = "";
		var innerindent = indent + "";
		
		var xml : String = indent + "<file_upload>\n";
		
		if (file_info != null) 			xml += innerindent + file_info.toXmlString(innerindent);
		if (nbytes != null) 			xml += innerindent + "<nbytes>" + nbytes + "</nbytes>\n";
		if (md5_cksum != null) 			xml += innerindent + "<md5_cksum>" + md5_cksum + "</md5_cksum>\n";
		if (offset != null) 			xml += innerindent + "<offset>" + offset + "</offset>\n";
		
		xml += "<data>\n";
		xml += data;
	
		return xml;
	}
	
}