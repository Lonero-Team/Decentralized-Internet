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

package gridbee.worksource.boinc;

import gridbee.worksource.boinc.BoincUploader;
import gridbee.worksource.boinc.BoincWorkUnit;
import henkolib.events.Event;
import henkolib.events.PublicEvent;
import gridbee.core.iface.Operable;
import henkolib.log.Console;

/**
 * ...
 * @author tbur
 */

class BoincUploaderPool implements Operable
{
	private var uploaders : Array<BoincUploader>;
	private var onupload : Event<BoincWorkUnit>;
	
	public var onUpload(default, null) : PublicEvent<BoincWorkUnit>;

	public function new() 
	{
		uploaders = new Array<BoincUploader>();
		onUpload = onupload = new Event<BoincWorkUnit>();
	}
	
	private function init()
	{
		onUpload = onupload = new Event<BoincWorkUnit>();
	}
	
	public function operate() : Void
	{
		for (ul in uploaders)
		{
			ul.operate();
			if (ul.isCompleted())
			{
				onupload.invoke(ul.getResult());
				uploaders.remove(ul);
			}
		}
	}
	
	public function isChanged() : Bool
	{
		for (ul in uploaders)
		{
			if (ul.isChanged())
				return true;
		}
		
		return false;
	}
	
	// add a boincworkunit to upload
	public function add(wu : BoincWorkUnit)
	{
		var ul : BoincUploader = new BoincUploader(wu);
		uploaders.push(ul);
		ul.uploadAll();
	}
	
	public function hxSerialize(s : haxe.Serializer) : Void
	{
		s.serialize(uploaders);
	}
	
	public function hxUnserialize(s : haxe.Unserializer)  : Void
	{
		uploaders = s.unserialize();
		init();
	}
}