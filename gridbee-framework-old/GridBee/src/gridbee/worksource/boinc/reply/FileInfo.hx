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

/**
 * @author Henko
 */
class FileInfo 
{
	public var name(default, null) : String;
	
	public var generated_locally(default, null) : Bool;
	public var upload_when_present(default, null) : Bool;
	public var executable(default, null) : Bool;
	
	public var nbytes(default, null) : Int;
	public var max_nbytes(default, null) : Int;
	
	public var url(default, null) : String;
	public var md5_cksum(default, null) : String;
	
	public var xml_signature(default, null) : String;
	public var file_signature(default, null) : String;
	
	public function new(node : Fast) 
	{
		if (node.hasNode.name) 				name = 	node.node.name.innerData;
		
		generated_locally = 	node.hasNode.generated_locally;
		upload_when_present = 	node.hasNode.upload_when_present;
		executable = 			node.hasNode.executable;
		
		if (node.hasNode.nbytes) 			nbytes = 	Std.parseInt(node.node.nbytes.innerData);
		if (node.hasNode.max_nbytes) 		max_nbytes = 	Std.parseInt(node.node.max_nbytes.innerData);
		
		if (node.hasNode.url) 				url = 	node.node.url.innerData;
		if (node.hasNode.md5_cksum) 		md5_cksum = 	node.node.md5_cksum.innerData;
		
		if (node.hasNode.xml_signature) 	xml_signature = 	node.node.xml_signature.innerData;
		if (node.hasNode.file_signature) 	file_signature = 	node.node.file_signature.innerData;
	}
	
}