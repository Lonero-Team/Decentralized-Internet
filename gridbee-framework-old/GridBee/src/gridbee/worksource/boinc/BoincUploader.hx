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
import henkolib.async.AsyncOperation;
import henkolib.async.AsyncResult;
import gridbee.core.work.WorkContext;
import gridbee.worksource.boinc.BoincResult;
import gridbee.worksource.boinc.BoincWorkSource;
import gridbee.worksource.boinc.BoincWorkUnit;
import gridbee.worksource.boinc.reply.Workunit;
import gridbee.worksource.boinc.request.Result;
import henkolib.log.Console;

/**
 * ...
 * @author tbur
 */

class BoincUploader 
{
	private var workunit : Workunit;
	private var boincworkunit : BoincWorkUnit;
	private var context : WorkContext;
	private var results : Array<BoincResult>;
	private var status : AsyncOperation<BoincWorkUnit>;
	
	public function new(wu : BoincWorkUnit)
	{
		this.workunit = wu.getUnitinfo();
		this.boincworkunit = wu;
		this.context = wu.getContext();
		results = new Array();
		status = new AsyncOperation<BoincWorkUnit>();
	}
	
	public function uploadAll() : AsyncResult<BoincWorkUnit>
	{
		boincworkunit.setUploadingState();
		Console.main.logNotice("Uploading results.");
		var streams : Array<String> = context.getFileList();
		for (stream in streams)
		{
			var ok = false;
			for (ref in workunit.result.file_ref)
			{
				if (ref.open_name == stream)
				{
					results.push(new BoincResult(boincworkunit, workunit.result, ref, context.read(ref.open_name)));
					ok = true;
				}
			}
			
			if (!ok)
			{
				//TODO: log
				//"Error: no corresponding upload for stream "+stream
			}
		}
		return status;
	}
	
	public function isChanged() : Bool
	{
		for (r in results)
		{
			if (r.isChanged())
				return true;
		}
		
		return false;
	}
	
	public function isCompleted() : Bool
	{
		return status.isCompleted();
	}
	
	public function getResult() : BoincWorkUnit
	{
		if (status.isCompleted())
		{
			return status.getResult();
		}
		else
		{
			return null;
		}
	}
	
	public function operate() : Void
	{
		if (!status.isError())
		{
			for (result in results)
			{
				result.operate();
			}
			
			var completed = results.length > 0;
			var error = false;
			
			for (result in results)
			{
				completed = completed && result.isCompleted();
				error = error || result.isError();
			}
			
			if (completed)
			{
				if (!status.isCompleted())
				{
					status.setResult(this.boincworkunit);
					boincworkunit.setUploadedState(results);
				}
			}
			
			else if (error)
			{
				status.setError("Error while uploading results");
			}
		}
	}
}