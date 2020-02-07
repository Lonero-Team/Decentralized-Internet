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
class ResultFileinfo implements BoincData
{
	public var name(default, default) : String;
	public var file_name(default, default) : String;
	public var nbytes(default, default) : Int;
	public var max_nbytes(default, default) : Int;
	public var md5_cksum(default, default) : String;
	public var url(default, default) : String;
	
	public function new()
	{
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		
		var innerindent = indent + "    ";
		
		var xml : String = indent + "<file_info>\n";
		
		if (name != null) 		xml += innerindent + "<name>" + name + "</name>\n";
		
		// TODO: should file_name be part of result reporting?
		// this may not be a part of the boinc protocol
		if (file_name != null) 	xml += innerindent + "<file_name>" + file_name + "</file_name>\n";
		
		if (nbytes != null) 	xml += innerindent + "<nbytes>" + nbytes + "</nbytes>\n";
		if (max_nbytes != null) xml += innerindent + "<max_nbytes>" + max_nbytes + "</max_nbytes>\n";
		if (md5_cksum != null) 	xml += innerindent + "<md5_cksum>" + md5_cksum + "</md5_cksum>\n";
		if (url != null) 		xml += innerindent + "<url>" + url + "</url>\n";
		
		xml += indent + "</file_info>\n";
		
		return xml;
	}
	
}