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

package gridbee.worksource.boinc.benchmark;
import gridbee.core.work.BasicWorkUnit;
import gridbee.core.iface.WorkUnit;

/**
 * ...
 * @author Henko
 */

class WhetstoneBenchmark extends BasicWorkUnit
{
	public function new() 
	{
		super();
		var code = '
			var whetstone=function(m){var q=[],d,e,a,c,f,h,b=[],o,k;o=(new Date).getTime()/1E3;var g=0.49999975,p=g;k=0;do{var i=[];b[0]=1;b[1]=-1;b[2]=-1;b[3]=-1;for(e=0;e<1;e++){for(d=0;d<12E4;d++)b[0]=(b[0]+b[1]+b[2]-b[3])*g,b[1]=(b[0]+b[1]-b[2]+b[3])*g,b[2]=(b[0]-b[1]+b[2]+b[3])*g,b[3]=(-b[0]+b[1]+b[2]+b[3])*g;g=1-g}g=p;i[0]=b[0];i[1]=b[1];i[2]=b[2];i[3]=b[3];for(e=0;e<1;e++){for(d=0;d<14E3;d++){a=b;c=g;f=void 0;for(f=0;f<6;f++)a[0]=(a[0]+a[1]+a[2]-a[3])*c,a[1]=(a[0]+a[1]-a[2]+a[3])*c,a[2]=(a[0]-a[1]+a[2]+a[3])*c,a[3]=(-a[0]+a[1]+a[2]+a[3])/2}g=1-g}g=p;i[4]=b[0];a=c=h=i[11];for(e=0;e<1;e++)for(d=0;d<345E3;d++)f=a==1?h:c,a=c>2?h:1,c=f<1?1:h;i[5]=a;a=b[0];c=2;f=3;for(e=0;e<1;e++)for(d=0;d<21E4;d++)a=a*(c-a)*(f-c),c=f*c-(f-a)*c,f=(f-c)*(c+a),b[f&3]=a+c+f,b[c&3]=a*c*f;i[6]=b[0];c=a=0.5;for(e=0;e<1;e++){for(d=1;d<32E3;d++)a=g*Math.atan(2*Math.sin(a)*Math.cos(a)/(Math.cos(a+c)+Math.cos(a-c)-1)),c=g*Math.atan(2*Math.sin(c)*Math.cos(c)/(Math.cos(a+c)+Math.cos(a-c)-1));g=1-g}g=p;i[7]=a;a={a:1};c={a:1};f={a:1};for(e=0;e<1;e++)for(d=0;d<899E3;d++){h=a;var j=c,l=f,n=g;h.a=j.a;j.a=l.a;h.a=n*(h.a+j.a);j.a=0.50000025*(h.a+j.a);l.a=(h.a+j.a)/2}i[8]=a.a;a=0;c=1;f=2;b[0]=1;b[1]=2;b[2]=3;for(e=0;e<1;e++)for(d=0;d<616E3;d++)h=b,j=a,l=c,n=f,h[j]=h[l],h[l]=h[n],h[n]=h[j];i[9]=b[0];a=0.75;for(e=0;e<1;e++)for(d=0;d<93E3;d++)a=Math.sqrt(Math.exp(Math.log(a)/0.50000025));i[10]=a;i[12]=k;q.push(i);k++}while((new Date).getTime()/1E3-o<m);m=(new Date).getTime()/1E3-o;d={};d.flops=1E5*k/m*1E3;d.time=m;d.iter=k;d.results=q;return d};
			var seconds = parseFloat(js.input.read("seconds"));
			var result = whetstone(seconds);
			js.output.write("flops", result.flops);
			return 0;
		';
		
		context.setProgramCode(code);
		context.setPlatform("javascript");
		
		SwitchState(Passive);
	}
	
	public function getFlops() : Float
	{
		if (operation.isCompleted())
		{
			return Std.parseFloat(context.read("flops"));
		}
		else
		{
			return 0;
		}
	}
}