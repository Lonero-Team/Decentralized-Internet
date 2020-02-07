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
import gridbee.core.info.BrowserInfo;
import gridbee.worksource.boinc.BoincData;

/**
 * @author Henko
 */
class HostInfo implements BoincData
{
	// Difference from UTC time in seconds
	public var timezone(default, default) : Int;
	// Domain name of the host
	public var domain_name(default, default) : String;
	// IP address
	public var ip_addr(default, default) : String;
	// Cross-project identification, see: http://boinc.berkeley.edu/wiki/CPID
	public var host_cpid(default, default) : String;
	
	// CPU
	// Number of cpus/cpu cores
	public var p_ncpus(default, default) : Int;
	// Vendor = browser vendor
	public var p_vendor(default, default) : String;
	// CPU model = browser name
	public var p_model(default, default) : String;
	// CPU features = browser features
	public var p_features(default, default) : String;
	// floating point performance in FLOPS
	public var p_fpops(default, default) : Float;
	// integer performance in IOPS
	public var p_iops(default, default) : Float;
	// million bytes/sec memory bandwidth = it doesnt make sense for us
	public var p_membw(default, default) : Float;
	// When benchmarks were last run, or zero
	public var p_calculated(default, default) : Float;
	
	// Memory
	// Total amount of memory in bytes = it doesnt make sense for us
	public var m_nbytes(default, default) : Float;
	// Total amount of cache in bytes = it doesnt make sense for us
	public var m_cache(default, default) : Float;
	// Total amount of swap space in bytes = it doesnt make sense for us
	public var m_swap(default, default) : Float;
	
	// Disk
	// Total amount of disk in bytes = total size of LocalStorage, but we dont want to measure this
	public var d_total(default, default) : Float;
	// Total amount of free disk in bytes = free space in LocalStorage, but we dont want to measure this
	public var d_free(default, default) : Float;
	
	// OS
	// Name of the OS
	public var os_name(default, default) : String;
	// Version of the OS
	public var os_version(default, default) : String;
	
	public static function updateHostInfo(hostinfo : HostInfo)
	{
		// Difference from UTC in seconds
		// Source: http://www.onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/
		untyped __js__('
			var rightNow = new Date();
			var jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
			var temp = jan1.toGMTString();
			var jan2 = new Date(temp.substring(0, temp.lastIndexOf(" ") - 1));
			var std_time_offset = (jan1 - jan2) / 1000;
		');
		hostinfo.timezone = untyped __js__('std_time_offset');
		
		// IP address
		hostinfo.ip_addr = '0.0.0.0';
		
		// Cross-project identification
		// TODO: Cross-project identification
		// http://boinc.berkeley.edu/wiki/CPID
		//hostinfo.host_cpid = 'd2aeb02aff64019aa1ddfff4a79013d8';
		
		// ---------- CPU ----------
		// Number of cpus/cpu cores
		hostinfo.p_ncpus = 1;
		
		// Vendor = browser vendor
		hostinfo.p_vendor = BrowserInfo.browserVendor();
		
		// CPU model = browser name
		hostinfo.p_model = BrowserInfo.browserName() + ' ' + BrowserInfo.browserFullVersion();
		
		// CPU features = browser features
		hostinfo.p_features = '';
		if (BrowserInfo.flashInstalled()) 				hostinfo.p_features += 'Flash;';
		if (BrowserInfo.html5xmlHttpRequestLevel2())	hostinfo.p_features += 'XmlHttpRequestLevel2;';
		if (BrowserInfo.html5localStorage()) 			hostinfo.p_features += 'LocalStorage;';
		if (BrowserInfo.html5webWorkers()) 				hostinfo.p_features += 'WebWorkers;';
		if (BrowserInfo.html5webSockets())				hostinfo.p_features += 'WebSockets;';
				
		// million bytes/sec memory bandwidth = it doesnt make sense for us
		hostinfo.p_membw = 0;
		
		// p_fpops, p_iops, p_calculated are calculated elsewhere (BrowserBenchmark.hx)		
		
		// ---------- Memory ----------
		// Total amount of memory in bytes = fake 1GB
		hostinfo.m_nbytes = 1024 * 1024 * 1024;
		
		// Total amount of cache in bytes = fake 1MB
		hostinfo.m_cache = 1024 * 1024 * 1024;
		
		// Total amount of swap space in bytes = fake 1GB
		hostinfo.m_swap = 1024 * 1024 * 1024;
		
		// Disk
		// Total amount of disk in bytes = fake 1GB
		hostinfo.d_total = 1024 * 1024 * 1024;
		// Total amount of free disk in bytes = fake 1GB
		hostinfo.d_free = 1024 * 1024 * 1024;
		
		// OS
		// Name of the OS
		hostinfo.os_name = BrowserInfo.osPlatform();
		
		// Version of the OS
		hostinfo.os_version = BrowserInfo.osName();

		return hostinfo;
	}
	
	public function new() 
	{
	}
	
	public function toXmlString(?indent : String = "") : String
	{
		var xml : String = indent + "<host_info>\n";
		
		var innerindent = indent + "    ";
		
		if (timezone != null) 		xml += innerindent + "<timezone>" + timezone + "</timezone>\n";
		if (domain_name != null) 	xml += innerindent + "<domain_name>" + domain_name + "</domain_name>\n";
		if (ip_addr != null) 		xml += innerindent + "<ip_addr>" + ip_addr + "</ip_addr>\n";
		if (host_cpid != null) 		xml += innerindent + "<host_cpid>" + host_cpid + "</host_cpid>\n";
		
		if (p_ncpus != null) 		xml += innerindent + "<p_ncpus>" + p_ncpus + "</p_ncpus>\n";		
		if (p_vendor != null) 		xml += innerindent + "<p_vendor>" + p_vendor + "</p_vendor>\n";
		if (p_model != null) 		xml += innerindent + "<p_model>" + p_model + "</p_model>\n";
		if (p_features != null) 	xml += innerindent + "<p_features>" + p_features + "</p_features>\n";
		if (p_fpops != null) 		xml += innerindent + "<p_fpops>" + p_fpops + "</p_fpops>\n";
		if (p_iops != null) 		xml += innerindent + "<p_iops>" + p_iops + "</p_iops>\n";
		if (p_membw != null) 		xml += innerindent + "<p_membw>" + p_membw + "</p_membw>\n";
		if (p_calculated != null) 	xml += innerindent + "<p_calculated>" + p_calculated + "</p_calculated>\n";
		
		if (m_nbytes != null) 		xml += innerindent + "<m_nbytes>" + m_nbytes + "</m_nbytes>\n";
		if (m_cache != null) 		xml += innerindent + "<m_cache>" + m_cache + "</m_cache>\n";
		if (m_swap != null) 		xml += innerindent + "<m_swap>" + m_swap + "</m_swap>\n";
		
		if (d_total != null) 		xml += innerindent + "<d_total>" + d_total + "</d_total>\n";
		if (d_free != null) 		xml += innerindent + "<d_free>" + d_free + "</d_free>\n";
		
		if (os_name != null) 		xml += innerindent + "<os_name>" + os_name + "</os_name>\n";
		if (os_version != null) 	xml += innerindent + "<os_version>" + os_version + "</os_version>\n";
		
		xml += indent + "</host_info>\n";
		
		return xml;
	}
	
}