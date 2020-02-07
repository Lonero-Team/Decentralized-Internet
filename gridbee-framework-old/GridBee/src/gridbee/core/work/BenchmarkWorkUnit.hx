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
import henkolib.async.AsyncResult;
import gridbee.core.iface.WorkUnit;
import gridbee.core.work.BasicWorkUnit;
import gridbee.core.work.WorkContext;
import gridbee.core.work.WorkExecutor;

/**
 * @author tbur
 */

class BenchmarkWorkUnit extends BasicWorkUnit
{
	private var code : String;
	
	override public function new(code : String)
	{
		super();
		context.setProgramCode(code);
		state = Passive;
	}
}