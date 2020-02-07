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

package gridbee.worksource.boinc.webrpc.subclasses;
import haxe.xml.Fast;

class SystemRequirements 
{
	public var p_fpops : Float;
    public var p_iops : Float;
    public var p_membw : Float;
    public var m_nbytes : Float;
    public var m_swap : Float;
    public var d_free : Float;
    public var bwup : Float;
    public var bwdown : Float;
	
	public function new(input : Fast)
	{
		if (input.hasNode.p_fpops)
			p_fpops = Std.parseFloat(input.node.p_fpops.innerData);
		if (input.hasNode.p_iops)
			p_iops = Std.parseFloat(input.node.p_iops.innerData);
		if (input.hasNode.p_membw)
			p_membw = Std.parseFloat(input.node.p_membw.innerData);
		if (input.hasNode.m_nbytes)
			m_nbytes = Std.parseFloat(input.node.m_nbytes.innerData);
		if (input.hasNode.m_swap)
			m_swap = Std.parseFloat(input.node.m_swap.innerData);
		if (input.hasNode.d_free)
			d_free = Std.parseFloat(input.node.d_free.innerData);
		if (input.hasNode.bwup)
			bwup = Std.parseFloat(input.node.bwup.innerData);
		if (input.hasNode.bwdown)
			bwdown = Std.parseFloat(input.node.bwdown.innerData);
	}
	public function print()
	{
		trace('p_fpops: ' + p_fpops);
		trace('p_iops: ' + p_iops);
		trace('p_membw: ' + p_membw);
		trace('m_nbytes: ' + m_nbytes);
		trace('m_swap: ' + m_swap);
		trace('d_free: ' + d_free);
		trace('bwup: ' + bwup);
		trace('bwdown: ' + bwdown);
	}
}