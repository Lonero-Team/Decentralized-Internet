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

package henkolib.events;

/**
 * Represents an Event with customizable arguments.
 * Should be kept private in the class that invokes it.
 * Use the IPublicSimpleEvent interface for publishing the event.
 * @author Henko
 */

class Event<T> implements PublicEvent<T>
{
	var owner: Dynamic;
	var subscribed : Array<T->Void>;
	
	public function new() 
	{
		subscribed = new Array<T->Void>();
	}
	
	public function subscribe(func:T->Void) : Void
	{
		if (Reflect.isFunction(func))
		{
			subscribed.push(func);
		}
	}
	
	public function unsubscribe(func:T->Void) : Void
	{
		if (Reflect.isFunction(func))
		{
			subscribed.remove(func);
		}
	}
	
	public function invoke(arg : T)
	{
		var callargs = new Array<Dynamic>();
		callargs.push(arg);
		
		for (func in subscribed)
		{
			Reflect.callMethod( { }, func, callargs);
		}
	}	
}