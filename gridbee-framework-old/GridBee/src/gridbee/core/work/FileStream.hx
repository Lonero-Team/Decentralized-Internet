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

package gridbee.core.work;
import haxe.Md5;
import haxe.Unserializer;
import gridbee.core.iface.Persistent;
import gridbee.core.net.HTTPRequest;
import haxe.Serializer;

/**
 * @author Henko
 */

class FileStream implements Persistent
{
	var content : String;
	var created : Date;
	var url : String;
	var readonly : Bool;
	var isavailable : Bool;
	var iserror : Bool;
	
	var changed : Bool;
	
	public function new(?url : String, ?readonly : Bool) 
	{
		this.content = "";
		this.url = url;
		this.readonly = readonly?true:false;
		this.isavailable = (url == null);
		this.iserror = (url != null);
		this.created = Date.now();
		init();
	}
	
	private function init()
	{
		if (url != null && isavailable != true)
		{
			var req = HTTPRequest.get(url).send();
			var self = this;
			
			req.onComplete.subscribe(function(response: HTTPResponse)
			{
				self.content = response.content;
				self.isavailable = true;
			});
			
			req.onError.subscribe(function(r)
			{
				self.iserror = true;
			});
		}
		changed = false;
	}
	
	public function write(s : String)
	{
		content += s;
		
		if (!readonly)
		{
			changed = true;
		}
	}
	
	public function setContent(s : String)
	{
		content = s;

		if (!readonly)
		{
			changed = true;
		}
	}
	
	public function getContent() : String
	{
		return '' + content;
	}
	
	public function getHash() : String
	{
		return Md5.encode(content);
	}
	
	public function getSize() : Int
	{
		return content.length;
	}
	
	public function getCreateDate() : Date
	{
		return created;
	}
	
	public function copyFrom(stream : FileStream)
	{
		this.content = '' + stream.content;
		this.created = stream.created;
		changed = true;
	}
		
	public function clear() 
	{
		content = "";
		this.created = Date.now();
		changed = true;
	}
	
	public function isChanged() : Bool
	{
		return changed;
	}
	
	public function isAvailable() : Bool
	{
		return isavailable;
	}
	
	public function hxSerialize(s : haxe.Serializer) : Void
	{
		s.serialize(created);
		s.serialize(readonly);
		s.serialize(isavailable);
		if (!readonly)
		{
			s.serialize(content);
		}
		s.serialize(url);
		
		changed = false;
	}
	
	public function hxUnserialize(s : haxe.Unserializer)  : Void
	{
		this.created = s.unserialize();
		this.readonly = s.unserialize();
		this.isavailable = s.unserialize();
		if (!readonly && isavailable)
		{
			this.content = s.unserialize();
		}
		else
		{
			this.isavailable = false;
		}
		this.url = s.unserialize();
		
		init();
	}
}	