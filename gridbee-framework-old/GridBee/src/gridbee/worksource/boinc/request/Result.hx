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
class Result implements BoincData
{
	public var name(default, default) : String;
	
	public var final_cpu_time(default, default) : Float;
	public var final_elapsed_time(default, default) : Float;
	
	public var exit_status(default, default) : Int;
	public var state(default, default) : Int;
	
	public var platform(default, default) : String;
	public var version_num(default, default) : Int;
	public var app_version_num(default, default) : Int;
	
	public var stderr_txt(default, default) : String;
	
	public var file_info(default, null) : Array<ResultFileinfo>;
	
	public function new() 
	{
		file_info = new Array<ResultFileinfo>();
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		var innerindent = indent + "    ";
		
		var xml : String = indent + "<result>\n";
		
		if (name != null) 				xml += innerindent + "<name>" + name + "</name>\n";
		if (final_cpu_time != null) 	xml += innerindent + "<final_cpu_time>" + final_cpu_time + "</final_cpu_time>\n";
		if (final_elapsed_time != null) xml += innerindent + "<final_elapsed_time>" + final_elapsed_time + "</final_elapsed_time>\n";
		if (exit_status != null) 		xml += innerindent + "<exit_status>" + exit_status + "</exit_status>\n";
		if (state != null) 				xml += innerindent + "<state>" + state + "</state>\n";
		if (platform != null) 			xml += innerindent + "<platform>" + platform + "</platform>\n";
		if (version_num != null) 		xml += innerindent + "<version_num>" + version_num + "</version_num>\n";
		if (app_version_num != null) 	xml += innerindent + "<app_version_num>" + app_version_num + "</app_version_num>\n";
		
		xml += "<stderr_out>\n";
		xml += "<![CDATA[";
		xml += "<stderr_txt>\n";
		if (stderr_txt != null)
		{	
			xml += stderr_txt;
		}	
		xml += "</stderr_txt>\n";
		xml += "]]>\n";
		xml += "</stderr_out>\n";		
		
		for (info in file_info) 		xml += info.toXmlString(innerindent);
		
		xml += indent + "</result>\n";
		
		return xml;
	}
	
}