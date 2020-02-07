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
import henkolib.async.AsyncResult;
import gridbee.core.iface.WorkUnit;
import gridbee.core.net.Downloader;
import gridbee.core.work.BasicWorkUnit;
import gridbee.core.work.WorkContext;
import gridbee.worksource.boinc.reply.Workunit;
import gridbee.core.work.FileStream;
import gridbee.worksource.boinc.request.Result;
import henkolib.log.Console;
import gridbee.core.iface.WorkUnit;
import henkolib.log.LogEntry;
import henkolib.log.LogLevel;

/**
 * ...
 * @author tbur, Henko
 */

class BoincWorkUnit extends BasicWorkUnit
{
	private var unitinfo : Workunit;
	private var readytoreport : Bool;
	private var boincresult : Result;
	private var uploader : BoincUploader;
	private var boincboincresults : Array<BoincResult>;
	
	// required for unserialization
	private var filesdownloaded : Bool;

	override public function new(unit : Workunit, ?platform : String = "") 
	{
		this.unitinfo = unit;		
		this.readytoreport = false;
		this.filesdownloaded = false;
		super(platform);
	}
	
	override private function init()
	{
		super.init();
		
		boincresult = new Result();
		boincresult.name = unitinfo.result.name;
		boincresult.platform = unitinfo.application.version.platform;
		boincresult.version_num = unitinfo.result.version_num;
		boincresult.app_version_num = unitinfo.application.version.version_num;
		
		var self = this;
		//operation.onComplete.subscribe(function(result) { self.upload(); } );
		
		if(!filesdownloaded)
		{
			download();
		}
	}
	
	private function download()
	{
		boincresult.state = 1; // Downloading
		
		var downloader = new Downloader();
		
		if (context.getPlatform() == "nacl")
		{
			for (data in unitinfo.file_ref)
			{
				// NaCl executables are downloaded by Chrome's inner mechanism
				if (data.file_info.url.substr( -5) != ".nexe" && data.file_info.url.substr( -4) != ".nmf")
					downloader.add(data.file_info.url);
			}
			// Chrome handles code downloading
			context.setProgramCode(unitinfo.application.version.main_program.file_info.url);
		}
		else // platform == "javascript"
		{
			for (data in unitinfo.file_ref)
			{
				downloader.add(data.file_info.url);
			}
			downloader.add(unitinfo.application.version.main_program.file_info.url);
		}
		
		onlog.invoke(new LogEntry(null, LogLevel.L5_Debug, "Downloading input files", null, null));
		var dlresult = downloader.downloadAll();
		
		var self = this;
		dlresult.onComplete.subscribe(function(files : Hash<FileStream>)
		{
			for (url in files.keys())
			{
				if (url == self.unitinfo.application.version.main_program.file_info.url)
					self.context.setProgram(files.get(url));
				else
				{
					for (file in self.unitinfo.file_ref)
					{
						if (file.file_info.url == url)
							self.context.addFile(file.open_name, files.get(url));
					}
				}
			}
			
			self.boincresult.state = 2; // Downloaded
			self.filesdownloaded = true;
			self.onlog.invoke(new LogEntry(null, LogLevel.L5_Debug, "Download successfully finished", null, null));
			self.SwitchState(Passive);
			
			// Now we are ready to be scheduled to run
		});
	}
	
	override public function operate()
	{
		super.operate();
		if (uploader != null)
			uploader.operate();
	}
	
	public function setUploadingState() : Void
	{
		boincresult.state = 4;
	}
	
	public function setUploadedState(br : Array<BoincResult>) : Void
	{
		boincboincresults = br;
		boincresult.state = 5;
		
		for (r in boincboincresults)
		{
			boincresult.file_info.push(r.getFileInfo());
		}
	}
	
	public function getResultState() : Int
	{
		return boincresult.state;
	}
	
	public function setResultState(s : Int)
	{
		boincresult.state = s;
	}
	
	public function getBoincResult() : Result
	{
		return boincresult;
	}
	
	public function getUnitinfo() : Workunit
	{
		return unitinfo;
	}
	
	public function getWorkUnitResultName() : String
	{
		return unitinfo.result.name;
	}
	
	override public function getScreenName() : String
	{
		return "BOINC workunit (" + unitinfo.app_name + ", " + unitinfo.result.name + ")";
	}
	
	override public function hxSerialize(s : haxe.Serializer) : Void
	{
		s.serialize(unitinfo);
		s.serialize(readytoreport);
		s.serialize(filesdownloaded);
		super.hxSerialize(s);
	}
	
	override public function hxUnserialize(s : haxe.Unserializer)  : Void
	{
		unitinfo = s.unserialize();
		readytoreport = s.unserialize();
		filesdownloaded = s.unserialize();
		super.hxUnserialize(s);
		init();
	}
}