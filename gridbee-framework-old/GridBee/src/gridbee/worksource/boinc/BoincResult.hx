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
import haxe.Md5;
import gridbee.core.iface.Operable;
import henkolib.log.LogSource;
import henkolib.async.AsyncOperation;
import gridbee.worksource.boinc.reply.DataServerReply;
import gridbee.worksource.boinc.reply.FileRef;
import gridbee.worksource.boinc.reply.ResultSlot;
import henkolib.log.Console;
import gridbee.core.net.HTTPRequest;
import henkolib.async.AsyncResult;
import haxe.xml.Fast;
import gridbee.worksource.boinc.request.ResultFileinfo;
import gridbee.worksource.boinc.request.DataServerRequest;
import gridbee.worksource.boinc.request.FileUpload;
import gridbee.worksource.boinc.request.UploadFileInfo;

/**
 * @author Henko, tbur
 */

enum BoincResultState
{
	New;
	CheckingStatus;
	ReadyToUpload;
	Uploading;
	Uploaded;
	Error;
}

class BoincResult implements Operable, implements LogSource
{
	var state : BoincResultState;
	var workunit : BoincWorkUnit;
	var slot : ResultSlot;
	var fileref : FileRef;
	var data : String;
	var md5 : String;
	var changed : Bool;
	var offset : Int;
	
	var accepted : Bool;
	
	var statusCheckOperation : AsyncResult<HTTPResponse>;
	var uploadOperation : AsyncResult<HTTPResponse>;
	var reportOperation :AsyncResult<HTTPResponse>;
	
	public function new(workunit : BoincWorkUnit, slot : ResultSlot, fileref : FileRef, data : String) 
	{
		this.workunit = workunit;
		this.slot = slot;
		this.fileref = fileref;
		this.data = data; // filestream legyen
		this.md5 = Md5.encode(data);
		this.offset = 0;
		this.state = New;
		this.accepted = false;
		this.changed = true;
	}
	
	public function isCompleted() : Bool
	{
		return state == Uploaded;
	}
	
	public function isError() : Bool
	{
		return state == Error;
	}
	
	private function SwitchState(newstate : BoincResultState)
	{
		this.changed = true;
		this.state = newstate;
		Console.main.logDebug("Changed state to " + getState(), null, this);
	}
	
	public function getScreenName() : String
	{
		return workunit.getScreenName() + " / Result " + slot.name + " / " + fileref.open_name; 
	}
	
	public function getStateString() : String
	{
		switch (state)
		{
			case New: return "New";
			case CheckingStatus: return "Checking upload status";
			case ReadyToUpload: return "Ready to upload";
			case Uploading: return "Uploading";
			case Uploaded: return "Uploaded";
			case Error: return "Error";
			default: return "Unknown";
		}
	}
	
	public function isChanged() : Bool
	{
		return changed;
	}
	
	public function getState() : BoincResultState
	{
		return state;
	}
	
	public function operate() : Void
	{
		switch (state)
		{
			case New:
			{
				Console.main.logInformation("Checking upload status.", null, this);
				statusCheckOperation = checkUploadStatus(fileref);
				SwitchState(CheckingStatus);
			}
			
			case CheckingStatus:
			{
				if (statusCheckOperation.isCompleted())
				{
					var response = statusCheckOperation.getResult();
					var xml = new Fast(Xml.parse(response.content).firstElement());
					var reply : DataServerReply = new DataServerReply(xml);
					
					if (reply.status == 0)
					{
						// uploading all bytes
						if (reply.file_size == 0)
						{
							Console.main.logInformation("This result is not uploaded yet.", null, this);
							SwitchState(ReadyToUpload);
						}
						
						// partial upload
						else if (reply.file_size < data.length)
						{
							Console.main.logInformation("Partial upload present. Continuing upload.", null, this);
							offset = reply.file_size;
							SwitchState(ReadyToUpload);
						}
						
						// upload not necessary
						else
						{
							Console.main.logInformation("This result has been already uploaded.", null, this);
							SwitchState(Uploaded);
						}
					}
					else
					{
						Console.main.logWarning("Could not retrieve result status.", null, this);
						SwitchState(Error);
					}
				}
			}
			
			case ReadyToUpload:
			{
				Console.main.logInformation("Uploading: " + (data.length - offset) + " bytes", null, this);
				uploadOperation = uploadResult(fileref, data, offset, md5);
				SwitchState(Uploading);
			}
			
			case Uploading:
			{
				if (uploadOperation.isCompleted())
				{
					var response = uploadOperation.getResult();
					var xml = new Fast(Xml.parse(response.content).firstElement());
					var reply : DataServerReply = new DataServerReply(xml);
					
					if (reply.message != null)
					{
						Console.main.logWarning("Upload handler message: " + reply.message, null, this);
					}
					
					if (reply.status == 0)
					{
						Console.main.logInformation("Uploaded successfully.", null, this);
						SwitchState(Uploaded);
					}
					else
					{
						Console.main.logWarning("Could not upload result.", null, this);
						SwitchState(Error);
					}
					
				}
			}
			
			case Uploaded:
			{
			}
			
			case Error:
			{
				
			}
		}
	}
	
	public function getFileInfo() : ResultFileinfo
	{
		var info = new ResultFileinfo();
		
		info.name = slot.name;
		info.file_name = fileref.file_name;
		info.nbytes = data.length;
		info.max_nbytes = fileref.file_info.max_nbytes;
		info.md5_cksum = md5;
		info.url = fileref.file_info.url;
		
		return info;
	}
	
	public function isAccepted() : Bool
	{
		return accepted;
	}
	
	public function setAccepted() 
	{
		if (state == Uploaded)
		{
			accepted = true;
		}
	}
		
	private function checkUploadStatus(fileref : FileRef) : AsyncResult<HTTPResponse>
	{
		var request = new DataServerRequest();
		request.clientversion = BoincWorkSource.getVersion();
		request.get_file_size = fileref.file_name;
		
		var http = HTTPRequest.post(fileref.file_info.url);
		http.rawData(request.toXmlString());
		
		return http.send();
	}
	
	private function uploadResult(fileref : FileRef, data : String, offset : Int, md5 : String) : AsyncResult<HTTPResponse>
	{
		var request = new DataServerRequest();
		request.clientversion = BoincWorkSource.getVersion();
		
		request.file_upload = new FileUpload();
		request.file_upload.file_info = new UploadFileInfo(fileref.file_info);
		request.file_upload.offset = offset;
		
		request.file_upload.nbytes = data.length;
		request.file_upload.md5_cksum = md5;
		request.file_upload.data = data.substr(offset);
		
		var http = HTTPRequest.post(fileref.file_info.url);
		http.rawData(request.toXmlString());
		
		return http.send();
	}
	
	function hxSerialize(s : haxe.Serializer)
	{
		s.serialize(state);
		s.serialize(workunit);
		s.serialize(slot);
		s.serialize(fileref);
		s.serialize(data);
		s.serialize(md5);
		s.serialize(offset);
		s.serialize(accepted);
		changed = false;
    }
	
    function hxUnserialize(s : haxe.Unserializer)
	{
		state=s.unserialize();
		workunit=s.unserialize();
		slot=s.unserialize();
		fileref=s.unserialize();
		data=s.unserialize();
		md5 = s.unserialize();
		offset = s.unserialize();
		accepted = s.unserialize();
		
		if (state == Uploading) state = New;
    }
}