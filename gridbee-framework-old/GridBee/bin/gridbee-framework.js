$estr = function() { return js.Boot.__string_rec(this,''); }
if(typeof henkolib=='undefined') henkolib = {}
if(!henkolib.events) henkolib.events = {}
henkolib.events.PublicEvent = function() { }
henkolib.events.PublicEvent.__name__ = ["henkolib","events","PublicEvent"];
henkolib.events.PublicEvent.prototype.subscribe = null;
henkolib.events.PublicEvent.prototype.unsubscribe = null;
henkolib.events.PublicEvent.prototype.__class__ = henkolib.events.PublicEvent;
if(typeof gridbee=='undefined') gridbee = {}
if(!gridbee.worksource) gridbee.worksource = {}
if(!gridbee.worksource.boinc) gridbee.worksource.boinc = {}
if(!gridbee.worksource.boinc.webrpc) gridbee.worksource.boinc.webrpc = {}
if(!gridbee.worksource.boinc.webrpc.result) gridbee.worksource.boinc.webrpc.result = {}
gridbee.worksource.boinc.webrpc.result.TeamMembrListRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("user")) {
		this.Membr_arr = new Array();
		var $it0 = input.nodes.resolve("user").iterator();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			this.Membr_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.TeamMembr(i));
		}
	}
}
gridbee.worksource.boinc.webrpc.result.TeamMembrListRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","TeamMembrListRes"];
gridbee.worksource.boinc.webrpc.result.TeamMembrListRes.prototype.Membr_arr = null;
gridbee.worksource.boinc.webrpc.result.TeamMembrListRes.prototype.print = function() {
	if(this.Membr_arr[0] != null) this.Membr_arr[0].print(); else haxe.Log.trace("No members",{ fileName : "TeamMembrListRes.hx", lineNumber : 40, className : "gridbee.worksource.boinc.webrpc.result.TeamMembrListRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.TeamMembrListRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.TeamMembrListRes;
if(!henkolib.async) henkolib.async = {}
henkolib.async.AsyncResult = function() { }
henkolib.async.AsyncResult.__name__ = ["henkolib","async","AsyncResult"];
henkolib.async.AsyncResult.prototype.isCompleted = null;
henkolib.async.AsyncResult.prototype.isError = null;
henkolib.async.AsyncResult.prototype.getError = null;
henkolib.async.AsyncResult.prototype.getProgress = null;
henkolib.async.AsyncResult.prototype.getResult = null;
henkolib.async.AsyncResult.prototype.getElapsedTime = null;
henkolib.async.AsyncResult.prototype.onComplete = null;
henkolib.async.AsyncResult.prototype.onError = null;
henkolib.async.AsyncResult.prototype.onProgress = null;
henkolib.async.AsyncResult.prototype.__class__ = henkolib.async.AsyncResult;
gridbee.Main = function() { }
gridbee.Main.__name__ = ["gridbee","Main"];
gridbee.Main.main = function() {
}
gridbee.Main.prototype.__class__ = gridbee.Main;
if(!gridbee.js) gridbee.js = {}
gridbee.js.Event = function() { }
gridbee.js.Event.__name__ = ["gridbee","js","Event"];
gridbee.js.Event.prototype.__class__ = gridbee.js.Event;
henkolib.async.AsyncOperation = function(p) {
	if( p === $_ ) return;
	this.starttime = Date.now();
	this.state = henkolib.async.AsyncState.Waiting;
	this.result = null;
	this.error = null;
	this.progress = 0;
	this.onComplete = this.oncomplete = new henkolib.events.Event();
	this.onError = this.onerror = new henkolib.events.Event();
	this.onProgress = this.onprogress = new henkolib.events.Event();
}
henkolib.async.AsyncOperation.__name__ = ["henkolib","async","AsyncOperation"];
henkolib.async.AsyncOperation.prototype.result = null;
henkolib.async.AsyncOperation.prototype.error = null;
henkolib.async.AsyncOperation.prototype.progress = null;
henkolib.async.AsyncOperation.prototype.state = null;
henkolib.async.AsyncOperation.prototype.starttime = null;
henkolib.async.AsyncOperation.prototype.oncomplete = null;
henkolib.async.AsyncOperation.prototype.onerror = null;
henkolib.async.AsyncOperation.prototype.onprogress = null;
henkolib.async.AsyncOperation.prototype.onComplete = null;
henkolib.async.AsyncOperation.prototype.onError = null;
henkolib.async.AsyncOperation.prototype.onProgress = null;
henkolib.async.AsyncOperation.prototype.setResult = function(result) {
	if(this.state == henkolib.async.AsyncState.Waiting) {
		var self = this;
		haxe.Timer.delay(function() {
			self.result = result;
			self.state = henkolib.async.AsyncState.Completed;
			self.progress = 1.0;
			self.onprogress.invoke(self.progress);
			self.oncomplete.invoke(result);
		},0);
	} else henkolib.log.Console.main.logError("Async operation result can only be set once!",null,null,{ fileName : "AsyncOperation.hx", lineNumber : 76, className : "henkolib.async.AsyncOperation", methodName : "setResult"});
}
henkolib.async.AsyncOperation.prototype.setError = function(error) {
	if(this.state == henkolib.async.AsyncState.Waiting) {
		this.error = error;
		this.state = henkolib.async.AsyncState.Error;
		this.onerror.invoke(error);
	} else henkolib.log.Console.main.logError("Async operation error can only be set once!",null,null,{ fileName : "AsyncOperation.hx", lineNumber : 90, className : "henkolib.async.AsyncOperation", methodName : "setError"});
}
henkolib.async.AsyncOperation.prototype.setProgress = function(progress) {
	if(progress > this.progress) {
		this.progress = progress;
		this.onprogress.invoke(progress);
	}
}
henkolib.async.AsyncOperation.prototype.getElapsedTime = function() {
	return Date.fromTime(Date.now().getTime() - this.starttime.getTime());
}
henkolib.async.AsyncOperation.prototype.isCompleted = function() {
	return this.state == henkolib.async.AsyncState.Completed;
}
henkolib.async.AsyncOperation.prototype.isError = function() {
	return this.state == henkolib.async.AsyncState.Error;
}
henkolib.async.AsyncOperation.prototype.getState = function() {
	return this.state;
}
henkolib.async.AsyncOperation.prototype.getError = function() {
	if(this.state != henkolib.async.AsyncState.Error) henkolib.log.Console.main.logWarning("Async operation has not completed yet.",null,null,{ fileName : "AsyncOperation.hx", lineNumber : 125, className : "henkolib.async.AsyncOperation", methodName : "getError"});
	return this.error;
}
henkolib.async.AsyncOperation.prototype.getProgress = function() {
	return this.progress;
}
henkolib.async.AsyncOperation.prototype.getResult = function() {
	if(this.state != henkolib.async.AsyncState.Completed) henkolib.log.Console.main.logWarning("Async operation has not completed yet.",null,null,{ fileName : "AsyncOperation.hx", lineNumber : 136, className : "henkolib.async.AsyncOperation", methodName : "getResult"});
	return this.result;
}
henkolib.async.AsyncOperation.prototype.__class__ = henkolib.async.AsyncOperation;
henkolib.async.AsyncOperation.__interfaces__ = [henkolib.async.AsyncResult];
if(!gridbee.core) gridbee.core = {}
if(!gridbee.core.iface) gridbee.core.iface = {}
gridbee.core.iface.Persistent = function() { }
gridbee.core.iface.Persistent.__name__ = ["gridbee","core","iface","Persistent"];
gridbee.core.iface.Persistent.prototype.init = null;
gridbee.core.iface.Persistent.prototype.isChanged = null;
gridbee.core.iface.Persistent.prototype.hxSerialize = null;
gridbee.core.iface.Persistent.prototype.hxUnserialize = null;
gridbee.core.iface.Persistent.prototype.__class__ = gridbee.core.iface.Persistent;
gridbee.core.iface.Operable = function() { }
gridbee.core.iface.Operable.__name__ = ["gridbee","core","iface","Operable"];
gridbee.core.iface.Operable.prototype.operate = null;
gridbee.core.iface.Operable.prototype.__class__ = gridbee.core.iface.Operable;
if(!gridbee.core.work) gridbee.core.work = {}
gridbee.core.work.WorkSourcePool = function(p) {
	if( p === $_ ) return;
	this.worksources = new Array();
	this.targetactive = 1;
	this.currentwsindex = 0;
	this.init();
	henkolib.log.Console.main.logNotice("WorkSourcePool created: targetactive = " + this.targetactive,null,null,{ fileName : "WorkSourcePool.hx", lineNumber : 42, className : "gridbee.core.work.WorkSourcePool", methodName : "new"});
}
gridbee.core.work.WorkSourcePool.__name__ = ["gridbee","core","work","WorkSourcePool"];
gridbee.core.work.WorkSourcePool.prototype.worksources = null;
gridbee.core.work.WorkSourcePool.prototype.targetactive = null;
gridbee.core.work.WorkSourcePool.prototype.currentwsindex = null;
gridbee.core.work.WorkSourcePool.prototype.changed = null;
gridbee.core.work.WorkSourcePool.prototype.init = function() {
	this.changed = false;
	this.currentwsindex = 0;
	this.changed = false;
}
gridbee.core.work.WorkSourcePool.prototype.addWorkSource = function(ws) {
	this.worksources.push(ws);
	this.changed = true;
}
gridbee.core.work.WorkSourcePool.prototype.removeWorkSource = function(ws) {
	this.worksources.remove(ws);
}
gridbee.core.work.WorkSourcePool.prototype.getWorkSources = function() {
	return this.worksources;
}
gridbee.core.work.WorkSourcePool.prototype.setTargetActive = function(num) {
	this.targetactive = num;
}
gridbee.core.work.WorkSourcePool.prototype.getTargetActive = function() {
	return this.targetactive;
}
gridbee.core.work.WorkSourcePool.prototype.getNumActive = function() {
	var active = 0;
	var _g = 0, _g1 = this.worksources;
	while(_g < _g1.length) {
		var ws = _g1[_g];
		++_g;
		active += ws.getNumActive();
	}
	return active;
}
gridbee.core.work.WorkSourcePool.prototype.stepToNext = function() {
	this.currentwsindex = (this.currentwsindex + 1) % this.worksources.length;
}
gridbee.core.work.WorkSourcePool.prototype.stepToPrev = function() {
	if(this.currentwsindex == 0) this.currentwsindex = this.worksources.length - 1; else this.currentwsindex == this.currentwsindex - 1;
}
gridbee.core.work.WorkSourcePool.prototype.operate = function() {
	var _g = 0, _g1 = this.worksources;
	while(_g < _g1.length) {
		var ws = _g1[_g];
		++_g;
		ws.operate();
	}
	if(this.getNumActive() < this.targetactive && this.worksources.length > 0) {
		this.stepToNext();
		this.worksources[this.currentwsindex].startOne();
	}
	if(this.getNumActive() > this.targetactive) {
		this.worksources[this.currentwsindex].terminateOne();
		this.stepToPrev();
	}
}
gridbee.core.work.WorkSourcePool.prototype.terminate = function() {
	var _g = 0, _g1 = this.worksources;
	while(_g < _g1.length) {
		var ws = _g1[_g];
		++_g;
		ws.terminate();
	}
}
gridbee.core.work.WorkSourcePool.prototype.isChanged = function() {
	var _g = 0, _g1 = this.worksources;
	while(_g < _g1.length) {
		var ws = _g1[_g];
		++_g;
		if(ws.isChanged()) this.changed = true;
	}
	return this.changed;
}
gridbee.core.work.WorkSourcePool.prototype.hxSerialize = function(s) {
	s.serialize(this.worksources);
	s.serialize(this.targetactive);
	this.changed = false;
}
gridbee.core.work.WorkSourcePool.prototype.hxUnserialize = function(s) {
	this.worksources = s.unserialize();
	this.targetactive = s.unserialize();
	this.init();
}
gridbee.core.work.WorkSourcePool.prototype.__class__ = gridbee.core.work.WorkSourcePool;
gridbee.core.work.WorkSourcePool.__interfaces__ = [gridbee.core.iface.Persistent,gridbee.core.iface.Operable];
if(!gridbee.worksource.boinc.request) gridbee.worksource.boinc.request = {}
gridbee.worksource.boinc.request.Host = function(p) {
	if( p === $_ ) return;
	this.hostid = null;
	this.host_info = new gridbee.worksource.boinc.request.HostInfo();
}
gridbee.worksource.boinc.request.Host.__name__ = ["gridbee","worksource","boinc","request","Host"];
gridbee.worksource.boinc.request.Host.prototype.hostid = null;
gridbee.worksource.boinc.request.Host.prototype.host_info = null;
gridbee.worksource.boinc.request.Host.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = "";
	if(this.hostid != null) xml += indent + "<hostid>" + this.hostid + "</hostid>\n";
	if(this.host_info != null) xml += this.host_info.toXmlString(indent);
	return xml;
}
gridbee.worksource.boinc.request.Host.prototype.__class__ = gridbee.worksource.boinc.request.Host;
gridbee.worksource.boinc.BoincUploader = function(wu) {
	if( wu === $_ ) return;
	this.workunit = wu.getUnitinfo();
	this.boincworkunit = wu;
	this.context = wu.getContext();
	this.results = new Array();
	this.status = new henkolib.async.AsyncOperation();
}
gridbee.worksource.boinc.BoincUploader.__name__ = ["gridbee","worksource","boinc","BoincUploader"];
gridbee.worksource.boinc.BoincUploader.prototype.workunit = null;
gridbee.worksource.boinc.BoincUploader.prototype.boincworkunit = null;
gridbee.worksource.boinc.BoincUploader.prototype.context = null;
gridbee.worksource.boinc.BoincUploader.prototype.results = null;
gridbee.worksource.boinc.BoincUploader.prototype.status = null;
gridbee.worksource.boinc.BoincUploader.prototype.uploadAll = function() {
	this.boincworkunit.setUploadingState();
	henkolib.log.Console.main.logNotice("Uploading results.",null,null,{ fileName : "BoincUploader.hx", lineNumber : 55, className : "gridbee.worksource.boinc.BoincUploader", methodName : "uploadAll"});
	var streams = this.context.getFileList();
	var _g = 0;
	while(_g < streams.length) {
		var stream = streams[_g];
		++_g;
		var ok = false;
		var _g1 = 0, _g2 = this.workunit.result.file_ref;
		while(_g1 < _g2.length) {
			var ref = _g2[_g1];
			++_g1;
			if(ref.open_name == stream) {
				this.results.push(new gridbee.worksource.boinc.BoincResult(this.boincworkunit,this.workunit.result,ref,this.context.read(ref.open_name)));
				ok = true;
			}
		}
		if(!ok) {
		}
	}
	return this.status;
}
gridbee.worksource.boinc.BoincUploader.prototype.isChanged = function() {
	var _g = 0, _g1 = this.results;
	while(_g < _g1.length) {
		var r = _g1[_g];
		++_g;
		if(r.isChanged()) return true;
	}
	return false;
}
gridbee.worksource.boinc.BoincUploader.prototype.isCompleted = function() {
	return this.status.isCompleted();
}
gridbee.worksource.boinc.BoincUploader.prototype.getResult = function() {
	if(this.status.isCompleted()) return this.status.getResult(); else return null;
}
gridbee.worksource.boinc.BoincUploader.prototype.operate = function() {
	if(!this.status.isError()) {
		var _g = 0, _g1 = this.results;
		while(_g < _g1.length) {
			var result = _g1[_g];
			++_g;
			result.operate();
		}
		var completed = this.results.length > 0;
		var error = false;
		var _g = 0, _g1 = this.results;
		while(_g < _g1.length) {
			var result = _g1[_g];
			++_g;
			completed = completed && result.isCompleted();
			error = error || result.isError();
		}
		if(completed) {
			if(!this.status.isCompleted()) {
				this.status.setResult(this.boincworkunit);
				this.boincworkunit.setUploadedState(this.results);
			}
		} else if(error) this.status.setError("Error while uploading results");
	}
}
gridbee.worksource.boinc.BoincUploader.prototype.__class__ = gridbee.worksource.boinc.BoincUploader;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("id")) this.id = Std.parseInt(input.node.resolve("id").getInnerData());
	if(input.hasNode.resolve("cpid")) this.cpid = input.node.resolve("cpid").getInnerData();
	if(input.hasNode.resolve("create_time")) this.create_time = Std.parseInt(input.node.resolve("create_time").getInnerData());
	if(input.hasNode.resolve("name")) this.name = input.node.resolve("name").getInnerData();
	if(input.hasNode.resolve("country")) this.country = input.node.resolve("country").getInnerData();
	if(input.hasNode.resolve("total_credit")) this.total_credit = Std.parseFloat(input.node.resolve("total_credit").getInnerData());
	if(input.hasNode.resolve("expavg_credit")) this.expavg_credit = Std.parseFloat(input.node.resolve("expavg_credit").getInnerData());
	if(input.hasNode.resolve("expavg_time")) this.expavg_time = Std.parseFloat(input.node.resolve("expavg_time").getInnerData());
	if(input.hasNode.resolve("teamid")) this.teamid = Std.parseInt(input.node.resolve("teamid").getInnerData());
	if(input.hasNode.resolve("url")) this.url = input.node.resolve("url").getInnerData();
	if(input.hasNode.resolve("has_profile")) {
		if(input.node.resolve("has_profile").getInnerData() == "1") this.has_profile = true; else if(input.node.resolve("has_profile").getInnerData() == "0") this.has_profile = false;
	}
	if(input.hasNode.resolve("host")) {
		this.host_arr = new Array();
		var $it0 = input.nodes.resolve("host").iterator();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			this.host_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.Host(i));
		}
	}
}
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","CreditInfoRes"];
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.id = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.cpid = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.create_time = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.name = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.country = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.total_credit = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.expavg_credit = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.expavg_time = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.teamid = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.url = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.has_profile = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.host_arr = null;
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.print = function() {
	haxe.Log.trace("id: " + this.id,{ fileName : "CreditInfoRes.hx", lineNumber : 75, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("cpid:" + this.cpid,{ fileName : "CreditInfoRes.hx", lineNumber : 76, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("create_time: " + this.create_time,{ fileName : "CreditInfoRes.hx", lineNumber : 77, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("name: " + this.name,{ fileName : "CreditInfoRes.hx", lineNumber : 78, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("country: " + this.country,{ fileName : "CreditInfoRes.hx", lineNumber : 79, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("total_credit: " + this.total_credit,{ fileName : "CreditInfoRes.hx", lineNumber : 80, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("expavg_credit: " + this.expavg_credit,{ fileName : "CreditInfoRes.hx", lineNumber : 81, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("expavg_time: " + this.expavg_time,{ fileName : "CreditInfoRes.hx", lineNumber : 82, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("teamid: " + this.teamid,{ fileName : "CreditInfoRes.hx", lineNumber : 83, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("url: " + this.url,{ fileName : "CreditInfoRes.hx", lineNumber : 84, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
	haxe.Log.trace("has_profile: " + this.has_profile,{ fileName : "CreditInfoRes.hx", lineNumber : 85, className : "gridbee.worksource.boinc.webrpc.result.CreditInfoRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.CreditInfoRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.CreditInfoRes;
List = function(p) {
	if( p === $_ ) return;
	this.length = 0;
}
List.__name__ = ["List"];
List.prototype.h = null;
List.prototype.q = null;
List.prototype.length = null;
List.prototype.add = function(item) {
	var x = [item];
	if(this.h == null) this.h = x; else this.q[1] = x;
	this.q = x;
	this.length++;
}
List.prototype.push = function(item) {
	var x = [item,this.h];
	this.h = x;
	if(this.q == null) this.q = x;
	this.length++;
}
List.prototype.first = function() {
	return this.h == null?null:this.h[0];
}
List.prototype.last = function() {
	return this.q == null?null:this.q[0];
}
List.prototype.pop = function() {
	if(this.h == null) return null;
	var x = this.h[0];
	this.h = this.h[1];
	if(this.h == null) this.q = null;
	this.length--;
	return x;
}
List.prototype.isEmpty = function() {
	return this.h == null;
}
List.prototype.clear = function() {
	this.h = null;
	this.q = null;
	this.length = 0;
}
List.prototype.remove = function(v) {
	var prev = null;
	var l = this.h;
	while(l != null) {
		if(l[0] == v) {
			if(prev == null) this.h = l[1]; else prev[1] = l[1];
			if(this.q == l) this.q = prev;
			this.length--;
			return true;
		}
		prev = l;
		l = l[1];
	}
	return false;
}
List.prototype.iterator = function() {
	return { h : this.h, hasNext : function() {
		return this.h != null;
	}, next : function() {
		if(this.h == null) return null;
		var x = this.h[0];
		this.h = this.h[1];
		return x;
	}};
}
List.prototype.toString = function() {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	s.b[s.b.length] = "{" == null?"null":"{";
	while(l != null) {
		if(first) first = false; else s.b[s.b.length] = ", " == null?"null":", ";
		s.add(Std.string(l[0]));
		l = l[1];
	}
	s.b[s.b.length] = "}" == null?"null":"}";
	return s.b.join("");
}
List.prototype.join = function(sep) {
	var s = new StringBuf();
	var first = true;
	var l = this.h;
	while(l != null) {
		if(first) first = false; else s.b[s.b.length] = sep == null?"null":sep;
		s.add(l[0]);
		l = l[1];
	}
	return s.b.join("");
}
List.prototype.filter = function(f) {
	var l2 = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		if(f(v)) l2.add(v);
	}
	return l2;
}
List.prototype.map = function(f) {
	var b = new List();
	var l = this.h;
	while(l != null) {
		var v = l[0];
		l = l[1];
		b.add(f(v));
	}
	return b;
}
List.prototype.__class__ = List;
IntIter = function(min,max) {
	if( min === $_ ) return;
	this.min = min;
	this.max = max;
}
IntIter.__name__ = ["IntIter"];
IntIter.prototype.min = null;
IntIter.prototype.max = null;
IntIter.prototype.hasNext = function() {
	return this.min < this.max;
}
IntIter.prototype.next = function() {
	return this.min++;
}
IntIter.prototype.__class__ = IntIter;
if(!gridbee.worksource.boinc.reply) gridbee.worksource.boinc.reply = {}
gridbee.worksource.boinc.reply.ResultAck = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("name")) this.name = node.node.resolve("name").getInnerData();
}
gridbee.worksource.boinc.reply.ResultAck.__name__ = ["gridbee","worksource","boinc","reply","ResultAck"];
gridbee.worksource.boinc.reply.ResultAck.prototype.name = null;
gridbee.worksource.boinc.reply.ResultAck.prototype.__class__ = gridbee.worksource.boinc.reply.ResultAck;
gridbee.worksource.boinc.webrpc.result.AccountCreateRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("authenticator")) this.authenticator = input.node.resolve("authenticator").getInnerData();
}
gridbee.worksource.boinc.webrpc.result.AccountCreateRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","AccountCreateRes"];
gridbee.worksource.boinc.webrpc.result.AccountCreateRes.prototype.authenticator = null;
gridbee.worksource.boinc.webrpc.result.AccountCreateRes.prototype.print = function() {
	haxe.Log.trace("authenticator: " + this.authenticator,{ fileName : "AccountCreateRes.hx", lineNumber : 34, className : "gridbee.worksource.boinc.webrpc.result.AccountCreateRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.AccountCreateRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.AccountCreateRes;
Hash = function(p) {
	if( p === $_ ) return;
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
}
Hash.__name__ = ["Hash"];
Hash.prototype.h = null;
Hash.prototype.set = function(key,value) {
	this.h["$" + key] = value;
}
Hash.prototype.get = function(key) {
	return this.h["$" + key];
}
Hash.prototype.exists = function(key) {
	try {
		key = "$" + key;
		return this.hasOwnProperty.call(this.h,key);
	} catch( e ) {
		for(var i in this.h) if( i == key ) return true;
		return false;
	}
}
Hash.prototype.remove = function(key) {
	if(!this.exists(key)) return false;
	delete(this.h["$" + key]);
	return true;
}
Hash.prototype.keys = function() {
	var a = new Array();
	for(var i in this.h) a.push(i.substr(1));
	return a.iterator();
}
Hash.prototype.iterator = function() {
	return { ref : this.h, it : this.keys(), hasNext : function() {
		return this.it.hasNext();
	}, next : function() {
		var i = this.it.next();
		return this.ref["$" + i];
	}};
}
Hash.prototype.toString = function() {
	var s = new StringBuf();
	s.b[s.b.length] = "{" == null?"null":"{";
	var it = this.keys();
	while( it.hasNext() ) {
		var i = it.next();
		s.b[s.b.length] = i == null?"null":i;
		s.b[s.b.length] = " => " == null?"null":" => ";
		s.add(Std.string(this.get(i)));
		if(it.hasNext()) s.b[s.b.length] = ", " == null?"null":", ";
	}
	s.b[s.b.length] = "}" == null?"null":"}";
	return s.b.join("");
}
Hash.prototype.__class__ = Hash;
IntHash = function(p) {
	if( p === $_ ) return;
	this.h = {}
	if(this.h.__proto__ != null) {
		this.h.__proto__ = null;
		delete(this.h.__proto__);
	}
}
IntHash.__name__ = ["IntHash"];
IntHash.prototype.h = null;
IntHash.prototype.set = function(key,value) {
	this.h[key] = value;
}
IntHash.prototype.get = function(key) {
	return this.h[key];
}
IntHash.prototype.exists = function(key) {
	return this.h[key] != null;
}
IntHash.prototype.remove = function(key) {
	if(this.h[key] == null) return false;
	delete(this.h[key]);
	return true;
}
IntHash.prototype.keys = function() {
	var a = new Array();
	for( x in this.h ) a.push(x);
	return a.iterator();
}
IntHash.prototype.iterator = function() {
	return { ref : this.h, it : this.keys(), hasNext : function() {
		return this.it.hasNext();
	}, next : function() {
		var i = this.it.next();
		return this.ref[i];
	}};
}
IntHash.prototype.toString = function() {
	var s = new StringBuf();
	s.b[s.b.length] = "{" == null?"null":"{";
	var it = this.keys();
	while( it.hasNext() ) {
		var i = it.next();
		s.b[s.b.length] = i == null?"null":i;
		s.b[s.b.length] = " => " == null?"null":" => ";
		s.add(Std.string(this.get(i)));
		if(it.hasNext()) s.b[s.b.length] = ", " == null?"null":", ";
	}
	s.b[s.b.length] = "}" == null?"null":"}";
	return s.b.join("");
}
IntHash.prototype.__class__ = IntHash;
if(!henkolib.log) henkolib.log = {}
henkolib.log.LogSource = function() { }
henkolib.log.LogSource.__name__ = ["henkolib","log","LogSource"];
henkolib.log.LogSource.prototype.getScreenName = null;
henkolib.log.LogSource.prototype.__class__ = henkolib.log.LogSource;
gridbee.core.iface.WorkSource = function() { }
gridbee.core.iface.WorkSource.__name__ = ["gridbee","core","iface","WorkSource"];
gridbee.core.iface.WorkSource.prototype.getWorkUnits = null;
gridbee.core.iface.WorkSource.prototype.start = null;
gridbee.core.iface.WorkSource.prototype.terminate = null;
gridbee.core.iface.WorkSource.prototype.operate = null;
gridbee.core.iface.WorkSource.prototype.getNumActive = null;
gridbee.core.iface.WorkSource.prototype.startOne = null;
gridbee.core.iface.WorkSource.prototype.terminateOne = null;
gridbee.core.iface.WorkSource.prototype.onAddWorkunit = null;
gridbee.core.iface.WorkSource.prototype.onRemoveWorkunit = null;
gridbee.core.iface.WorkSource.prototype.getScreenName = null;
gridbee.core.iface.WorkSource.prototype.isChanged = null;
gridbee.core.iface.WorkSource.prototype.hxSerialize = null;
gridbee.core.iface.WorkSource.prototype.hxUnserialize = null;
gridbee.core.iface.WorkSource.prototype.__class__ = gridbee.core.iface.WorkSource;
gridbee.core.iface.WorkSource.__interfaces__ = [gridbee.core.iface.Persistent,henkolib.log.LogSource,gridbee.core.iface.Operable];
gridbee.core.work.BasicWorkSource = function(p) {
	if( p === $_ ) return;
	this.workpool = new gridbee.core.work.WorkUnitPool();
	this.init();
}
gridbee.core.work.BasicWorkSource.__name__ = ["gridbee","core","work","BasicWorkSource"];
gridbee.core.work.BasicWorkSource.prototype.workpool = null;
gridbee.core.work.BasicWorkSource.prototype.isRunning = null;
gridbee.core.work.BasicWorkSource.prototype.onaddworkunit = null;
gridbee.core.work.BasicWorkSource.prototype.onremoveworkunit = null;
gridbee.core.work.BasicWorkSource.prototype.onAddWorkunit = null;
gridbee.core.work.BasicWorkSource.prototype.onRemoveWorkunit = null;
gridbee.core.work.BasicWorkSource.prototype.init = function() {
	this.isRunning = false;
	this.onAddWorkunit = this.onaddworkunit = new henkolib.events.Event();
	this.onRemoveWorkunit = this.onremoveworkunit = new henkolib.events.Event();
}
gridbee.core.work.BasicWorkSource.prototype.getWorkUnits = function() {
	return this.workpool.getWorkUnits();
}
gridbee.core.work.BasicWorkSource.prototype.start = function() {
	this.isRunning = true;
}
gridbee.core.work.BasicWorkSource.prototype.terminate = function() {
	this.isRunning = false;
	this.workpool.terminateAll();
}
gridbee.core.work.BasicWorkSource.prototype.operate = function() {
	if(this.isRunning) this.workpool.operate();
}
gridbee.core.work.BasicWorkSource.prototype.getNumActive = function() {
	return this.workpool.getNumActive();
}
gridbee.core.work.BasicWorkSource.prototype.startOne = function() {
	this.isRunning = true;
	this.workpool.startOne();
}
gridbee.core.work.BasicWorkSource.prototype.terminateOne = function() {
	this.workpool.terminateOne();
}
gridbee.core.work.BasicWorkSource.prototype.getScreenName = function() {
	return "BasicWorkSource";
}
gridbee.core.work.BasicWorkSource.prototype.isChanged = function() {
	return this.workpool.isChanged();
}
gridbee.core.work.BasicWorkSource.prototype.hxSerialize = function(s) {
	s.serialize(this.workpool);
}
gridbee.core.work.BasicWorkSource.prototype.hxUnserialize = function(s) {
	this.workpool = s.unserialize();
	this.init();
}
gridbee.core.work.BasicWorkSource.prototype.__class__ = gridbee.core.work.BasicWorkSource;
gridbee.core.work.BasicWorkSource.__interfaces__ = [gridbee.core.iface.WorkSource];
gridbee.worksource.boinc.BoincData = function() { }
gridbee.worksource.boinc.BoincData.__name__ = ["gridbee","worksource","boinc","BoincData"];
gridbee.worksource.boinc.BoincData.prototype.toXmlString = null;
gridbee.worksource.boinc.BoincData.prototype.__class__ = gridbee.worksource.boinc.BoincData;
gridbee.worksource.boinc.request.ClientVersion = function(major,minor,release) {
	if( major === $_ ) return;
	if(release == null) release = 0;
	if(minor == null) minor = 0;
	if(major == null) major = 1;
	this.core_client_major_version = major;
	this.core_client_minor_version = minor;
	this.core_client_release = release;
}
gridbee.worksource.boinc.request.ClientVersion.__name__ = ["gridbee","worksource","boinc","request","ClientVersion"];
gridbee.worksource.boinc.request.ClientVersion.prototype.core_client_major_version = null;
gridbee.worksource.boinc.request.ClientVersion.prototype.core_client_minor_version = null;
gridbee.worksource.boinc.request.ClientVersion.prototype.core_client_release = null;
gridbee.worksource.boinc.request.ClientVersion.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = "";
	if(this.core_client_major_version != null) xml += indent + "<core_client_major_version>" + this.core_client_major_version + "</core_client_major_version>\n";
	if(this.core_client_minor_version != null) xml += indent + "<core_client_minor_version>" + this.core_client_minor_version + "</core_client_minor_version>\n";
	if(this.core_client_release != null) xml += indent + "<core_client_release>" + this.core_client_release + "</core_client_release>\n";
	return xml;
}
gridbee.worksource.boinc.request.ClientVersion.prototype.__class__ = gridbee.worksource.boinc.request.ClientVersion;
gridbee.worksource.boinc.request.ClientVersion.__interfaces__ = [gridbee.worksource.boinc.BoincData];
gridbee.worksource.boinc.BoincWorkSource = function(scheduler_url,authkey) {
	if( scheduler_url === $_ ) return;
	this.projecturl = new String("");
	this.projectname = new String("");
	this.username = new String("");
	this.uploadqueue = new Array();
	this.reportqueue = new Array();
	this.scheduler_url = scheduler_url;
	this.authinfo = new gridbee.worksource.boinc.request.AuthInfo();
	this.authinfo.authenticator = authkey;
	this.benchmarkpool = new gridbee.core.work.WorkUnitPool();
	this.uploader = new gridbee.worksource.boinc.BoincUploaderPool();
	if(gridbee.core.info.BrowserInfo.NaCl()) {
		this.platform = "nacl";
		henkolib.log.Console.main.logInformation("Setting platform to 'nacl'",null,this,{ fileName : "BoincWorkSource.hx", lineNumber : 104, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "new"});
	} else {
		this.platform = "javascript";
		henkolib.log.Console.main.logInformation("Setting platform to 'javascript'",null,this,{ fileName : "BoincWorkSource.hx", lineNumber : 109, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "new"});
	}
	this.host = new gridbee.worksource.boinc.request.Host();
	this.host.host_info.p_fpops = 0;
	this.host.host_info.p_iops = 0;
	gridbee.core.work.BasicWorkSource.call(this);
}
gridbee.worksource.boinc.BoincWorkSource.__name__ = ["gridbee","worksource","boinc","BoincWorkSource"];
gridbee.worksource.boinc.BoincWorkSource.__super__ = gridbee.core.work.BasicWorkSource;
for(var k in gridbee.core.work.BasicWorkSource.prototype ) gridbee.worksource.boinc.BoincWorkSource.prototype[k] = gridbee.core.work.BasicWorkSource.prototype[k];
gridbee.worksource.boinc.BoincWorkSource.version = null;
gridbee.worksource.boinc.BoincWorkSource.getVersion = function() {
	return gridbee.worksource.boinc.BoincWorkSource.version;
}
gridbee.worksource.boinc.BoincWorkSource.prototype.projecturl = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.projectname = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.username = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.platform = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.scheduler_url = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.authinfo = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.host = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.uploadqueue = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.reportqueue = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.benchmarkpool = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.requestinprogress = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.uploader = null;
gridbee.worksource.boinc.BoincWorkSource.prototype.init = function() {
	gridbee.core.work.BasicWorkSource.prototype.init.call(this);
	this.updateHostInfo();
	this.uploader.onUpload.subscribe($closure(this,"wuUploaded"));
	if(this.host.host_info.p_fpops == 0) {
		this.benchmarkpool = new gridbee.core.work.WorkUnitPool();
		var benchmark = new gridbee.worksource.boinc.benchmark.WhetstoneBenchmark();
		var self = this;
		benchmark.onComplete.subscribe(function(c) {
			self.host.host_info.p_fpops = benchmark.getFlops();
			self.updateHostInfo();
			self.benchmarkpool.removeCompleted();
			henkolib.log.Console.main.logInformation("Benchmark successfully executed.",null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 136, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "init"});
		});
		benchmark.onError.subscribe(function(e) {
			henkolib.log.Console.main.logError("Benchmark error: " + e,null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 140, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "init"});
			self.benchmarkpool.removeCompleted();
		});
		this.benchmarkpool.addFirst(benchmark);
		this.onaddworkunit.invoke(benchmark);
	}
}
gridbee.worksource.boinc.BoincWorkSource.prototype.isChanged = function() {
	return gridbee.core.work.BasicWorkSource.prototype.isChanged.call(this) || this.benchmarkpool.isChanged() || this.uploader.isChanged();
}
gridbee.worksource.boinc.BoincWorkSource.prototype.startOne = function() {
	if(this.host.host_info.p_fpops != 0) {
		if(this.workpool.getNumInit() + this.workpool.getNumPassive() == 0 && !this.requestinprogress) {
			var newworks = this.requestWorks();
			var self = this;
			newworks.onComplete.subscribe(function(wus) {
				if(wus.length == 0) {
					self.platform = "javascript";
					henkolib.log.Console.main.logInformation("Setting platform to JavaScript",null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 168, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "startOne"});
				}
				var _g = 0;
				while(_g < wus.length) {
					var wu = wus[_g];
					++_g;
					self.workpool.add(wu);
					self.onaddworkunit.invoke(wu);
					henkolib.log.Console.main.logInformation("New workunit recieved",null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 174, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "startOne"});
				}
			});
			newworks.onError.subscribe(function(errormes) {
				henkolib.log.Console.main.logNotice(errormes,null,null,{ fileName : "BoincWorkSource.hx", lineNumber : 180, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "startOne"});
			});
		}
		gridbee.core.work.BasicWorkSource.prototype.startOne.call(this);
	} else this.benchmarkpool.startOne();
}
gridbee.worksource.boinc.BoincWorkSource.prototype.getSchedulerUrl = function() {
	return this.scheduler_url;
}
gridbee.worksource.boinc.BoincWorkSource.prototype.getAuthkey = function() {
	return this.authinfo.authenticator;
}
gridbee.worksource.boinc.BoincWorkSource.prototype.updateHostInfo = function() {
	gridbee.worksource.boinc.request.HostInfo.updateHostInfo(this.host.host_info);
}
gridbee.worksource.boinc.BoincWorkSource.prototype.getScreenName = function() {
	return "BOINC Server WorkSource (" + this.scheduler_url + ")";
}
gridbee.worksource.boinc.BoincWorkSource.prototype.operate = function() {
	gridbee.core.work.BasicWorkSource.prototype.operate.call(this);
	this.uploader.operate();
	var wus = this.workpool.removeCompleted();
	var _g = 0;
	while(_g < wus.length) {
		var wu = wus[_g];
		++_g;
		this.uploader.add(wu);
	}
}
gridbee.worksource.boinc.BoincWorkSource.prototype.wuUploaded = function(wu) {
	this.reportWork(wu);
}
gridbee.worksource.boinc.BoincWorkSource.prototype.requestWorks = function() {
	this.requestinprogress = true;
	var request = new gridbee.worksource.boinc.request.SchedulerRequest(this.platform);
	request.setClientVersion(gridbee.worksource.boinc.BoincWorkSource.version);
	request.setPlatform(this.platform);
	request.setAuthInfo(this.authinfo);
	request.setHost(this.host);
	request.setWorkRequest(new gridbee.worksource.boinc.request.WorkRequest(10));
	var _g = 0, _g1 = this.reportqueue;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		henkolib.log.Console.main.logInformation("Reporting uploaded results to: " + this.getScreenName(),null,work,{ fileName : "BoincWorkSource.hx", lineNumber : 245, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
		request.addResult(work.getBoincResult());
	}
	var result = new henkolib.async.AsyncOperation();
	var self = this;
	var http = gridbee.core.net.HTTPRequest.post(this.scheduler_url);
	http.rawData(request.toXmlString());
	http.errorCallback(function(error) {
		result.setError(error);
		self.requestinprogress = false;
	});
	http.successCallback(function(response) {
		henkolib.log.Console.main.logInformation("Received Boinc Scheduler reply.",null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 257, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
		var xml = new haxe.xml.Fast(Xml.parse(response.content).firstElement());
		var reply = new gridbee.worksource.boinc.reply.SchedulerReply(xml);
		if(reply.hostid != null) {
			self.host.hostid = reply.hostid;
			henkolib.log.Console.main.logNotice("Registered new host: " + reply.hostid,null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 267, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
			henkolib.log.Console.main.logNotice("Project name: " + reply.project_name,null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 268, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
			henkolib.log.Console.main.logNotice("Username: " + reply.user_name,null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 269, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
		}
		var _g = 0, _g1 = reply.result_ack;
		while(_g < _g1.length) {
			var ack = _g1[_g];
			++_g;
			henkolib.log.Console.main.logInformation("Received result ack: " + ack.name,null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 277, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
			var _g2 = 0, _g3 = self.reportqueue;
			while(_g2 < _g3.length) {
				var work = _g3[_g2];
				++_g2;
				if(work.getWorkUnitResultName() == ack.name) {
					self.reportqueue.remove(work);
					henkolib.log.Console.main.logNotice("Reported result accepted. WorkUnit removed.",null,work,{ fileName : "BoincWorkSource.hx", lineNumber : 283, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
					self.onremoveworkunit.invoke(work);
				}
			}
		}
		var _g = 0, _g1 = reply.message;
		while(_g < _g1.length) {
			var message = _g1[_g];
			++_g;
			henkolib.log.Console.main.logNotice("BOINC " + message.priority + " priority message: " + message.message,null,self,{ fileName : "BoincWorkSource.hx", lineNumber : 294, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
		}
		var workunits = new Array();
		var _g = 0, _g1 = reply.workunit;
		while(_g < _g1.length) {
			var unit = _g1[_g];
			++_g;
			var _g2 = 0, _g3 = reply.app;
			while(_g2 < _g3.length) {
				var app = _g3[_g2];
				++_g2;
				if(app.name == unit.app_name) unit.application = app;
			}
			var _g2 = 0, _g3 = reply.app_version;
			while(_g2 < _g3.length) {
				var appv = _g3[_g2];
				++_g2;
				if(appv.app_name == unit.app_name) {
					var _g4 = 0, _g5 = appv.file_ref;
					while(_g4 < _g5.length) {
						var ref = _g5[_g4];
						++_g4;
						var _g6 = 0, _g7 = reply.file_info;
						while(_g6 < _g7.length) {
							var finfo = _g7[_g6];
							++_g6;
							if(finfo.name == ref.file_name) ref.file_info = finfo;
							if(ref.main_program) appv.main_program = ref;
						}
					}
					unit.application.version = appv;
				}
			}
			var _g2 = 0, _g3 = unit.file_ref;
			while(_g2 < _g3.length) {
				var ref = _g3[_g2];
				++_g2;
				var _g4 = 0, _g5 = reply.file_info;
				while(_g4 < _g5.length) {
					var finfo = _g5[_g4];
					++_g4;
					if(finfo.name == ref.file_name) ref.file_info = finfo;
				}
			}
			var _g2 = 0, _g3 = reply.result;
			while(_g2 < _g3.length) {
				var res = _g3[_g2];
				++_g2;
				if(res.wu_name == unit.name) {
					var _g4 = 0, _g5 = res.file_ref;
					while(_g4 < _g5.length) {
						var ref = _g5[_g4];
						++_g4;
						var _g6 = 0, _g7 = reply.file_info;
						while(_g6 < _g7.length) {
							var finfo = _g7[_g6];
							++_g6;
							if(finfo.name == ref.file_name) ref.file_info = finfo;
						}
					}
					unit.result = res;
					break;
				}
			}
			var platform = "";
			var _g2 = 0, _g3 = reply.app_version;
			while(_g2 < _g3.length) {
				var v = _g3[_g2];
				++_g2;
				platform = v.platform;
			}
			var bwu = new gridbee.worksource.boinc.BoincWorkUnit(unit,platform);
			workunits.push(bwu);
		}
		result.setResult(workunits);
		self.requestinprogress = false;
	});
	henkolib.log.Console.main.logInformation("Sending Boinc Scheduler request.",null,this,{ fileName : "BoincWorkSource.hx", lineNumber : 369, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "requestWorks"});
	http.send();
	return result;
}
gridbee.worksource.boinc.BoincWorkSource.prototype.reportWork = function(work) {
	henkolib.log.Console.main.logInformation("Added to reporting queue: " + work.getScreenName(),null,this,{ fileName : "BoincWorkSource.hx", lineNumber : 377, className : "gridbee.worksource.boinc.BoincWorkSource", methodName : "reportWork"});
	this.reportqueue.push(work);
}
gridbee.worksource.boinc.BoincWorkSource.prototype.hxSerialize = function(s) {
	s.serialize(this.scheduler_url);
	s.serialize(this.authinfo);
	s.serialize(this.host);
	s.serialize(this.uploader);
	s.serialize(this.reportqueue);
	s.serialize(this.projecturl);
	s.serialize(this.projectname);
	s.serialize(this.username);
	s.serialize(this.platform);
	gridbee.core.work.BasicWorkSource.prototype.hxSerialize.call(this,s);
}
gridbee.worksource.boinc.BoincWorkSource.prototype.hxUnserialize = function(s) {
	this.scheduler_url = s.unserialize();
	this.authinfo = s.unserialize();
	this.host = s.unserialize();
	this.uploader = s.unserialize();
	this.reportqueue = s.unserialize();
	this.projecturl = s.unserialize();
	this.projectname = s.unserialize();
	this.username = s.unserialize();
	this.platform = s.unserialize();
	gridbee.core.work.BasicWorkSource.prototype.hxUnserialize.call(this,s);
}
gridbee.worksource.boinc.BoincWorkSource.prototype.__class__ = gridbee.worksource.boinc.BoincWorkSource;
gridbee.worksource.boinc.request.UploadFileInfo = function(reply_file_info) {
	if( reply_file_info === $_ ) return;
	if(reply_file_info != null) {
		this.name = reply_file_info.name;
		this.generated_locally = reply_file_info.generated_locally;
		this.upload_when_present = reply_file_info.upload_when_present;
		this.max_nbytes = reply_file_info.max_nbytes;
		this.url = reply_file_info.url;
		this.xml_signature = reply_file_info.xml_signature;
	}
}
gridbee.worksource.boinc.request.UploadFileInfo.__name__ = ["gridbee","worksource","boinc","request","UploadFileInfo"];
gridbee.worksource.boinc.request.UploadFileInfo.prototype.name = null;
gridbee.worksource.boinc.request.UploadFileInfo.prototype.generated_locally = null;
gridbee.worksource.boinc.request.UploadFileInfo.prototype.upload_when_present = null;
gridbee.worksource.boinc.request.UploadFileInfo.prototype.max_nbytes = null;
gridbee.worksource.boinc.request.UploadFileInfo.prototype.url = null;
gridbee.worksource.boinc.request.UploadFileInfo.prototype.xml_signature = null;
gridbee.worksource.boinc.request.UploadFileInfo.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	indent = "";
	var innerindent = indent + "\t";
	var xml = indent + "<file_info>\n";
	if(this.name != null) xml += innerindent + "<name>" + this.name + "</name>\n";
	if(this.generated_locally) xml += innerindent + "<generated_locally/>\n";
	if(this.upload_when_present) xml += innerindent + "<upload_when_present/>\n";
	if(this.max_nbytes != null) xml += innerindent + "<max_nbytes>" + this.max_nbytes + "</max_nbytes>\n";
	if(this.url != null) xml += innerindent + "<url>" + this.url + "</url>\n";
	if(this.xml_signature != null) xml += "<xml_signature>" + this.xml_signature + "</xml_signature>\n";
	xml += indent + "</file_info>\n";
	return xml;
}
gridbee.worksource.boinc.request.UploadFileInfo.prototype.__class__ = gridbee.worksource.boinc.request.UploadFileInfo;
gridbee.worksource.boinc.request.UploadFileInfo.__interfaces__ = [gridbee.worksource.boinc.BoincData];
gridbee.js.ProgressEvent = function() { }
gridbee.js.ProgressEvent.__name__ = ["gridbee","js","ProgressEvent"];
gridbee.js.ProgressEvent.prototype.lengthComputable = null;
gridbee.js.ProgressEvent.prototype.loaded = null;
gridbee.js.ProgressEvent.prototype.total = null;
gridbee.js.ProgressEvent.prototype.__class__ = gridbee.js.ProgressEvent;
gridbee.js.ProgressEvent.__interfaces__ = [gridbee.js.Event];
gridbee.js.EventTarget = function() { }
gridbee.js.EventTarget.__name__ = ["gridbee","js","EventTarget"];
gridbee.js.EventTarget.prototype.addEventListener = null;
gridbee.js.EventTarget.prototype.removeEventListener = null;
gridbee.js.EventTarget.prototype.dispatchEvent = null;
gridbee.js.EventTarget.prototype.__class__ = gridbee.js.EventTarget;
gridbee.js.XMLHttpRequestEventTarget = function() { }
gridbee.js.XMLHttpRequestEventTarget.__name__ = ["gridbee","js","XMLHttpRequestEventTarget"];
gridbee.js.XMLHttpRequestEventTarget.prototype.onloadstart = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.onprogress = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.onabort = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.onerror = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.onload = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.ontimeout = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.onloadend = null;
gridbee.js.XMLHttpRequestEventTarget.prototype.__class__ = gridbee.js.XMLHttpRequestEventTarget;
gridbee.js.XMLHttpRequestEventTarget.__interfaces__ = [gridbee.js.EventTarget];
gridbee.js.XMLHttpRequestUpload = function() { }
gridbee.js.XMLHttpRequestUpload.__name__ = ["gridbee","js","XMLHttpRequestUpload"];
gridbee.js.XMLHttpRequestUpload.prototype.__class__ = gridbee.js.XMLHttpRequestUpload;
gridbee.js.XMLHttpRequestUpload.__interfaces__ = [gridbee.js.XMLHttpRequestEventTarget];
StringTools = function() { }
StringTools.__name__ = ["StringTools"];
StringTools.urlEncode = function(s) {
	return encodeURIComponent(s);
}
StringTools.urlDecode = function(s) {
	return decodeURIComponent(s.split("+").join(" "));
}
StringTools.htmlEscape = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
StringTools.htmlUnescape = function(s) {
	return s.split("&gt;").join(">").split("&lt;").join("<").split("&amp;").join("&");
}
StringTools.startsWith = function(s,start) {
	return s.length >= start.length && s.substr(0,start.length) == start;
}
StringTools.endsWith = function(s,end) {
	var elen = end.length;
	var slen = s.length;
	return slen >= elen && s.substr(slen - elen,elen) == end;
}
StringTools.isSpace = function(s,pos) {
	var c = s.charCodeAt(pos);
	return c >= 9 && c <= 13 || c == 32;
}
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return s.substr(r,l - r); else return s;
}
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return s.substr(0,l - r); else return s;
}
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
}
StringTools.rpad = function(s,c,l) {
	var sl = s.length;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		s += c.substr(0,l - sl);
		sl = l;
	} else {
		s += c;
		sl += cl;
	}
	return s;
}
StringTools.lpad = function(s,c,l) {
	var ns = "";
	var sl = s.length;
	if(sl >= l) return s;
	var cl = c.length;
	while(sl < l) if(l - sl < cl) {
		ns += c.substr(0,l - sl);
		sl = l;
	} else {
		ns += c;
		sl += cl;
	}
	return ns + s;
}
StringTools.replace = function(s,sub,by) {
	return s.split(sub).join(by);
}
StringTools.hex = function(n,digits) {
	var s = "";
	var hexChars = "0123456789ABCDEF";
	do {
		s = hexChars.charAt(n & 15) + s;
		n >>>= 4;
	} while(n > 0);
	if(digits != null) while(s.length < digits) s = "0" + s;
	return s;
}
StringTools.fastCodeAt = function(s,index) {
	return s.cca(index);
}
StringTools.isEOF = function(c) {
	return c != c;
}
StringTools.prototype.__class__ = StringTools;
henkolib.events.PublicSimpleEvent = function() { }
henkolib.events.PublicSimpleEvent.__name__ = ["henkolib","events","PublicSimpleEvent"];
henkolib.events.PublicSimpleEvent.prototype.subscribe = null;
henkolib.events.PublicSimpleEvent.prototype.unsubscribe = null;
henkolib.events.PublicSimpleEvent.prototype.__class__ = henkolib.events.PublicSimpleEvent;
henkolib.events.SimpleEvent = function(p) {
	if( p === $_ ) return;
	this.subscribed = new Array();
}
henkolib.events.SimpleEvent.__name__ = ["henkolib","events","SimpleEvent"];
henkolib.events.SimpleEvent.prototype.subscribed = null;
henkolib.events.SimpleEvent.prototype.subscribe = function(func) {
	if(Reflect.isFunction(func)) this.subscribed.push(func);
}
henkolib.events.SimpleEvent.prototype.unsubscribe = function(func) {
	if(Reflect.isFunction(func)) this.subscribed.remove(func);
}
henkolib.events.SimpleEvent.prototype.invoke = function() {
	var callargs = new Array();
	var _g = 0, _g1 = this.subscribed;
	while(_g < _g1.length) {
		var func = _g1[_g];
		++_g;
		func.apply({ },callargs);
	}
}
henkolib.events.SimpleEvent.prototype.__class__ = henkolib.events.SimpleEvent;
henkolib.events.SimpleEvent.__interfaces__ = [henkolib.events.PublicSimpleEvent];
if(typeof haxe=='undefined') haxe = {}
if(!haxe.io) haxe.io = {}
haxe.io.Bytes = function(length,b) {
	if( length === $_ ) return;
	this.length = length;
	this.b = b;
}
haxe.io.Bytes.__name__ = ["haxe","io","Bytes"];
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
}
haxe.io.Bytes.ofString = function(s) {
	var a = new Array();
	var _g1 = 0, _g = s.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = s.cca(i);
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe.io.Bytes(a.length,a);
}
haxe.io.Bytes.ofData = function(b) {
	return new haxe.io.Bytes(b.length,b);
}
haxe.io.Bytes.prototype.length = null;
haxe.io.Bytes.prototype.b = null;
haxe.io.Bytes.prototype.get = function(pos) {
	return this.b[pos];
}
haxe.io.Bytes.prototype.set = function(pos,v) {
	this.b[pos] = v & 255;
}
haxe.io.Bytes.prototype.blit = function(pos,src,srcpos,len) {
	if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
	var b1 = this.b;
	var b2 = src.b;
	if(b1 == b2 && pos > srcpos) {
		var i = len;
		while(i > 0) {
			i--;
			b1[i + pos] = b2[i + srcpos];
		}
		return;
	}
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		b1[i + pos] = b2[i + srcpos];
	}
}
haxe.io.Bytes.prototype.sub = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	return new haxe.io.Bytes(len,this.b.slice(pos,pos + len));
}
haxe.io.Bytes.prototype.compare = function(other) {
	var b1 = this.b;
	var b2 = other.b;
	var len = this.length < other.length?this.length:other.length;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		if(b1[i] != b2[i]) return b1[i] - b2[i];
	}
	return this.length - other.length;
}
haxe.io.Bytes.prototype.readString = function(pos,len) {
	if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
	var s = "";
	var b = this.b;
	var fcc = String.fromCharCode;
	var i = pos;
	var max = pos + len;
	while(i < max) {
		var c = b[i++];
		if(c < 128) {
			if(c == 0) break;
			s += fcc(c);
		} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
			var c2 = b[i++];
			s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
		} else {
			var c2 = b[i++];
			var c3 = b[i++];
			s += fcc((c & 15) << 18 | (c2 & 127) << 12 | c3 << 6 & 127 | b[i++] & 127);
		}
	}
	return s;
}
haxe.io.Bytes.prototype.toString = function() {
	return this.readString(0,this.length);
}
haxe.io.Bytes.prototype.toHex = function() {
	var s = new StringBuf();
	var chars = [];
	var str = "0123456789abcdef";
	var _g1 = 0, _g = str.length;
	while(_g1 < _g) {
		var i = _g1++;
		chars.push(str.charCodeAt(i));
	}
	var _g1 = 0, _g = this.length;
	while(_g1 < _g) {
		var i = _g1++;
		var c = this.b[i];
		s.b[s.b.length] = String.fromCharCode(chars[c >> 4]);
		s.b[s.b.length] = String.fromCharCode(chars[c & 15]);
	}
	return s.b.join("");
}
haxe.io.Bytes.prototype.getData = function() {
	return this.b;
}
haxe.io.Bytes.prototype.__class__ = haxe.io.Bytes;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("id")) this.id = Std.parseInt(input.node.resolve("id").getInnerData());
	if(input.hasNode.resolve("name")) this.name = input.node.resolve("name").getInnerData();
	if(input.hasNode.resolve("country")) this.country = input.node.resolve("country").getInnerData();
	if(input.hasNode.resolve("weak_auth")) this.weak_auth = input.node.resolve("weak_auth").getInnerData();
	if(input.hasNode.resolve("postal_code")) this.postal_code = input.node.resolve("postal_code").getInnerData();
	if(input.hasNode.resolve("global_prefs")) this.global_prefs = input.node.resolve("global_prefs").getInnerData();
	if(input.hasNode.resolve("project_prefs")) this.project_prefs = input.node.resolve("project_prefs").getInnerData();
	if(input.hasNode.resolve("url")) this.url = input.node.resolve("url").getInnerData();
	if(input.hasNode.resolve("send_email")) {
		if(input.node.resolve("send_email").getInnerData() == "1") this.send_email = true; else if(input.node.resolve("send_email").getInnerData() == "0") this.send_email = false;
	}
	if(input.hasNode.resolve("show_hosts")) {
		if(input.node.resolve("show_hosts").getInnerData() == "1") this.show_hosts = true; else if(input.node.resolve("show_hosts").getInnerData() == "0") this.show_hosts = false;
	}
	if(input.hasNode.resolve("teamid")) this.teamid = Std.parseInt(input.node.resolve("teamid").getInnerData());
	if(input.hasNode.resolve("venue")) this.venue = input.node.resolve("venue").getInnerData();
	if(input.hasNode.resolve("teamfounder")) this.teamfounder = true; else this.teamfounder = false;
}
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","AccountInfoRes"];
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.id = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.name = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.country = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.weak_auth = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.postal_code = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.global_prefs = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.project_prefs = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.url = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.send_email = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.show_hosts = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.teamid = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.venue = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.teamfounder = null;
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.print = function() {
	haxe.Log.trace("id: " + this.id,{ fileName : "AccountInfoRes.hx", lineNumber : 77, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("name: " + this.name,{ fileName : "AccountInfoRes.hx", lineNumber : 78, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("country: " + this.country,{ fileName : "AccountInfoRes.hx", lineNumber : 79, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("weak_auth: " + this.weak_auth,{ fileName : "AccountInfoRes.hx", lineNumber : 80, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("postal_code: " + this.postal_code,{ fileName : "AccountInfoRes.hx", lineNumber : 81, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("global_prefs: " + this.global_prefs,{ fileName : "AccountInfoRes.hx", lineNumber : 82, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("project_prefs: " + this.project_prefs,{ fileName : "AccountInfoRes.hx", lineNumber : 83, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("url: " + this.url,{ fileName : "AccountInfoRes.hx", lineNumber : 84, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("send_email: " + this.send_email,{ fileName : "AccountInfoRes.hx", lineNumber : 85, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("show_hosts: " + this.show_hosts,{ fileName : "AccountInfoRes.hx", lineNumber : 86, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("teamid: " + this.teamid,{ fileName : "AccountInfoRes.hx", lineNumber : 87, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("venue: " + this.venue,{ fileName : "AccountInfoRes.hx", lineNumber : 88, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
	haxe.Log.trace("teamfounder: " + this.teamfounder,{ fileName : "AccountInfoRes.hx", lineNumber : 89, className : "gridbee.worksource.boinc.webrpc.result.AccountInfoRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.AccountInfoRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.AccountInfoRes;
gridbee.worksource.boinc.request.Result = function(p) {
	if( p === $_ ) return;
	this.file_info = new Array();
}
gridbee.worksource.boinc.request.Result.__name__ = ["gridbee","worksource","boinc","request","Result"];
gridbee.worksource.boinc.request.Result.prototype.name = null;
gridbee.worksource.boinc.request.Result.prototype.final_cpu_time = null;
gridbee.worksource.boinc.request.Result.prototype.final_elapsed_time = null;
gridbee.worksource.boinc.request.Result.prototype.exit_status = null;
gridbee.worksource.boinc.request.Result.prototype.state = null;
gridbee.worksource.boinc.request.Result.prototype.platform = null;
gridbee.worksource.boinc.request.Result.prototype.version_num = null;
gridbee.worksource.boinc.request.Result.prototype.app_version_num = null;
gridbee.worksource.boinc.request.Result.prototype.stderr_txt = null;
gridbee.worksource.boinc.request.Result.prototype.file_info = null;
gridbee.worksource.boinc.request.Result.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var innerindent = indent + "    ";
	var xml = indent + "<result>\n";
	if(this.name != null) xml += innerindent + "<name>" + this.name + "</name>\n";
	if(this.final_cpu_time != null) xml += innerindent + "<final_cpu_time>" + this.final_cpu_time + "</final_cpu_time>\n";
	if(this.final_elapsed_time != null) xml += innerindent + "<final_elapsed_time>" + this.final_elapsed_time + "</final_elapsed_time>\n";
	if(this.exit_status != null) xml += innerindent + "<exit_status>" + this.exit_status + "</exit_status>\n";
	if(this.state != null) xml += innerindent + "<state>" + this.state + "</state>\n";
	if(this.platform != null) xml += innerindent + "<platform>" + this.platform + "</platform>\n";
	if(this.version_num != null) xml += innerindent + "<version_num>" + this.version_num + "</version_num>\n";
	if(this.app_version_num != null) xml += innerindent + "<app_version_num>" + this.app_version_num + "</app_version_num>\n";
	xml += "<stderr_out>\n";
	xml += "<![CDATA[";
	xml += "<stderr_txt>\n";
	if(this.stderr_txt != null) xml += this.stderr_txt;
	xml += "</stderr_txt>\n";
	xml += "]]>\n";
	xml += "</stderr_out>\n";
	var _g = 0, _g1 = this.file_info;
	while(_g < _g1.length) {
		var info = _g1[_g];
		++_g;
		xml += info.toXmlString(innerindent);
	}
	xml += indent + "</result>\n";
	return xml;
}
gridbee.worksource.boinc.request.Result.prototype.__class__ = gridbee.worksource.boinc.request.Result;
gridbee.worksource.boinc.request.Result.__interfaces__ = [gridbee.worksource.boinc.BoincData];
gridbee.core.work.WorkUnitPool = function(p) {
	if( p === $_ ) return;
	this.workunits = new Array();
	this.init();
}
gridbee.core.work.WorkUnitPool.__name__ = ["gridbee","core","work","WorkUnitPool"];
gridbee.core.work.WorkUnitPool.prototype.workunits = null;
gridbee.core.work.WorkUnitPool.prototype.changed = null;
gridbee.core.work.WorkUnitPool.prototype.init = function() {
	this.changed = false;
}
gridbee.core.work.WorkUnitPool.prototype.add = function(work) {
	this.workunits.push(work);
	this.changed = true;
}
gridbee.core.work.WorkUnitPool.prototype.addFirst = function(work) {
	this.workunits.unshift(work);
	this.changed = true;
}
gridbee.core.work.WorkUnitPool.prototype.startOne = function() {
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Passive) {
			work.start();
			return;
		}
	}
}
gridbee.core.work.WorkUnitPool.prototype.terminateOne = function() {
	henkolib.log.Console.main.logInformation("terminate one called on workunitpool",null,null,{ fileName : "WorkUnitPool.hx", lineNumber : 72, className : "gridbee.core.work.WorkUnitPool", methodName : "terminateOne"});
	var i = this.workunits.length - 1;
	while(i >= 0) {
		var work = this.workunits[i];
		if(work.getState() == gridbee.core.iface.WorkUnitState.Active) {
			work.terminate();
			this.workunits.remove(work);
			this.workunits.push(work);
			return;
		}
		i--;
	}
}
gridbee.core.work.WorkUnitPool.prototype.terminateAll = function() {
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Active) {
			work.terminate();
			this.workunits.remove(work);
			this.workunits.unshift(work);
		}
	}
}
gridbee.core.work.WorkUnitPool.prototype.getNumInit = function() {
	var nr = 0;
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Init) nr++;
	}
	return nr;
}
gridbee.core.work.WorkUnitPool.prototype.getNumPassive = function() {
	var nr = 0;
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Passive) nr++;
	}
	return nr;
}
gridbee.core.work.WorkUnitPool.prototype.getNumActive = function() {
	var nr = 0;
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Active) nr++;
	}
	return nr;
}
gridbee.core.work.WorkUnitPool.prototype.getNumCompleted = function() {
	var nr = 0;
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Completed) nr++;
	}
	return nr;
}
gridbee.core.work.WorkUnitPool.prototype.getCompleted = function() {
	var result = new Array();
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Completed) result.push(work);
	}
	return result;
}
gridbee.core.work.WorkUnitPool.prototype.removeCompleted = function() {
	var result = new Array();
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var work = _g1[_g];
		++_g;
		if(work.getState() == gridbee.core.iface.WorkUnitState.Completed) {
			result.push(work);
			this.workunits.remove(work);
		}
	}
	this.changed = true;
	return result;
}
gridbee.core.work.WorkUnitPool.prototype.getWorkUnits = function() {
	return this.workunits;
}
gridbee.core.work.WorkUnitPool.prototype.operate = function() {
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var item = _g1[_g];
		++_g;
		item.operate();
	}
}
gridbee.core.work.WorkUnitPool.prototype.getScreenName = function() {
	return "WorkUnitPool";
}
gridbee.core.work.WorkUnitPool.prototype.isChanged = function() {
	var _g = 0, _g1 = this.workunits;
	while(_g < _g1.length) {
		var wu = _g1[_g];
		++_g;
		if(wu.isChanged()) this.changed = true;
	}
	return this.changed;
}
gridbee.core.work.WorkUnitPool.prototype.hxSerialize = function(s) {
	s.serialize(this.workunits);
	this.changed = false;
}
gridbee.core.work.WorkUnitPool.prototype.hxUnserialize = function(s) {
	this.workunits = s.unserialize();
	this.init();
}
gridbee.core.work.WorkUnitPool.prototype.__class__ = gridbee.core.work.WorkUnitPool;
gridbee.core.work.WorkUnitPool.__interfaces__ = [gridbee.core.iface.Persistent,henkolib.log.LogSource,gridbee.core.iface.Operable];
gridbee.worksource.boinc.reply.DataServerReply = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("status")) this.status = Std.parseInt(node.node.resolve("status").getInnerData());
	if(node.hasNode.resolve("file_size")) this.file_size = Std.parseInt(node.node.resolve("file_size").getInnerData());
	if(node.hasNode.resolve("message")) this.message = node.node.resolve("message").getInnerData();
}
gridbee.worksource.boinc.reply.DataServerReply.__name__ = ["gridbee","worksource","boinc","reply","DataServerReply"];
gridbee.worksource.boinc.reply.DataServerReply.prototype.status = null;
gridbee.worksource.boinc.reply.DataServerReply.prototype.file_size = null;
gridbee.worksource.boinc.reply.DataServerReply.prototype.message = null;
gridbee.worksource.boinc.reply.DataServerReply.prototype.__class__ = gridbee.worksource.boinc.reply.DataServerReply;
henkolib.events.Event = function(p) {
	if( p === $_ ) return;
	this.subscribed = new Array();
}
henkolib.events.Event.__name__ = ["henkolib","events","Event"];
henkolib.events.Event.prototype.owner = null;
henkolib.events.Event.prototype.subscribed = null;
henkolib.events.Event.prototype.subscribe = function(func) {
	if(Reflect.isFunction(func)) this.subscribed.push(func);
}
henkolib.events.Event.prototype.unsubscribe = function(func) {
	if(Reflect.isFunction(func)) this.subscribed.remove(func);
}
henkolib.events.Event.prototype.invoke = function(arg) {
	var callargs = new Array();
	callargs.push(arg);
	var _g = 0, _g1 = this.subscribed;
	while(_g < _g1.length) {
		var func = _g1[_g];
		++_g;
		func.apply({ },callargs);
	}
}
henkolib.events.Event.prototype.__class__ = henkolib.events.Event;
henkolib.events.Event.__interfaces__ = [henkolib.events.PublicEvent];
if(!gridbee.worksource.boinc.webrpc.subclasses) gridbee.worksource.boinc.webrpc.subclasses = {}
gridbee.worksource.boinc.webrpc.subclasses.Applic = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("name")) this.name = input.node.resolve("name").getInnerData();
	if(input.hasNode.resolve("id")) this.id = Std.parseInt(input.node.resolve("id").getInnerData());
	if(input.hasNode.resolve("version")) {
		var k = input.node.resolve("version");
		this.version = new gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion(k);
	}
}
gridbee.worksource.boinc.webrpc.subclasses.Applic.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","Applic"];
gridbee.worksource.boinc.webrpc.subclasses.Applic.prototype.name = null;
gridbee.worksource.boinc.webrpc.subclasses.Applic.prototype.id = null;
gridbee.worksource.boinc.webrpc.subclasses.Applic.prototype.version = null;
gridbee.worksource.boinc.webrpc.subclasses.Applic.prototype.print = function() {
	haxe.Log.trace("name: " + this.name,{ fileName : "Applic.hx", lineNumber : 43, className : "gridbee.worksource.boinc.webrpc.subclasses.Applic", methodName : "print"});
	haxe.Log.trace("id: " + this.id,{ fileName : "Applic.hx", lineNumber : 44, className : "gridbee.worksource.boinc.webrpc.subclasses.Applic", methodName : "print"});
	haxe.Log.trace("***Version descriptions***",{ fileName : "Applic.hx", lineNumber : 45, className : "gridbee.worksource.boinc.webrpc.subclasses.Applic", methodName : "print"});
	this.version.print();
}
gridbee.worksource.boinc.webrpc.subclasses.Applic.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.Applic;
gridbee.worksource.boinc.reply.FileRef = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("file_name")) this.file_name = node.node.resolve("file_name").getInnerData();
	if(node.hasNode.resolve("open_name")) this.open_name = node.node.resolve("open_name").getInnerData();
	this.main_program = node.hasNode.resolve("main_program");
}
gridbee.worksource.boinc.reply.FileRef.__name__ = ["gridbee","worksource","boinc","reply","FileRef"];
gridbee.worksource.boinc.reply.FileRef.prototype.file_name = null;
gridbee.worksource.boinc.reply.FileRef.prototype.open_name = null;
gridbee.worksource.boinc.reply.FileRef.prototype.main_program = null;
gridbee.worksource.boinc.reply.FileRef.prototype.file_info = null;
gridbee.worksource.boinc.reply.FileRef.prototype.__class__ = gridbee.worksource.boinc.reply.FileRef;
gridbee.worksource.boinc.BoincUploaderPool = function(p) {
	if( p === $_ ) return;
	this.uploaders = new Array();
	this.onUpload = this.onupload = new henkolib.events.Event();
}
gridbee.worksource.boinc.BoincUploaderPool.__name__ = ["gridbee","worksource","boinc","BoincUploaderPool"];
gridbee.worksource.boinc.BoincUploaderPool.prototype.uploaders = null;
gridbee.worksource.boinc.BoincUploaderPool.prototype.onupload = null;
gridbee.worksource.boinc.BoincUploaderPool.prototype.onUpload = null;
gridbee.worksource.boinc.BoincUploaderPool.prototype.init = function() {
	this.onUpload = this.onupload = new henkolib.events.Event();
}
gridbee.worksource.boinc.BoincUploaderPool.prototype.operate = function() {
	var _g = 0, _g1 = this.uploaders;
	while(_g < _g1.length) {
		var ul = _g1[_g];
		++_g;
		ul.operate();
		if(ul.isCompleted()) {
			this.onupload.invoke(ul.getResult());
			this.uploaders.remove(ul);
		}
	}
}
gridbee.worksource.boinc.BoincUploaderPool.prototype.isChanged = function() {
	var _g = 0, _g1 = this.uploaders;
	while(_g < _g1.length) {
		var ul = _g1[_g];
		++_g;
		if(ul.isChanged()) return true;
	}
	return false;
}
gridbee.worksource.boinc.BoincUploaderPool.prototype.add = function(wu) {
	var ul = new gridbee.worksource.boinc.BoincUploader(wu);
	this.uploaders.push(ul);
	ul.uploadAll();
}
gridbee.worksource.boinc.BoincUploaderPool.prototype.hxSerialize = function(s) {
	s.serialize(this.uploaders);
}
gridbee.worksource.boinc.BoincUploaderPool.prototype.hxUnserialize = function(s) {
	this.uploaders = s.unserialize();
	this.init();
}
gridbee.worksource.boinc.BoincUploaderPool.prototype.__class__ = gridbee.worksource.boinc.BoincUploaderPool;
gridbee.worksource.boinc.BoincUploaderPool.__interfaces__ = [gridbee.core.iface.Operable];
if(!gridbee.core.work.hxjson2) gridbee.core.work.hxjson2 = {}
gridbee.core.work.hxjson2.JSON = function() { }
gridbee.core.work.hxjson2.JSON.__name__ = ["gridbee","core","work","hxjson2","JSON"];
gridbee.core.work.hxjson2.JSON.encode = function(o) {
	return new gridbee.core.work.hxjson2.JSONEncoder(o).getString();
}
gridbee.core.work.hxjson2.JSON.decode = function(s,strict) {
	if(strict == null) strict = true;
	return new gridbee.core.work.hxjson2.JSONDecoder(s,strict).getValue();
}
gridbee.core.work.hxjson2.JSON.stringify = function(o) {
	return new gridbee.core.work.hxjson2.JSONEncoder(o).getString();
}
gridbee.core.work.hxjson2.JSON.parse = function(s,strict) {
	if(strict == null) strict = true;
	return new gridbee.core.work.hxjson2.JSONDecoder(s,strict).getValue();
}
gridbee.core.work.hxjson2.JSON.prototype.__class__ = gridbee.core.work.hxjson2.JSON;
gridbee.worksource.boinc.reply.Message = function(node) {
	if( node === $_ ) return;
	if(node.has.resolve("priority")) this.priority = node.att.resolve("priority");
	this.message = node.getInnerData();
}
gridbee.worksource.boinc.reply.Message.__name__ = ["gridbee","worksource","boinc","reply","Message"];
gridbee.worksource.boinc.reply.Message.prototype.priority = null;
gridbee.worksource.boinc.reply.Message.prototype.message = null;
gridbee.worksource.boinc.reply.Message.prototype.__class__ = gridbee.worksource.boinc.reply.Message;
henkolib.async.AsyncState = { __ename__ : ["henkolib","async","AsyncState"], __constructs__ : ["Waiting","Completed","Error"] }
henkolib.async.AsyncState.Waiting = ["Waiting",0];
henkolib.async.AsyncState.Waiting.toString = $estr;
henkolib.async.AsyncState.Waiting.__enum__ = henkolib.async.AsyncState;
henkolib.async.AsyncState.Completed = ["Completed",1];
henkolib.async.AsyncState.Completed.toString = $estr;
henkolib.async.AsyncState.Completed.__enum__ = henkolib.async.AsyncState;
henkolib.async.AsyncState.Error = ["Error",2];
henkolib.async.AsyncState.Error.toString = $estr;
henkolib.async.AsyncState.Error.__enum__ = henkolib.async.AsyncState;
gridbee.worksource.boinc.webrpc.result.ApplicVersionRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("application")) {
		this.applic_arr = new Array();
		var $it0 = input.nodes.resolve("application").iterator();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			this.applic_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.Applic(i));
		}
	}
}
gridbee.worksource.boinc.webrpc.result.ApplicVersionRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","ApplicVersionRes"];
gridbee.worksource.boinc.webrpc.result.ApplicVersionRes.prototype.applic_arr = null;
gridbee.worksource.boinc.webrpc.result.ApplicVersionRes.prototype.print = function() {
	if(this.applic_arr != null) this.applic_arr[0].print();
}
gridbee.worksource.boinc.webrpc.result.ApplicVersionRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.ApplicVersionRes;
gridbee.core.work.hxjson2.JSONEncoder = function(value) {
	if( value === $_ ) return;
	this.jsonString = this.convertToString(value);
}
gridbee.core.work.hxjson2.JSONEncoder.__name__ = ["gridbee","core","work","hxjson2","JSONEncoder"];
gridbee.core.work.hxjson2.JSONEncoder.prototype.jsonString = null;
gridbee.core.work.hxjson2.JSONEncoder.prototype.getString = function() {
	return this.jsonString;
}
gridbee.core.work.hxjson2.JSONEncoder.prototype.convertToString = function(value) {
	if(Std["is"](value,List) || Std["is"](value,IntHash)) value = Lambda.array(value);
	if(Std["is"](value,Hash)) value = this.mapHash(value);
	if(Std["is"](value,String)) return this.escapeString((function($this) {
		var $r;
		var $t = value;
		if(Std["is"]($t,String)) $t; else throw "Class cast error";
		$r = $t;
		return $r;
	}(this))); else if(Std["is"](value,Float)) return Math.isFinite((function($this) {
		var $r;
		var $t = value;
		if(Std["is"]($t,Float)) $t; else throw "Class cast error";
		$r = $t;
		return $r;
	}(this)))?value + "":"null"; else if(Std["is"](value,Bool)) return value?"true":"false"; else if(Std["is"](value,Array)) return this.arrayToString((function($this) {
		var $r;
		var $t = value;
		if(Std["is"]($t,Array)) $t; else throw "Class cast error";
		$r = $t;
		return $r;
	}(this))); else if(Std["is"](value,Dynamic) && value != null) return this.objectToString(value);
	return "null";
}
gridbee.core.work.hxjson2.JSONEncoder.prototype.mapHash = function(value) {
	var ret = { };
	var $it0 = value.keys();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		ret[i] = value.get(i);
	}
	return ret;
}
gridbee.core.work.hxjson2.JSONEncoder.prototype.escapeString = function(str) {
	var s = "";
	var ch;
	var len = str.length;
	var _g = 0;
	while(_g < len) {
		var i = _g++;
		ch = str.charAt(i);
		switch(ch) {
		case "/":
			s += "\\/";
			break;
		case "\"":
			s += "\\\"";
			break;
		case "\\":
			s += "\\\\";
			break;
		case "\n":
			s += "\\n";
			break;
		case "\r":
			s += "\\r";
			break;
		case "\t":
			s += "\\t";
			break;
		default:
			var code = ch.charCodeAt(0);
			if(ch < " " || code > 127) {
				var hexCode = StringTools.hex(ch.charCodeAt(0));
				var zeroPad = "";
				var _g2 = 0, _g1 = 4 - hexCode.length;
				while(_g2 < _g1) {
					var j = _g2++;
					zeroPad += "0";
				}
				s += "\\u" + zeroPad + hexCode;
			} else s += ch;
		}
	}
	return "\"" + s + "\"";
}
gridbee.core.work.hxjson2.JSONEncoder.prototype.arrayToString = function(a) {
	var s = "";
	var _g1 = 0, _g = a.length;
	while(_g1 < _g) {
		var i = _g1++;
		if(s.length > 0) s += ",";
		s += this.convertToString(a[i]);
	}
	return "[" + s + "]";
}
gridbee.core.work.hxjson2.JSONEncoder.prototype.objectToString = function(o) {
	var s = "";
	var value;
	var _g = 0, _g1 = Reflect.fields(o);
	while(_g < _g1.length) {
		var key = _g1[_g];
		++_g;
		value = Reflect.field(o,key);
		if(!Reflect.isFunction(value)) {
			if(s.length > 0) s += ",";
			s += this.escapeString(key) + ":" + this.convertToString(value);
		}
	}
	return "{" + s + "}";
}
gridbee.core.work.hxjson2.JSONEncoder.prototype.__class__ = gridbee.core.work.hxjson2.JSONEncoder;
if(typeof js=='undefined') js = {}
js.Boot = function() { }
js.Boot.__name__ = ["js","Boot"];
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
}
js.Boot.__trace = function(v,i) {
	var msg = i != null?i.fileName + ":" + i.lineNumber + ": ":"";
	msg += js.Boot.__unhtml(js.Boot.__string_rec(v,"")) + "<br/>";
	var d = document.getElementById("haxe:trace");
	if(d == null) alert("No haxe:trace element defined\n" + msg); else d.innerHTML += msg;
}
js.Boot.__clear_trace = function() {
	var d = document.getElementById("haxe:trace");
	if(d != null) d.innerHTML = "";
}
js.Boot.__closure = function(o,f) {
	var m = o[f];
	if(m == null) return null;
	var f1 = function() {
		return m.apply(o,arguments);
	};
	f1.scope = o;
	f1.method = m;
	return f1;
}
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ != null || o.__ename__ != null)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__ != null) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2, _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i;
			var str = "[";
			s += "\t";
			var _g = 0;
			while(_g < l) {
				var i1 = _g++;
				str += (i1 > 0?",":"") + js.Boot.__string_rec(o[i1],s);
			}
			str += "]";
			return str;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) { ;
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
}
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0, _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
}
js.Boot.__instanceof = function(o,cl) {
	try {
		if(o instanceof cl) {
			if(cl == Array) return o.__enum__ == null;
			return true;
		}
		if(js.Boot.__interfLoop(o.__class__,cl)) return true;
	} catch( e ) {
		if(cl == null) return false;
	}
	switch(cl) {
	case Int:
		return Math.ceil(o%2147483648.0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return o === true || o === false;
	case String:
		return typeof(o) == "string";
	case Dynamic:
		return true;
	default:
		if(o == null) return false;
		return o.__enum__ == cl || cl == Class && o.__name__ != null || cl == Enum && o.__ename__ != null;
	}
}
js.Boot.__init = function() {
	js.Lib.isIE = typeof document!='undefined' && document.all != null && typeof window!='undefined' && window.opera == null;
	js.Lib.isOpera = typeof window!='undefined' && window.opera != null;
	Array.prototype.copy = Array.prototype.slice;
	Array.prototype.insert = function(i,x) {
		this.splice(i,0,x);
	};
	Array.prototype.remove = Array.prototype.indexOf?function(obj) {
		var idx = this.indexOf(obj);
		if(idx == -1) return false;
		this.splice(idx,1);
		return true;
	}:function(obj) {
		var i = 0;
		var l = this.length;
		while(i < l) {
			if(this[i] == obj) {
				this.splice(i,1);
				return true;
			}
			i++;
		}
		return false;
	};
	Array.prototype.iterator = function() {
		return { cur : 0, arr : this, hasNext : function() {
			return this.cur < this.arr.length;
		}, next : function() {
			return this.arr[this.cur++];
		}};
	};
	if(String.prototype.cca == null) String.prototype.cca = String.prototype.charCodeAt;
	String.prototype.charCodeAt = function(i) {
		var x = this.cca(i);
		if(x != x) return null;
		return x;
	};
	var oldsub = String.prototype.substr;
	String.prototype.substr = function(pos,len) {
		if(pos != null && pos != 0 && len != null && len < 0) return "";
		if(len == null) len = this.length;
		if(pos < 0) {
			pos = this.length + pos;
			if(pos < 0) pos = 0;
		} else if(len < 0) len = this.length + len - pos;
		return oldsub.apply(this,[pos,len]);
	};
	$closure = js.Boot.__closure;
}
js.Boot.prototype.__class__ = js.Boot;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("update_time")) this.update_time = Std.parseInt(input.node.resolve("update_time").getInnerData());
	if(input.hasNode.resolve("software_version")) this.software_version = input.node.resolve("software_version").getInnerData();
	if(input.node.resolve("daemon_status").hasNode.resolve("daemon")) {
		this.daemon_arr = new Array();
		var $it0 = input.node.resolve("daemon_status").nodes.resolve("daemon").iterator();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			this.daemon_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.Daemon(i));
		}
	}
	var k = input.node.resolve("database_file_states");
	if(k.hasNode.resolve("results_ready_to_send")) this.results_ready_to_send = Std.parseInt(k.node.resolve("results_ready_to_send").getInnerData());
	if(k.hasNode.resolve("results_in_progress")) this.results_in_progress = Std.parseInt(k.node.resolve("results_in_progress").getInnerData());
	if(k.hasNode.resolve("workunits_waiting_for_validation")) this.workunits_waiting_for_validation = Std.parseInt(k.node.resolve("workunits_waiting_for_validation").getInnerData());
	if(k.hasNode.resolve("workunits_waiting_for_assimilation")) this.workunits_waiting_for_assimilation = Std.parseInt(k.node.resolve("workunits_waiting_for_assimilation").getInnerData());
	if(k.hasNode.resolve("workunits_waiting_for_deletion")) this.workunits_waiting_for_deletion = Std.parseInt(k.node.resolve("workunits_waiting_for_deletion").getInnerData());
	if(k.hasNode.resolve("results_waiting_for_deletion")) this.results_waiting_for_deletion = Std.parseInt(k.node.resolve("results_waiting_for_deletion").getInnerData());
	if(k.hasNode.resolve("transitioner_backlog_hours")) this.transitioner_backlog_hours = Std.parseFloat(k.node.resolve("transitioner_backlog_hours").getInnerData());
}
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","ServerStatusRes"];
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.update_time = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.software_version = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.daemon_arr = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.results_ready_to_send = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.results_in_progress = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.workunits_waiting_for_validation = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.workunits_waiting_for_assimilation = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.workunits_waiting_for_deletion = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.results_waiting_for_deletion = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.transitioner_backlog_hours = null;
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.print = function() {
	haxe.Log.trace("update_time: " + this.update_time,{ fileName : "ServerStatusRes.hx", lineNumber : 68, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("software_version: " + this.software_version,{ fileName : "ServerStatusRes.hx", lineNumber : 69, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	if(this.daemon_arr != null) this.daemon_arr[0].print();
	haxe.Log.trace("results_ready_to_send: " + this.results_ready_to_send,{ fileName : "ServerStatusRes.hx", lineNumber : 72, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("results_in_progress: " + this.results_in_progress,{ fileName : "ServerStatusRes.hx", lineNumber : 73, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("workunits_waiting_for_validation: " + this.workunits_waiting_for_validation,{ fileName : "ServerStatusRes.hx", lineNumber : 74, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("workunits_waiting_for_assimilation: " + this.workunits_waiting_for_assimilation,{ fileName : "ServerStatusRes.hx", lineNumber : 75, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("workunits_waiting_for_deletion: " + this.workunits_waiting_for_deletion,{ fileName : "ServerStatusRes.hx", lineNumber : 76, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("results_waiting_for_deletion: " + this.results_waiting_for_deletion,{ fileName : "ServerStatusRes.hx", lineNumber : 77, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
	haxe.Log.trace("transitioner_backlog_hours: " + this.transitioner_backlog_hours,{ fileName : "ServerStatusRes.hx", lineNumber : 78, className : "gridbee.worksource.boinc.webrpc.result.ServerStatusRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.ServerStatusRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.ServerStatusRes;
gridbee.core.iface.Event = function() { }
gridbee.core.iface.Event.__name__ = ["gridbee","core","iface","Event"];
gridbee.core.iface.Event.prototype.type = null;
gridbee.core.iface.Event.prototype.__class__ = gridbee.core.iface.Event;
gridbee.core.iface.MessageEvent = function() { }
gridbee.core.iface.MessageEvent.__name__ = ["gridbee","core","iface","MessageEvent"];
gridbee.core.iface.MessageEvent.prototype.data = null;
gridbee.core.iface.MessageEvent.prototype.origin = null;
gridbee.core.iface.MessageEvent.prototype.lastEventId = null;
gridbee.core.iface.MessageEvent.prototype.__class__ = gridbee.core.iface.MessageEvent;
gridbee.core.iface.MessageEvent.__interfaces__ = [gridbee.core.iface.Event];
gridbee.core.iface.SimpleMessageEvent = function(data,origin,lastEventId,type) {
	if( data === $_ ) return;
	if(type == null) type = "";
	if(lastEventId == null) lastEventId = "";
	if(origin == null) origin = "";
	if(data == null) data = "";
	this.data = data;
	this.origin = origin;
	this.lastEventId = lastEventId;
	this.type = type;
}
gridbee.core.iface.SimpleMessageEvent.__name__ = ["gridbee","core","iface","SimpleMessageEvent"];
gridbee.core.iface.SimpleMessageEvent.prototype.data = null;
gridbee.core.iface.SimpleMessageEvent.prototype.origin = null;
gridbee.core.iface.SimpleMessageEvent.prototype.lastEventId = null;
gridbee.core.iface.SimpleMessageEvent.prototype.type = null;
gridbee.core.iface.SimpleMessageEvent.prototype.__class__ = gridbee.core.iface.SimpleMessageEvent;
gridbee.core.iface.SimpleMessageEvent.__interfaces__ = [gridbee.core.iface.MessageEvent];
gridbee.core.iface.ErrorEvent = function() { }
gridbee.core.iface.ErrorEvent.__name__ = ["gridbee","core","iface","ErrorEvent"];
gridbee.core.iface.ErrorEvent.prototype.message = null;
gridbee.core.iface.ErrorEvent.prototype.filename = null;
gridbee.core.iface.ErrorEvent.prototype.lineno = null;
gridbee.core.iface.ErrorEvent.prototype.__class__ = gridbee.core.iface.ErrorEvent;
gridbee.core.iface.ErrorEvent.__interfaces__ = [gridbee.core.iface.Event];
gridbee.core.iface.ProgressEvent = function() { }
gridbee.core.iface.ProgressEvent.__name__ = ["gridbee","core","iface","ProgressEvent"];
gridbee.core.iface.ProgressEvent.prototype.lengthComputable = null;
gridbee.core.iface.ProgressEvent.prototype.loaded = null;
gridbee.core.iface.ProgressEvent.prototype.total = null;
gridbee.core.iface.ProgressEvent.prototype.__class__ = gridbee.core.iface.ProgressEvent;
gridbee.core.iface.ProgressEvent.__interfaces__ = [gridbee.core.iface.Event];
gridbee.core.iface.Worker = function() { }
gridbee.core.iface.Worker.__name__ = ["gridbee","core","iface","Worker"];
gridbee.core.iface.Worker.prototype.setOnerror = null;
gridbee.core.iface.Worker.prototype.setOnmessage = null;
gridbee.core.iface.Worker.prototype.postMessage = null;
gridbee.core.iface.Worker.prototype.terminate = null;
gridbee.core.iface.Worker.prototype.__class__ = gridbee.core.iface.Worker;
henkolib.log.LogEntry = function(source,level,message,data,pos) {
	if( source === $_ ) return;
	this.time = Date.now();
	this.source = source;
	this.level = level;
	this.message = message;
	this.data = data;
	this.pos = pos;
}
henkolib.log.LogEntry.__name__ = ["henkolib","log","LogEntry"];
henkolib.log.LogEntry.prototype.time = null;
henkolib.log.LogEntry.prototype.source = null;
henkolib.log.LogEntry.prototype.level = null;
henkolib.log.LogEntry.prototype.message = null;
henkolib.log.LogEntry.prototype.data = null;
henkolib.log.LogEntry.prototype.pos = null;
henkolib.log.LogEntry.prototype.__class__ = henkolib.log.LogEntry;
gridbee.core.iface.WorkUnit = function() { }
gridbee.core.iface.WorkUnit.__name__ = ["gridbee","core","iface","WorkUnit"];
gridbee.core.iface.WorkUnit.prototype.start = null;
gridbee.core.iface.WorkUnit.prototype.terminate = null;
gridbee.core.iface.WorkUnit.prototype.enable = null;
gridbee.core.iface.WorkUnit.prototype.disable = null;
gridbee.core.iface.WorkUnit.prototype.operate = null;
gridbee.core.iface.WorkUnit.prototype.getState = null;
gridbee.core.iface.WorkUnit.prototype.getStatusString = null;
gridbee.core.iface.WorkUnit.prototype.onProgressChange = null;
gridbee.core.iface.WorkUnit.prototype.onStatusChange = null;
gridbee.core.iface.WorkUnit.prototype.getScreenName = null;
gridbee.core.iface.WorkUnit.prototype.isChanged = null;
gridbee.core.iface.WorkUnit.prototype.isCompleted = null;
gridbee.core.iface.WorkUnit.prototype.isError = null;
gridbee.core.iface.WorkUnit.prototype.getError = null;
gridbee.core.iface.WorkUnit.prototype.getProgress = null;
gridbee.core.iface.WorkUnit.prototype.getResult = null;
gridbee.core.iface.WorkUnit.prototype.getElapsedTime = null;
gridbee.core.iface.WorkUnit.prototype.onComplete = null;
gridbee.core.iface.WorkUnit.prototype.onError = null;
gridbee.core.iface.WorkUnit.prototype.onProgress = null;
gridbee.core.iface.WorkUnit.prototype.__class__ = gridbee.core.iface.WorkUnit;
gridbee.core.iface.WorkUnit.__interfaces__ = [henkolib.async.AsyncResult,gridbee.core.iface.Persistent,henkolib.log.LogSource,gridbee.core.iface.Operable];
gridbee.core.work.BasicWorkUnit = function(platform) {
	if( platform === $_ ) return;
	if(platform == null) platform = "";
	this.state = gridbee.core.iface.WorkUnitState.Init;
	this.context = new gridbee.core.work.WorkContext();
	this.context.setPlatform(platform);
	this.init();
}
gridbee.core.work.BasicWorkUnit.__name__ = ["gridbee","core","work","BasicWorkUnit"];
gridbee.core.work.BasicWorkUnit.prototype.state = null;
gridbee.core.work.BasicWorkUnit.prototype.context = null;
gridbee.core.work.BasicWorkUnit.prototype.exe = null;
gridbee.core.work.BasicWorkUnit.prototype.operation = null;
gridbee.core.work.BasicWorkUnit.prototype.ares = null;
gridbee.core.work.BasicWorkUnit.prototype.onComplete = null;
gridbee.core.work.BasicWorkUnit.prototype.onError = null;
gridbee.core.work.BasicWorkUnit.prototype.onProgress = null;
gridbee.core.work.BasicWorkUnit.prototype.onProgressChange = null;
gridbee.core.work.BasicWorkUnit.prototype.onlog = null;
gridbee.core.work.BasicWorkUnit.prototype.onLog = null;
gridbee.core.work.BasicWorkUnit.prototype.onstatuschange = null;
gridbee.core.work.BasicWorkUnit.prototype.onStatusChange = null;
gridbee.core.work.BasicWorkUnit.prototype.init = function() {
	this.operation = new henkolib.async.AsyncOperation();
	this.onComplete = this.operation.onComplete;
	this.onError = this.operation.onError;
	this.onProgress = this.operation.onProgress;
	this.onProgressChange = this.operation.onProgress;
	this.onStatusChange = this.onstatuschange = new henkolib.events.SimpleEvent();
	this.onLog = this.onlog = new henkolib.events.Event();
}
gridbee.core.work.BasicWorkUnit.prototype.operate = function() {
	if(this.exe != null) this.exe.operate();
}
gridbee.core.work.BasicWorkUnit.prototype.start = function() {
	if(this.state == gridbee.core.iface.WorkUnitState.Passive) {
		this.exe = new gridbee.core.work.WorkExecutor(this.context);
		this.ares = this.exe.run();
		var self = this;
		this.ares.onComplete.subscribe(function(wc) {
			self.SwitchState(gridbee.core.iface.WorkUnitState.Completed);
			self.operation.setResult(wc);
		});
		this.ares.onError.subscribe(function(mes) {
			self.SwitchState(gridbee.core.iface.WorkUnitState.Completed);
			self.operation.setError(mes);
		});
		this.ares.onProgress.subscribe(function(prog) {
			self.operation.setProgress(prog);
		});
		this.SwitchState(gridbee.core.iface.WorkUnitState.Active);
	}
}
gridbee.core.work.BasicWorkUnit.prototype.disable = function() {
	if(this.state == gridbee.core.iface.WorkUnitState.Active || this.state == gridbee.core.iface.WorkUnitState.Passive) {
		this.exe.terminate();
		this.SwitchState(gridbee.core.iface.WorkUnitState.Disabled);
	}
}
gridbee.core.work.BasicWorkUnit.prototype.enable = function() {
	if(this.state == gridbee.core.iface.WorkUnitState.Disabled) this.SwitchState(gridbee.core.iface.WorkUnitState.Passive);
}
gridbee.core.work.BasicWorkUnit.prototype.terminate = function() {
	if(this.state == gridbee.core.iface.WorkUnitState.Active) {
		this.exe.terminate();
		this.SwitchState(gridbee.core.iface.WorkUnitState.Passive);
	}
}
gridbee.core.work.BasicWorkUnit.prototype.SwitchState = function(s) {
	this.state = s;
	this.onstatuschange.invoke();
	henkolib.log.Console.main.logDebug("Changed state to " + this.getStatusString(),null,null,{ fileName : "BasicWorkUnit.hx", lineNumber : 146, className : "gridbee.core.work.BasicWorkUnit", methodName : "SwitchState"});
	this.onlog.invoke(new henkolib.log.LogEntry(null,henkolib.log.LogLevel.L5_Debug,"Changed state to " + this.getStatusString(),null,null));
}
gridbee.core.work.BasicWorkUnit.prototype.getState = function() {
	return this.state;
}
gridbee.core.work.BasicWorkUnit.prototype.getStatusString = function() {
	switch( (this.state)[1] ) {
	case 2:
		return "Active";
	case 4:
		return "Completed";
	case 3:
		return "Disabled";
	case 0:
		return "Init";
	case 1:
		return "Passive";
	}
}
gridbee.core.work.BasicWorkUnit.prototype.getContext = function() {
	return this.context;
}
gridbee.core.work.BasicWorkUnit.prototype.getScreenName = function() {
	return "BasicWorkUnit";
}
gridbee.core.work.BasicWorkUnit.prototype.isChanged = function() {
	return this.context.isChanged();
}
gridbee.core.work.BasicWorkUnit.prototype.isCompleted = function() {
	return this.operation.isCompleted();
}
gridbee.core.work.BasicWorkUnit.prototype.isError = function() {
	return this.operation.isError();
}
gridbee.core.work.BasicWorkUnit.prototype.getError = function() {
	return this.operation.getError();
}
gridbee.core.work.BasicWorkUnit.prototype.getProgress = function() {
	return this.operation.getProgress();
}
gridbee.core.work.BasicWorkUnit.prototype.getResult = function() {
	return this.operation.getResult();
}
gridbee.core.work.BasicWorkUnit.prototype.getElapsedTime = function() {
	return this.operation.getElapsedTime();
}
gridbee.core.work.BasicWorkUnit.prototype.hxSerialize = function(s) {
	s.serialize(this.state);
	s.serialize(this.context);
}
gridbee.core.work.BasicWorkUnit.prototype.hxUnserialize = function(s) {
	this.state = s.unserialize();
	this.context = s.unserialize();
	if(this.state == gridbee.core.iface.WorkUnitState.Active) this.state = gridbee.core.iface.WorkUnitState.Passive;
	this.init();
}
gridbee.core.work.BasicWorkUnit.prototype.__class__ = gridbee.core.work.BasicWorkUnit;
gridbee.core.work.BasicWorkUnit.__interfaces__ = [henkolib.async.AsyncResult,gridbee.core.iface.WorkUnit];
if(!gridbee.worksource.boinc.benchmark) gridbee.worksource.boinc.benchmark = {}
gridbee.worksource.boinc.benchmark.WhetstoneBenchmark = function(p) {
	if( p === $_ ) return;
	gridbee.core.work.BasicWorkUnit.call(this);
	var code = "\r\n\t\t\tvar whetstone=function(m){var q=[],d,e,a,c,f,h,b=[],o,k;o=(new Date).getTime()/1E3;var g=0.49999975,p=g;k=0;do{var i=[];b[0]=1;b[1]=-1;b[2]=-1;b[3]=-1;for(e=0;e<1;e++){for(d=0;d<12E4;d++)b[0]=(b[0]+b[1]+b[2]-b[3])*g,b[1]=(b[0]+b[1]-b[2]+b[3])*g,b[2]=(b[0]-b[1]+b[2]+b[3])*g,b[3]=(-b[0]+b[1]+b[2]+b[3])*g;g=1-g}g=p;i[0]=b[0];i[1]=b[1];i[2]=b[2];i[3]=b[3];for(e=0;e<1;e++){for(d=0;d<14E3;d++){a=b;c=g;f=void 0;for(f=0;f<6;f++)a[0]=(a[0]+a[1]+a[2]-a[3])*c,a[1]=(a[0]+a[1]-a[2]+a[3])*c,a[2]=(a[0]-a[1]+a[2]+a[3])*c,a[3]=(-a[0]+a[1]+a[2]+a[3])/2}g=1-g}g=p;i[4]=b[0];a=c=h=i[11];for(e=0;e<1;e++)for(d=0;d<345E3;d++)f=a==1?h:c,a=c>2?h:1,c=f<1?1:h;i[5]=a;a=b[0];c=2;f=3;for(e=0;e<1;e++)for(d=0;d<21E4;d++)a=a*(c-a)*(f-c),c=f*c-(f-a)*c,f=(f-c)*(c+a),b[f&3]=a+c+f,b[c&3]=a*c*f;i[6]=b[0];c=a=0.5;for(e=0;e<1;e++){for(d=1;d<32E3;d++)a=g*Math.atan(2*Math.sin(a)*Math.cos(a)/(Math.cos(a+c)+Math.cos(a-c)-1)),c=g*Math.atan(2*Math.sin(c)*Math.cos(c)/(Math.cos(a+c)+Math.cos(a-c)-1));g=1-g}g=p;i[7]=a;a={a:1};c={a:1};f={a:1};for(e=0;e<1;e++)for(d=0;d<899E3;d++){h=a;var j=c,l=f,n=g;h.a=j.a;j.a=l.a;h.a=n*(h.a+j.a);j.a=0.50000025*(h.a+j.a);l.a=(h.a+j.a)/2}i[8]=a.a;a=0;c=1;f=2;b[0]=1;b[1]=2;b[2]=3;for(e=0;e<1;e++)for(d=0;d<616E3;d++)h=b,j=a,l=c,n=f,h[j]=h[l],h[l]=h[n],h[n]=h[j];i[9]=b[0];a=0.75;for(e=0;e<1;e++)for(d=0;d<93E3;d++)a=Math.sqrt(Math.exp(Math.log(a)/0.50000025));i[10]=a;i[12]=k;q.push(i);k++}while((new Date).getTime()/1E3-o<m);m=(new Date).getTime()/1E3-o;d={};d.flops=1E5*k/m*1E3;d.time=m;d.iter=k;d.results=q;return d};\r\n\t\t\tvar seconds = parseFloat(js.input.read(\"seconds\"));\r\n\t\t\tvar result = whetstone(seconds);\r\n\t\t\tjs.output.write(\"flops\", result.flops);\r\n\t\t\treturn 0;\r\n\t\t";
	this.context.setProgramCode(code);
	this.context.setPlatform("javascript");
	this.SwitchState(gridbee.core.iface.WorkUnitState.Passive);
}
gridbee.worksource.boinc.benchmark.WhetstoneBenchmark.__name__ = ["gridbee","worksource","boinc","benchmark","WhetstoneBenchmark"];
gridbee.worksource.boinc.benchmark.WhetstoneBenchmark.__super__ = gridbee.core.work.BasicWorkUnit;
for(var k in gridbee.core.work.BasicWorkUnit.prototype ) gridbee.worksource.boinc.benchmark.WhetstoneBenchmark.prototype[k] = gridbee.core.work.BasicWorkUnit.prototype[k];
gridbee.worksource.boinc.benchmark.WhetstoneBenchmark.prototype.getFlops = function() {
	if(this.operation.isCompleted()) return Std.parseFloat(this.context.read("flops")); else return 0;
}
gridbee.worksource.boinc.benchmark.WhetstoneBenchmark.prototype.__class__ = gridbee.worksource.boinc.benchmark.WhetstoneBenchmark;
if(!gridbee.core.net) gridbee.core.net = {}
gridbee.core.net.HTTPResponse = function(statusCode,headers,content) {
	if( statusCode === $_ ) return;
	this.statusCode = statusCode;
	this.headers = headers;
	this.content = content;
}
gridbee.core.net.HTTPResponse.__name__ = ["gridbee","core","net","HTTPResponse"];
gridbee.core.net.HTTPResponse.prototype.statusCode = null;
gridbee.core.net.HTTPResponse.prototype.headers = null;
gridbee.core.net.HTTPResponse.prototype.content = null;
gridbee.core.net.HTTPResponse.prototype.__class__ = gridbee.core.net.HTTPResponse;
gridbee.core.net.HTTPRequest = function(method,url) {
	if( method === $_ ) return;
	if(gridbee.js.XMLHttpRequestLevel2 != null) {
		this.xhr2 = new gridbee.js.XMLHttpRequestLevel2();
		this.xhr2.addEventListener("progress",$closure(this,"xhr2OnProgress"),false);
		this.xhr2.addEventListener("load",$closure(this,"xhr2OnLoad"),false);
		this.xhr2.addEventListener("error",$closure(this,"xhr2OnError"),false);
		this.xhr2.upload.addEventListener("progress",$closure(this,"xhr2UploadOnProgress"),false);
		this.xhr2.open(method,url,true);
		this.req = this.xhr2;
	} else {
		var r = new EReg("(http://)?([^/]*).*","");
		r.match(js.Lib.window.location.href);
		var currentDomain = r.matched(2);
		r.match(url);
		var reuqestDomain = r.matched(2);
		if(currentDomain != reuqestDomain && gridbee.js.XDomainRequest != null) {
			this.xdr = new gridbee.js.XDomainRequest();
			this.xdr.onload = $closure(this,"xdrOnLoad");
			this.xdr.onerror = $closure(this,"xdrOnError");
			this.xdr.open(method,url);
			this.req = this.xdr;
		} else {
			this.xhr = new js.XMLHttpRequest();
			this.xhr.onreadystatechange = $closure(this,"xhrOnReadyStateChange");
			this.xhr.open(method,url,true);
			this.req = this.xhr;
		}
	}
	this.method = method;
	if(method == "POST" || method == "PUT") this.ratio = 1; else this.ratio = 0;
	this.data = null;
	this.parameters = new Hash();
	this.response = new henkolib.async.AsyncOperation();
}
gridbee.core.net.HTTPRequest.__name__ = ["gridbee","core","net","HTTPRequest"];
gridbee.core.net.HTTPRequest.get = function(url) {
	return new gridbee.core.net.HTTPRequest("GET",url);
}
gridbee.core.net.HTTPRequest.post = function(url) {
	return new gridbee.core.net.HTTPRequest("POST",url);
}
gridbee.core.net.HTTPRequest.put = function(url) {
	return new gridbee.core.net.HTTPRequest("PUT",url);
}
gridbee.core.net.HTTPRequest.prototype.xhr = null;
gridbee.core.net.HTTPRequest.prototype.xhr2 = null;
gridbee.core.net.HTTPRequest.prototype.xdr = null;
gridbee.core.net.HTTPRequest.prototype.req = null;
gridbee.core.net.HTTPRequest.prototype.method = null;
gridbee.core.net.HTTPRequest.prototype.ratio = null;
gridbee.core.net.HTTPRequest.prototype.parameters = null;
gridbee.core.net.HTTPRequest.prototype.data = null;
gridbee.core.net.HTTPRequest.prototype.response = null;
gridbee.core.net.HTTPRequest.prototype.send = function() {
	this.response.setProgress(0);
	if(this.data == null) {
		if(this.xdr == null) this.req.setRequestHeader("Content-Type","application/x-www-form-urlencoded"); else this.xdr.contentType = "application/x-www-form-urlencoded";
		var $it0 = this.parameters.keys();
		while( $it0.hasNext() ) {
			var key = $it0.next();
			if(this.data == null) this.data = "";
			if(this.data != null) this.data += "&";
			this.data += StringTools.urlEncode(key) + "=" + StringTools.urlEncode(this.parameters.get(key));
		}
	}
	try {
		this.req.send(this.data);
	} catch( e ) {
		this.response.setError("");
	}
	return this.response;
}
gridbee.core.net.HTTPRequest.prototype.xhrOnReadyStateChange = function() {
	if(this.xhr.readyState == 4) {
		if(this.xhr.status == 200) {
			this.response.setProgress(1);
			this.response.setResult(new gridbee.core.net.HTTPResponse(null,null,this.xhr.responseText));
		} else this.response.setError("Error: " + this.xhr.statusText);
	}
}
gridbee.core.net.HTTPRequest.prototype.xhr2UploadOnProgress = function(evt) {
	if(evt.lengthComputable) {
		var progress = evt.loaded / evt.total;
		progress = this.ratio * progress;
		this.response.setProgress(progress);
	}
}
gridbee.core.net.HTTPRequest.prototype.xhr2OnProgress = function(evt) {
	if(evt.lengthComputable) {
		var progress = evt.loaded / evt.total;
		progress = (1 - this.ratio) * progress + this.ratio;
		this.response.setProgress(progress);
	}
}
gridbee.core.net.HTTPRequest.prototype.xhr2OnLoad = function(evt) {
	if(this.xhr2.status == 200) {
		this.response.setProgress(1);
		this.response.setResult(new gridbee.core.net.HTTPResponse(null,null,this.xhr2.responseText));
	} else this.response.setError("HTTP ERROR: " + this.xhr2.statusText + " (" + this.xhr2.status + ")");
}
gridbee.core.net.HTTPRequest.prototype.xhr2OnError = function(evt) {
	this.response.setError("Network error");
}
gridbee.core.net.HTTPRequest.prototype.xdrOnLoad = function() {
	this.response.setProgress(1);
	this.response.setResult(new gridbee.core.net.HTTPResponse(null,null,this.xdr.responseText));
}
gridbee.core.net.HTTPRequest.prototype.xdrOnError = function() {
	this.response.setError("");
}
gridbee.core.net.HTTPRequest.prototype.uploadRatio = function(ratio) {
	this.ratio = ratio;
}
gridbee.core.net.HTTPRequest.prototype.rawData = function(data) {
	this.data = data;
}
gridbee.core.net.HTTPRequest.prototype.addParam = function(key,value) {
	this.parameters.set(key,value);
}
gridbee.core.net.HTTPRequest.prototype.successCallback = function(successCallback) {
	this.response.onComplete.subscribe(successCallback);
}
gridbee.core.net.HTTPRequest.prototype.errorCallback = function(errorCallback) {
	this.response.onError.subscribe(errorCallback);
}
gridbee.core.net.HTTPRequest.prototype.progressCallback = function(progressCallback) {
	this.response.onProgress.subscribe(progressCallback);
}
gridbee.core.net.HTTPRequest.prototype.__class__ = gridbee.core.net.HTTPRequest;
gridbee.worksource.boinc.reply.ResultSlot = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("name")) this.name = node.node.resolve("name").getInnerData();
	if(node.hasNode.resolve("wu_name")) this.wu_name = node.node.resolve("wu_name").getInnerData();
	if(node.hasNode.resolve("platform")) this.platform = node.node.resolve("platform").getInnerData();
	if(node.hasNode.resolve("version_num")) this.version_num = Std.parseInt(node.node.resolve("version_num").getInnerData());
	if(node.hasNode.resolve("report_deadline")) this.report_deadline = Std.parseInt(node.node.resolve("report_deadline").getInnerData());
	this.file_ref = new Array();
	if(node.hasNode.resolve("file_ref")) {
		var $it0 = node.nodes.resolve("file_ref").iterator();
		while( $it0.hasNext() ) {
			var child = $it0.next();
			this.file_ref.push(new gridbee.worksource.boinc.reply.FileRef(child));
		}
	}
}
gridbee.worksource.boinc.reply.ResultSlot.__name__ = ["gridbee","worksource","boinc","reply","ResultSlot"];
gridbee.worksource.boinc.reply.ResultSlot.prototype.name = null;
gridbee.worksource.boinc.reply.ResultSlot.prototype.wu_name = null;
gridbee.worksource.boinc.reply.ResultSlot.prototype.platform = null;
gridbee.worksource.boinc.reply.ResultSlot.prototype.version_num = null;
gridbee.worksource.boinc.reply.ResultSlot.prototype.report_deadline = null;
gridbee.worksource.boinc.reply.ResultSlot.prototype.file_ref = null;
gridbee.worksource.boinc.reply.ResultSlot.prototype.__class__ = gridbee.worksource.boinc.reply.ResultSlot;
js.Lib = function() { }
js.Lib.__name__ = ["js","Lib"];
js.Lib.isIE = null;
js.Lib.isOpera = null;
js.Lib.document = null;
js.Lib.window = null;
js.Lib.alert = function(v) {
	alert(js.Boot.__string_rec(v,""));
}
js.Lib.eval = function(code) {
	return eval(code);
}
js.Lib.setErrorHandler = function(f) {
	js.Lib.onerror = f;
}
js.Lib.prototype.__class__ = js.Lib;
gridbee.core.work.hxjson2.JSONTokenType = { __ename__ : ["gridbee","core","work","hxjson2","JSONTokenType"], __constructs__ : ["tUNKNOWN","tCOMMA","tLEFT_BRACE","tRIGHT_BRACE","tLEFT_BRACKET","tRIGHT_BRACKET","tCOLON","tTRUE","tFALSE","tNULL","tSTRING","tNUMBER","tNAN"] }
gridbee.core.work.hxjson2.JSONTokenType.tUNKNOWN = ["tUNKNOWN",0];
gridbee.core.work.hxjson2.JSONTokenType.tUNKNOWN.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tUNKNOWN.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tCOMMA = ["tCOMMA",1];
gridbee.core.work.hxjson2.JSONTokenType.tCOMMA.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tCOMMA.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACE = ["tLEFT_BRACE",2];
gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACE.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACE.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE = ["tRIGHT_BRACE",3];
gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACKET = ["tLEFT_BRACKET",4];
gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACKET.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACKET.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET = ["tRIGHT_BRACKET",5];
gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tCOLON = ["tCOLON",6];
gridbee.core.work.hxjson2.JSONTokenType.tCOLON.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tCOLON.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tTRUE = ["tTRUE",7];
gridbee.core.work.hxjson2.JSONTokenType.tTRUE.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tTRUE.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tFALSE = ["tFALSE",8];
gridbee.core.work.hxjson2.JSONTokenType.tFALSE.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tFALSE.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tNULL = ["tNULL",9];
gridbee.core.work.hxjson2.JSONTokenType.tNULL.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tNULL.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tSTRING = ["tSTRING",10];
gridbee.core.work.hxjson2.JSONTokenType.tSTRING.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tSTRING.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tNUMBER = ["tNUMBER",11];
gridbee.core.work.hxjson2.JSONTokenType.tNUMBER.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tNUMBER.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONTokenType.tNAN = ["tNAN",12];
gridbee.core.work.hxjson2.JSONTokenType.tNAN.toString = $estr;
gridbee.core.work.hxjson2.JSONTokenType.tNAN.__enum__ = gridbee.core.work.hxjson2.JSONTokenType;
gridbee.core.work.hxjson2.JSONDecoder = function(s,strict) {
	if( s === $_ ) return;
	this.strict = strict;
	this.tokenizer = new gridbee.core.work.hxjson2.JSONTokenizer(s,strict);
	this.nextToken();
	this.value = this.parseValue();
	if(strict && this.nextToken() != null) this.tokenizer.parseError("Unexpected characters left in input stream!");
}
gridbee.core.work.hxjson2.JSONDecoder.__name__ = ["gridbee","core","work","hxjson2","JSONDecoder"];
gridbee.core.work.hxjson2.JSONDecoder.prototype.strict = null;
gridbee.core.work.hxjson2.JSONDecoder.prototype.value = null;
gridbee.core.work.hxjson2.JSONDecoder.prototype.tokenizer = null;
gridbee.core.work.hxjson2.JSONDecoder.prototype.token = null;
gridbee.core.work.hxjson2.JSONDecoder.prototype.getValue = function() {
	return this.value;
}
gridbee.core.work.hxjson2.JSONDecoder.prototype.nextToken = function() {
	return this.token = this.tokenizer.getNextToken();
}
gridbee.core.work.hxjson2.JSONDecoder.prototype.parseArray = function() {
	var a = new Array();
	this.nextToken();
	if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET) return a; else if(!this.strict && this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tCOMMA) {
		this.nextToken();
		if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET) return a; else this.tokenizer.parseError("Leading commas are not supported.  Expecting ']' but found " + this.token.value);
	}
	while(true) {
		a.push(this.parseValue());
		this.nextToken();
		if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET) return a; else if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tCOMMA) {
			this.nextToken();
			if(!this.strict) {
				if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET) return a;
			}
		} else this.tokenizer.parseError("Expecting ] or , but found " + this.token.value);
	}
	return null;
}
gridbee.core.work.hxjson2.JSONDecoder.prototype.parseObject = function() {
	var o = { };
	var key;
	this.nextToken();
	if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE) return o; else if(!this.strict && this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tCOMMA) {
		this.nextToken();
		if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE) return o; else this.tokenizer.parseError("Leading commas are not supported.  Expecting '}' but found " + this.token.value);
	}
	while(true) if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tSTRING) {
		key = Std.string(this.token.value);
		this.nextToken();
		if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tCOLON) {
			this.nextToken();
			o[key] = this.parseValue();
			this.nextToken();
			if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE) return o; else if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tCOMMA) {
				this.nextToken();
				if(!this.strict) {
					if(this.token.type == gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE) return o;
				}
			} else this.tokenizer.parseError("Expecting } or , but found " + this.token.value);
		} else this.tokenizer.parseError("Expecting : but found " + this.token.value);
	} else this.tokenizer.parseError("Expecting string but found " + this.token.value);
	return null;
}
gridbee.core.work.hxjson2.JSONDecoder.prototype.parseValue = function() {
	if(this.token == null) this.tokenizer.parseError("Unexpected end of input");
	switch( (this.token.type)[1] ) {
	case 2:
		return this.parseObject();
	case 4:
		return this.parseArray();
	case 10:
		return this.token.value;
	case 11:
		return this.token.value;
	case 7:
		return true;
	case 8:
		return false;
	case 9:
		return null;
	case 12:
		if(!this.strict) return this.token.value; else this.tokenizer.parseError("Unexpected " + this.token.value);
		break;
	default:
		this.tokenizer.parseError("Unexpected " + this.token.value);
	}
	return null;
}
gridbee.core.work.hxjson2.JSONDecoder.prototype.__class__ = gridbee.core.work.hxjson2.JSONDecoder;
ValueType = { __ename__ : ["ValueType"], __constructs__ : ["TNull","TInt","TFloat","TBool","TObject","TFunction","TClass","TEnum","TUnknown"] }
ValueType.TNull = ["TNull",0];
ValueType.TNull.toString = $estr;
ValueType.TNull.__enum__ = ValueType;
ValueType.TInt = ["TInt",1];
ValueType.TInt.toString = $estr;
ValueType.TInt.__enum__ = ValueType;
ValueType.TFloat = ["TFloat",2];
ValueType.TFloat.toString = $estr;
ValueType.TFloat.__enum__ = ValueType;
ValueType.TBool = ["TBool",3];
ValueType.TBool.toString = $estr;
ValueType.TBool.__enum__ = ValueType;
ValueType.TObject = ["TObject",4];
ValueType.TObject.toString = $estr;
ValueType.TObject.__enum__ = ValueType;
ValueType.TFunction = ["TFunction",5];
ValueType.TFunction.toString = $estr;
ValueType.TFunction.__enum__ = ValueType;
ValueType.TClass = function(c) { var $x = ["TClass",6,c]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TEnum = function(e) { var $x = ["TEnum",7,e]; $x.__enum__ = ValueType; $x.toString = $estr; return $x; }
ValueType.TUnknown = ["TUnknown",8];
ValueType.TUnknown.toString = $estr;
ValueType.TUnknown.__enum__ = ValueType;
Type = function() { }
Type.__name__ = ["Type"];
Type.getClass = function(o) {
	if(o == null) return null;
	if(o.__enum__ != null) return null;
	return o.__class__;
}
Type.getEnum = function(o) {
	if(o == null) return null;
	return o.__enum__;
}
Type.getSuperClass = function(c) {
	return c.__super__;
}
Type.getClassName = function(c) {
	var a = c.__name__;
	return a.join(".");
}
Type.getEnumName = function(e) {
	var a = e.__ename__;
	return a.join(".");
}
Type.resolveClass = function(name) {
	var cl;
	try {
		cl = eval(name);
	} catch( e ) {
		cl = null;
	}
	if(cl == null || cl.__name__ == null) return null;
	return cl;
}
Type.resolveEnum = function(name) {
	var e;
	try {
		e = eval(name);
	} catch( err ) {
		e = null;
	}
	if(e == null || e.__ename__ == null) return null;
	return e;
}
Type.createInstance = function(cl,args) {
	if(args.length <= 3) return new cl(args[0],args[1],args[2]);
	if(args.length > 8) throw "Too many arguments";
	return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
}
Type.createEmptyInstance = function(cl) {
	return new cl($_);
}
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw "No such constructor " + constr;
	if(Reflect.isFunction(f)) {
		if(params == null) throw "Constructor " + constr + " need parameters";
		return f.apply(e,params);
	}
	if(params != null && params.length != 0) throw "Constructor " + constr + " does not need parameters";
	return f;
}
Type.createEnumIndex = function(e,index,params) {
	var c = e.__constructs__[index];
	if(c == null) throw index + " is not a valid enum constructor index";
	return Type.createEnum(e,c,params);
}
Type.getInstanceFields = function(c) {
	var a = Reflect.fields(c.prototype);
	a.remove("__class__");
	return a;
}
Type.getClassFields = function(c) {
	var a = Reflect.fields(c);
	a.remove("__name__");
	a.remove("__interfaces__");
	a.remove("__super__");
	a.remove("prototype");
	return a;
}
Type.getEnumConstructs = function(e) {
	var a = e.__constructs__;
	return a.copy();
}
Type["typeof"] = function(v) {
	switch(typeof(v)) {
	case "boolean":
		return ValueType.TBool;
	case "string":
		return ValueType.TClass(String);
	case "number":
		if(Math.ceil(v) == v % 2147483648.0) return ValueType.TInt;
		return ValueType.TFloat;
	case "object":
		if(v == null) return ValueType.TNull;
		var e = v.__enum__;
		if(e != null) return ValueType.TEnum(e);
		var c = v.__class__;
		if(c != null) return ValueType.TClass(c);
		return ValueType.TObject;
	case "function":
		if(v.__name__ != null) return ValueType.TObject;
		return ValueType.TFunction;
	case "undefined":
		return ValueType.TNull;
	default:
		return ValueType.TUnknown;
	}
}
Type.enumEq = function(a,b) {
	if(a == b) return true;
	try {
		if(a[0] != b[0]) return false;
		var _g1 = 2, _g = a.length;
		while(_g1 < _g) {
			var i = _g1++;
			if(!Type.enumEq(a[i],b[i])) return false;
		}
		var e = a.__enum__;
		if(e != b.__enum__ || e == null) return false;
	} catch( e ) {
		return false;
	}
	return true;
}
Type.enumConstructor = function(e) {
	return e[0];
}
Type.enumParameters = function(e) {
	return e.slice(2);
}
Type.enumIndex = function(e) {
	return e[1];
}
Type.prototype.__class__ = Type;
if(!gridbee.core.work._NaClWorker) gridbee.core.work._NaClWorker = {}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly = function(url) {
	if( url === $_ ) return;
	this.isReady = false;
	this.postMessageQueue = new List();
	this.onmessageQueue = new List();
	this.outerIframe = js.Lib.document.createElement("iframe");
	this.outerIframe.setAttribute("width",0);
	this.outerIframe.setAttribute("height",0);
	js.Lib.document.body.appendChild(this.outerIframe);
	this.innerIframe = js.Lib.document.createElement("iframe");
	this.innerIframe.setAttribute("src",url);
	this.outerIframe.contentWindow.document.body.appendChild(this.innerIframe);
	this.outerIframe.contentWindow.addEventListener("message",$closure(this,"_onmessage"),false);
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.__name__ = ["gridbee","core","work","_NaClWorker","NaClWorker_StringOnly"];
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.isSupported = function() {
	var testNaclElement = js.Lib.document.createElement("embed");
	testNaclElement.setAttribute("type","application/x-nacl");
	testNaclElement.setAttribute("width",0);
	testNaclElement.setAttribute("height",0);
	js.Lib.document.body.appendChild(testNaclElement);
	var isSupported = testNaclElement.postMessage?true:false;
	js.Lib.document.body.removeChild(testNaclElement);
	return isSupported;
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.outerIframe = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.innerIframe = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.onerror = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.onmessageQueue = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.onmessage = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.onmessageTheRealOne = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.onmessageSetter = function(func) {
	if(func != null) {
		if(!this.onmessageQueue.isEmpty()) {
		}
		var evt;
		while((evt = this.onmessageQueue.pop()) != null) func(evt);
		this.onmessageTheRealOne = func;
	}
	return func;
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.onmessageGetter = function() {
	return this.onmessageTheRealOne;
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.ParseEventData = function(evt) {
	var simpleEvent = new gridbee.core.iface.SimpleMessageEvent();
	simpleEvent.lastEventId = evt.lastEventId;
	simpleEvent.origin = evt.origin;
	simpleEvent.type = evt.type;
	try {
		simpleEvent.data = new gridbee.core.work.hxjson2.JSONDecoder(evt.data,true).getValue();
	} catch( unknown ) {
		simpleEvent.data = new gridbee.core.work.hxjson2.JSONDecoder("{\"command\": \"exception\", \"exception\" : { \"message\" : \"Got invalid JSON from NaCl. NaCl termined.\" }}",true).getValue();
	}
	return simpleEvent;
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype._onmessage = function(evt) {
	if(evt.data == "READY") {
		this.isReady = true;
		var message;
		while((message = this.postMessageQueue.pop()) != null) this.innerIframe.contentWindow.postMessage(message,"*");
	} else if(this.onmessageGetter() != null) (this.onmessageGetter())(this.ParseEventData(evt)); else this.onmessageQueue.add(evt);
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.isReady = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.postMessageQueue = null;
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.postMessage = function(message) {
	if(this.isReady) this.innerIframe.contentWindow.postMessage(message,"*"); else this.postMessageQueue.add(message);
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.terminate = function() {
	js.Lib.document.body.removeChild(this.outerIframe);
}
gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.__class__ = gridbee.core.work._NaClWorker.NaClWorker_StringOnly;
gridbee.core.work.NaClWorker = function(url) {
	if( url === $_ ) return;
	gridbee.core.work._NaClWorker.NaClWorker_StringOnly.call(this,url);
}
gridbee.core.work.NaClWorker.__name__ = ["gridbee","core","work","NaClWorker"];
gridbee.core.work.NaClWorker.__super__ = gridbee.core.work._NaClWorker.NaClWorker_StringOnly;
for(var k in gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype ) gridbee.core.work.NaClWorker.prototype[k] = gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype[k];
gridbee.core.work.NaClWorker.isSupported = function() {
	return gridbee.core.work._NaClWorker.NaClWorker_StringOnly.isSupported();
}
gridbee.core.work.NaClWorker.prototype._onmessage = function(evt) {
	gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype._onmessage.call(this,evt);
}
gridbee.core.work.NaClWorker.prototype.postMessage = function(message) {
	message = new gridbee.core.work.hxjson2.JSONEncoder(message).getString();
	gridbee.core.work._NaClWorker.NaClWorker_StringOnly.prototype.postMessage.call(this,message);
}
gridbee.core.work.NaClWorker.prototype.setOnerror = function(func) {
	this.onerror = func;
}
gridbee.core.work.NaClWorker.prototype.setOnmessage = function(func) {
	this.onmessageSetter(func);
}
gridbee.core.work.NaClWorker.prototype.__class__ = gridbee.core.work.NaClWorker;
gridbee.core.work.NaClWorker.__interfaces__ = [gridbee.core.iface.Worker];
gridbee.worksource.boinc.reply.AppVersion = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("app_name")) this.app_name = node.node.resolve("app_name").getInnerData();
	if(node.hasNode.resolve("version_num")) this.version_num = Std.parseInt(node.node.resolve("version_num").getInnerData());
	if(node.hasNode.resolve("platform")) this.platform = node.node.resolve("platform").getInnerData();
	if(node.hasNode.resolve("avg_ncpus")) this.avg_ncpus = Std.parseFloat(node.node.resolve("avg_ncpus").getInnerData());
	if(node.hasNode.resolve("max_ncpus")) this.max_ncpus = Std.parseFloat(node.node.resolve("max_ncpus").getInnerData());
	if(node.hasNode.resolve("flops")) this.flops = Std.parseFloat(node.node.resolve("flops").getInnerData());
	this.file_ref = new Array();
	if(node.hasNode.resolve("file_ref")) {
		var $it0 = node.nodes.resolve("file_ref").iterator();
		while( $it0.hasNext() ) {
			var child = $it0.next();
			this.file_ref.push(new gridbee.worksource.boinc.reply.FileRef(child));
		}
	}
}
gridbee.worksource.boinc.reply.AppVersion.__name__ = ["gridbee","worksource","boinc","reply","AppVersion"];
gridbee.worksource.boinc.reply.AppVersion.prototype.app_name = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.version_num = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.platform = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.avg_ncpus = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.max_ncpus = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.flops = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.file_ref = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.main_program = null;
gridbee.worksource.boinc.reply.AppVersion.prototype.__class__ = gridbee.worksource.boinc.reply.AppVersion;
haxe.Md5 = function(p) {
}
haxe.Md5.__name__ = ["haxe","Md5"];
haxe.Md5.encode = function(s) {
	return new haxe.Md5().doEncode(s);
}
haxe.Md5.prototype.bitOR = function(a,b) {
	var lsb = a & 1 | b & 1;
	var msb31 = a >>> 1 | b >>> 1;
	return msb31 << 1 | lsb;
}
haxe.Md5.prototype.bitXOR = function(a,b) {
	var lsb = a & 1 ^ b & 1;
	var msb31 = a >>> 1 ^ b >>> 1;
	return msb31 << 1 | lsb;
}
haxe.Md5.prototype.bitAND = function(a,b) {
	var lsb = a & 1 & (b & 1);
	var msb31 = a >>> 1 & b >>> 1;
	return msb31 << 1 | lsb;
}
haxe.Md5.prototype.addme = function(x,y) {
	var lsw = (x & 65535) + (y & 65535);
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	return msw << 16 | lsw & 65535;
}
haxe.Md5.prototype.rhex = function(num) {
	var str = "";
	var hex_chr = "0123456789abcdef";
	var _g = 0;
	while(_g < 4) {
		var j = _g++;
		str += hex_chr.charAt(num >> j * 8 + 4 & 15) + hex_chr.charAt(num >> j * 8 & 15);
	}
	return str;
}
haxe.Md5.prototype.str2blks = function(str) {
	var nblk = (str.length + 8 >> 6) + 1;
	var blks = new Array();
	var _g1 = 0, _g = nblk * 16;
	while(_g1 < _g) {
		var i = _g1++;
		blks[i] = 0;
	}
	var i = 0;
	while(i < str.length) {
		blks[i >> 2] |= str.charCodeAt(i) << (str.length * 8 + i) % 4 * 8;
		i++;
	}
	blks[i >> 2] |= 128 << (str.length * 8 + i) % 4 * 8;
	var l = str.length * 8;
	var k = nblk * 16 - 2;
	blks[k] = l & 255;
	blks[k] |= (l >>> 8 & 255) << 8;
	blks[k] |= (l >>> 16 & 255) << 16;
	blks[k] |= (l >>> 24 & 255) << 24;
	return blks;
}
haxe.Md5.prototype.rol = function(num,cnt) {
	return num << cnt | num >>> 32 - cnt;
}
haxe.Md5.prototype.cmn = function(q,a,b,x,s,t) {
	return this.addme(this.rol(this.addme(this.addme(a,q),this.addme(x,t)),s),b);
}
haxe.Md5.prototype.ff = function(a,b,c,d,x,s,t) {
	return this.cmn(this.bitOR(this.bitAND(b,c),this.bitAND(~b,d)),a,b,x,s,t);
}
haxe.Md5.prototype.gg = function(a,b,c,d,x,s,t) {
	return this.cmn(this.bitOR(this.bitAND(b,d),this.bitAND(c,~d)),a,b,x,s,t);
}
haxe.Md5.prototype.hh = function(a,b,c,d,x,s,t) {
	return this.cmn(this.bitXOR(this.bitXOR(b,c),d),a,b,x,s,t);
}
haxe.Md5.prototype.ii = function(a,b,c,d,x,s,t) {
	return this.cmn(this.bitXOR(c,this.bitOR(b,~d)),a,b,x,s,t);
}
haxe.Md5.prototype.doEncode = function(str) {
	var x = this.str2blks(str);
	var a = 1732584193;
	var b = -271733879;
	var c = -1732584194;
	var d = 271733878;
	var step;
	var i = 0;
	while(i < x.length) {
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;
		step = 0;
		a = this.ff(a,b,c,d,x[i],7,-680876936);
		d = this.ff(d,a,b,c,x[i + 1],12,-389564586);
		c = this.ff(c,d,a,b,x[i + 2],17,606105819);
		b = this.ff(b,c,d,a,x[i + 3],22,-1044525330);
		a = this.ff(a,b,c,d,x[i + 4],7,-176418897);
		d = this.ff(d,a,b,c,x[i + 5],12,1200080426);
		c = this.ff(c,d,a,b,x[i + 6],17,-1473231341);
		b = this.ff(b,c,d,a,x[i + 7],22,-45705983);
		a = this.ff(a,b,c,d,x[i + 8],7,1770035416);
		d = this.ff(d,a,b,c,x[i + 9],12,-1958414417);
		c = this.ff(c,d,a,b,x[i + 10],17,-42063);
		b = this.ff(b,c,d,a,x[i + 11],22,-1990404162);
		a = this.ff(a,b,c,d,x[i + 12],7,1804603682);
		d = this.ff(d,a,b,c,x[i + 13],12,-40341101);
		c = this.ff(c,d,a,b,x[i + 14],17,-1502002290);
		b = this.ff(b,c,d,a,x[i + 15],22,1236535329);
		a = this.gg(a,b,c,d,x[i + 1],5,-165796510);
		d = this.gg(d,a,b,c,x[i + 6],9,-1069501632);
		c = this.gg(c,d,a,b,x[i + 11],14,643717713);
		b = this.gg(b,c,d,a,x[i],20,-373897302);
		a = this.gg(a,b,c,d,x[i + 5],5,-701558691);
		d = this.gg(d,a,b,c,x[i + 10],9,38016083);
		c = this.gg(c,d,a,b,x[i + 15],14,-660478335);
		b = this.gg(b,c,d,a,x[i + 4],20,-405537848);
		a = this.gg(a,b,c,d,x[i + 9],5,568446438);
		d = this.gg(d,a,b,c,x[i + 14],9,-1019803690);
		c = this.gg(c,d,a,b,x[i + 3],14,-187363961);
		b = this.gg(b,c,d,a,x[i + 8],20,1163531501);
		a = this.gg(a,b,c,d,x[i + 13],5,-1444681467);
		d = this.gg(d,a,b,c,x[i + 2],9,-51403784);
		c = this.gg(c,d,a,b,x[i + 7],14,1735328473);
		b = this.gg(b,c,d,a,x[i + 12],20,-1926607734);
		a = this.hh(a,b,c,d,x[i + 5],4,-378558);
		d = this.hh(d,a,b,c,x[i + 8],11,-2022574463);
		c = this.hh(c,d,a,b,x[i + 11],16,1839030562);
		b = this.hh(b,c,d,a,x[i + 14],23,-35309556);
		a = this.hh(a,b,c,d,x[i + 1],4,-1530992060);
		d = this.hh(d,a,b,c,x[i + 4],11,1272893353);
		c = this.hh(c,d,a,b,x[i + 7],16,-155497632);
		b = this.hh(b,c,d,a,x[i + 10],23,-1094730640);
		a = this.hh(a,b,c,d,x[i + 13],4,681279174);
		d = this.hh(d,a,b,c,x[i],11,-358537222);
		c = this.hh(c,d,a,b,x[i + 3],16,-722521979);
		b = this.hh(b,c,d,a,x[i + 6],23,76029189);
		a = this.hh(a,b,c,d,x[i + 9],4,-640364487);
		d = this.hh(d,a,b,c,x[i + 12],11,-421815835);
		c = this.hh(c,d,a,b,x[i + 15],16,530742520);
		b = this.hh(b,c,d,a,x[i + 2],23,-995338651);
		a = this.ii(a,b,c,d,x[i],6,-198630844);
		d = this.ii(d,a,b,c,x[i + 7],10,1126891415);
		c = this.ii(c,d,a,b,x[i + 14],15,-1416354905);
		b = this.ii(b,c,d,a,x[i + 5],21,-57434055);
		a = this.ii(a,b,c,d,x[i + 12],6,1700485571);
		d = this.ii(d,a,b,c,x[i + 3],10,-1894986606);
		c = this.ii(c,d,a,b,x[i + 10],15,-1051523);
		b = this.ii(b,c,d,a,x[i + 1],21,-2054922799);
		a = this.ii(a,b,c,d,x[i + 8],6,1873313359);
		d = this.ii(d,a,b,c,x[i + 15],10,-30611744);
		c = this.ii(c,d,a,b,x[i + 6],15,-1560198380);
		b = this.ii(b,c,d,a,x[i + 13],21,1309151649);
		a = this.ii(a,b,c,d,x[i + 4],6,-145523070);
		d = this.ii(d,a,b,c,x[i + 11],10,-1120210379);
		c = this.ii(c,d,a,b,x[i + 2],15,718787259);
		b = this.ii(b,c,d,a,x[i + 9],21,-343485551);
		a = this.addme(a,olda);
		b = this.addme(b,oldb);
		c = this.addme(c,oldc);
		d = this.addme(d,oldd);
		i += 16;
	}
	return this.rhex(a) + this.rhex(b) + this.rhex(c) + this.rhex(d);
}
haxe.Md5.prototype.__class__ = haxe.Md5;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("name")) this.name = input.node.resolve("name").getInnerData();
	if(input.hasNode.resolve("master_url")) this.master_url = input.node.resolve("master_url").getInnerData();
	if(input.hasNode.resolve("local_revision")) this.local_revision = input.node.resolve("local_revision").getInnerData();
	if(input.hasNode.resolve("web_stopped")) {
		if(input.node.resolve("web_stopped").getInnerData() == "1") this.web_stopped = true; else if(input.node.resolve("web_stopped").getInnerData() == "0") this.web_stopped = false;
	}
	if(input.hasNode.resolve("account_creation_disabled")) this.account_creation_disabled = true; else this.account_creation_disabled = false;
	if(input.hasNode.resolve("client_account_creation_disabled")) this.client_account_creation_disabled = true; else this.client_account_creation_disabled = false;
	if(input.hasNode.resolve("min_passwd_length")) this.min_passwd_length = Std.parseInt(input.node.resolve("min_passwd_length").getInnerData());
	if(input.hasNode.resolve("account_manager")) this.account_manager = true; else this.account_manager = false;
	if(input.hasNode.resolve("uses_username")) this.uses_username = true; else this.uses_username = false;
	if(input.hasNode.resolve("rpc_prefix")) this.rpc_prefix = input.node.resolve("rpc_prefix").getInnerData();
	if(input.hasNode.resolve("error_num")) this.error_num = Std.parseInt(input.node.resolve("error_num").getInnerData());
	if(input.hasNode.resolve("sched_stopped")) {
		if(input.node.resolve("sched_stopped").getInnerData() == "1") this.sched_stopped = true; else if(input.node.resolve("sched_stopped").getInnerData() == "0") this.sched_stopped = false;
	}
	if(input.hasNode.resolve("platforms")) {
		if(input.node.resolve("platforms").hasNode.resolve("platform")) {
			this.platforms_arr = new Array();
			var $it0 = input.node.resolve("platforms").nodes.resolve("platform").iterator();
			while( $it0.hasNext() ) {
				var i = $it0.next();
				this.platforms_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.Platforms(i));
			}
		}
	}
	if(input.hasNode.resolve("system_requiremenets")) this.system_requirements = new gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements(input.node.resolve("system_requirements")); else this.system_requirements = null;
}
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","ProjectConfigRes"];
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.name = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.master_url = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.local_revision = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.web_stopped = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.account_creation_disabled = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.client_account_creation_disabled = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.min_passwd_length = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.account_manager = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.uses_username = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.rpc_prefix = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.error_num = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.sched_stopped = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.platforms_arr = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.system_requirements = null;
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.print = function() {
	haxe.Log.trace("name: " + this.name,{ fileName : "ProjectConfigRes.hx", lineNumber : 100, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("master_url: " + this.master_url,{ fileName : "ProjectConfigRes.hx", lineNumber : 101, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("local_revision: " + this.local_revision,{ fileName : "ProjectConfigRes.hx", lineNumber : 102, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("web_stopped: " + this.web_stopped,{ fileName : "ProjectConfigRes.hx", lineNumber : 103, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("account_creation_disabled: " + this.account_creation_disabled,{ fileName : "ProjectConfigRes.hx", lineNumber : 104, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("client_account_creation_disabled: " + this.client_account_creation_disabled,{ fileName : "ProjectConfigRes.hx", lineNumber : 105, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("min_passwd_length: " + this.min_passwd_length,{ fileName : "ProjectConfigRes.hx", lineNumber : 106, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("account_manager: " + this.account_manager,{ fileName : "ProjectConfigRes.hx", lineNumber : 107, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("uses_username: " + this.uses_username,{ fileName : "ProjectConfigRes.hx", lineNumber : 108, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("rpc_prefix: " + this.rpc_prefix,{ fileName : "ProjectConfigRes.hx", lineNumber : 109, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("error_num: " + this.error_num,{ fileName : "ProjectConfigRes.hx", lineNumber : 110, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	haxe.Log.trace("sched_stopped: " + this.sched_stopped,{ fileName : "ProjectConfigRes.hx", lineNumber : 111, className : "gridbee.worksource.boinc.webrpc.result.ProjectConfigRes", methodName : "print"});
	if(this.platforms_arr[0] != null) this.platforms_arr[0].print();
	if(this.system_requirements != null) this.system_requirements.print();
}
gridbee.worksource.boinc.webrpc.result.ProjectConfigRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.ProjectConfigRes;
Reflect = function() { }
Reflect.__name__ = ["Reflect"];
Reflect.hasField = function(o,field) {
	if(o.hasOwnProperty != null) return o.hasOwnProperty(field);
	var arr = Reflect.fields(o);
	var $it0 = arr.iterator();
	while( $it0.hasNext() ) {
		var t = $it0.next();
		if(t == field) return true;
	}
	return false;
}
Reflect.field = function(o,field) {
	var v = null;
	try {
		v = o[field];
	} catch( e ) {
	}
	return v;
}
Reflect.setField = function(o,field,value) {
	o[field] = value;
}
Reflect.callMethod = function(o,func,args) {
	return func.apply(o,args);
}
Reflect.fields = function(o) {
	if(o == null) return new Array();
	var a = new Array();
	if(o.hasOwnProperty) {
		for(var i in o) if( o.hasOwnProperty(i) ) a.push(i);
	} else {
		var t;
		try {
			t = o.__proto__;
		} catch( e ) {
			t = null;
		}
		if(t != null) o.__proto__ = null;
		for(var i in o) if( i != "__proto__" ) a.push(i);
		if(t != null) o.__proto__ = t;
	}
	return a;
}
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && f.__name__ == null;
}
Reflect.compare = function(a,b) {
	return a == b?0:a > b?1:-1;
}
Reflect.compareMethods = function(f1,f2) {
	if(f1 == f2) return true;
	if(!Reflect.isFunction(f1) || !Reflect.isFunction(f2)) return false;
	return f1.scope == f2.scope && f1.method == f2.method && f1.method != null;
}
Reflect.isObject = function(v) {
	if(v == null) return false;
	var t = typeof(v);
	return t == "string" || t == "object" && !v.__enum__ || t == "function" && v.__name__ != null;
}
Reflect.deleteField = function(o,f) {
	if(!Reflect.hasField(o,f)) return false;
	delete(o[f]);
	return true;
}
Reflect.copy = function(o) {
	var o2 = { };
	var _g = 0, _g1 = Reflect.fields(o);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		o2[f] = Reflect.field(o,f);
	}
	return o2;
}
Reflect.makeVarArgs = function(f) {
	return function() {
		var a = new Array();
		var _g1 = 0, _g = arguments.length;
		while(_g1 < _g) {
			var i = _g1++;
			a.push(arguments[i]);
		}
		return f(a);
	};
}
Reflect.prototype.__class__ = Reflect;
gridbee.worksource.boinc.reply.FileInfo = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("name")) this.name = node.node.resolve("name").getInnerData();
	this.generated_locally = node.hasNode.resolve("generated_locally");
	this.upload_when_present = node.hasNode.resolve("upload_when_present");
	this.executable = node.hasNode.resolve("executable");
	if(node.hasNode.resolve("nbytes")) this.nbytes = Std.parseInt(node.node.resolve("nbytes").getInnerData());
	if(node.hasNode.resolve("max_nbytes")) this.max_nbytes = Std.parseInt(node.node.resolve("max_nbytes").getInnerData());
	if(node.hasNode.resolve("url")) this.url = node.node.resolve("url").getInnerData();
	if(node.hasNode.resolve("md5_cksum")) this.md5_cksum = node.node.resolve("md5_cksum").getInnerData();
	if(node.hasNode.resolve("xml_signature")) this.xml_signature = node.node.resolve("xml_signature").getInnerData();
	if(node.hasNode.resolve("file_signature")) this.file_signature = node.node.resolve("file_signature").getInnerData();
}
gridbee.worksource.boinc.reply.FileInfo.__name__ = ["gridbee","worksource","boinc","reply","FileInfo"];
gridbee.worksource.boinc.reply.FileInfo.prototype.name = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.generated_locally = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.upload_when_present = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.executable = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.nbytes = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.max_nbytes = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.url = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.md5_cksum = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.xml_signature = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.file_signature = null;
gridbee.worksource.boinc.reply.FileInfo.prototype.__class__ = gridbee.worksource.boinc.reply.FileInfo;
gridbee.core.work.FileStream = function(url,readonly) {
	if( url === $_ ) return;
	this.content = "";
	this.url = url;
	this.readonly = readonly?true:false;
	this.isavailable = url == null;
	this.iserror = url != null;
	this.created = Date.now();
	this.init();
}
gridbee.core.work.FileStream.__name__ = ["gridbee","core","work","FileStream"];
gridbee.core.work.FileStream.prototype.content = null;
gridbee.core.work.FileStream.prototype.created = null;
gridbee.core.work.FileStream.prototype.url = null;
gridbee.core.work.FileStream.prototype.readonly = null;
gridbee.core.work.FileStream.prototype.isavailable = null;
gridbee.core.work.FileStream.prototype.iserror = null;
gridbee.core.work.FileStream.prototype.changed = null;
gridbee.core.work.FileStream.prototype.init = function() {
	if(this.url != null && this.isavailable != true) {
		var req = gridbee.core.net.HTTPRequest.get(this.url).send();
		var self = this;
		req.onComplete.subscribe(function(response) {
			self.content = response.content;
			self.isavailable = true;
		});
		req.onError.subscribe(function(r) {
			self.iserror = true;
		});
	}
	this.changed = false;
}
gridbee.core.work.FileStream.prototype.write = function(s) {
	this.content += s;
	if(!this.readonly) this.changed = true;
}
gridbee.core.work.FileStream.prototype.setContent = function(s) {
	this.content = s;
	if(!this.readonly) this.changed = true;
}
gridbee.core.work.FileStream.prototype.getContent = function() {
	return "" + this.content;
}
gridbee.core.work.FileStream.prototype.getHash = function() {
	return haxe.Md5.encode(this.content);
}
gridbee.core.work.FileStream.prototype.getSize = function() {
	return this.content.length;
}
gridbee.core.work.FileStream.prototype.getCreateDate = function() {
	return this.created;
}
gridbee.core.work.FileStream.prototype.copyFrom = function(stream) {
	this.content = "" + stream.content;
	this.created = stream.created;
	this.changed = true;
}
gridbee.core.work.FileStream.prototype.clear = function() {
	this.content = "";
	this.created = Date.now();
	this.changed = true;
}
gridbee.core.work.FileStream.prototype.isChanged = function() {
	return this.changed;
}
gridbee.core.work.FileStream.prototype.isAvailable = function() {
	return this.isavailable;
}
gridbee.core.work.FileStream.prototype.hxSerialize = function(s) {
	s.serialize(this.created);
	s.serialize(this.readonly);
	s.serialize(this.isavailable);
	if(!this.readonly) s.serialize(this.content);
	s.serialize(this.url);
	this.changed = false;
}
gridbee.core.work.FileStream.prototype.hxUnserialize = function(s) {
	this.created = s.unserialize();
	this.readonly = s.unserialize();
	this.isavailable = s.unserialize();
	if(!this.readonly && this.isavailable) this.content = s.unserialize(); else this.isavailable = false;
	this.url = s.unserialize();
	this.init();
}
gridbee.core.work.FileStream.prototype.__class__ = gridbee.core.work.FileStream;
gridbee.core.work.FileStream.__interfaces__ = [gridbee.core.iface.Persistent];
gridbee.worksource.boinc.webrpc.subclasses.Daemon = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("host")) this.host = input.node.resolve("host").getInnerData();
	if(input.hasNode.resolve("command")) this.command = input.node.resolve("command").getInnerData();
	if(input.hasNode.resolve("status")) this.status = input.node.resolve("status").getInnerData();
}
gridbee.worksource.boinc.webrpc.subclasses.Daemon.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","Daemon"];
gridbee.worksource.boinc.webrpc.subclasses.Daemon.prototype.host = null;
gridbee.worksource.boinc.webrpc.subclasses.Daemon.prototype.command = null;
gridbee.worksource.boinc.webrpc.subclasses.Daemon.prototype.status = null;
gridbee.worksource.boinc.webrpc.subclasses.Daemon.prototype.print = function() {
	haxe.Log.trace("host: " + this.host,{ fileName : "Daemon.hx", lineNumber : 40, className : "gridbee.worksource.boinc.webrpc.subclasses.Daemon", methodName : "print"});
	haxe.Log.trace("command: " + this.command,{ fileName : "Daemon.hx", lineNumber : 41, className : "gridbee.worksource.boinc.webrpc.subclasses.Daemon", methodName : "print"});
	haxe.Log.trace("status: " + this.status,{ fileName : "Daemon.hx", lineNumber : 42, className : "gridbee.worksource.boinc.webrpc.subclasses.Daemon", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.Daemon.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.Daemon;
gridbee.worksource.boinc.webrpc.subclasses.Host = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("id")) this.id = Std.parseInt(input.node.resolve("id").getInnerData());
	if(input.hasNode.resolve("create_time")) this.create_time = Std.parseInt(input.node.resolve("create_time").getInnerData());
	if(input.hasNode.resolve("rpc_seqno")) this.rpc_seqno = Std.parseInt(input.node.resolve("rpc_seqno").getInnerData());
	if(input.hasNode.resolve("host_cpid")) this.host_cpid = input.node.resolve("host_cpid").getInnerData();
	if(input.hasNode.resolve("total_credit")) this.total_credit = Std.parseFloat(input.node.resolve("total_credit").getInnerData());
	if(input.hasNode.resolve("expavg_credit")) this.expavg_credit = Std.parseFloat(input.node.resolve("expavg_credit").getInnerData());
	if(input.hasNode.resolve("expavg_time")) this.expavg_time = Std.parseFloat(input.node.resolve("expavg_time").getInnerData());
	if(input.hasNode.resolve("domain_name")) this.domain_name = input.node.resolve("domain_name").getInnerData();
	if(input.hasNode.resolve("p_ncpus")) this.p_ncpus = Std.parseInt(input.node.resolve("p_ncpus").getInnerData());
	if(input.hasNode.resolve("p_vendor")) this.p_vendor = input.node.resolve("p_vendor").getInnerData();
	if(input.hasNode.resolve("p_model")) this.p_model = input.node.resolve("p_model").getInnerData();
	if(input.hasNode.resolve("p_fpops")) this.p_fpops = Std.parseFloat(input.node.resolve("p_fpops").getInnerData());
	if(input.hasNode.resolve("p_iops")) this.p_iops = Std.parseFloat(input.node.resolve("p_iops").getInnerData());
	if(input.hasNode.resolve("os_name")) this.os_name = input.node.resolve("os_name").getInnerData();
	if(input.hasNode.resolve("os_version")) this.os_version = input.node.resolve("os_version").getInnerData();
}
gridbee.worksource.boinc.webrpc.subclasses.Host.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","Host"];
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.id = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.create_time = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.rpc_seqno = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.host_cpid = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.total_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.expavg_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.expavg_time = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.domain_name = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.p_ncpus = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.p_vendor = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.p_model = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.p_fpops = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.p_iops = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.os_name = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.os_version = null;
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.print = function() {
	haxe.Log.trace("id: " + this.id,{ fileName : "Host.hx", lineNumber : 76, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("create_time: " + this.create_time,{ fileName : "Host.hx", lineNumber : 77, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("rpc_seqno: " + this.rpc_seqno,{ fileName : "Host.hx", lineNumber : 78, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("host_cpid: " + this.host_cpid,{ fileName : "Host.hx", lineNumber : 79, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("total_credit: " + this.total_credit,{ fileName : "Host.hx", lineNumber : 80, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("expavg_credit: " + this.expavg_credit,{ fileName : "Host.hx", lineNumber : 81, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("expavg_time: " + this.expavg_time,{ fileName : "Host.hx", lineNumber : 82, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("domain_name: " + this.domain_name,{ fileName : "Host.hx", lineNumber : 83, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("p_ncpus: " + this.p_ncpus,{ fileName : "Host.hx", lineNumber : 84, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("p_vendor: " + this.p_vendor,{ fileName : "Host.hx", lineNumber : 85, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("p_model: " + this.p_model,{ fileName : "Host.hx", lineNumber : 86, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("p_fpops: " + this.p_fpops,{ fileName : "Host.hx", lineNumber : 87, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("p_iops: " + this.p_iops,{ fileName : "Host.hx", lineNumber : 88, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("os_name: " + this.os_name,{ fileName : "Host.hx", lineNumber : 89, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
	haxe.Log.trace("os_version: " + this.os_version,{ fileName : "Host.hx", lineNumber : 90, className : "gridbee.worksource.boinc.webrpc.subclasses.Host", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.Host.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.Host;
gridbee.core.work.hxjson2.JSONToken = function(type,value) {
	if( type === $_ ) return;
	this.type = type == null?gridbee.core.work.hxjson2.JSONTokenType.tUNKNOWN:type;
	this.value = value;
}
gridbee.core.work.hxjson2.JSONToken.__name__ = ["gridbee","core","work","hxjson2","JSONToken"];
gridbee.core.work.hxjson2.JSONToken.prototype.type = null;
gridbee.core.work.hxjson2.JSONToken.prototype.value = null;
gridbee.core.work.hxjson2.JSONToken.prototype.__class__ = gridbee.core.work.hxjson2.JSONToken;
Lambda = function() { }
Lambda.__name__ = ["Lambda"];
Lambda.array = function(it) {
	var a = new Array();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		a.push(i);
	}
	return a;
}
Lambda.list = function(it) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var i = $it0.next();
		l.add(i);
	}
	return l;
}
Lambda.map = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(f(x));
	}
	return l;
}
Lambda.mapi = function(it,f) {
	var l = new List();
	var i = 0;
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(f(i++,x));
	}
	return l;
}
Lambda.has = function(it,elt,cmp) {
	if(cmp == null) {
		var $it0 = it.iterator();
		while( $it0.hasNext() ) {
			var x = $it0.next();
			if(x == elt) return true;
		}
	} else {
		var $it1 = it.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(cmp(x,elt)) return true;
		}
	}
	return false;
}
Lambda.exists = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) return true;
	}
	return false;
}
Lambda.foreach = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(!f(x)) return false;
	}
	return true;
}
Lambda.iter = function(it,f) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		f(x);
	}
}
Lambda.filter = function(it,f) {
	var l = new List();
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(f(x)) l.add(x);
	}
	return l;
}
Lambda.fold = function(it,f,first) {
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		first = f(x,first);
	}
	return first;
}
Lambda.count = function(it,pred) {
	var n = 0;
	if(pred == null) {
		var $it0 = it.iterator();
		while( $it0.hasNext() ) {
			var _ = $it0.next();
			n++;
		}
	} else {
		var $it1 = it.iterator();
		while( $it1.hasNext() ) {
			var x = $it1.next();
			if(pred(x)) n++;
		}
	}
	return n;
}
Lambda.empty = function(it) {
	return !it.iterator().hasNext();
}
Lambda.indexOf = function(it,v) {
	var i = 0;
	var $it0 = it.iterator();
	while( $it0.hasNext() ) {
		var v2 = $it0.next();
		if(v == v2) return i;
		i++;
	}
	return -1;
}
Lambda.concat = function(a,b) {
	var l = new List();
	var $it0 = a.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(x);
	}
	var $it1 = b.iterator();
	while( $it1.hasNext() ) {
		var x = $it1.next();
		l.add(x);
	}
	return l;
}
Lambda.prototype.__class__ = Lambda;
gridbee.worksource.boinc.webrpc.result.CreateTeamRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("teamid")) this.teamid = Std.parseInt(input.node.resolve("teamid").getInnerData());
}
gridbee.worksource.boinc.webrpc.result.CreateTeamRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","CreateTeamRes"];
gridbee.worksource.boinc.webrpc.result.CreateTeamRes.prototype.teamid = null;
gridbee.worksource.boinc.webrpc.result.CreateTeamRes.prototype.print = function() {
	haxe.Log.trace("teamid: " + this.teamid,{ fileName : "CreateTeamRes.hx", lineNumber : 32, className : "gridbee.worksource.boinc.webrpc.result.CreateTeamRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.CreateTeamRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.CreateTeamRes;
gridbee.core.net.Downloader = function(p) {
	if( p === $_ ) return;
	this.urls = new Array();
	this.dlurls = new Array();
	this.requests = new Array();
	this.data = new Hash();
}
gridbee.core.net.Downloader.__name__ = ["gridbee","core","net","Downloader"];
gridbee.core.net.Downloader.databank = null;
gridbee.core.net.Downloader.prototype.urls = null;
gridbee.core.net.Downloader.prototype.dlurls = null;
gridbee.core.net.Downloader.prototype.requests = null;
gridbee.core.net.Downloader.prototype.data = null;
gridbee.core.net.Downloader.prototype.result = null;
gridbee.core.net.Downloader.prototype.add = function(url) {
	this.urls.push(url);
	henkolib.log.Console.main.logInformation("Downloading: " + url,null,null,{ fileName : "Downloader.hx", lineNumber : 58, className : "gridbee.core.net.Downloader", methodName : "add"});
}
gridbee.core.net.Downloader.prototype.downloadAll = function() {
	var self = this;
	this.result = new henkolib.async.AsyncOperation();
	var _g = 0, _g1 = this.urls;
	while(_g < _g1.length) {
		var url = _g1[_g];
		++_g;
		if(gridbee.core.net.Downloader.databank.exists(url)) this.data.set(url,gridbee.core.net.Downloader.databank.get(url)); else this.dlurls.push(url);
	}
	if(this.dlurls.length == 0) this.result.setResult(self.data);
	var _g = 0, _g1 = this.dlurls;
	while(_g < _g1.length) {
		var url = [_g1[_g]];
		++_g;
		var req = gridbee.core.net.HTTPRequest.get(url[0]).send();
		req.onComplete.subscribe((function(url) {
			return function(response) {
				var fs = new gridbee.core.work.FileStream();
				fs.write(response.content);
				self.data.set(url[0],fs);
				var _g2 = 0, _g3 = self.requests;
				while(_g2 < _g3.length) {
					var r = _g3[_g2];
					++_g2;
					if(r.isCompleted() == false) return;
				}
				self.result.setResult(self.data);
			};
		})(url));
		req.onError.subscribe((function() {
			return function(error) {
				self.result.setError(error);
			};
		})());
		req.onProgress.subscribe((function() {
			return function(progress) {
				var sum = 0;
				var _g2 = 0, _g3 = self.requests;
				while(_g2 < _g3.length) {
					var r = _g3[_g2];
					++_g2;
					sum += r.getProgress();
				}
				self.result.setProgress(sum / self.requests.length);
			};
		})());
		this.requests.push(req);
	}
	return this.result;
}
gridbee.core.net.Downloader.prototype.__class__ = gridbee.core.net.Downloader;
gridbee.worksource.boinc.webrpc.result.LookupAccRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("authenticator")) this.Auth = input.node.resolve("authenticator").getInnerData();
}
gridbee.worksource.boinc.webrpc.result.LookupAccRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","LookupAccRes"];
gridbee.worksource.boinc.webrpc.result.LookupAccRes.prototype.Auth = null;
gridbee.worksource.boinc.webrpc.result.LookupAccRes.prototype.print = function() {
	haxe.Log.trace("authenticator: " + this.Auth,{ fileName : "LookupAccRes.hx", lineNumber : 32, className : "gridbee.worksource.boinc.webrpc.result.LookupAccRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.LookupAccRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.LookupAccRes;
gridbee.core.work.BenchmarkWorkUnit = function(code) {
	if( code === $_ ) return;
	gridbee.core.work.BasicWorkUnit.call(this);
	this.context.setProgramCode(code);
	this.state = gridbee.core.iface.WorkUnitState.Passive;
}
gridbee.core.work.BenchmarkWorkUnit.__name__ = ["gridbee","core","work","BenchmarkWorkUnit"];
gridbee.core.work.BenchmarkWorkUnit.__super__ = gridbee.core.work.BasicWorkUnit;
for(var k in gridbee.core.work.BasicWorkUnit.prototype ) gridbee.core.work.BenchmarkWorkUnit.prototype[k] = gridbee.core.work.BasicWorkUnit.prototype[k];
gridbee.core.work.BenchmarkWorkUnit.prototype.code = null;
gridbee.core.work.BenchmarkWorkUnit.prototype.__class__ = gridbee.core.work.BenchmarkWorkUnit;
gridbee.worksource.boinc.webrpc.result.LookupTeamsRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("team")) {
		this.teams_arr = new Array();
		var $it0 = input.nodes.resolve("team").iterator();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			this.teams_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.Team(i));
		}
	} else if(input.getName() == "team") {
		this.teams_arr = new Array();
		this.teams_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.Team(input));
	}
}
gridbee.worksource.boinc.webrpc.result.LookupTeamsRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","LookupTeamsRes"];
gridbee.worksource.boinc.webrpc.result.LookupTeamsRes.prototype.teams_arr = null;
gridbee.worksource.boinc.webrpc.result.LookupTeamsRes.prototype.print = function() {
	haxe.Log.trace("Print first team:",{ fileName : "LookupTeamsRes.hx", lineNumber : 44, className : "gridbee.worksource.boinc.webrpc.result.LookupTeamsRes", methodName : "print"});
	this.teams_arr[0].print();
}
gridbee.worksource.boinc.webrpc.result.LookupTeamsRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.LookupTeamsRes;
gridbee.core.work.hxjson2.JSONParseError = function(message,location,text) {
	if( message === $_ ) return;
	if(text == null) text = "";
	if(location == null) location = 0;
	if(message == null) message = "";
	this.name = "JSONParseError";
	this._location = location;
	this._text = text;
	this.message = message;
}
gridbee.core.work.hxjson2.JSONParseError.__name__ = ["gridbee","core","work","hxjson2","JSONParseError"];
gridbee.core.work.hxjson2.JSONParseError.prototype._location = null;
gridbee.core.work.hxjson2.JSONParseError.prototype._text = null;
gridbee.core.work.hxjson2.JSONParseError.prototype.name = null;
gridbee.core.work.hxjson2.JSONParseError.prototype.text = null;
gridbee.core.work.hxjson2.JSONParseError.prototype.location = null;
gridbee.core.work.hxjson2.JSONParseError.prototype.message = null;
gridbee.core.work.hxjson2.JSONParseError.prototype.getlocation = function() {
	return this._location;
}
gridbee.core.work.hxjson2.JSONParseError.prototype.gettext = function() {
	return this._text;
}
gridbee.core.work.hxjson2.JSONParseError.prototype.toString = function() {
	return this.name + ": " + this.message + " at position: " + this._location + " near \"" + this._text + "\"";
}
gridbee.core.work.hxjson2.JSONParseError.prototype.__class__ = gridbee.core.work.hxjson2.JSONParseError;
if(!gridbee.core.control) gridbee.core.control = {}
gridbee.core.control.Client = function(savepath) {
	if( savepath === $_ ) return;
	this.timer = null;
	this.savepath = savepath;
	this.onLog = henkolib.log.Console.main.onLog;
	this.restore();
}
gridbee.core.control.Client.__name__ = ["gridbee","core","control","Client"];
gridbee.core.control.Client.prototype.timer = null;
gridbee.core.control.Client.prototype.worksourcepool = null;
gridbee.core.control.Client.prototype.savepath = null;
gridbee.core.control.Client.prototype.webrpc = null;
gridbee.core.control.Client.prototype.onLog = null;
gridbee.core.control.Client.prototype.start = function(ms) {
	if(ms == null) ms = 2000;
	this.timer = new haxe.Timer(ms);
	this.timer.run = $closure(this,"onrun");
}
gridbee.core.control.Client.prototype.stop = function() {
	this.terminate();
}
gridbee.core.control.Client.prototype.terminate = function() {
	if(this.timer != null) {
		this.worksourcepool.terminate();
		this.timer.stop();
		this.timer = null;
	}
}
gridbee.core.control.Client.prototype.CreateBoincWebRPCHandler = function(projecturl) {
	this.webrpc = new gridbee.worksource.boinc.webrpc.BoincWebRPC(projecturl);
	return this.webrpc;
}
gridbee.core.control.Client.prototype.setThreadNumber = function(n) {
	this.worksourcepool.setTargetActive(n);
}
gridbee.core.control.Client.prototype.getThreadNumber = function() {
	return this.worksourcepool.getTargetActive();
}
gridbee.core.control.Client.prototype.onrun = function() {
	this.worksourcepool.operate();
	if(this.worksourcepool.isChanged()) this.save();
}
gridbee.core.control.Client.prototype.addWorksource = function(worksource) {
	this.worksourcepool.addWorkSource(worksource);
	this.save();
}
gridbee.core.control.Client.prototype.removeWorksource = function(worksource) {
	this.worksourcepool.removeWorkSource(worksource);
	this.save();
}
gridbee.core.control.Client.prototype.getWorksources = function() {
	return this.worksourcepool.getWorkSources();
}
gridbee.core.control.Client.prototype.addBoincWorkSource = function(scheduler_url,authkey) {
	this.worksourcepool.addWorkSource(new gridbee.worksource.boinc.BoincWorkSource(scheduler_url,authkey));
	this.save();
}
gridbee.core.control.Client.prototype.setTargetActive = function(num) {
	this.worksourcepool.setTargetActive(num);
	this.save();
}
gridbee.core.control.Client.prototype.save = function() {
	haxe.Serializer.USE_CACHE = true;
	var str = haxe.Serializer.run(this.worksourcepool);
	localStorage.setItem(this.savepath,str);
}
gridbee.core.control.Client.prototype.restore = function() {
	try {
		var string = localStorage.getItem(this.savepath);
		if(string == null || string == "") {
			this.worksourcepool = new gridbee.core.work.WorkSourcePool();
			henkolib.log.Console.main.logWarning("Client is not installed in this browser yet. Installing new settings.",null,null,{ fileName : "Client.hx", lineNumber : 146, className : "gridbee.core.control.Client", methodName : "restore"});
		} else {
			this.worksourcepool = (function($this) {
				var $r;
				var $t = haxe.Unserializer.run(string);
				if(Std["is"]($t,gridbee.core.work.WorkSourcePool)) $t; else throw "Class cast error";
				$r = $t;
				return $r;
			}(this));
			henkolib.log.Console.main.logNotice("Loaded last settings from LocalStorage.",null,null,{ fileName : "Client.hx", lineNumber : 151, className : "gridbee.core.control.Client", methodName : "restore"});
		}
	} catch( e ) {
		this.worksourcepool = new gridbee.core.work.WorkSourcePool();
		this.save();
		henkolib.log.Console.main.logError("Could not load from LocalStorage! Invalid data found! Installing new settings.",null,null,{ fileName : "Client.hx", lineNumber : 157, className : "gridbee.core.control.Client", methodName : "restore"});
	}
}
gridbee.core.control.Client.prototype.__class__ = gridbee.core.control.Client;
gridbee.core.work.WorkContext = function(p) {
	if( p === $_ ) return;
	this.files = new Hash();
	this.created = Date.now();
	this.console = new henkolib.log.Console(0,henkolib.log.LogLevel.L5_Debug);
	this.worktime = 0;
	this.exitstatus = 0;
	this.completed = false;
	this.platform = "";
	this.init();
}
gridbee.core.work.WorkContext.__name__ = ["gridbee","core","work","WorkContext"];
gridbee.core.work.WorkContext.prototype.program = null;
gridbee.core.work.WorkContext.prototype.files = null;
gridbee.core.work.WorkContext.prototype.checkpointdata = null;
gridbee.core.work.WorkContext.prototype.progress = null;
gridbee.core.work.WorkContext.prototype.console = null;
gridbee.core.work.WorkContext.prototype.created = null;
gridbee.core.work.WorkContext.prototype.worktime = null;
gridbee.core.work.WorkContext.prototype.exitstatus = null;
gridbee.core.work.WorkContext.prototype.completed = null;
gridbee.core.work.WorkContext.prototype.platform = null;
gridbee.core.work.WorkContext.prototype.changed = null;
gridbee.core.work.WorkContext.prototype.init = function() {
	this.changed = false;
	this.console.setParent(henkolib.log.Console.main);
}
gridbee.core.work.WorkContext.prototype.isAvailable = function() {
	var $it0 = this.files.iterator();
	while( $it0.hasNext() ) {
		var f = $it0.next();
		if(f.isAvailable() == false) return false;
	}
	return true;
}
gridbee.core.work.WorkContext.prototype.addFile = function(name,fs) {
	if(this.completed) return;
	if(this.files.exists(name)) this.files.remove(name);
	this.files.set(name,fs);
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.write = function(name,s) {
	if(this.completed) return;
	if(this.files.exists(name)) this.files.get(name).write(s); else {
		var stream = new gridbee.core.work.FileStream();
		stream.write(s);
		this.files.set(name,stream);
	}
}
gridbee.core.work.WorkContext.prototype.read = function(name) {
	if(this.files.exists(name)) return this.files.get(name).getContent(); else return "";
}
gridbee.core.work.WorkContext.prototype.clear = function(name) {
	if(this.completed) return;
	if(this.files.exists(name)) this.files.get(name).clear(); else {
		var stream = new gridbee.core.work.FileStream();
		this.files.set(name,stream);
	}
}
gridbee.core.work.WorkContext.prototype.setPlatform = function(p) {
	this.platform = p;
}
gridbee.core.work.WorkContext.prototype.setCheckpoint = function(data) {
	if(this.completed) return;
	this.checkpointdata = data;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.getCheckpoint = function() {
	return this.checkpointdata;
}
gridbee.core.work.WorkContext.prototype.getPlatform = function() {
	return this.platform;
}
gridbee.core.work.WorkContext.prototype.getCreatedDate = function() {
	return this.created;
}
gridbee.core.work.WorkContext.prototype.setProgress = function(progress) {
	if(this.completed) return;
	this.progress = progress;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.getProgress = function() {
	return this.progress;
}
gridbee.core.work.WorkContext.prototype.setProgram = function(program) {
	if(this.completed) return;
	this.program = program;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.setProgramCode = function(program) {
	if(this.completed) return;
	var fs = new gridbee.core.work.FileStream();
	fs.setContent(program);
	this.program = fs;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.getProgramCode = function() {
	return this.program.getContent();
}
gridbee.core.work.WorkContext.prototype.getFileList = function() {
	var list = new Array();
	var $it0 = this.files.keys();
	while( $it0.hasNext() ) {
		var key = $it0.next();
		list.push(key);
	}
	return list;
}
gridbee.core.work.WorkContext.prototype.log = function(level,message,data,source,pos) {
	if(this.completed) return;
	this.console.log(level,message,data,source,pos);
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.addWorktime = function(time) {
	if(this.completed) return;
	this.worktime += time;
}
gridbee.core.work.WorkContext.prototype.getWorktime = function() {
	return this.worktime;
}
gridbee.core.work.WorkContext.prototype.setExitStatus = function(status) {
	if(this.completed) return;
	this.exitstatus = status;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.getExitStatus = function() {
	return this.exitstatus;
}
gridbee.core.work.WorkContext.prototype.isCompleted = function() {
	return this.completed;
}
gridbee.core.work.WorkContext.prototype.setCompleted = function() {
	this.completed = true;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.copyFrom = function(context) {
	this.program = context.program;
	this.files = new Hash();
	var $it0 = context.files.keys();
	while( $it0.hasNext() ) {
		var name = $it0.next();
		this.write(name,context.files.get(name).getContent());
	}
	this.checkpointdata = context.checkpointdata;
	this.progress = context.progress;
	this.created = context.created;
	this.console = new henkolib.log.Console(0,henkolib.log.LogLevel.L5_Debug);
	this.console.copyFrom(context.console);
	this.worktime = context.worktime;
	this.exitstatus = context.exitstatus;
	this.completed = context.completed;
	this.changed = true;
}
gridbee.core.work.WorkContext.prototype.isChanged = function() {
	var $it0 = this.files.iterator();
	while( $it0.hasNext() ) {
		var file = $it0.next();
		if(file.isChanged()) this.changed = true;
	}
	return true;
}
gridbee.core.work.WorkContext.prototype.getLogNoticeText = function() {
	return this.console.exportAsText(0,henkolib.log.LogLevel.L3_Notice);
}
gridbee.core.work.WorkContext.prototype.hxSerialize = function(s) {
	s.serialize(this.program);
	s.serialize(this.files);
	s.serialize(this.checkpointdata);
	s.serialize(this.progress);
	s.serialize(this.created);
	s.serialize(this.console);
	s.serialize(this.worktime);
	s.serialize(this.exitstatus);
	s.serialize(this.completed);
	s.serialize(this.platform);
	this.changed = false;
}
gridbee.core.work.WorkContext.prototype.hxUnserialize = function(s) {
	this.program = s.unserialize();
	this.files = s.unserialize();
	this.checkpointdata = s.unserialize();
	this.progress = s.unserialize();
	this.created = s.unserialize();
	this.console = s.unserialize();
	this.worktime = s.unserialize();
	this.exitstatus = s.unserialize();
	this.completed = s.unserialize();
	this.platform = s.unserialize();
	this.init();
}
gridbee.core.work.WorkContext.prototype.__class__ = gridbee.core.work.WorkContext;
gridbee.core.work.WorkContext.__interfaces__ = [gridbee.core.iface.Persistent];
StringBuf = function(p) {
	if( p === $_ ) return;
	this.b = new Array();
}
StringBuf.__name__ = ["StringBuf"];
StringBuf.prototype.add = function(x) {
	this.b[this.b.length] = x == null?"null":x;
}
StringBuf.prototype.addSub = function(s,pos,len) {
	this.b[this.b.length] = s.substr(pos,len);
}
StringBuf.prototype.addChar = function(c) {
	this.b[this.b.length] = String.fromCharCode(c);
}
StringBuf.prototype.toString = function() {
	return this.b.join("");
}
StringBuf.prototype.b = null;
StringBuf.prototype.__class__ = StringBuf;
haxe.Log = function() { }
haxe.Log.__name__ = ["haxe","Log"];
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
}
haxe.Log.clear = function() {
	js.Boot.__clear_trace();
}
haxe.Log.prototype.__class__ = haxe.Log;
gridbee.worksource.boinc.BoincWorkUnit = function(unit,platform) {
	if( unit === $_ ) return;
	if(platform == null) platform = "";
	this.unitinfo = unit;
	this.readytoreport = false;
	this.filesdownloaded = false;
	gridbee.core.work.BasicWorkUnit.call(this,platform);
}
gridbee.worksource.boinc.BoincWorkUnit.__name__ = ["gridbee","worksource","boinc","BoincWorkUnit"];
gridbee.worksource.boinc.BoincWorkUnit.__super__ = gridbee.core.work.BasicWorkUnit;
for(var k in gridbee.core.work.BasicWorkUnit.prototype ) gridbee.worksource.boinc.BoincWorkUnit.prototype[k] = gridbee.core.work.BasicWorkUnit.prototype[k];
gridbee.worksource.boinc.BoincWorkUnit.prototype.unitinfo = null;
gridbee.worksource.boinc.BoincWorkUnit.prototype.readytoreport = null;
gridbee.worksource.boinc.BoincWorkUnit.prototype.boincresult = null;
gridbee.worksource.boinc.BoincWorkUnit.prototype.uploader = null;
gridbee.worksource.boinc.BoincWorkUnit.prototype.boincboincresults = null;
gridbee.worksource.boinc.BoincWorkUnit.prototype.filesdownloaded = null;
gridbee.worksource.boinc.BoincWorkUnit.prototype.init = function() {
	gridbee.core.work.BasicWorkUnit.prototype.init.call(this);
	this.boincresult = new gridbee.worksource.boinc.request.Result();
	this.boincresult.name = this.unitinfo.result.name;
	this.boincresult.platform = this.unitinfo.application.version.platform;
	this.boincresult.version_num = this.unitinfo.result.version_num;
	this.boincresult.app_version_num = this.unitinfo.application.version.version_num;
	var self = this;
	if(!this.filesdownloaded) this.download();
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.download = function() {
	this.boincresult.state = 1;
	var downloader = new gridbee.core.net.Downloader();
	if(this.context.getPlatform() == "nacl") {
		var _g = 0, _g1 = this.unitinfo.file_ref;
		while(_g < _g1.length) {
			var data = _g1[_g];
			++_g;
			if(data.file_info.url.substr(-5) != ".nexe" && data.file_info.url.substr(-4) != ".nmf") downloader.add(data.file_info.url);
		}
		this.context.setProgramCode(this.unitinfo.application.version.main_program.file_info.url);
	} else {
		var _g = 0, _g1 = this.unitinfo.file_ref;
		while(_g < _g1.length) {
			var data = _g1[_g];
			++_g;
			downloader.add(data.file_info.url);
		}
		downloader.add(this.unitinfo.application.version.main_program.file_info.url);
	}
	this.onlog.invoke(new henkolib.log.LogEntry(null,henkolib.log.LogLevel.L5_Debug,"Downloading input files",null,null));
	var dlresult = downloader.downloadAll();
	var self = this;
	dlresult.onComplete.subscribe(function(files) {
		var $it0 = files.keys();
		while( $it0.hasNext() ) {
			var url = $it0.next();
			if(url == self.unitinfo.application.version.main_program.file_info.url) self.context.setProgram(files.get(url)); else {
				var _g = 0, _g1 = self.unitinfo.file_ref;
				while(_g < _g1.length) {
					var file = _g1[_g];
					++_g;
					if(file.file_info.url == url) self.context.addFile(file.open_name,files.get(url));
				}
			}
		}
		self.boincresult.state = 2;
		self.filesdownloaded = true;
		self.onlog.invoke(new henkolib.log.LogEntry(null,henkolib.log.LogLevel.L5_Debug,"Download successfully finished",null,null));
		self.SwitchState(gridbee.core.iface.WorkUnitState.Passive);
	});
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.operate = function() {
	gridbee.core.work.BasicWorkUnit.prototype.operate.call(this);
	if(this.uploader != null) this.uploader.operate();
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.setUploadingState = function() {
	this.boincresult.state = 4;
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.setUploadedState = function(br) {
	this.boincboincresults = br;
	this.boincresult.state = 5;
	var _g = 0, _g1 = this.boincboincresults;
	while(_g < _g1.length) {
		var r = _g1[_g];
		++_g;
		this.boincresult.file_info.push(r.getFileInfo());
	}
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.getResultState = function() {
	return this.boincresult.state;
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.setResultState = function(s) {
	this.boincresult.state = s;
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.getBoincResult = function() {
	return this.boincresult;
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.getUnitinfo = function() {
	return this.unitinfo;
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.getWorkUnitResultName = function() {
	return this.unitinfo.result.name;
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.getScreenName = function() {
	return "BOINC workunit (" + this.unitinfo.app_name + ", " + this.unitinfo.result.name + ")";
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.hxSerialize = function(s) {
	s.serialize(this.unitinfo);
	s.serialize(this.readytoreport);
	s.serialize(this.filesdownloaded);
	gridbee.core.work.BasicWorkUnit.prototype.hxSerialize.call(this,s);
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.hxUnserialize = function(s) {
	this.unitinfo = s.unserialize();
	this.readytoreport = s.unserialize();
	this.filesdownloaded = s.unserialize();
	gridbee.core.work.BasicWorkUnit.prototype.hxUnserialize.call(this,s);
	this.init();
}
gridbee.worksource.boinc.BoincWorkUnit.prototype.__class__ = gridbee.worksource.boinc.BoincWorkUnit;
gridbee.js.JSWorker = function(filename) {
	if( filename === $_ ) return;
	this.ww = new gridbee.js.WebWorker(filename);
}
gridbee.js.JSWorker.__name__ = ["gridbee","js","JSWorker"];
gridbee.js.JSWorker.prototype.ww = null;
gridbee.js.JSWorker.prototype.addEventListener = function(type,listener,useCapture) {
	if(useCapture == null) useCapture = false;
	this.ww.addEventListener(type,listener,useCapture);
}
gridbee.js.JSWorker.prototype.removeEventListener = function(type,listener,useCapture) {
	if(useCapture == null) useCapture = false;
	this.ww.removeEventListener(type,listener,useCapture);
}
gridbee.js.JSWorker.prototype.dispatchEvent = function(event) {
	return this.ww.dispatchEvent(event);
}
gridbee.js.JSWorker.prototype.setOnmessage = function(func) {
	this.ww.onmessage = func;
}
gridbee.js.JSWorker.prototype.setOnerror = function(func) {
	this.ww.onerror = func;
}
gridbee.js.JSWorker.prototype.postMessage = function(message) {
	this.ww.postMessage(message);
}
gridbee.js.JSWorker.prototype.terminate = function() {
	this.ww.terminate();
}
gridbee.js.JSWorker.prototype.__class__ = gridbee.js.JSWorker;
gridbee.js.JSWorker.__interfaces__ = [gridbee.core.iface.Worker];
haxe.Serializer = function(p) {
	if( p === $_ ) return;
	this.buf = new StringBuf();
	this.cache = new Array();
	this.useCache = haxe.Serializer.USE_CACHE;
	this.useEnumIndex = haxe.Serializer.USE_ENUM_INDEX;
	this.shash = new Hash();
	this.scount = 0;
}
haxe.Serializer.__name__ = ["haxe","Serializer"];
haxe.Serializer.run = function(v) {
	var s = new haxe.Serializer();
	s.serialize(v);
	return s.toString();
}
haxe.Serializer.prototype.buf = null;
haxe.Serializer.prototype.cache = null;
haxe.Serializer.prototype.shash = null;
haxe.Serializer.prototype.scount = null;
haxe.Serializer.prototype.useCache = null;
haxe.Serializer.prototype.useEnumIndex = null;
haxe.Serializer.prototype.toString = function() {
	return this.buf.b.join("");
}
haxe.Serializer.prototype.serializeString = function(s) {
	var x = this.shash.get(s);
	if(x != null) {
		this.buf.add("R");
		this.buf.add(x);
		return;
	}
	this.shash.set(s,this.scount++);
	this.buf.add("y");
	s = StringTools.urlEncode(s);
	this.buf.add(s.length);
	this.buf.add(":");
	this.buf.add(s);
}
haxe.Serializer.prototype.serializeRef = function(v) {
	var vt = typeof(v);
	var _g1 = 0, _g = this.cache.length;
	while(_g1 < _g) {
		var i = _g1++;
		var ci = this.cache[i];
		if(typeof(ci) == vt && ci == v) {
			this.buf.add("r");
			this.buf.add(i);
			return true;
		}
	}
	this.cache.push(v);
	return false;
}
haxe.Serializer.prototype.serializeFields = function(v) {
	var _g = 0, _g1 = Reflect.fields(v);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		this.serializeString(f);
		this.serialize(Reflect.field(v,f));
	}
	this.buf.add("g");
}
haxe.Serializer.prototype.serialize = function(v) {
	var $e = (Type["typeof"](v));
	switch( $e[1] ) {
	case 0:
		this.buf.add("n");
		break;
	case 1:
		if(v == 0) {
			this.buf.add("z");
			return;
		}
		this.buf.add("i");
		this.buf.add(v);
		break;
	case 2:
		if(Math.isNaN(v)) this.buf.add("k"); else if(!Math.isFinite(v)) this.buf.add(v < 0?"m":"p"); else {
			this.buf.add("d");
			this.buf.add(v);
		}
		break;
	case 3:
		this.buf.add(v?"t":"f");
		break;
	case 6:
		var c = $e[2];
		if(c == String) {
			this.serializeString(v);
			return;
		}
		if(this.useCache && this.serializeRef(v)) return;
		switch(c) {
		case Array:
			var ucount = 0;
			this.buf.add("a");
			var l = v["length"];
			var _g = 0;
			while(_g < l) {
				var i = _g++;
				if(v[i] == null) ucount++; else {
					if(ucount > 0) {
						if(ucount == 1) this.buf.add("n"); else {
							this.buf.add("u");
							this.buf.add(ucount);
						}
						ucount = 0;
					}
					this.serialize(v[i]);
				}
			}
			if(ucount > 0) {
				if(ucount == 1) this.buf.add("n"); else {
					this.buf.add("u");
					this.buf.add(ucount);
				}
			}
			this.buf.add("h");
			break;
		case List:
			this.buf.add("l");
			var v1 = v;
			var $it0 = v1.iterator();
			while( $it0.hasNext() ) {
				var i = $it0.next();
				this.serialize(i);
			}
			this.buf.add("h");
			break;
		case Date:
			var d = v;
			this.buf.add("v");
			this.buf.add(d.toString());
			break;
		case Hash:
			this.buf.add("b");
			var v1 = v;
			var $it1 = v1.keys();
			while( $it1.hasNext() ) {
				var k = $it1.next();
				this.serializeString(k);
				this.serialize(v1.get(k));
			}
			this.buf.add("h");
			break;
		case IntHash:
			this.buf.add("q");
			var v1 = v;
			var $it2 = v1.keys();
			while( $it2.hasNext() ) {
				var k = $it2.next();
				this.buf.add(":");
				this.buf.add(k);
				this.serialize(v1.get(k));
			}
			this.buf.add("h");
			break;
		case haxe.io.Bytes:
			var v1 = v;
			var i = 0;
			var max = v1.length - 2;
			var chars = "";
			var b64 = haxe.Serializer.BASE64;
			while(i < max) {
				var b1 = v1.b[i++];
				var b2 = v1.b[i++];
				var b3 = v1.b[i++];
				chars += b64.charAt(b1 >> 2) + b64.charAt((b1 << 4 | b2 >> 4) & 63) + b64.charAt((b2 << 2 | b3 >> 6) & 63) + b64.charAt(b3 & 63);
			}
			if(i == max) {
				var b1 = v1.b[i++];
				var b2 = v1.b[i++];
				chars += b64.charAt(b1 >> 2) + b64.charAt((b1 << 4 | b2 >> 4) & 63) + b64.charAt(b2 << 2 & 63);
			} else if(i == max + 1) {
				var b1 = v1.b[i++];
				chars += b64.charAt(b1 >> 2) + b64.charAt(b1 << 4 & 63);
			}
			this.buf.add("s");
			this.buf.add(chars.length);
			this.buf.add(":");
			this.buf.add(chars);
			break;
		default:
			this.cache.pop();
			if(v.hxSerialize != null) {
				this.buf.add("C");
				this.serializeString(Type.getClassName(c));
				this.cache.push(v);
				v.hxSerialize(this);
				this.buf.add("g");
			} else {
				this.buf.add("c");
				this.serializeString(Type.getClassName(c));
				this.cache.push(v);
				this.serializeFields(v);
			}
		}
		break;
	case 4:
		if(this.useCache && this.serializeRef(v)) return;
		this.buf.add("o");
		this.serializeFields(v);
		break;
	case 7:
		var e = $e[2];
		if(this.useCache && this.serializeRef(v)) return;
		this.cache.pop();
		this.buf.add(this.useEnumIndex?"j":"w");
		this.serializeString(Type.getEnumName(e));
		if(this.useEnumIndex) {
			this.buf.add(":");
			this.buf.add(v[1]);
		} else this.serializeString(v[0]);
		this.buf.add(":");
		var l = v["length"];
		this.buf.add(l - 2);
		var _g = 2;
		while(_g < l) {
			var i = _g++;
			this.serialize(v[i]);
		}
		this.cache.push(v);
		break;
	case 5:
		throw "Cannot serialize function";
		break;
	default:
		throw "Cannot serialize " + Std.string(v);
	}
}
haxe.Serializer.prototype.serializeException = function(e) {
	this.buf.add("x");
	this.serialize(e);
}
haxe.Serializer.prototype.__class__ = haxe.Serializer;
gridbee.worksource.boinc.request.SchedulerRequest = function(platform) {
	if( platform === $_ ) return;
	this.platform = platform;
	this.results = new Array();
	this.others = new Array();
}
gridbee.worksource.boinc.request.SchedulerRequest.__name__ = ["gridbee","worksource","boinc","request","SchedulerRequest"];
gridbee.worksource.boinc.request.SchedulerRequest.prototype.platform = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.clientversion = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.authinfo = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.host = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.workrequest = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.results = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.others = null;
gridbee.worksource.boinc.request.SchedulerRequest.prototype.setPlatform = function(platform) {
	this.platform = platform;
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.setClientVersion = function(clientversion) {
	this.clientversion = clientversion;
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.setAuthInfo = function(authinfo) {
	this.authinfo = authinfo;
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.setHost = function(host) {
	this.host = host;
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.setWorkRequest = function(workrequest) {
	this.workrequest = workrequest;
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.addResult = function(result) {
	this.results.push(result);
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.addOther = function(data) {
	this.others.push(data);
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = indent + "<scheduler_request>\n";
	var innerindent = indent + "    ";
	if(this.platform != null) xml += innerindent + "<platform_name>" + this.platform + "</platform_name>\n";
	if(this.clientversion != null) xml += this.clientversion.toXmlString(innerindent);
	if(this.authinfo != null) xml += this.authinfo.toXmlString(innerindent);
	if(this.host != null) xml += this.host.toXmlString(innerindent);
	if(this.workrequest != null) xml += this.workrequest.toXmlString(innerindent);
	var _g = 0, _g1 = this.results;
	while(_g < _g1.length) {
		var result = _g1[_g];
		++_g;
		xml += result.toXmlString(innerindent);
	}
	var _g = 0, _g1 = this.others;
	while(_g < _g1.length) {
		var other = _g1[_g];
		++_g;
		xml += other.toXmlString(innerindent);
	}
	xml += indent + "</scheduler_request>\n";
	return xml;
}
gridbee.worksource.boinc.request.SchedulerRequest.prototype.__class__ = gridbee.worksource.boinc.request.SchedulerRequest;
gridbee.worksource.boinc.request.SchedulerRequest.__interfaces__ = [gridbee.worksource.boinc.BoincData];
gridbee.core.iface.WorkUnitState = { __ename__ : ["gridbee","core","iface","WorkUnitState"], __constructs__ : ["Init","Passive","Active","Disabled","Completed"] }
gridbee.core.iface.WorkUnitState.Init = ["Init",0];
gridbee.core.iface.WorkUnitState.Init.toString = $estr;
gridbee.core.iface.WorkUnitState.Init.__enum__ = gridbee.core.iface.WorkUnitState;
gridbee.core.iface.WorkUnitState.Passive = ["Passive",1];
gridbee.core.iface.WorkUnitState.Passive.toString = $estr;
gridbee.core.iface.WorkUnitState.Passive.__enum__ = gridbee.core.iface.WorkUnitState;
gridbee.core.iface.WorkUnitState.Active = ["Active",2];
gridbee.core.iface.WorkUnitState.Active.toString = $estr;
gridbee.core.iface.WorkUnitState.Active.__enum__ = gridbee.core.iface.WorkUnitState;
gridbee.core.iface.WorkUnitState.Disabled = ["Disabled",3];
gridbee.core.iface.WorkUnitState.Disabled.toString = $estr;
gridbee.core.iface.WorkUnitState.Disabled.__enum__ = gridbee.core.iface.WorkUnitState;
gridbee.core.iface.WorkUnitState.Completed = ["Completed",4];
gridbee.core.iface.WorkUnitState.Completed.toString = $estr;
gridbee.core.iface.WorkUnitState.Completed.__enum__ = gridbee.core.iface.WorkUnitState;
gridbee.worksource.boinc.request.AuthInfo = function(p) {
	if( p === $_ ) return;
	this.authenticator = null;
	this.cross_project_id = null;
}
gridbee.worksource.boinc.request.AuthInfo.__name__ = ["gridbee","worksource","boinc","request","AuthInfo"];
gridbee.worksource.boinc.request.AuthInfo.prototype.authenticator = null;
gridbee.worksource.boinc.request.AuthInfo.prototype.cross_project_id = null;
gridbee.worksource.boinc.request.AuthInfo.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = "";
	if(this.authenticator != null) xml += indent + "<authenticator>" + this.authenticator + "</authenticator>\n";
	if(this.cross_project_id != null) xml += indent + "<cross_project_id>" + this.cross_project_id + "</cross_project_id>\n";
	return xml;
}
gridbee.worksource.boinc.request.AuthInfo.prototype.__class__ = gridbee.worksource.boinc.request.AuthInfo;
gridbee.worksource.boinc.request.AuthInfo.__interfaces__ = [gridbee.worksource.boinc.BoincData];
Std = function() { }
Std.__name__ = ["Std"];
Std["is"] = function(v,t) {
	return js.Boot.__instanceof(v,t);
}
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
}
Std["int"] = function(x) {
	if(x < 0) return Math.ceil(x);
	return Math.floor(x);
}
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && x.charCodeAt(1) == 120) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
}
Std.parseFloat = function(x) {
	return parseFloat(x);
}
Std.random = function(x) {
	return Math.floor(Math.random() * x);
}
Std.prototype.__class__ = Std;
EReg = function(r,opt) {
	if( r === $_ ) return;
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
}
EReg.__name__ = ["EReg"];
EReg.prototype.r = null;
EReg.prototype.match = function(s) {
	this.r.m = this.r.exec(s);
	this.r.s = s;
	this.r.l = RegExp.leftContext;
	this.r.r = RegExp.rightContext;
	return this.r.m != null;
}
EReg.prototype.matched = function(n) {
	return this.r.m != null && n >= 0 && n < this.r.m.length?this.r.m[n]:(function($this) {
		var $r;
		throw "EReg::matched";
		return $r;
	}(this));
}
EReg.prototype.matchedLeft = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.l == null) return this.r.s.substr(0,this.r.m.index);
	return this.r.l;
}
EReg.prototype.matchedRight = function() {
	if(this.r.m == null) throw "No string matched";
	if(this.r.r == null) {
		var sz = this.r.m.index + this.r.m[0].length;
		return this.r.s.substr(sz,this.r.s.length - sz);
	}
	return this.r.r;
}
EReg.prototype.matchedPos = function() {
	if(this.r.m == null) throw "No string matched";
	return { pos : this.r.m.index, len : this.r.m[0].length};
}
EReg.prototype.split = function(s) {
	var d = "#__delim__#";
	return s.replace(this.r,d).split(d);
}
EReg.prototype.replace = function(s,by) {
	return s.replace(this.r,by);
}
EReg.prototype.customReplace = function(s,f) {
	var buf = new StringBuf();
	while(true) {
		if(!this.match(s)) break;
		buf.add(this.matchedLeft());
		buf.add(f(this));
		s = this.matchedRight();
	}
	buf.b[buf.b.length] = s == null?"null":s;
	return buf.b.join("");
}
EReg.prototype.__class__ = EReg;
if(!gridbee.core.info) gridbee.core.info = {}
gridbee.core.info.BrowserInfo = function(p) {
}
gridbee.core.info.BrowserInfo.__name__ = ["gridbee","core","info","BrowserInfo"];
gridbee.core.info.BrowserInfo.detectBrowser = function() {
	var success;
	success = gridbee.core.info.BrowserInfo.checkBrowser("Opera Software","Opera",function(navigator) {
		return window.opera ? true : false;
	},new EReg("([0-9]+)\\.([.0-9]+)$",""));
	if(success) return;
	success = gridbee.core.info.BrowserInfo.checkBrowser("Microsoft","Internet Explorer",function(navigator) {
		return navigator.userAgent.indexOf("MSIE") > -1?true:false;
	},new EReg("MSIE (\\d+)\\.(\\d+)",""));
	if(success) return;
	success = gridbee.core.info.BrowserInfo.checkBrowser("Google","Chrome",function(navigator) {
		return navigator.userAgent.indexOf("Chrome") > -1?true:false;
	},new EReg("Chrome/(\\d+)\\.([.0-9]+)",""));
	if(success) return;
	success = gridbee.core.info.BrowserInfo.checkBrowser("Mozilla","Firefox",function(navigator) {
		return navigator.userAgent.indexOf("Firefox") > -1?true:false;
	},new EReg("Firefox/(\\d+)\\.([.0-9]+)",""));
	if(success) return;
}
gridbee.core.info.BrowserInfo.checkBrowser = function(vendor,browser,check,versionRegexp) {
	if(check(js.Lib.window.navigator)) {
		versionRegexp.match(js.Lib.window.navigator.userAgent);
		gridbee.core.info.BrowserInfo.browserVendorValue = vendor;
		gridbee.core.info.BrowserInfo.browserNameValue = browser;
		gridbee.core.info.BrowserInfo.browserMajorVersionValue = Std.parseInt(versionRegexp.matched(1));
		gridbee.core.info.BrowserInfo.browserFullVersionValue = versionRegexp.matched(1) + "." + versionRegexp.matched(2);
		return true;
	}
	return false;
}
gridbee.core.info.BrowserInfo.browserVendor = function() {
	if(gridbee.core.info.BrowserInfo.browserVendorValue == null) gridbee.core.info.BrowserInfo.detectBrowser();
	return gridbee.core.info.BrowserInfo.browserVendorValue;
}
gridbee.core.info.BrowserInfo.browserName = function() {
	if(gridbee.core.info.BrowserInfo.browserNameValue == null) gridbee.core.info.BrowserInfo.detectBrowser();
	return gridbee.core.info.BrowserInfo.browserNameValue;
}
gridbee.core.info.BrowserInfo.browserFullVersion = function() {
	if(gridbee.core.info.BrowserInfo.browserFullVersionValue == null) gridbee.core.info.BrowserInfo.detectBrowser();
	return gridbee.core.info.BrowserInfo.browserFullVersionValue;
}
gridbee.core.info.BrowserInfo.browserMajorVersion = function() {
	if(gridbee.core.info.BrowserInfo.browserMajorVersionValue == null) gridbee.core.info.BrowserInfo.detectBrowser();
	return gridbee.core.info.BrowserInfo.browserMajorVersionValue;
}
gridbee.core.info.BrowserInfo.detectOs = function() {
	var r;
	var navigator = js.Lib.window.navigator;
	var platform = navigator.platform;
	var os = "";
	if(platform.indexOf("Win") > -1) {
		r = new EReg("Windows NT ([.0-9]+)","");
		r.match(navigator.userAgent);
		switch(r.matched(1)) {
		case "6.1":
			os = "Windows 7";
			break;
		case "6.0":
			os = "Windows Vista";
			break;
		case "5.2":
			os = "Windows XP";
			break;
		case "5.1":
			os = "Windows XP";
			break;
		default:
			os = "Windows";
		}
	}
	if(platform.indexOf("Linux") > -1) os = "Linux";
	if(platform.indexOf("Mac") > -1) {
		r = new EReg("Mac OS X [.0-9]","");
		if(r.match(navigator.userAgent)) os = r.matched(0); else os = "Apple";
	}
	gridbee.core.info.BrowserInfo.osPlatformValue = platform;
	gridbee.core.info.BrowserInfo.osNameValue = os;
}
gridbee.core.info.BrowserInfo.osPlatform = function() {
	if(gridbee.core.info.BrowserInfo.osPlatformValue == null) gridbee.core.info.BrowserInfo.detectOs();
	return gridbee.core.info.BrowserInfo.osPlatformValue;
}
gridbee.core.info.BrowserInfo.osName = function() {
	if(gridbee.core.info.BrowserInfo.osNameValue == null) gridbee.core.info.BrowserInfo.detectOs();
	return gridbee.core.info.BrowserInfo.osNameValue;
}
gridbee.core.info.BrowserInfo.detectFlash = function() {
	var flashPlugin = navigator.plugins["Shockwave Flash"];
	if(flashPlugin) {
		gridbee.core.info.BrowserInfo.flashInstalledValue = true;
		var description = navigator.plugins["Shockwave Flash"].description;
		var r = new EReg("Flash ([0-9]+)\\.([.0-9]+)","");
		r.match(description);
		gridbee.core.info.BrowserInfo.flashFullVersionValue = r.matched(1) + "." + r.matched(2);
		gridbee.core.info.BrowserInfo.flashMajorVersionValue = Std.parseInt(r.matched(1));
	} else gridbee.core.info.BrowserInfo.flashInstalledValue = false;
}
gridbee.core.info.BrowserInfo.flashInstalled = function() {
	if(gridbee.core.info.BrowserInfo.flashInstalledValue == null) gridbee.core.info.BrowserInfo.detectFlash();
	return gridbee.core.info.BrowserInfo.flashInstalledValue;
}
gridbee.core.info.BrowserInfo.flashFullVersion = function() {
	if(gridbee.core.info.BrowserInfo.flashFullVersionValue == null) gridbee.core.info.BrowserInfo.detectFlash();
	return gridbee.core.info.BrowserInfo.flashFullVersionValue;
}
gridbee.core.info.BrowserInfo.flashMajorVersion = function() {
	if(gridbee.core.info.BrowserInfo.flashMajorVersionValue == null) gridbee.core.info.BrowserInfo.detectFlash();
	return gridbee.core.info.BrowserInfo.flashMajorVersionValue;
}
gridbee.core.info.BrowserInfo.detectHtml5 = function() {
	gridbee.core.info.BrowserInfo.html5xmlHttpRequestLevel2Value = !!(new XMLHttpRequest()).upload;
	gridbee.core.info.BrowserInfo.html5localStorageValue = !!window.localStorage;
	gridbee.core.info.BrowserInfo.html5webWorkersValue = !!window.Worker;
	gridbee.core.info.BrowserInfo.html5webSocketsValue = !!window.WebSocket;
}
gridbee.core.info.BrowserInfo.html5xmlHttpRequestLevel2 = function() {
	if(gridbee.core.info.BrowserInfo.html5xmlHttpRequestLevel2Value == null) gridbee.core.info.BrowserInfo.detectHtml5();
	return gridbee.core.info.BrowserInfo.html5xmlHttpRequestLevel2Value;
}
gridbee.core.info.BrowserInfo.html5localStorage = function() {
	if(gridbee.core.info.BrowserInfo.html5localStorageValue == null) gridbee.core.info.BrowserInfo.detectHtml5();
	return gridbee.core.info.BrowserInfo.html5localStorageValue;
}
gridbee.core.info.BrowserInfo.html5webWorkers = function() {
	if(gridbee.core.info.BrowserInfo.html5webWorkersValue == null) gridbee.core.info.BrowserInfo.detectHtml5();
	return gridbee.core.info.BrowserInfo.html5webWorkersValue;
}
gridbee.core.info.BrowserInfo.html5webSockets = function() {
	if(gridbee.core.info.BrowserInfo.html5webSocketsValue == null) gridbee.core.info.BrowserInfo.detectHtml5();
	return gridbee.core.info.BrowserInfo.html5webSocketsValue;
}
gridbee.core.info.BrowserInfo.NaCl = function() {
	var testNaclElement = js.Lib.document.createElement("embed");
	testNaclElement.setAttribute("type","application/x-nacl");
	testNaclElement.setAttribute("width",0);
	testNaclElement.setAttribute("height",0);
	js.Lib.document.body.appendChild(testNaclElement);
	var isSupported = testNaclElement.postMessage?true:false;
	js.Lib.document.body.removeChild(testNaclElement);
	return isSupported;
}
gridbee.core.info.BrowserInfo.prototype.__class__ = gridbee.core.info.BrowserInfo;
gridbee.worksource.boinc.reply.Application = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("name")) this.name = node.node.resolve("name").getInnerData();
	if(node.hasNode.resolve("user_friendly_name")) this.user_friendly_name = node.node.resolve("user_friendly_name").getInnerData();
}
gridbee.worksource.boinc.reply.Application.__name__ = ["gridbee","worksource","boinc","reply","Application"];
gridbee.worksource.boinc.reply.Application.prototype.name = null;
gridbee.worksource.boinc.reply.Application.prototype.user_friendly_name = null;
gridbee.worksource.boinc.reply.Application.prototype.version = null;
gridbee.worksource.boinc.reply.Application.prototype.__class__ = gridbee.worksource.boinc.reply.Application;
gridbee.worksource.boinc.webrpc.result.SetHostInfoRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("success")) this.success = true; else this.success = false;
}
gridbee.worksource.boinc.webrpc.result.SetHostInfoRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","SetHostInfoRes"];
gridbee.worksource.boinc.webrpc.result.SetHostInfoRes.prototype.success = null;
gridbee.worksource.boinc.webrpc.result.SetHostInfoRes.prototype.print = function() {
	haxe.Log.trace("success: " + this.success,{ fileName : "SetHostInfoRes.hx", lineNumber : 36, className : "gridbee.worksource.boinc.webrpc.result.SetHostInfoRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.SetHostInfoRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.SetHostInfoRes;
gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("success")) this.success = true; else this.success = false;
	if(input.hasNode.resolve("opaque_auth")) this.opaque_auth = input.node.resolve("opaque_auth").getInnerData();
}
gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","SetAccountInfoRes"];
gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes.prototype.success = null;
gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes.prototype.opaque_auth = null;
gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes.prototype.print = function() {
	haxe.Log.trace("success: " + this.success,{ fileName : "SetAccountInfoRes.hx", lineNumber : 39, className : "gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes", methodName : "print"});
	haxe.Log.trace("opaque_auth: " + this.opaque_auth,{ fileName : "SetAccountInfoRes.hx", lineNumber : 40, className : "gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes;
haxe.Timer = function(time_ms) {
	if( time_ms === $_ ) return;
	var arr = haxe_timers;
	this.id = arr.length;
	arr[this.id] = this;
	this.timerId = window.setInterval("haxe_timers[" + this.id + "].run();",time_ms);
}
haxe.Timer.__name__ = ["haxe","Timer"];
haxe.Timer.delay = function(f,time_ms) {
	var t = new haxe.Timer(time_ms);
	t.run = function() {
		t.stop();
		f();
	};
	return t;
}
haxe.Timer.measure = function(f,pos) {
	var t0 = haxe.Timer.stamp();
	var r = f();
	haxe.Log.trace(haxe.Timer.stamp() - t0 + "s",pos);
	return r;
}
haxe.Timer.stamp = function() {
	return Date.now().getTime() / 1000;
}
haxe.Timer.prototype.id = null;
haxe.Timer.prototype.timerId = null;
haxe.Timer.prototype.stop = function() {
	if(this.id == null) return;
	window.clearInterval(this.timerId);
	var arr = haxe_timers;
	arr[this.id] = null;
	if(this.id > 100 && this.id == arr.length - 1) {
		var p = this.id - 1;
		while(p >= 0 && arr[p] == null) p--;
		arr = arr.slice(0,p + 1);
	}
	this.id = null;
}
haxe.Timer.prototype.run = function() {
}
haxe.Timer.prototype.__class__ = haxe.Timer;
gridbee.worksource.boinc.request.ResultFileinfo = function(p) {
}
gridbee.worksource.boinc.request.ResultFileinfo.__name__ = ["gridbee","worksource","boinc","request","ResultFileinfo"];
gridbee.worksource.boinc.request.ResultFileinfo.prototype.name = null;
gridbee.worksource.boinc.request.ResultFileinfo.prototype.file_name = null;
gridbee.worksource.boinc.request.ResultFileinfo.prototype.nbytes = null;
gridbee.worksource.boinc.request.ResultFileinfo.prototype.max_nbytes = null;
gridbee.worksource.boinc.request.ResultFileinfo.prototype.md5_cksum = null;
gridbee.worksource.boinc.request.ResultFileinfo.prototype.url = null;
gridbee.worksource.boinc.request.ResultFileinfo.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var innerindent = indent + "    ";
	var xml = indent + "<file_info>\n";
	if(this.name != null) xml += innerindent + "<name>" + this.name + "</name>\n";
	if(this.file_name != null) xml += innerindent + "<file_name>" + this.file_name + "</file_name>\n";
	if(this.nbytes != null) xml += innerindent + "<nbytes>" + this.nbytes + "</nbytes>\n";
	if(this.max_nbytes != null) xml += innerindent + "<max_nbytes>" + this.max_nbytes + "</max_nbytes>\n";
	if(this.md5_cksum != null) xml += innerindent + "<md5_cksum>" + this.md5_cksum + "</md5_cksum>\n";
	if(this.url != null) xml += innerindent + "<url>" + this.url + "</url>\n";
	xml += indent + "</file_info>\n";
	return xml;
}
gridbee.worksource.boinc.request.ResultFileinfo.prototype.__class__ = gridbee.worksource.boinc.request.ResultFileinfo;
gridbee.worksource.boinc.request.ResultFileinfo.__interfaces__ = [gridbee.worksource.boinc.BoincData];
henkolib.events.EventArgs = function(data,sender) {
	if( data === $_ ) return;
	this.sender = sender;
	this.data = data;
}
henkolib.events.EventArgs.__name__ = ["henkolib","events","EventArgs"];
henkolib.events.EventArgs.prototype.sender = null;
henkolib.events.EventArgs.prototype.data = null;
henkolib.events.EventArgs.prototype.__class__ = henkolib.events.EventArgs;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("id")) this.id = Std.parseInt(input.node.resolve("id").getInnerData());
	if(input.hasNode.resolve("email_addr")) this.email_addr = input.node.resolve("email_addr").getInnerData();
	if(input.hasNode.resolve("email_ok")) {
		if(input.node.resolve("email_ok").getInnerData() == "yes") this.email_ok = true; else if(input.node.resolve("email_ok").getInnerData() == "no") this.email_ok = false;
	}
	if(input.hasNode.resolve("cpid")) this.cpid = input.node.resolve("cpid").getInnerData();
	if(input.hasNode.resolve("create_time")) this.create_time = Std.parseInt(input.node.resolve("create_time").getInnerData());
	if(input.hasNode.resolve("name")) this.name = input.node.resolve("name").getInnerData();
	if(input.hasNode.resolve("country")) this.country = input.node.resolve("country").getInnerData();
	if(input.hasNode.resolve("total_credit")) this.total_credit = Std.parseFloat(input.node.resolve("total_credit").getInnerData());
	if(input.hasNode.resolve("expavg_credit")) this.expavg_credit = Std.parseFloat(input.node.resolve("expavg_credit").getInnerData());
	if(input.hasNode.resolve("expavg_time")) this.expavg_time = Std.parseFloat(input.node.resolve("expavg_time").getInnerData());
	if(input.hasNode.resolve("url")) this.url = input.node.resolve("url").getInnerData();
	if(input.hasNode.resolve("has_profile")) {
		if(input.node.resolve("has_profile").getInnerData() == "1") this.has_profile = true; else if(input.node.resolve("has_profile").getInnerData() == "0") this.has_profile = false;
	}
}
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","TeamMembr"];
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.id = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.email_addr = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.email_ok = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.cpid = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.create_time = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.name = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.country = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.total_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.expavg_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.expavg_time = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.url = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.has_profile = null;
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.print = function() {
	haxe.Log.trace("id: " + this.id,{ fileName : "TeamMembr.hx", lineNumber : 73, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("email_addr: " + this.email_addr,{ fileName : "TeamMembr.hx", lineNumber : 74, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("email_ok: " + this.email_ok,{ fileName : "TeamMembr.hx", lineNumber : 75, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("cpid: " + this.cpid,{ fileName : "TeamMembr.hx", lineNumber : 76, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("create_time: " + this.create_time,{ fileName : "TeamMembr.hx", lineNumber : 77, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("name: " + this.name,{ fileName : "TeamMembr.hx", lineNumber : 78, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("country: " + this.country,{ fileName : "TeamMembr.hx", lineNumber : 79, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("total_credit: " + this.total_credit,{ fileName : "TeamMembr.hx", lineNumber : 80, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("expavg_credit: " + this.expavg_credit,{ fileName : "TeamMembr.hx", lineNumber : 81, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("expavg_time: " + this.expavg_time,{ fileName : "TeamMembr.hx", lineNumber : 82, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("url: " + this.url,{ fileName : "TeamMembr.hx", lineNumber : 83, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
	haxe.Log.trace("has_profile: " + this.has_profile,{ fileName : "TeamMembr.hx", lineNumber : 84, className : "gridbee.worksource.boinc.webrpc.subclasses.TeamMembr", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.TeamMembr.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.TeamMembr;
if(!haxe.xml) haxe.xml = {}
if(!haxe.xml._Fast) haxe.xml._Fast = {}
haxe.xml._Fast.NodeAccess = function(x) {
	if( x === $_ ) return;
	this.__x = x;
}
haxe.xml._Fast.NodeAccess.__name__ = ["haxe","xml","_Fast","NodeAccess"];
haxe.xml._Fast.NodeAccess.prototype.__x = null;
haxe.xml._Fast.NodeAccess.prototype.resolve = function(name) {
	var x = this.__x.elementsNamed(name).next();
	if(x == null) {
		var xname = this.__x.nodeType == Xml.Document?"Document":this.__x.getNodeName();
		throw xname + " is missing element " + name;
	}
	return new haxe.xml.Fast(x);
}
haxe.xml._Fast.NodeAccess.prototype.__class__ = haxe.xml._Fast.NodeAccess;
haxe.xml._Fast.AttribAccess = function(x) {
	if( x === $_ ) return;
	this.__x = x;
}
haxe.xml._Fast.AttribAccess.__name__ = ["haxe","xml","_Fast","AttribAccess"];
haxe.xml._Fast.AttribAccess.prototype.__x = null;
haxe.xml._Fast.AttribAccess.prototype.resolve = function(name) {
	if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
	var v = this.__x.get(name);
	if(v == null) throw this.__x.getNodeName() + " is missing attribute " + name;
	return v;
}
haxe.xml._Fast.AttribAccess.prototype.__class__ = haxe.xml._Fast.AttribAccess;
haxe.xml._Fast.HasAttribAccess = function(x) {
	if( x === $_ ) return;
	this.__x = x;
}
haxe.xml._Fast.HasAttribAccess.__name__ = ["haxe","xml","_Fast","HasAttribAccess"];
haxe.xml._Fast.HasAttribAccess.prototype.__x = null;
haxe.xml._Fast.HasAttribAccess.prototype.resolve = function(name) {
	if(this.__x.nodeType == Xml.Document) throw "Cannot access document attribute " + name;
	return this.__x.exists(name);
}
haxe.xml._Fast.HasAttribAccess.prototype.__class__ = haxe.xml._Fast.HasAttribAccess;
haxe.xml._Fast.HasNodeAccess = function(x) {
	if( x === $_ ) return;
	this.__x = x;
}
haxe.xml._Fast.HasNodeAccess.__name__ = ["haxe","xml","_Fast","HasNodeAccess"];
haxe.xml._Fast.HasNodeAccess.prototype.__x = null;
haxe.xml._Fast.HasNodeAccess.prototype.resolve = function(name) {
	return this.__x.elementsNamed(name).hasNext();
}
haxe.xml._Fast.HasNodeAccess.prototype.__class__ = haxe.xml._Fast.HasNodeAccess;
haxe.xml._Fast.NodeListAccess = function(x) {
	if( x === $_ ) return;
	this.__x = x;
}
haxe.xml._Fast.NodeListAccess.__name__ = ["haxe","xml","_Fast","NodeListAccess"];
haxe.xml._Fast.NodeListAccess.prototype.__x = null;
haxe.xml._Fast.NodeListAccess.prototype.resolve = function(name) {
	var l = new List();
	var $it0 = this.__x.elementsNamed(name);
	while( $it0.hasNext() ) {
		var x = $it0.next();
		l.add(new haxe.xml.Fast(x));
	}
	return l;
}
haxe.xml._Fast.NodeListAccess.prototype.__class__ = haxe.xml._Fast.NodeListAccess;
haxe.xml.Fast = function(x) {
	if( x === $_ ) return;
	if(x.nodeType != Xml.Document && x.nodeType != Xml.Element) throw "Invalid nodeType " + x.nodeType;
	this.x = x;
	this.node = new haxe.xml._Fast.NodeAccess(x);
	this.nodes = new haxe.xml._Fast.NodeListAccess(x);
	this.att = new haxe.xml._Fast.AttribAccess(x);
	this.has = new haxe.xml._Fast.HasAttribAccess(x);
	this.hasNode = new haxe.xml._Fast.HasNodeAccess(x);
}
haxe.xml.Fast.__name__ = ["haxe","xml","Fast"];
haxe.xml.Fast.prototype.x = null;
haxe.xml.Fast.prototype.name = null;
haxe.xml.Fast.prototype.innerData = null;
haxe.xml.Fast.prototype.innerHTML = null;
haxe.xml.Fast.prototype.node = null;
haxe.xml.Fast.prototype.nodes = null;
haxe.xml.Fast.prototype.att = null;
haxe.xml.Fast.prototype.has = null;
haxe.xml.Fast.prototype.hasNode = null;
haxe.xml.Fast.prototype.elements = null;
haxe.xml.Fast.prototype.getName = function() {
	return this.x.nodeType == Xml.Document?"Document":this.x.getNodeName();
}
haxe.xml.Fast.prototype.getInnerData = function() {
	var it = this.x.iterator();
	if(!it.hasNext()) throw this.getName() + " does not have data";
	var v = it.next();
	if(it.hasNext()) throw this.getName() + " does not only have data";
	if(v.nodeType != Xml.PCData && v.nodeType != Xml.CData) throw this.getName() + " does not have data";
	return v.getNodeValue();
}
haxe.xml.Fast.prototype.getInnerHTML = function() {
	var s = new StringBuf();
	var $it0 = this.x.iterator();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		s.add(x.toString());
	}
	return s.b.join("");
}
haxe.xml.Fast.prototype.getElements = function() {
	var it = this.x.elements();
	return { hasNext : $closure(it,"hasNext"), next : function() {
		var x = it.next();
		if(x == null) return null;
		return new haxe.xml.Fast(x);
	}};
}
haxe.xml.Fast.prototype.__class__ = haxe.xml.Fast;
henkolib.log.LogLevel = { __ename__ : ["henkolib","log","LogLevel"], __constructs__ : ["L0_Critical","L1_Error","L2_Warning","L3_Notice","L4_Information","L5_Debug"] }
henkolib.log.LogLevel.L0_Critical = ["L0_Critical",0];
henkolib.log.LogLevel.L0_Critical.toString = $estr;
henkolib.log.LogLevel.L0_Critical.__enum__ = henkolib.log.LogLevel;
henkolib.log.LogLevel.L1_Error = ["L1_Error",1];
henkolib.log.LogLevel.L1_Error.toString = $estr;
henkolib.log.LogLevel.L1_Error.__enum__ = henkolib.log.LogLevel;
henkolib.log.LogLevel.L2_Warning = ["L2_Warning",2];
henkolib.log.LogLevel.L2_Warning.toString = $estr;
henkolib.log.LogLevel.L2_Warning.__enum__ = henkolib.log.LogLevel;
henkolib.log.LogLevel.L3_Notice = ["L3_Notice",3];
henkolib.log.LogLevel.L3_Notice.toString = $estr;
henkolib.log.LogLevel.L3_Notice.__enum__ = henkolib.log.LogLevel;
henkolib.log.LogLevel.L4_Information = ["L4_Information",4];
henkolib.log.LogLevel.L4_Information.toString = $estr;
henkolib.log.LogLevel.L4_Information.__enum__ = henkolib.log.LogLevel;
henkolib.log.LogLevel.L5_Debug = ["L5_Debug",5];
henkolib.log.LogLevel.L5_Debug.toString = $estr;
henkolib.log.LogLevel.L5_Debug.__enum__ = henkolib.log.LogLevel;
henkolib.log.Console = function(max,filterlevel,parent) {
	if( max === $_ ) return;
	if(max == null) max = 0;
	this.maxentries = max;
	this.filterlevel = filterlevel;
	this.parent = parent;
	this.entries = new Array();
	this.onlog = new henkolib.events.Event();
	this.onLog = this.onlog;
}
henkolib.log.Console.__name__ = ["henkolib","log","Console"];
henkolib.log.Console.main = null;
henkolib.log.Console.prototype.parent = null;
henkolib.log.Console.prototype.entries = null;
henkolib.log.Console.prototype.maxentries = null;
henkolib.log.Console.prototype.filterlevel = null;
henkolib.log.Console.prototype.onlog = null;
henkolib.log.Console.prototype.onLog = null;
henkolib.log.Console.prototype.getEntries = function(max,filter) {
	if(max == null) max = 0;
	var filtered = new Array();
	var _g = 0, _g1 = this.entries;
	while(_g < _g1.length) {
		var entry = _g1[_g];
		++_g;
		if(entry.level[1] <= filter[1]) {
			filtered.unshift(entry);
			if(max > 0 && filtered.length >= max) return filtered.iterator();
		}
	}
	return filtered.iterator();
}
henkolib.log.Console.prototype.log = function(level,message,data,source,pos) {
	if(level != null && this.filterlevel != null) {
		if(level[1] > this.filterlevel[1]) return;
	} else {
		if(level == null) henkolib.log.Console.main.logWarning("New log entry level is null.",null,null,{ fileName : "Console.hx", lineNumber : 83, className : "henkolib.log.Console", methodName : "log"});
		if(this.filterlevel == null) henkolib.log.Console.main.logWarning("Filterlevel is null.",null,null,{ fileName : "Console.hx", lineNumber : 84, className : "henkolib.log.Console", methodName : "log"});
	}
	var entry = new henkolib.log.LogEntry(source,level,message,data,pos);
	this.entries.unshift(entry);
	if(this.maxentries > 0 && this.entries.length > this.maxentries) this.entries.pop();
	if(this.onLog != null) this.onlog.invoke(entry);
	if(this.parent != null) this.parent.log(level,message,data,source,pos);
}
henkolib.log.Console.prototype.setParent = function(console) {
	this.parent = console;
}
henkolib.log.Console.prototype.logDebug = function(message,data,source,pos) {
	this.log(henkolib.log.LogLevel.L5_Debug,message,data,source,pos);
}
henkolib.log.Console.prototype.logInformation = function(message,data,source,pos) {
	this.log(henkolib.log.LogLevel.L4_Information,message,data,source,pos);
}
henkolib.log.Console.prototype.logNotice = function(message,data,source,pos) {
	this.log(henkolib.log.LogLevel.L3_Notice,message,data,source,pos);
}
henkolib.log.Console.prototype.logWarning = function(message,data,source,pos) {
	this.log(henkolib.log.LogLevel.L2_Warning,message,data,source,pos);
}
henkolib.log.Console.prototype.logError = function(message,data,source,pos) {
	this.log(henkolib.log.LogLevel.L1_Error,message,data,source,pos);
}
henkolib.log.Console.prototype.logCritical = function(message,data,source,pos) {
	this.log(henkolib.log.LogLevel.L0_Critical,message,data,source,pos);
}
henkolib.log.Console.prototype.exportAsHtml = function(numlast,filter) {
	var html = "";
	var entries = this.getEntries(numlast,filter);
	while(entries.hasNext()) {
		var e = entries.next();
		var classname = "";
		switch( (e.level)[1] ) {
		case 0:
			classname = "critical";
			break;
		case 1:
			classname = "error";
			break;
		case 2:
			classname = "warning";
			break;
		case 3:
			classname = "notice";
			break;
		case 4:
			classname = "information";
			break;
		case 5:
			classname = "debug";
			break;
		default:
			classname = "";
		}
		var line = "<div class=\"logentry " + classname + "\">";
		line += "<div class=\"time\">" + DateTools.format(e.time,"%H:%M:%S") + "</div>";
		if(e.source != null) line += "<div class=\"source\">" + e.source.getScreenName() + "</div>";
		line += e.message;
		if(e.data != null) {
			line += "<div class=\"data\">";
			line += "<pre>" + Std.string(e.data) + "</pre>";
			line += "</div>";
		}
		line += "</div>";
		html += line + "\n";
	}
	return html;
}
henkolib.log.Console.prototype.exportAsText = function(numlast,filter) {
	var text = "";
	var entries = this.getEntries(numlast,filter);
	while(entries.hasNext()) {
		var e = entries.next();
		var line = "";
		line += DateTools.format(e.time,"%H:%M:%S") + " ";
		line += "[" + e.level[1] + "] ";
		if(e.source != null) line += e.source.getScreenName() + " ";
		line += ": ";
		line += e.message;
		if(e.data != null) {
			line += "\n";
			line += Std.string(e.data);
		}
		if(e.level == henkolib.log.LogLevel.L1_Error || e.level == henkolib.log.LogLevel.L0_Critical) {
			line += "\n";
			line += e.pos.className + "." + e.pos.methodName;
			line += "\n";
			line += e.pos.fileName + " # " + e.pos.lineNumber;
		}
		text += line + "\n";
	}
	return text;
}
henkolib.log.Console.prototype.copyFrom = function(console) {
	this.entries = this.entries = new Array();
	var _g = 0, _g1 = console.entries;
	while(_g < _g1.length) {
		var entry = _g1[_g];
		++_g;
		this.entries.push(entry);
	}
	this.maxentries = console.maxentries;
	this.filterlevel = console.filterlevel;
}
henkolib.log.Console.prototype.hxSerialize = function(s) {
	s.serialize(this.entries);
	s.serialize(this.maxentries);
	s.serialize(this.filterlevel);
}
henkolib.log.Console.prototype.hxUnserialize = function(s) {
	this.entries = s.unserialize();
	this.maxentries = s.unserialize();
	this.filterlevel = s.unserialize();
	this.onlog = new henkolib.events.Event();
}
henkolib.log.Console.prototype.__class__ = henkolib.log.Console;
gridbee.worksource.boinc.request.DataServerRequest = function(p) {
}
gridbee.worksource.boinc.request.DataServerRequest.__name__ = ["gridbee","worksource","boinc","request","DataServerRequest"];
gridbee.worksource.boinc.request.DataServerRequest.prototype.clientversion = null;
gridbee.worksource.boinc.request.DataServerRequest.prototype.get_file_size = null;
gridbee.worksource.boinc.request.DataServerRequest.prototype.file_upload = null;
gridbee.worksource.boinc.request.DataServerRequest.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = indent + "<data_server_request>\n";
	var innerindent = indent + "    ";
	if(this.clientversion != null) xml += this.clientversion.toXmlString(innerindent);
	if(this.get_file_size != null) xml += innerindent + "<get_file_size>" + this.get_file_size + "</get_file_size>\n";
	if(this.file_upload != null) xml += this.file_upload.toXmlString(innerindent); else xml += indent + "</data_server_request>\n";
	return xml;
}
gridbee.worksource.boinc.request.DataServerRequest.prototype.__class__ = gridbee.worksource.boinc.request.DataServerRequest;
gridbee.worksource.boinc.request.DataServerRequest.__interfaces__ = [gridbee.worksource.boinc.BoincData];
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("resultid")) this.resultid = Std.parseInt(input.node.resolve("resultid").getInnerData());
	if(input.hasNode.resolve("workunitid")) this.workunitid = Std.parseInt(input.node.resolve("workunitid").getInnerData());
	if(input.hasNode.resolve("claimed_credit")) this.claimed_credit = Std.parseFloat(input.node.resolve("claimed_credit").getInnerData());
	if(input.hasNode.resolve("received_time")) this.received_time = Std.parseInt(input.node.resolve("received_time").getInnerData());
}
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","PendingCredit"];
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.prototype.resultid = null;
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.prototype.workunitid = null;
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.prototype.claimed_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.prototype.received_time = null;
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.prototype.print = function() {
	haxe.Log.trace("resultid: " + this.resultid,{ fileName : "PendingCredit.hx", lineNumber : 43, className : "gridbee.worksource.boinc.webrpc.subclasses.PendingCredit", methodName : "print"});
	haxe.Log.trace("workunitid: " + this.workunitid,{ fileName : "PendingCredit.hx", lineNumber : 44, className : "gridbee.worksource.boinc.webrpc.subclasses.PendingCredit", methodName : "print"});
	haxe.Log.trace("claimed_credit: " + this.claimed_credit,{ fileName : "PendingCredit.hx", lineNumber : 45, className : "gridbee.worksource.boinc.webrpc.subclasses.PendingCredit", methodName : "print"});
	haxe.Log.trace("received_time: " + this.received_time,{ fileName : "PendingCredit.hx", lineNumber : 46, className : "gridbee.worksource.boinc.webrpc.subclasses.PendingCredit", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.PendingCredit.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.PendingCredit;
if(!haxe.macro) haxe.macro = {}
haxe.macro.Constant = { __ename__ : ["haxe","macro","Constant"], __constructs__ : ["CInt","CFloat","CString","CIdent","CType","CRegexp"] }
haxe.macro.Constant.CInt = function(v) { var $x = ["CInt",0,v]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CFloat = function(f) { var $x = ["CFloat",1,f]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CString = function(s) { var $x = ["CString",2,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CIdent = function(s) { var $x = ["CIdent",3,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CType = function(s) { var $x = ["CType",4,s]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Constant.CRegexp = function(r,opt) { var $x = ["CRegexp",5,r,opt]; $x.__enum__ = haxe.macro.Constant; $x.toString = $estr; return $x; }
haxe.macro.Binop = { __ename__ : ["haxe","macro","Binop"], __constructs__ : ["OpAdd","OpMult","OpDiv","OpSub","OpAssign","OpEq","OpNotEq","OpGt","OpGte","OpLt","OpLte","OpAnd","OpOr","OpXor","OpBoolAnd","OpBoolOr","OpShl","OpShr","OpUShr","OpMod","OpAssignOp","OpInterval"] }
haxe.macro.Binop.OpAdd = ["OpAdd",0];
haxe.macro.Binop.OpAdd.toString = $estr;
haxe.macro.Binop.OpAdd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpMult = ["OpMult",1];
haxe.macro.Binop.OpMult.toString = $estr;
haxe.macro.Binop.OpMult.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpDiv = ["OpDiv",2];
haxe.macro.Binop.OpDiv.toString = $estr;
haxe.macro.Binop.OpDiv.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpSub = ["OpSub",3];
haxe.macro.Binop.OpSub.toString = $estr;
haxe.macro.Binop.OpSub.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAssign = ["OpAssign",4];
haxe.macro.Binop.OpAssign.toString = $estr;
haxe.macro.Binop.OpAssign.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpEq = ["OpEq",5];
haxe.macro.Binop.OpEq.toString = $estr;
haxe.macro.Binop.OpEq.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpNotEq = ["OpNotEq",6];
haxe.macro.Binop.OpNotEq.toString = $estr;
haxe.macro.Binop.OpNotEq.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpGt = ["OpGt",7];
haxe.macro.Binop.OpGt.toString = $estr;
haxe.macro.Binop.OpGt.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpGte = ["OpGte",8];
haxe.macro.Binop.OpGte.toString = $estr;
haxe.macro.Binop.OpGte.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpLt = ["OpLt",9];
haxe.macro.Binop.OpLt.toString = $estr;
haxe.macro.Binop.OpLt.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpLte = ["OpLte",10];
haxe.macro.Binop.OpLte.toString = $estr;
haxe.macro.Binop.OpLte.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAnd = ["OpAnd",11];
haxe.macro.Binop.OpAnd.toString = $estr;
haxe.macro.Binop.OpAnd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpOr = ["OpOr",12];
haxe.macro.Binop.OpOr.toString = $estr;
haxe.macro.Binop.OpOr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpXor = ["OpXor",13];
haxe.macro.Binop.OpXor.toString = $estr;
haxe.macro.Binop.OpXor.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpBoolAnd = ["OpBoolAnd",14];
haxe.macro.Binop.OpBoolAnd.toString = $estr;
haxe.macro.Binop.OpBoolAnd.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpBoolOr = ["OpBoolOr",15];
haxe.macro.Binop.OpBoolOr.toString = $estr;
haxe.macro.Binop.OpBoolOr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpShl = ["OpShl",16];
haxe.macro.Binop.OpShl.toString = $estr;
haxe.macro.Binop.OpShl.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpShr = ["OpShr",17];
haxe.macro.Binop.OpShr.toString = $estr;
haxe.macro.Binop.OpShr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpUShr = ["OpUShr",18];
haxe.macro.Binop.OpUShr.toString = $estr;
haxe.macro.Binop.OpUShr.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpMod = ["OpMod",19];
haxe.macro.Binop.OpMod.toString = $estr;
haxe.macro.Binop.OpMod.__enum__ = haxe.macro.Binop;
haxe.macro.Binop.OpAssignOp = function(op) { var $x = ["OpAssignOp",20,op]; $x.__enum__ = haxe.macro.Binop; $x.toString = $estr; return $x; }
haxe.macro.Binop.OpInterval = ["OpInterval",21];
haxe.macro.Binop.OpInterval.toString = $estr;
haxe.macro.Binop.OpInterval.__enum__ = haxe.macro.Binop;
haxe.macro.Unop = { __ename__ : ["haxe","macro","Unop"], __constructs__ : ["OpIncrement","OpDecrement","OpNot","OpNeg","OpNegBits"] }
haxe.macro.Unop.OpIncrement = ["OpIncrement",0];
haxe.macro.Unop.OpIncrement.toString = $estr;
haxe.macro.Unop.OpIncrement.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpDecrement = ["OpDecrement",1];
haxe.macro.Unop.OpDecrement.toString = $estr;
haxe.macro.Unop.OpDecrement.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNot = ["OpNot",2];
haxe.macro.Unop.OpNot.toString = $estr;
haxe.macro.Unop.OpNot.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNeg = ["OpNeg",3];
haxe.macro.Unop.OpNeg.toString = $estr;
haxe.macro.Unop.OpNeg.__enum__ = haxe.macro.Unop;
haxe.macro.Unop.OpNegBits = ["OpNegBits",4];
haxe.macro.Unop.OpNegBits.toString = $estr;
haxe.macro.Unop.OpNegBits.__enum__ = haxe.macro.Unop;
haxe.macro.ExprDef = { __ename__ : ["haxe","macro","ExprDef"], __constructs__ : ["EConst","EArray","EBinop","EField","EType","EParenthesis","EObjectDecl","EArrayDecl","ECall","ENew","EUnop","EVars","EFunction","EBlock","EFor","EIn","EIf","EWhile","ESwitch","ETry","EReturn","EBreak","EContinue","EUntyped","EThrow","ECast","EDisplay","EDisplayNew","ETernary"] }
haxe.macro.ExprDef.EConst = function(c) { var $x = ["EConst",0,c]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EArray = function(e1,e2) { var $x = ["EArray",1,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EBinop = function(op,e1,e2) { var $x = ["EBinop",2,op,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EField = function(e,field) { var $x = ["EField",3,e,field]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EType = function(e,field) { var $x = ["EType",4,e,field]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EParenthesis = function(e) { var $x = ["EParenthesis",5,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EObjectDecl = function(fields) { var $x = ["EObjectDecl",6,fields]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EArrayDecl = function(values) { var $x = ["EArrayDecl",7,values]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ECall = function(e,params) { var $x = ["ECall",8,e,params]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ENew = function(t,params) { var $x = ["ENew",9,t,params]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EUnop = function(op,postFix,e) { var $x = ["EUnop",10,op,postFix,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EVars = function(vars) { var $x = ["EVars",11,vars]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EFunction = function(name,f) { var $x = ["EFunction",12,name,f]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EBlock = function(exprs) { var $x = ["EBlock",13,exprs]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EFor = function(it,expr) { var $x = ["EFor",14,it,expr]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EIn = function(e1,e2) { var $x = ["EIn",15,e1,e2]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EIf = function(econd,eif,eelse) { var $x = ["EIf",16,econd,eif,eelse]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EWhile = function(econd,e,normalWhile) { var $x = ["EWhile",17,econd,e,normalWhile]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ESwitch = function(e,cases,edef) { var $x = ["ESwitch",18,e,cases,edef]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ETry = function(e,catches) { var $x = ["ETry",19,e,catches]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EReturn = function(e) { var $x = ["EReturn",20,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EBreak = ["EBreak",21];
haxe.macro.ExprDef.EBreak.toString = $estr;
haxe.macro.ExprDef.EBreak.__enum__ = haxe.macro.ExprDef;
haxe.macro.ExprDef.EContinue = ["EContinue",22];
haxe.macro.ExprDef.EContinue.toString = $estr;
haxe.macro.ExprDef.EContinue.__enum__ = haxe.macro.ExprDef;
haxe.macro.ExprDef.EUntyped = function(e) { var $x = ["EUntyped",23,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EThrow = function(e) { var $x = ["EThrow",24,e]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ECast = function(e,t) { var $x = ["ECast",25,e,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EDisplay = function(e,isCall) { var $x = ["EDisplay",26,e,isCall]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.EDisplayNew = function(t) { var $x = ["EDisplayNew",27,t]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ExprDef.ETernary = function(econd,eif,eelse) { var $x = ["ETernary",28,econd,eif,eelse]; $x.__enum__ = haxe.macro.ExprDef; $x.toString = $estr; return $x; }
haxe.macro.ComplexType = { __ename__ : ["haxe","macro","ComplexType"], __constructs__ : ["TPath","TFunction","TAnonymous","TParent","TExtend"] }
haxe.macro.ComplexType.TPath = function(p) { var $x = ["TPath",0,p]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TFunction = function(args,ret) { var $x = ["TFunction",1,args,ret]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TAnonymous = function(fields) { var $x = ["TAnonymous",2,fields]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TParent = function(t) { var $x = ["TParent",3,t]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.ComplexType.TExtend = function(p,fields) { var $x = ["TExtend",4,p,fields]; $x.__enum__ = haxe.macro.ComplexType; $x.toString = $estr; return $x; }
haxe.macro.TypeParam = { __ename__ : ["haxe","macro","TypeParam"], __constructs__ : ["TPType","TPExpr"] }
haxe.macro.TypeParam.TPType = function(t) { var $x = ["TPType",0,t]; $x.__enum__ = haxe.macro.TypeParam; $x.toString = $estr; return $x; }
haxe.macro.TypeParam.TPExpr = function(e) { var $x = ["TPExpr",1,e]; $x.__enum__ = haxe.macro.TypeParam; $x.toString = $estr; return $x; }
haxe.macro.Access = { __ename__ : ["haxe","macro","Access"], __constructs__ : ["APublic","APrivate","AStatic","AOverride","ADynamic","AInline"] }
haxe.macro.Access.APublic = ["APublic",0];
haxe.macro.Access.APublic.toString = $estr;
haxe.macro.Access.APublic.__enum__ = haxe.macro.Access;
haxe.macro.Access.APrivate = ["APrivate",1];
haxe.macro.Access.APrivate.toString = $estr;
haxe.macro.Access.APrivate.__enum__ = haxe.macro.Access;
haxe.macro.Access.AStatic = ["AStatic",2];
haxe.macro.Access.AStatic.toString = $estr;
haxe.macro.Access.AStatic.__enum__ = haxe.macro.Access;
haxe.macro.Access.AOverride = ["AOverride",3];
haxe.macro.Access.AOverride.toString = $estr;
haxe.macro.Access.AOverride.__enum__ = haxe.macro.Access;
haxe.macro.Access.ADynamic = ["ADynamic",4];
haxe.macro.Access.ADynamic.toString = $estr;
haxe.macro.Access.ADynamic.__enum__ = haxe.macro.Access;
haxe.macro.Access.AInline = ["AInline",5];
haxe.macro.Access.AInline.toString = $estr;
haxe.macro.Access.AInline.__enum__ = haxe.macro.Access;
haxe.macro.FieldType = { __ename__ : ["haxe","macro","FieldType"], __constructs__ : ["FVar","FFun","FProp"] }
haxe.macro.FieldType.FVar = function(t,e) { var $x = ["FVar",0,t,e]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; }
haxe.macro.FieldType.FFun = function(f) { var $x = ["FFun",1,f]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; }
haxe.macro.FieldType.FProp = function(get,set,t,e) { var $x = ["FProp",2,get,set,t,e]; $x.__enum__ = haxe.macro.FieldType; $x.toString = $estr; return $x; }
haxe.macro.TypeDefKind = { __ename__ : ["haxe","macro","TypeDefKind"], __constructs__ : ["TDEnum","TDStructure","TDClass"] }
haxe.macro.TypeDefKind.TDEnum = ["TDEnum",0];
haxe.macro.TypeDefKind.TDEnum.toString = $estr;
haxe.macro.TypeDefKind.TDEnum.__enum__ = haxe.macro.TypeDefKind;
haxe.macro.TypeDefKind.TDStructure = ["TDStructure",1];
haxe.macro.TypeDefKind.TDStructure.toString = $estr;
haxe.macro.TypeDefKind.TDStructure.__enum__ = haxe.macro.TypeDefKind;
haxe.macro.TypeDefKind.TDClass = function(extend,implement,isInterface) { var $x = ["TDClass",2,extend,implement,isInterface]; $x.__enum__ = haxe.macro.TypeDefKind; $x.toString = $estr; return $x; }
haxe.macro.Error = function(m,p) {
	if( m === $_ ) return;
	this.message = m;
	this.pos = p;
}
haxe.macro.Error.__name__ = ["haxe","macro","Error"];
haxe.macro.Error.prototype.message = null;
haxe.macro.Error.prototype.pos = null;
haxe.macro.Error.prototype.__class__ = haxe.macro.Error;
gridbee.core.work.WorkExecutor = function(context) {
	if( context === $_ ) return;
	this.context = context;
	this.temp = new gridbee.core.work.WorkContext();
	this.temp.copyFrom(context);
	this.running = false;
}
gridbee.core.work.WorkExecutor.__name__ = ["gridbee","core","work","WorkExecutor"];
gridbee.core.work.WorkExecutor.prototype.worker = null;
gridbee.core.work.WorkExecutor.prototype.context = null;
gridbee.core.work.WorkExecutor.prototype.temp = null;
gridbee.core.work.WorkExecutor.prototype.running = null;
gridbee.core.work.WorkExecutor.prototype.start = null;
gridbee.core.work.WorkExecutor.prototype.lastchecktime = null;
gridbee.core.work.WorkExecutor.prototype.operation = null;
gridbee.core.work.WorkExecutor.prototype.operate = function() {
	if(this.start && this.context.isAvailable()) {
		this.start = false;
		if(this.context.getPlatform() == "nacl") this.worker = new gridbee.core.work.NaClWorker(this.temp.getProgramCode()); else {
			this.worker = new gridbee.js.JSWorker("worker.js");
			this.send("program",this.temp.getProgramCode());
		}
		this.worker.setOnmessage($closure(this,"onmessage"));
		this.worker.setOnerror($closure(this,"onerror"));
		var _g = 0, _g1 = this.temp.getFileList();
		while(_g < _g1.length) {
			var name = _g1[_g];
			++_g;
			var data = this.temp.read(name);
			this.send("data",{ openname : name, inputdata : data});
		}
		this.send("checkpoint",this.temp.getCheckpoint());
		this.send("run");
	}
}
gridbee.core.work.WorkExecutor.prototype.send = function(command,data) {
	if(this.worker != null) this.worker.postMessage({ command : command, data : data});
}
gridbee.core.work.WorkExecutor.prototype.run = function() {
	this.operation = new henkolib.async.AsyncOperation();
	this.start = true;
	this.operate();
	return this.operation;
}
gridbee.core.work.WorkExecutor.prototype.terminate = function() {
	this.worker.terminate();
	this.worker = null;
	this.running = false;
}
gridbee.core.work.WorkExecutor.prototype.onerror = function(event) {
	this.temp.log(henkolib.log.LogLevel.L1_Error,"worker error: " + event.message,event,null,{ fileName : "WorkExecutor.hx", lineNumber : 110, className : "gridbee.core.work.WorkExecutor", methodName : "onerror"});
	this.operation.setError("worker error: " + event.message);
}
gridbee.core.work.WorkExecutor.prototype.onmessage = function(event) {
	var command = event.data.command;
	var data = event.data.data;
	if(command == "running") {
		this.running = true;
		this.lastchecktime = Date.now().getTime();
	}
	if(command == "done") {
		this.temp.setExitStatus(data);
		this.temp.setCompleted();
		this.context.copyFrom(this.temp);
		this.terminate();
		this.operation.setResult(this.context);
	}
	if(command == "exception") {
		this.temp.log(henkolib.log.LogLevel.L1_Error,data.type + " error",data.exception,null,{ fileName : "WorkExecutor.hx", lineNumber : 136, className : "gridbee.core.work.WorkExecutor", methodName : "onmessage"});
		this.context.copyFrom(this.temp);
		this.terminate();
		this.operation.setError(data.type + " error: " + data.exception.message);
	}
	if(command == "write") this.temp.write(data.name,data.str);
	if(command == "replace") {
		this.temp.clear(data.name);
		this.temp.write(data.name,data.str);
	}
	if(command == "progress") {
		var progress = data;
		this.temp.setProgress(progress);
		this.operation.setProgress(progress);
	}
	if(command == "checkpoint") {
		this.temp.setCheckpoint(data);
		var now = Date.now().getTime();
		this.temp.addWorktime(now - this.lastchecktime);
		this.lastchecktime = now;
		this.context.copyFrom(this.temp);
	}
	if(command == "debug") this.temp.log(henkolib.log.LogLevel.L5_Debug,"Debug",data,null,{ fileName : "WorkExecutor.hx", lineNumber : 173, className : "gridbee.core.work.WorkExecutor", methodName : "onmessage"});
}
gridbee.core.work.WorkExecutor.prototype.__class__ = gridbee.core.work.WorkExecutor;
gridbee.core.work.WorkExecutor.__interfaces__ = [gridbee.core.iface.Operable];
gridbee.worksource.boinc.request.WorkRequest = function(required_seconds) {
	if( required_seconds === $_ ) return;
	this.work_req_seconds = required_seconds;
}
gridbee.worksource.boinc.request.WorkRequest.__name__ = ["gridbee","worksource","boinc","request","WorkRequest"];
gridbee.worksource.boinc.request.WorkRequest.prototype.work_req_seconds = null;
gridbee.worksource.boinc.request.WorkRequest.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = "";
	if(this.work_req_seconds != null) xml += indent + "<work_req_seconds>" + this.work_req_seconds + "</work_req_seconds>\n";
	return xml;
}
gridbee.worksource.boinc.request.WorkRequest.prototype.__class__ = gridbee.worksource.boinc.request.WorkRequest;
gridbee.worksource.boinc.request.WorkRequest.__interfaces__ = [gridbee.worksource.boinc.BoincData];
haxe.io.Error = { __ename__ : ["haxe","io","Error"], __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] }
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; }
haxe.Unserializer = function(buf) {
	if( buf === $_ ) return;
	this.buf = buf;
	this.length = buf.length;
	this.pos = 0;
	this.scache = new Array();
	this.cache = new Array();
	var r = haxe.Unserializer.DEFAULT_RESOLVER;
	if(r == null) {
		r = Type;
		haxe.Unserializer.DEFAULT_RESOLVER = r;
	}
	this.setResolver(r);
}
haxe.Unserializer.__name__ = ["haxe","Unserializer"];
haxe.Unserializer.initCodes = function() {
	var codes = new Array();
	var _g1 = 0, _g = haxe.Unserializer.BASE64.length;
	while(_g1 < _g) {
		var i = _g1++;
		codes[haxe.Unserializer.BASE64.cca(i)] = i;
	}
	return codes;
}
haxe.Unserializer.run = function(v) {
	return new haxe.Unserializer(v).unserialize();
}
haxe.Unserializer.prototype.buf = null;
haxe.Unserializer.prototype.pos = null;
haxe.Unserializer.prototype.length = null;
haxe.Unserializer.prototype.cache = null;
haxe.Unserializer.prototype.scache = null;
haxe.Unserializer.prototype.resolver = null;
haxe.Unserializer.prototype.setResolver = function(r) {
	if(r == null) this.resolver = { resolveClass : function(_) {
		return null;
	}, resolveEnum : function(_) {
		return null;
	}}; else this.resolver = r;
}
haxe.Unserializer.prototype.getResolver = function() {
	return this.resolver;
}
haxe.Unserializer.prototype.get = function(p) {
	return this.buf.cca(p);
}
haxe.Unserializer.prototype.readDigits = function() {
	var k = 0;
	var s = false;
	var fpos = this.pos;
	while(true) {
		var c = this.buf.cca(this.pos);
		if(c != c) break;
		if(c == 45) {
			if(this.pos != fpos) break;
			s = true;
			this.pos++;
			continue;
		}
		if(c < 48 || c > 57) break;
		k = k * 10 + (c - 48);
		this.pos++;
	}
	if(s) k *= -1;
	return k;
}
haxe.Unserializer.prototype.unserializeObject = function(o) {
	while(true) {
		if(this.pos >= this.length) throw "Invalid object";
		if(this.buf.cca(this.pos) == 103) break;
		var k = this.unserialize();
		if(!Std["is"](k,String)) throw "Invalid object key";
		var v = this.unserialize();
		o[k] = v;
	}
	this.pos++;
}
haxe.Unserializer.prototype.unserializeEnum = function(edecl,tag) {
	var constr = Reflect.field(edecl,tag);
	if(constr == null) throw "Unknown enum tag " + Type.getEnumName(edecl) + "." + tag;
	if(this.buf.cca(this.pos++) != 58) throw "Invalid enum format";
	var nargs = this.readDigits();
	if(nargs == 0) {
		this.cache.push(constr);
		return constr;
	}
	var args = new Array();
	while(nargs > 0) {
		args.push(this.unserialize());
		nargs -= 1;
	}
	var e = constr.apply(edecl,args);
	this.cache.push(e);
	return e;
}
haxe.Unserializer.prototype.unserialize = function() {
	switch(this.buf.cca(this.pos++)) {
	case 110:
		return null;
	case 116:
		return true;
	case 102:
		return false;
	case 122:
		return 0;
	case 105:
		return this.readDigits();
	case 100:
		var p1 = this.pos;
		while(true) {
			var c = this.buf.cca(this.pos);
			if(c >= 43 && c < 58 || c == 101 || c == 69) this.pos++; else break;
		}
		return Std.parseFloat(this.buf.substr(p1,this.pos - p1));
	case 121:
		var len = this.readDigits();
		if(this.buf.cca(this.pos++) != 58 || this.length - this.pos < len) throw "Invalid string length";
		var s = this.buf.substr(this.pos,len);
		this.pos += len;
		s = StringTools.urlDecode(s);
		this.scache.push(s);
		return s;
	case 107:
		return Math.NaN;
	case 109:
		return Math.NEGATIVE_INFINITY;
	case 112:
		return Math.POSITIVE_INFINITY;
	case 97:
		var buf = this.buf;
		var a = new Array();
		this.cache.push(a);
		while(true) {
			var c = this.buf.cca(this.pos);
			if(c == 104) {
				this.pos++;
				break;
			}
			if(c == 117) {
				this.pos++;
				var n = this.readDigits();
				a[a.length + n - 1] = null;
			} else a.push(this.unserialize());
		}
		return a;
	case 111:
		var o = { };
		this.cache.push(o);
		this.unserializeObject(o);
		return o;
	case 114:
		var n = this.readDigits();
		if(n < 0 || n >= this.cache.length) throw "Invalid reference";
		return this.cache[n];
	case 82:
		var n = this.readDigits();
		if(n < 0 || n >= this.scache.length) throw "Invalid string reference";
		return this.scache[n];
	case 120:
		throw this.unserialize();
		break;
	case 99:
		var name = this.unserialize();
		var cl = this.resolver.resolveClass(name);
		if(cl == null) throw "Class not found " + name;
		var o = Type.createEmptyInstance(cl);
		this.cache.push(o);
		this.unserializeObject(o);
		return o;
	case 119:
		var name = this.unserialize();
		var edecl = this.resolver.resolveEnum(name);
		if(edecl == null) throw "Enum not found " + name;
		return this.unserializeEnum(edecl,this.unserialize());
	case 106:
		var name = this.unserialize();
		var edecl = this.resolver.resolveEnum(name);
		if(edecl == null) throw "Enum not found " + name;
		this.pos++;
		var index = this.readDigits();
		var tag = Type.getEnumConstructs(edecl)[index];
		if(tag == null) throw "Unknown enum index " + name + "@" + index;
		return this.unserializeEnum(edecl,tag);
	case 108:
		var l = new List();
		this.cache.push(l);
		var buf = this.buf;
		while(this.buf.cca(this.pos) != 104) l.add(this.unserialize());
		this.pos++;
		return l;
	case 98:
		var h = new Hash();
		this.cache.push(h);
		var buf = this.buf;
		while(this.buf.cca(this.pos) != 104) {
			var s = this.unserialize();
			h.set(s,this.unserialize());
		}
		this.pos++;
		return h;
	case 113:
		var h = new IntHash();
		this.cache.push(h);
		var buf = this.buf;
		var c = this.buf.cca(this.pos++);
		while(c == 58) {
			var i = this.readDigits();
			h.set(i,this.unserialize());
			c = this.buf.cca(this.pos++);
		}
		if(c != 104) throw "Invalid IntHash format";
		return h;
	case 118:
		var d = Date.fromString(this.buf.substr(this.pos,19));
		this.cache.push(d);
		this.pos += 19;
		return d;
	case 115:
		var len = this.readDigits();
		var buf = this.buf;
		if(this.buf.cca(this.pos++) != 58 || this.length - this.pos < len) throw "Invalid bytes length";
		var codes = haxe.Unserializer.CODES;
		if(codes == null) {
			codes = haxe.Unserializer.initCodes();
			haxe.Unserializer.CODES = codes;
		}
		var i = this.pos;
		var rest = len & 3;
		var size = (len >> 2) * 3 + (rest >= 2?rest - 1:0);
		var max = i + (len - rest);
		var bytes = haxe.io.Bytes.alloc(size);
		var bpos = 0;
		while(i < max) {
			var c1 = codes[buf.cca(i++)];
			var c2 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (c1 << 2 | c2 >> 4) & 255;
			var c3 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (c2 << 4 | c3 >> 2) & 255;
			var c4 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (c3 << 6 | c4) & 255;
		}
		if(rest >= 2) {
			var c1 = codes[buf.cca(i++)];
			var c2 = codes[buf.cca(i++)];
			bytes.b[bpos++] = (c1 << 2 | c2 >> 4) & 255;
			if(rest == 3) {
				var c3 = codes[buf.cca(i++)];
				bytes.b[bpos++] = (c2 << 4 | c3 >> 2) & 255;
			}
		}
		this.pos += len;
		this.cache.push(bytes);
		return bytes;
	case 67:
		var name = this.unserialize();
		var cl = this.resolver.resolveClass(name);
		if(cl == null) throw "Class not found " + name;
		var o = Type.createEmptyInstance(cl);
		this.cache.push(o);
		o.hxUnserialize(this);
		if(this.buf.cca(this.pos++) != 103) throw "Invalid custom data";
		return o;
	default:
	}
	this.pos--;
	throw "Invalid char " + this.buf.charAt(this.pos) + " at position " + this.pos;
}
haxe.Unserializer.prototype.__class__ = haxe.Unserializer;
gridbee.worksource.boinc.reply.SchedulerReply = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("scheduler_version")) this.scheduler_version = Std.parseInt(node.node.resolve("scheduler_version").getInnerData());
	if(node.hasNode.resolve("master_url")) this.master_url = node.node.resolve("master_url").getInnerData();
	if(node.hasNode.resolve("request_delay")) this.request_delay = Std.parseFloat(node.node.resolve("request_delay").getInnerData());
	if(node.hasNode.resolve("hostid")) this.hostid = Std.parseInt(node.node.resolve("hostid").getInnerData());
	if(node.hasNode.resolve("project_name")) this.project_name = node.node.resolve("project_name").getInnerData();
	if(node.hasNode.resolve("user_name")) this.user_name = node.node.resolve("user_name").getInnerData();
	if(node.hasNode.resolve("user_total_credit")) this.user_total_credit = Std.parseFloat(node.node.resolve("user_total_credit").getInnerData());
	if(node.hasNode.resolve("user_expavg_credit")) this.user_expavg_credit = Std.parseFloat(node.node.resolve("user_expavg_credit").getInnerData());
	if(node.hasNode.resolve("user_create_time")) this.user_create_time = Std.parseInt(node.node.resolve("user_create_time").getInnerData());
	if(node.hasNode.resolve("email_hash")) this.email_hash = node.node.resolve("email_hash").getInnerData();
	if(node.hasNode.resolve("cross_project_id")) this.cross_project_id = node.node.resolve("cross_project_id").getInnerData();
	if(node.hasNode.resolve("host_total_credit")) this.host_total_credit = Std.parseFloat(node.node.resolve("host_total_credit").getInnerData());
	if(node.hasNode.resolve("host_expavg_credit")) this.host_expavg_credit = Std.parseFloat(node.node.resolve("host_expavg_credit").getInnerData());
	if(node.hasNode.resolve("host_create_time")) this.host_create_time = Std.parseInt(node.node.resolve("host_create_time").getInnerData());
	if(node.hasNode.resolve("team_name")) this.team_name = node.node.resolve("team_name").getInnerData();
	this.message = new Array();
	this.app = new Array();
	this.app_version = new Array();
	this.file_info = new Array();
	this.workunit = new Array();
	this.result = new Array();
	this.result_ack = new Array();
	if(node.hasNode.resolve("message")) {
		var $it0 = node.nodes.resolve("message").iterator();
		while( $it0.hasNext() ) {
			var child = $it0.next();
			this.message.push(new gridbee.worksource.boinc.reply.Message(child));
		}
	}
	if(node.hasNode.resolve("app")) {
		var $it1 = node.nodes.resolve("app").iterator();
		while( $it1.hasNext() ) {
			var child = $it1.next();
			this.app.push(new gridbee.worksource.boinc.reply.Application(child));
		}
	}
	if(node.hasNode.resolve("app_version")) {
		var $it2 = node.nodes.resolve("app_version").iterator();
		while( $it2.hasNext() ) {
			var child = $it2.next();
			this.app_version.push(new gridbee.worksource.boinc.reply.AppVersion(child));
		}
	}
	if(node.hasNode.resolve("file_info")) {
		var $it3 = node.nodes.resolve("file_info").iterator();
		while( $it3.hasNext() ) {
			var child = $it3.next();
			this.file_info.push(new gridbee.worksource.boinc.reply.FileInfo(child));
		}
	}
	if(node.hasNode.resolve("workunit")) {
		var $it4 = node.nodes.resolve("workunit").iterator();
		while( $it4.hasNext() ) {
			var child = $it4.next();
			this.workunit.push(new gridbee.worksource.boinc.reply.Workunit(child));
		}
	}
	if(node.hasNode.resolve("result")) {
		var $it5 = node.nodes.resolve("result").iterator();
		while( $it5.hasNext() ) {
			var child = $it5.next();
			this.result.push(new gridbee.worksource.boinc.reply.ResultSlot(child));
		}
	}
	if(node.hasNode.resolve("result_ack")) {
		var $it6 = node.nodes.resolve("result_ack").iterator();
		while( $it6.hasNext() ) {
			var child = $it6.next();
			this.result_ack.push(new gridbee.worksource.boinc.reply.ResultAck(child));
		}
	}
}
gridbee.worksource.boinc.reply.SchedulerReply.__name__ = ["gridbee","worksource","boinc","reply","SchedulerReply"];
gridbee.worksource.boinc.reply.SchedulerReply.prototype.scheduler_version = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.master_url = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.request_delay = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.hostid = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.project_name = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.user_name = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.user_total_credit = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.user_expavg_credit = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.user_create_time = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.email_hash = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.cross_project_id = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.host_total_credit = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.host_expavg_credit = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.host_create_time = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.team_name = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.message = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.app = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.app_version = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.file_info = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.workunit = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.result = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.result_ack = null;
gridbee.worksource.boinc.reply.SchedulerReply.prototype.__class__ = gridbee.worksource.boinc.reply.SchedulerReply;
gridbee.worksource.boinc.reply.Workunit = function(node) {
	if( node === $_ ) return;
	if(node.hasNode.resolve("name")) this.name = node.node.resolve("name").getInnerData();
	if(node.hasNode.resolve("app_name")) this.app_name = node.node.resolve("app_name").getInnerData();
	if(node.hasNode.resolve("command_line")) this.command_line = node.node.resolve("command_line").getInnerData();
	if(node.hasNode.resolve("rsc_fpops_est")) this.rsc_fpops_est = Std.parseFloat(node.node.resolve("rsc_fpops_est").getInnerData());
	if(node.hasNode.resolve("rsc_fpops_bound")) this.rsc_fpops_bound = Std.parseFloat(node.node.resolve("rsc_fpops_bound").getInnerData());
	if(node.hasNode.resolve("rsc_memory_bound")) this.rsc_memory_bound = Std.parseFloat(node.node.resolve("rsc_memory_bound").getInnerData());
	if(node.hasNode.resolve("rsc_disk_bound")) this.rsc_disk_bound = Std.parseFloat(node.node.resolve("rsc_disk_bound").getInnerData());
	this.file_ref = new Array();
	if(node.hasNode.resolve("file_ref")) {
		var $it0 = node.nodes.resolve("file_ref").iterator();
		while( $it0.hasNext() ) {
			var child = $it0.next();
			this.file_ref.push(new gridbee.worksource.boinc.reply.FileRef(child));
		}
	}
}
gridbee.worksource.boinc.reply.Workunit.__name__ = ["gridbee","worksource","boinc","reply","Workunit"];
gridbee.worksource.boinc.reply.Workunit.prototype.name = null;
gridbee.worksource.boinc.reply.Workunit.prototype.app_name = null;
gridbee.worksource.boinc.reply.Workunit.prototype.command_line = null;
gridbee.worksource.boinc.reply.Workunit.prototype.rsc_fpops_est = null;
gridbee.worksource.boinc.reply.Workunit.prototype.rsc_fpops_bound = null;
gridbee.worksource.boinc.reply.Workunit.prototype.rsc_memory_bound = null;
gridbee.worksource.boinc.reply.Workunit.prototype.rsc_disk_bound = null;
gridbee.worksource.boinc.reply.Workunit.prototype.file_ref = null;
gridbee.worksource.boinc.reply.Workunit.prototype.application = null;
gridbee.worksource.boinc.reply.Workunit.prototype.result = null;
gridbee.worksource.boinc.reply.Workunit.prototype.__class__ = gridbee.worksource.boinc.reply.Workunit;
gridbee.core.work.hxjson2.JSONTokenizer = function(s,strict) {
	if( s === $_ ) return;
	this.jsonString = s;
	this.strict = strict;
	this.loc = 0;
	this.nextChar();
}
gridbee.core.work.hxjson2.JSONTokenizer.__name__ = ["gridbee","core","work","hxjson2","JSONTokenizer"];
gridbee.core.work.hxjson2.JSONTokenizer.prototype.obj = null;
gridbee.core.work.hxjson2.JSONTokenizer.prototype.jsonString = null;
gridbee.core.work.hxjson2.JSONTokenizer.prototype.loc = null;
gridbee.core.work.hxjson2.JSONTokenizer.prototype.ch = null;
gridbee.core.work.hxjson2.JSONTokenizer.prototype.strict = null;
gridbee.core.work.hxjson2.JSONTokenizer.prototype.getNextToken = function() {
	var token = new gridbee.core.work.hxjson2.JSONToken();
	this.skipIgnored();
	switch(this.ch) {
	case "{":
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACE;
		token.value = "{";
		this.nextChar();
		break;
	case "}":
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACE;
		token.value = "}";
		this.nextChar();
		break;
	case "[":
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tLEFT_BRACKET;
		token.value = "[";
		this.nextChar();
		break;
	case "]":
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tRIGHT_BRACKET;
		token.value = "]";
		this.nextChar();
		break;
	case ",":
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tCOMMA;
		token.value = ",";
		this.nextChar();
		break;
	case ":":
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tCOLON;
		token.value = ":";
		this.nextChar();
		break;
	case "t":
		var possibleTrue = "t" + (this.nextChar() + this.nextChar() + this.nextChar());
		if(possibleTrue == "true") {
			token.type = gridbee.core.work.hxjson2.JSONTokenType.tTRUE;
			token.value = true;
			this.nextChar();
		} else this.parseError("Expecting 'true' but found " + possibleTrue);
		break;
	case "f":
		var possibleFalse = "f" + this.nextChar() + this.nextChar() + this.nextChar() + this.nextChar();
		if(possibleFalse == "false") {
			token.type = gridbee.core.work.hxjson2.JSONTokenType.tFALSE;
			token.value = false;
			this.nextChar();
		} else this.parseError("Expecting 'false' but found " + possibleFalse);
		break;
	case "n":
		var possibleNull = "n" + this.nextChar() + this.nextChar() + this.nextChar();
		if(possibleNull == "null") {
			token.type = gridbee.core.work.hxjson2.JSONTokenType.tNULL;
			token.value = null;
			this.nextChar();
		} else this.parseError("Expecting 'null' but found " + possibleNull);
		break;
	case "N":
		var possibleNAN = "N" + this.nextChar() + this.nextChar();
		if(possibleNAN == "NAN" || possibleNAN == "NaN") {
			token.type = gridbee.core.work.hxjson2.JSONTokenType.tNAN;
			token.value = Math.NaN;
			this.nextChar();
		} else this.parseError("Expecting 'nan' but found " + possibleNAN);
		break;
	case "\"":
		token = this.readString();
		break;
	default:
		if(this.isDigit(this.ch) || this.ch == "-") token = this.readNumber(); else if(this.ch == "") return null; else this.parseError("Unexpected " + this.ch + " encountered");
	}
	return token;
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.readString = function() {
	var string = "";
	this.nextChar();
	while(this.ch != "\"" && this.ch != "") {
		if(this.ch == "\\") {
			this.nextChar();
			switch(this.ch) {
			case "\"":
				string += "\"";
				break;
			case "/":
				string += "/";
				break;
			case "\\/":
				string += "/";
				break;
			case "\\":
				string += "\\";
				break;
			case "n":
				string += "\n";
				break;
			case "r":
				string += "\r";
				break;
			case "t":
				string += "\t";
				break;
			case "u":
				var hexValue = "";
				var _g = 0;
				while(_g < 4) {
					var i = _g++;
					if(!this.isHexDigit(this.nextChar())) this.parseError(" Excepted a hex digit, but found: " + this.ch);
					hexValue += this.ch;
				}
				string += String.fromCharCode(this.hexValToInt(hexValue));
				break;
			default:
				string += "\\" + this.ch;
			}
		} else string += this.ch;
		this.nextChar();
	}
	if(this.ch == "") this.parseError("Unterminated string literal");
	this.nextChar();
	var token = new gridbee.core.work.hxjson2.JSONToken();
	token.type = gridbee.core.work.hxjson2.JSONTokenType.tSTRING;
	token.value = string;
	return token;
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.hexValToInt = function(hexVal) {
	var ret = 0;
	var _g1 = 0, _g = hexVal.length;
	while(_g1 < _g) {
		var i = _g1++;
		ret = ret << 4;
		switch(hexVal.charAt(i).toUpperCase()) {
		case "1":
			ret += 1;
			break;
		case "2":
			ret += 2;
			break;
		case "3":
			ret += 3;
			break;
		case "4":
			ret += 4;
			break;
		case "5":
			ret += 5;
			break;
		case "6":
			ret += 6;
			break;
		case "7":
			ret += 7;
			break;
		case "8":
			ret += 8;
			break;
		case "9":
			ret += 9;
			break;
		case "A":
			ret += 10;
			break;
		case "B":
			ret += 11;
			break;
		case "C":
			ret += 12;
			break;
		case "D":
			ret += 13;
			break;
		case "E":
			ret += 14;
			break;
		case "F":
			ret += 15;
			break;
		}
	}
	return ret;
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.readNumber = function() {
	var input = "";
	if(this.ch == "-") {
		input += "-";
		this.nextChar();
	}
	if(!this.isDigit(this.ch)) this.parseError("Expecting a digit");
	if(this.ch == "0") {
		input += this.ch;
		this.nextChar();
		if(this.isDigit(this.ch)) this.parseError("A digit cannot immediately follow 0"); else if(!this.strict && this.ch == "x") {
			input += this.ch;
			this.nextChar();
			if(this.isHexDigit(this.ch)) {
				input += this.ch;
				this.nextChar();
			} else this.parseError("Number in hex format require at least one hex digit after \"0x\"");
			while(this.isHexDigit(this.ch)) {
				input += this.ch;
				this.nextChar();
			}
			input = Std.string(this.hexValToInt(input));
		}
	} else while(this.isDigit(this.ch)) {
		input += this.ch;
		this.nextChar();
	}
	if(this.ch == ".") {
		input += ".";
		this.nextChar();
		if(!this.isDigit(this.ch)) this.parseError("Expecting a digit");
		while(this.isDigit(this.ch)) {
			input += this.ch;
			this.nextChar();
		}
	}
	if(this.ch == "e" || this.ch == "E") {
		input += "e";
		this.nextChar();
		if(this.ch == "+" || this.ch == "-") {
			input += this.ch;
			this.nextChar();
		}
		if(!this.isDigit(this.ch)) this.parseError("Scientific notation number needs exponent value");
		while(this.isDigit(this.ch)) {
			input += this.ch;
			this.nextChar();
		}
	}
	var num = Std.parseFloat(input);
	if(Math.isFinite(num) && !Math.isNaN(num)) {
		var token = new gridbee.core.work.hxjson2.JSONToken();
		token.type = gridbee.core.work.hxjson2.JSONTokenType.tNUMBER;
		token.value = num;
		return token;
	} else this.parseError("Number " + num + " is not valid!");
	return null;
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.nextChar = function() {
	return this.ch = this.jsonString.charAt(this.loc++);
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.skipIgnored = function() {
	var originalLoc;
	do {
		originalLoc = this.loc;
		this.skipWhite();
		this.skipComments();
	} while(originalLoc != this.loc);
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.skipComments = function() {
	if(this.ch == "/") {
		this.nextChar();
		switch(this.ch) {
		case "/":
			do this.nextChar(); while(this.ch != "\n" && this.ch != "");
			this.nextChar();
			break;
		case "*":
			this.nextChar();
			while(true) {
				if(this.ch == "*") {
					this.nextChar();
					if(this.ch == "/") {
						this.nextChar();
						break;
					}
				} else this.nextChar();
				if(this.ch == "") this.parseError("Multi-line comment not closed");
			}
			break;
		default:
			this.parseError("Unexpected " + this.ch + " encountered (expecting '/' or '*' )");
		}
	}
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.skipWhite = function() {
	while(this.isWhiteSpace(this.ch)) this.nextChar();
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.isWhiteSpace = function(ch) {
	return ch == " " || ch == "\t" || ch == "\n" || ch == "\r";
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.isDigit = function(ch) {
	return ch >= "0" && ch <= "9";
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.isHexDigit = function(ch) {
	var uc = ch.toUpperCase();
	return this.isDigit(ch) || uc >= "A" && uc <= "F";
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.parseError = function(message) {
	throw new gridbee.core.work.hxjson2.JSONParseError(message,this.loc,this.jsonString);
}
gridbee.core.work.hxjson2.JSONTokenizer.prototype.__class__ = gridbee.core.work.hxjson2.JSONTokenizer;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("platform_short")) this.platform_short = input.node.resolve("platform_short").getInnerData();
	if(input.hasNode.resolve("platform_long")) this.platform_long = input.node.resolve("platform_long").getInnerData();
	if(input.hasNode.resolve("version_num")) this.version_num = Std.parseFloat(input.node.resolve("version_num").getInnerData());
	if(input.hasNode.resolve("plan_class")) this.plan_class = input.node.resolve("plan_class").getInnerData();
	if(input.hasNode.resolve("date")) this.date = input.node.resolve("date").getInnerData();
	if(input.hasNode.resolve("date_unix")) this.date_unix = Std.parseInt(input.node.resolve("date").getInnerData());
}
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","ApplicVersion"];
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.platform_short = null;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.platform_long = null;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.version_num = null;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.plan_class = null;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.date = null;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.date_unix = null;
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.print = function() {
	haxe.Log.trace("platform_short: " + this.platform_short,{ fileName : "ApplicVersion.hx", lineNumber : 49, className : "gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion", methodName : "print"});
	haxe.Log.trace("platform_long: " + this.platform_long,{ fileName : "ApplicVersion.hx", lineNumber : 50, className : "gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion", methodName : "print"});
	haxe.Log.trace("version_num: " + this.version_num,{ fileName : "ApplicVersion.hx", lineNumber : 51, className : "gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion", methodName : "print"});
	haxe.Log.trace("plan_class: " + this.plan_class,{ fileName : "ApplicVersion.hx", lineNumber : 52, className : "gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion", methodName : "print"});
	haxe.Log.trace("date: " + this.date,{ fileName : "ApplicVersion.hx", lineNumber : 53, className : "gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion", methodName : "print"});
	haxe.Log.trace("date_unix: " + this.date_unix,{ fileName : "ApplicVersion.hx", lineNumber : 54, className : "gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.ApplicVersion;
gridbee.worksource.boinc.webrpc.result.PendingCreditRes = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("total_claimed_credit")) this.total_claimed_credit = Std.parseFloat(input.node.resolve("total_claimed_credit").getInnerData());
	if(input.hasNode.resolve("result")) {
		this.pending_arr = new Array();
		var $it0 = input.nodes.resolve("result").iterator();
		while( $it0.hasNext() ) {
			var i = $it0.next();
			this.pending_arr.push(new gridbee.worksource.boinc.webrpc.subclasses.PendingCredit(i));
		}
	}
}
gridbee.worksource.boinc.webrpc.result.PendingCreditRes.__name__ = ["gridbee","worksource","boinc","webrpc","result","PendingCreditRes"];
gridbee.worksource.boinc.webrpc.result.PendingCreditRes.prototype.total_claimed_credit = null;
gridbee.worksource.boinc.webrpc.result.PendingCreditRes.prototype.pending_arr = null;
gridbee.worksource.boinc.webrpc.result.PendingCreditRes.prototype.print = function() {
	haxe.Log.trace("total_claimed_credit: " + this.total_claimed_credit,{ fileName : "PendingCreditRes.hx", lineNumber : 41, className : "gridbee.worksource.boinc.webrpc.result.PendingCreditRes", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.result.PendingCreditRes.prototype.__class__ = gridbee.worksource.boinc.webrpc.result.PendingCreditRes;
gridbee.worksource.boinc.webrpc.subclasses.Platforms = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("platform_name")) this.platform_name = input.node.resolve("platform_name").getInnerData();
	if(input.hasNode.resolve("user_friendly_name")) this.user_friendly_name = input.node.resolve("user_friendly_name").getInnerData();
}
gridbee.worksource.boinc.webrpc.subclasses.Platforms.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","Platforms"];
gridbee.worksource.boinc.webrpc.subclasses.Platforms.prototype.platform_name = null;
gridbee.worksource.boinc.webrpc.subclasses.Platforms.prototype.user_friendly_name = null;
gridbee.worksource.boinc.webrpc.subclasses.Platforms.prototype.print = function() {
	haxe.Log.trace("platform_name: " + this.platform_name,{ fileName : "Platforms.hx", lineNumber : 37, className : "gridbee.worksource.boinc.webrpc.subclasses.Platforms", methodName : "print"});
	haxe.Log.trace("user_friendly_name: " + this.user_friendly_name,{ fileName : "Platforms.hx", lineNumber : 38, className : "gridbee.worksource.boinc.webrpc.subclasses.Platforms", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.Platforms.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.Platforms;
gridbee.worksource.boinc.webrpc.BoincWebRPC = function(projectUrl) {
	if( projectUrl === $_ ) return;
	while(StringTools.endsWith(projectUrl,"/")) projectUrl = projectUrl.substr(0,projectUrl.length - 1);
	this.projectUrl = projectUrl;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.__name__ = ["gridbee","worksource","boinc","webrpc","BoincWebRPC"];
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.projectUrl = null;
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.lookupAccount = function(email,passwd) {
	var operation = new henkolib.async.AsyncOperation();
	var passwd_hash;
	var url;
	email = email.toLowerCase();
	passwd_hash = haxe.Md5.encode(passwd + email);
	url = this.projectUrl + "/lookup_account.php?email_addr=" + email + "&passwd_hash=" + passwd_hash + "&get_opaque_auth=0";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.LookupAccRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getAccountInfo = function(Auth) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/am_get_info.php?account_key=" + Auth;
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.AccountInfoRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.setAccountInfo = function(Auth,email_addr,password,name,country,postal_code,global_prefs,project_prefs,yoururl,send_email,show_hosts,teamid,venue) {
	if(venue == null) venue = "";
	if(teamid == null) teamid = -1;
	if(show_hosts == null) show_hosts = -1;
	if(send_email == null) send_email = -1;
	if(yoururl == null) yoururl = "";
	if(project_prefs == null) project_prefs = "";
	if(global_prefs == null) global_prefs = "";
	if(postal_code == null) postal_code = "";
	if(country == null) country = "";
	if(name == null) name = "";
	if(password == null) password = "";
	if(email_addr == null) email_addr = "";
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/am_set_info.php?account_key=" + Auth;
	if(email_addr != "") url += "&email_addr=" + email_addr.toLowerCase();
	if(password != "") url += "&password_hash=" + haxe.Md5.encode(password + email_addr.toLowerCase());
	if(name != "") url += "&name=" + StringTools.urlEncode(name);
	if(country != "") url += "&country=" + StringTools.urlEncode(country);
	if(postal_code != "") url += "&postal_code=" + StringTools.urlEncode(postal_code);
	if(global_prefs != "") url += "&global_prefs=" + StringTools.urlEncode(global_prefs);
	if(project_prefs != "") url += "&project_prefs=" + StringTools.urlEncode(project_prefs);
	if(yoururl != "") url += "&url=" + yoururl;
	if(send_email != -1) {
		if(send_email == 1) url += "&send_email=1"; else if(send_email == 0) url += "&send_email=0";
	}
	if(show_hosts != -1) {
		if(show_hosts == 1) url += "&show_hosts=1"; else if(show_hosts == 0) url += "&show_hosts=0";
	}
	if(teamid != -1) url += "&teamid=" + teamid;
	if(venue != "") url += "&venue=" + StringTools.urlEncode(venue);
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.SetAccountInfoRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.createAccount = function(username,email,passwd) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	var passwd_hash;
	email = email.toLowerCase();
	passwd_hash = haxe.Md5.encode(passwd + email);
	url = this.projectUrl + "/create_account.php?email_addr=" + email + "&passwd_hash=" + passwd_hash + "&user_name=" + username;
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.AccountCreateRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getCreditInformationWithID = function(Id) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/show_user.php?userid=" + Id + "&format=xml";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.CreditInfoRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getCreditInformationWithAuth = function(Auth) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/show_user.php?auth=" + Auth + "&format=xml";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.CreditInfoRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getPendingCreditInfo = function(Auth) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/pending.php?authenticator=" + Auth + "&format=xml";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.PendingCreditRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.setHostInfo = function(Auth,hostid,venue) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/am_set_host_info.php?account_key=" + Auth + "&hostid=" + hostid + "&venue=" + StringTools.urlEncode(venue);
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.SetHostInfoRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.createTeam = function(Auth,TeamName,TeamType,TeamDescription,TeamCountry,TeamUrl,TeamNameHTML) {
	if(TeamNameHTML == null) TeamNameHTML = "";
	if(TeamCountry == null) TeamCountry = "";
	if(TeamDescription == null) TeamDescription = "";
	var operation = new henkolib.async.AsyncOperation();
	var url;
	if(TeamNameHTML == "") TeamNameHTML = TeamName;
	url = this.projectUrl + "/create_team.php?account_key=" + Auth + "&name=" + StringTools.urlEncode(TeamName) + "&type=" + StringTools.urlEncode(TeamType) + "&name_html=" + StringTools.htmlEscape(TeamNameHTML);
	if(TeamDescription != "") url += "&description=" + StringTools.urlEncode(TeamDescription);
	if(TeamCountry != "") url += "&country=" + StringTools.urlEncode(TeamCountry);
	if(TeamUrl != "") url += "&url=" + TeamUrl;
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.CreateTeamRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.lookupTeamByName = function(TeamName) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/team_lookup.php?team_name=" + StringTools.urlEncode(TeamName) + "&format=xml";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.LookupTeamsRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.lookupTeamByID = function(TeamID) {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/team_lookup.php?team_id=" + TeamID + "&format=xml";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.LookupTeamsRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getTeamMembersList = function(TeamID,TeamAdminAuth) {
	if(TeamAdminAuth == null) TeamAdminAuth = "";
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/team_email_list.php?teamid=" + TeamID + "&xml=1";
	if(TeamAdminAuth != "") url += "&account_key=" + TeamAdminAuth;
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.TeamMembrListRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getServerStatus = function() {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/server_status.php?xml=1";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		if(response.content.indexOf("Access denied") != -1) operation.setError("Access denied, you might have to log in for this action"); else {
			var inXml = Xml.parse(response.content);
			var input = new haxe.xml.Fast(inXml.firstElement());
			if(input.getName() == "error") {
				if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
			} else {
				var output = new gridbee.worksource.boinc.webrpc.result.ServerStatusRes(input);
				operation.setResult(output);
			}
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.getApplicationVersionsList = function() {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/apps.php?xml=1";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.ApplicVersionRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.projectConfiguration = function() {
	var operation = new henkolib.async.AsyncOperation();
	var url;
	url = this.projectUrl + "/get_project_config.php";
	var req = gridbee.core.net.HTTPRequest.get(url).send();
	req.onComplete.subscribe(function(response) {
		var inXml = Xml.parse(response.content);
		var input = new haxe.xml.Fast(inXml.firstElement());
		if(input.getName() == "error") {
			if(input.hasNode.resolve("error_msg")) operation.setError(input.node.resolve("error_msg").getInnerData()); else if(input.hasNode.resolve("error_string")) operation.setError(input.node.resolve("error_string").getInnerData());
		} else {
			var output = new gridbee.worksource.boinc.webrpc.result.ProjectConfigRes(input);
			operation.setResult(output);
		}
	});
	req.onError.subscribe(function(error) {
		operation.setError(error);
	});
	return operation;
}
gridbee.worksource.boinc.webrpc.BoincWebRPC.prototype.__class__ = gridbee.worksource.boinc.webrpc.BoincWebRPC;
gridbee.worksource.boinc.BoincResultState = { __ename__ : ["gridbee","worksource","boinc","BoincResultState"], __constructs__ : ["New","CheckingStatus","ReadyToUpload","Uploading","Uploaded","Error"] }
gridbee.worksource.boinc.BoincResultState.New = ["New",0];
gridbee.worksource.boinc.BoincResultState.New.toString = $estr;
gridbee.worksource.boinc.BoincResultState.New.__enum__ = gridbee.worksource.boinc.BoincResultState;
gridbee.worksource.boinc.BoincResultState.CheckingStatus = ["CheckingStatus",1];
gridbee.worksource.boinc.BoincResultState.CheckingStatus.toString = $estr;
gridbee.worksource.boinc.BoincResultState.CheckingStatus.__enum__ = gridbee.worksource.boinc.BoincResultState;
gridbee.worksource.boinc.BoincResultState.ReadyToUpload = ["ReadyToUpload",2];
gridbee.worksource.boinc.BoincResultState.ReadyToUpload.toString = $estr;
gridbee.worksource.boinc.BoincResultState.ReadyToUpload.__enum__ = gridbee.worksource.boinc.BoincResultState;
gridbee.worksource.boinc.BoincResultState.Uploading = ["Uploading",3];
gridbee.worksource.boinc.BoincResultState.Uploading.toString = $estr;
gridbee.worksource.boinc.BoincResultState.Uploading.__enum__ = gridbee.worksource.boinc.BoincResultState;
gridbee.worksource.boinc.BoincResultState.Uploaded = ["Uploaded",4];
gridbee.worksource.boinc.BoincResultState.Uploaded.toString = $estr;
gridbee.worksource.boinc.BoincResultState.Uploaded.__enum__ = gridbee.worksource.boinc.BoincResultState;
gridbee.worksource.boinc.BoincResultState.Error = ["Error",5];
gridbee.worksource.boinc.BoincResultState.Error.toString = $estr;
gridbee.worksource.boinc.BoincResultState.Error.__enum__ = gridbee.worksource.boinc.BoincResultState;
gridbee.worksource.boinc.BoincResult = function(workunit,slot,fileref,data) {
	if( workunit === $_ ) return;
	this.workunit = workunit;
	this.slot = slot;
	this.fileref = fileref;
	this.data = data;
	this.md5 = haxe.Md5.encode(data);
	this.offset = 0;
	this.state = gridbee.worksource.boinc.BoincResultState.New;
	this.accepted = false;
	this.changed = true;
}
gridbee.worksource.boinc.BoincResult.__name__ = ["gridbee","worksource","boinc","BoincResult"];
gridbee.worksource.boinc.BoincResult.prototype.state = null;
gridbee.worksource.boinc.BoincResult.prototype.workunit = null;
gridbee.worksource.boinc.BoincResult.prototype.slot = null;
gridbee.worksource.boinc.BoincResult.prototype.fileref = null;
gridbee.worksource.boinc.BoincResult.prototype.data = null;
gridbee.worksource.boinc.BoincResult.prototype.md5 = null;
gridbee.worksource.boinc.BoincResult.prototype.changed = null;
gridbee.worksource.boinc.BoincResult.prototype.offset = null;
gridbee.worksource.boinc.BoincResult.prototype.accepted = null;
gridbee.worksource.boinc.BoincResult.prototype.statusCheckOperation = null;
gridbee.worksource.boinc.BoincResult.prototype.uploadOperation = null;
gridbee.worksource.boinc.BoincResult.prototype.reportOperation = null;
gridbee.worksource.boinc.BoincResult.prototype.isCompleted = function() {
	return this.state == gridbee.worksource.boinc.BoincResultState.Uploaded;
}
gridbee.worksource.boinc.BoincResult.prototype.isError = function() {
	return this.state == gridbee.worksource.boinc.BoincResultState.Error;
}
gridbee.worksource.boinc.BoincResult.prototype.SwitchState = function(newstate) {
	this.changed = true;
	this.state = newstate;
	henkolib.log.Console.main.logDebug("Changed state to " + this.getState(),null,this,{ fileName : "BoincResult.hx", lineNumber : 94, className : "gridbee.worksource.boinc.BoincResult", methodName : "SwitchState"});
}
gridbee.worksource.boinc.BoincResult.prototype.getScreenName = function() {
	return this.workunit.getScreenName() + " / Result " + this.slot.name + " / " + this.fileref.open_name;
}
gridbee.worksource.boinc.BoincResult.prototype.getStateString = function() {
	switch( (this.state)[1] ) {
	case 0:
		return "New";
	case 1:
		return "Checking upload status";
	case 2:
		return "Ready to upload";
	case 3:
		return "Uploading";
	case 4:
		return "Uploaded";
	case 5:
		return "Error";
	default:
		return "Unknown";
	}
}
gridbee.worksource.boinc.BoincResult.prototype.isChanged = function() {
	return this.changed;
}
gridbee.worksource.boinc.BoincResult.prototype.getState = function() {
	return this.state;
}
gridbee.worksource.boinc.BoincResult.prototype.operate = function() {
	switch( (this.state)[1] ) {
	case 0:
		henkolib.log.Console.main.logInformation("Checking upload status.",null,this,{ fileName : "BoincResult.hx", lineNumber : 132, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
		this.statusCheckOperation = this.checkUploadStatus(this.fileref);
		this.SwitchState(gridbee.worksource.boinc.BoincResultState.CheckingStatus);
		break;
	case 1:
		if(this.statusCheckOperation.isCompleted()) {
			var response = this.statusCheckOperation.getResult();
			var xml = new haxe.xml.Fast(Xml.parse(response.content).firstElement());
			var reply = new gridbee.worksource.boinc.reply.DataServerReply(xml);
			if(reply.status == 0) {
				if(reply.file_size == 0) {
					henkolib.log.Console.main.logInformation("This result is not uploaded yet.",null,this,{ fileName : "BoincResult.hx", lineNumber : 150, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
					this.SwitchState(gridbee.worksource.boinc.BoincResultState.ReadyToUpload);
				} else if(reply.file_size < this.data.length) {
					henkolib.log.Console.main.logInformation("Partial upload present. Continuing upload.",null,this,{ fileName : "BoincResult.hx", lineNumber : 157, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
					this.offset = reply.file_size;
					this.SwitchState(gridbee.worksource.boinc.BoincResultState.ReadyToUpload);
				} else {
					henkolib.log.Console.main.logInformation("This result has been already uploaded.",null,this,{ fileName : "BoincResult.hx", lineNumber : 165, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
					this.SwitchState(gridbee.worksource.boinc.BoincResultState.Uploaded);
				}
			} else {
				henkolib.log.Console.main.logWarning("Could not retrieve result status.",null,this,{ fileName : "BoincResult.hx", lineNumber : 171, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
				this.SwitchState(gridbee.worksource.boinc.BoincResultState.Error);
			}
		}
		break;
	case 2:
		henkolib.log.Console.main.logInformation("Uploading: " + (this.data.length - this.offset) + " bytes",null,this,{ fileName : "BoincResult.hx", lineNumber : 179, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
		this.uploadOperation = this.uploadResult(this.fileref,this.data,this.offset,this.md5);
		this.SwitchState(gridbee.worksource.boinc.BoincResultState.Uploading);
		break;
	case 3:
		if(this.uploadOperation.isCompleted()) {
			var response = this.uploadOperation.getResult();
			var xml = new haxe.xml.Fast(Xml.parse(response.content).firstElement());
			var reply = new gridbee.worksource.boinc.reply.DataServerReply(xml);
			if(reply.message != null) henkolib.log.Console.main.logWarning("Upload handler message: " + reply.message,null,this,{ fileName : "BoincResult.hx", lineNumber : 194, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
			if(reply.status == 0) {
				henkolib.log.Console.main.logInformation("Uploaded successfully.",null,this,{ fileName : "BoincResult.hx", lineNumber : 199, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
				this.SwitchState(gridbee.worksource.boinc.BoincResultState.Uploaded);
			} else {
				henkolib.log.Console.main.logWarning("Could not upload result.",null,this,{ fileName : "BoincResult.hx", lineNumber : 204, className : "gridbee.worksource.boinc.BoincResult", methodName : "operate"});
				this.SwitchState(gridbee.worksource.boinc.BoincResultState.Error);
			}
		}
		break;
	case 4:
		break;
	case 5:
		break;
	}
}
gridbee.worksource.boinc.BoincResult.prototype.getFileInfo = function() {
	var info = new gridbee.worksource.boinc.request.ResultFileinfo();
	info.name = this.slot.name;
	info.file_name = this.fileref.file_name;
	info.nbytes = this.data.length;
	info.max_nbytes = this.fileref.file_info.max_nbytes;
	info.md5_cksum = this.md5;
	info.url = this.fileref.file_info.url;
	return info;
}
gridbee.worksource.boinc.BoincResult.prototype.isAccepted = function() {
	return this.accepted;
}
gridbee.worksource.boinc.BoincResult.prototype.setAccepted = function() {
	if(this.state == gridbee.worksource.boinc.BoincResultState.Uploaded) this.accepted = true;
}
gridbee.worksource.boinc.BoincResult.prototype.checkUploadStatus = function(fileref) {
	var request = new gridbee.worksource.boinc.request.DataServerRequest();
	request.clientversion = gridbee.worksource.boinc.BoincWorkSource.getVersion();
	request.get_file_size = fileref.file_name;
	var http = gridbee.core.net.HTTPRequest.post(fileref.file_info.url);
	http.rawData(request.toXmlString());
	return http.send();
}
gridbee.worksource.boinc.BoincResult.prototype.uploadResult = function(fileref,data,offset,md5) {
	var request = new gridbee.worksource.boinc.request.DataServerRequest();
	request.clientversion = gridbee.worksource.boinc.BoincWorkSource.getVersion();
	request.file_upload = new gridbee.worksource.boinc.request.FileUpload();
	request.file_upload.file_info = new gridbee.worksource.boinc.request.UploadFileInfo(fileref.file_info);
	request.file_upload.offset = offset;
	request.file_upload.nbytes = data.length;
	request.file_upload.md5_cksum = md5;
	request.file_upload.data = data.substr(offset);
	var http = gridbee.core.net.HTTPRequest.post(fileref.file_info.url);
	http.rawData(request.toXmlString());
	return http.send();
}
gridbee.worksource.boinc.BoincResult.prototype.hxSerialize = function(s) {
	s.serialize(this.state);
	s.serialize(this.workunit);
	s.serialize(this.slot);
	s.serialize(this.fileref);
	s.serialize(this.data);
	s.serialize(this.md5);
	s.serialize(this.offset);
	s.serialize(this.accepted);
	this.changed = false;
}
gridbee.worksource.boinc.BoincResult.prototype.hxUnserialize = function(s) {
	this.state = s.unserialize();
	this.workunit = s.unserialize();
	this.slot = s.unserialize();
	this.fileref = s.unserialize();
	this.data = s.unserialize();
	this.md5 = s.unserialize();
	this.offset = s.unserialize();
	this.accepted = s.unserialize();
	if(this.state == gridbee.worksource.boinc.BoincResultState.Uploading) this.state = gridbee.worksource.boinc.BoincResultState.New;
}
gridbee.worksource.boinc.BoincResult.prototype.__class__ = gridbee.worksource.boinc.BoincResult;
gridbee.worksource.boinc.BoincResult.__interfaces__ = [henkolib.log.LogSource,gridbee.core.iface.Operable];
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("p_fpops")) this.p_fpops = Std.parseFloat(input.node.resolve("p_fpops").getInnerData());
	if(input.hasNode.resolve("p_iops")) this.p_iops = Std.parseFloat(input.node.resolve("p_iops").getInnerData());
	if(input.hasNode.resolve("p_membw")) this.p_membw = Std.parseFloat(input.node.resolve("p_membw").getInnerData());
	if(input.hasNode.resolve("m_nbytes")) this.m_nbytes = Std.parseFloat(input.node.resolve("m_nbytes").getInnerData());
	if(input.hasNode.resolve("m_swap")) this.m_swap = Std.parseFloat(input.node.resolve("m_swap").getInnerData());
	if(input.hasNode.resolve("d_free")) this.d_free = Std.parseFloat(input.node.resolve("d_free").getInnerData());
	if(input.hasNode.resolve("bwup")) this.bwup = Std.parseFloat(input.node.resolve("bwup").getInnerData());
	if(input.hasNode.resolve("bwdown")) this.bwdown = Std.parseFloat(input.node.resolve("bwdown").getInnerData());
}
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","SystemRequirements"];
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.p_fpops = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.p_iops = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.p_membw = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.m_nbytes = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.m_swap = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.d_free = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.bwup = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.bwdown = null;
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.print = function() {
	haxe.Log.trace("p_fpops: " + this.p_fpops,{ fileName : "SystemRequirements.hx", lineNumber : 54, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("p_iops: " + this.p_iops,{ fileName : "SystemRequirements.hx", lineNumber : 55, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("p_membw: " + this.p_membw,{ fileName : "SystemRequirements.hx", lineNumber : 56, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("m_nbytes: " + this.m_nbytes,{ fileName : "SystemRequirements.hx", lineNumber : 57, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("m_swap: " + this.m_swap,{ fileName : "SystemRequirements.hx", lineNumber : 58, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("d_free: " + this.d_free,{ fileName : "SystemRequirements.hx", lineNumber : 59, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("bwup: " + this.bwup,{ fileName : "SystemRequirements.hx", lineNumber : 60, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
	haxe.Log.trace("bwdown: " + this.bwdown,{ fileName : "SystemRequirements.hx", lineNumber : 61, className : "gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.SystemRequirements;
gridbee.worksource.boinc.request.HostInfo = function(p) {
}
gridbee.worksource.boinc.request.HostInfo.__name__ = ["gridbee","worksource","boinc","request","HostInfo"];
gridbee.worksource.boinc.request.HostInfo.updateHostInfo = function(hostinfo) {
	
			var rightNow = new Date();
			var jan1 = new Date(rightNow.getFullYear(), 0, 1, 0, 0, 0, 0);
			var temp = jan1.toGMTString();
			var jan2 = new Date(temp.substring(0, temp.lastIndexOf(" ") - 1));
			var std_time_offset = (jan1 - jan2) / 1000;
		;
	hostinfo.timezone = std_time_offset;
	hostinfo.ip_addr = "0.0.0.0";
	hostinfo.p_ncpus = 1;
	hostinfo.p_vendor = gridbee.core.info.BrowserInfo.browserVendor();
	hostinfo.p_model = gridbee.core.info.BrowserInfo.browserName() + " " + gridbee.core.info.BrowserInfo.browserFullVersion();
	hostinfo.p_features = "";
	if(gridbee.core.info.BrowserInfo.flashInstalled()) hostinfo.p_features += "Flash;";
	if(gridbee.core.info.BrowserInfo.html5xmlHttpRequestLevel2()) hostinfo.p_features += "XmlHttpRequestLevel2;";
	if(gridbee.core.info.BrowserInfo.html5localStorage()) hostinfo.p_features += "LocalStorage;";
	if(gridbee.core.info.BrowserInfo.html5webWorkers()) hostinfo.p_features += "WebWorkers;";
	if(gridbee.core.info.BrowserInfo.html5webSockets()) hostinfo.p_features += "WebSockets;";
	hostinfo.p_membw = 0;
	hostinfo.m_nbytes = 1073741824;
	hostinfo.m_cache = 1073741824;
	hostinfo.m_swap = 1073741824;
	hostinfo.d_total = 1073741824;
	hostinfo.d_free = 1073741824;
	hostinfo.os_name = gridbee.core.info.BrowserInfo.osPlatform();
	hostinfo.os_version = gridbee.core.info.BrowserInfo.osName();
	return hostinfo;
}
gridbee.worksource.boinc.request.HostInfo.prototype.timezone = null;
gridbee.worksource.boinc.request.HostInfo.prototype.domain_name = null;
gridbee.worksource.boinc.request.HostInfo.prototype.ip_addr = null;
gridbee.worksource.boinc.request.HostInfo.prototype.host_cpid = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_ncpus = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_vendor = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_model = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_features = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_fpops = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_iops = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_membw = null;
gridbee.worksource.boinc.request.HostInfo.prototype.p_calculated = null;
gridbee.worksource.boinc.request.HostInfo.prototype.m_nbytes = null;
gridbee.worksource.boinc.request.HostInfo.prototype.m_cache = null;
gridbee.worksource.boinc.request.HostInfo.prototype.m_swap = null;
gridbee.worksource.boinc.request.HostInfo.prototype.d_total = null;
gridbee.worksource.boinc.request.HostInfo.prototype.d_free = null;
gridbee.worksource.boinc.request.HostInfo.prototype.os_name = null;
gridbee.worksource.boinc.request.HostInfo.prototype.os_version = null;
gridbee.worksource.boinc.request.HostInfo.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	var xml = indent + "<host_info>\n";
	var innerindent = indent + "    ";
	if(this.timezone != null) xml += innerindent + "<timezone>" + this.timezone + "</timezone>\n";
	if(this.domain_name != null) xml += innerindent + "<domain_name>" + this.domain_name + "</domain_name>\n";
	if(this.ip_addr != null) xml += innerindent + "<ip_addr>" + this.ip_addr + "</ip_addr>\n";
	if(this.host_cpid != null) xml += innerindent + "<host_cpid>" + this.host_cpid + "</host_cpid>\n";
	if(this.p_ncpus != null) xml += innerindent + "<p_ncpus>" + this.p_ncpus + "</p_ncpus>\n";
	if(this.p_vendor != null) xml += innerindent + "<p_vendor>" + this.p_vendor + "</p_vendor>\n";
	if(this.p_model != null) xml += innerindent + "<p_model>" + this.p_model + "</p_model>\n";
	if(this.p_features != null) xml += innerindent + "<p_features>" + this.p_features + "</p_features>\n";
	if(this.p_fpops != null) xml += innerindent + "<p_fpops>" + this.p_fpops + "</p_fpops>\n";
	if(this.p_iops != null) xml += innerindent + "<p_iops>" + this.p_iops + "</p_iops>\n";
	if(this.p_membw != null) xml += innerindent + "<p_membw>" + this.p_membw + "</p_membw>\n";
	if(this.p_calculated != null) xml += innerindent + "<p_calculated>" + this.p_calculated + "</p_calculated>\n";
	if(this.m_nbytes != null) xml += innerindent + "<m_nbytes>" + this.m_nbytes + "</m_nbytes>\n";
	if(this.m_cache != null) xml += innerindent + "<m_cache>" + this.m_cache + "</m_cache>\n";
	if(this.m_swap != null) xml += innerindent + "<m_swap>" + this.m_swap + "</m_swap>\n";
	if(this.d_total != null) xml += innerindent + "<d_total>" + this.d_total + "</d_total>\n";
	if(this.d_free != null) xml += innerindent + "<d_free>" + this.d_free + "</d_free>\n";
	if(this.os_name != null) xml += innerindent + "<os_name>" + this.os_name + "</os_name>\n";
	if(this.os_version != null) xml += innerindent + "<os_version>" + this.os_version + "</os_version>\n";
	xml += indent + "</host_info>\n";
	return xml;
}
gridbee.worksource.boinc.request.HostInfo.prototype.__class__ = gridbee.worksource.boinc.request.HostInfo;
gridbee.worksource.boinc.request.HostInfo.__interfaces__ = [gridbee.worksource.boinc.BoincData];
DateTools = function() { }
DateTools.__name__ = ["DateTools"];
DateTools.__format_get = function(d,e) {
	return (function($this) {
		var $r;
		switch(e) {
		case "%":
			$r = "%";
			break;
		case "C":
			$r = StringTools.lpad(Std.string(Std["int"](d.getFullYear() / 100)),"0",2);
			break;
		case "d":
			$r = StringTools.lpad(Std.string(d.getDate()),"0",2);
			break;
		case "D":
			$r = DateTools.__format(d,"%m/%d/%y");
			break;
		case "e":
			$r = Std.string(d.getDate());
			break;
		case "H":case "k":
			$r = StringTools.lpad(Std.string(d.getHours()),e == "H"?"0":" ",2);
			break;
		case "I":case "l":
			$r = (function($this) {
				var $r;
				var hour = d.getHours() % 12;
				$r = StringTools.lpad(Std.string(hour == 0?12:hour),e == "I"?"0":" ",2);
				return $r;
			}($this));
			break;
		case "m":
			$r = StringTools.lpad(Std.string(d.getMonth() + 1),"0",2);
			break;
		case "M":
			$r = StringTools.lpad(Std.string(d.getMinutes()),"0",2);
			break;
		case "n":
			$r = "\n";
			break;
		case "p":
			$r = d.getHours() > 11?"PM":"AM";
			break;
		case "r":
			$r = DateTools.__format(d,"%I:%M:%S %p");
			break;
		case "R":
			$r = DateTools.__format(d,"%H:%M");
			break;
		case "s":
			$r = Std.string(Std["int"](d.getTime() / 1000));
			break;
		case "S":
			$r = StringTools.lpad(Std.string(d.getSeconds()),"0",2);
			break;
		case "t":
			$r = "\t";
			break;
		case "T":
			$r = DateTools.__format(d,"%H:%M:%S");
			break;
		case "u":
			$r = (function($this) {
				var $r;
				var t = d.getDay();
				$r = t == 0?"7":Std.string(t);
				return $r;
			}($this));
			break;
		case "w":
			$r = Std.string(d.getDay());
			break;
		case "y":
			$r = StringTools.lpad(Std.string(d.getFullYear() % 100),"0",2);
			break;
		case "Y":
			$r = Std.string(d.getFullYear());
			break;
		default:
			$r = (function($this) {
				var $r;
				throw "Date.format %" + e + "- not implemented yet.";
				return $r;
			}($this));
		}
		return $r;
	}(this));
}
DateTools.__format = function(d,f) {
	var r = new StringBuf();
	var p = 0;
	while(true) {
		var np = f.indexOf("%",p);
		if(np < 0) break;
		r.b[r.b.length] = f.substr(p,np - p);
		r.add(DateTools.__format_get(d,f.substr(np + 1,1)));
		p = np + 2;
	}
	r.b[r.b.length] = f.substr(p,f.length - p);
	return r.b.join("");
}
DateTools.format = function(d,f) {
	return DateTools.__format(d,f);
}
DateTools.delta = function(d,t) {
	return Date.fromTime(d.getTime() + t);
}
DateTools.getMonthDays = function(d) {
	var month = d.getMonth();
	var year = d.getFullYear();
	if(month != 1) return DateTools.DAYS_OF_MONTH[month];
	var isB = year % 4 == 0 && year % 100 != 0 || year % 400 == 0;
	return isB?29:28;
}
DateTools.seconds = function(n) {
	return n * 1000.0;
}
DateTools.minutes = function(n) {
	return n * 60.0 * 1000.0;
}
DateTools.hours = function(n) {
	return n * 60.0 * 60.0 * 1000.0;
}
DateTools.days = function(n) {
	return n * 24.0 * 60.0 * 60.0 * 1000.0;
}
DateTools.parse = function(t) {
	var s = t / 1000;
	var m = s / 60;
	var h = m / 60;
	return { ms : t % 1000, seconds : Std["int"](s % 60), minutes : Std["int"](m % 60), hours : Std["int"](h % 24), days : Std["int"](h / 24)};
}
DateTools.make = function(o) {
	return o.ms + 1000.0 * (o.seconds + 60.0 * (o.minutes + 60.0 * (o.hours + 24.0 * o.days)));
}
DateTools.prototype.__class__ = DateTools;
Xml = function(p) {
}
Xml.__name__ = ["Xml"];
Xml.Element = null;
Xml.PCData = null;
Xml.CData = null;
Xml.Comment = null;
Xml.DocType = null;
Xml.Prolog = null;
Xml.Document = null;
Xml.parse = function(str) {
	var rules = [Xml.enode,Xml.epcdata,Xml.eend,Xml.ecdata,Xml.edoctype,Xml.ecomment,Xml.eprolog];
	var nrules = rules.length;
	var current = Xml.createDocument();
	var stack = new List();
	while(str.length > 0) {
		var i = 0;
		try {
			while(i < nrules) {
				var r = rules[i];
				if(r.match(str)) {
					switch(i) {
					case 0:
						var x = Xml.createElement(r.matched(1));
						current.addChild(x);
						str = r.matchedRight();
						while(Xml.eattribute.match(str)) {
							x.set(Xml.eattribute.matched(1),Xml.eattribute.matched(3));
							str = Xml.eattribute.matchedRight();
						}
						if(!Xml.eclose.match(str)) {
							i = nrules;
							throw "__break__";
						}
						if(Xml.eclose.matched(1) == ">") {
							stack.push(current);
							current = x;
						}
						str = Xml.eclose.matchedRight();
						break;
					case 1:
						var x = Xml.createPCData(r.matched(0));
						current.addChild(x);
						str = r.matchedRight();
						break;
					case 2:
						if(current._children != null && current._children.length == 0) {
							var e = Xml.createPCData("");
							current.addChild(e);
						}
						if(r.matched(1) != current._nodeName || stack.isEmpty()) {
							i = nrules;
							throw "__break__";
						}
						current = stack.pop();
						str = r.matchedRight();
						break;
					case 3:
						str = r.matchedRight();
						if(!Xml.ecdata_end.match(str)) throw "End of CDATA section not found";
						var x = Xml.createCData(Xml.ecdata_end.matchedLeft());
						current.addChild(x);
						str = Xml.ecdata_end.matchedRight();
						break;
					case 4:
						var pos = 0;
						var count = 0;
						var old = str;
						try {
							while(true) {
								if(!Xml.edoctype_elt.match(str)) throw "End of DOCTYPE section not found";
								var p = Xml.edoctype_elt.matchedPos();
								pos += p.pos + p.len;
								str = Xml.edoctype_elt.matchedRight();
								switch(Xml.edoctype_elt.matched(0)) {
								case "[":
									count++;
									break;
								case "]":
									count--;
									if(count < 0) throw "Invalid ] found in DOCTYPE declaration";
									break;
								default:
									if(count == 0) throw "__break__";
								}
							}
						} catch( e ) { if( e != "__break__" ) throw e; }
						var x = Xml.createDocType(old.substr(10,pos - 11));
						current.addChild(x);
						break;
					case 5:
						if(!Xml.ecomment_end.match(str)) throw "Unclosed Comment";
						var p = Xml.ecomment_end.matchedPos();
						var x = Xml.createComment(str.substr(4,p.pos + p.len - 7));
						current.addChild(x);
						str = Xml.ecomment_end.matchedRight();
						break;
					case 6:
						var prolog = r.matched(0);
						var x = Xml.createProlog(prolog.substr(2,prolog.length - 4));
						current.addChild(x);
						str = r.matchedRight();
						break;
					}
					throw "__break__";
				}
				i += 1;
			}
		} catch( e ) { if( e != "__break__" ) throw e; }
		if(i == nrules) {
			if(str.length > 10) throw "Xml parse error : Unexpected " + str.substr(0,10) + "..."; else throw "Xml parse error : Unexpected " + str;
		}
	}
	if(!stack.isEmpty()) throw "Xml parse error : Unclosed " + stack.last().getNodeName();
	return current;
}
Xml.createElement = function(name) {
	var r = new Xml();
	r.nodeType = Xml.Element;
	r._children = new Array();
	r._attributes = new Hash();
	r.setNodeName(name);
	return r;
}
Xml.createPCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.PCData;
	r.setNodeValue(data);
	return r;
}
Xml.createCData = function(data) {
	var r = new Xml();
	r.nodeType = Xml.CData;
	r.setNodeValue(data);
	return r;
}
Xml.createComment = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Comment;
	r.setNodeValue(data);
	return r;
}
Xml.createDocType = function(data) {
	var r = new Xml();
	r.nodeType = Xml.DocType;
	r.setNodeValue(data);
	return r;
}
Xml.createProlog = function(data) {
	var r = new Xml();
	r.nodeType = Xml.Prolog;
	r.setNodeValue(data);
	return r;
}
Xml.createDocument = function() {
	var r = new Xml();
	r.nodeType = Xml.Document;
	r._children = new Array();
	return r;
}
Xml.prototype.nodeType = null;
Xml.prototype.nodeName = null;
Xml.prototype.nodeValue = null;
Xml.prototype.parent = null;
Xml.prototype._nodeName = null;
Xml.prototype._nodeValue = null;
Xml.prototype._attributes = null;
Xml.prototype._children = null;
Xml.prototype._parent = null;
Xml.prototype.getNodeName = function() {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	return this._nodeName;
}
Xml.prototype.setNodeName = function(n) {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	return this._nodeName = n;
}
Xml.prototype.getNodeValue = function() {
	if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
	return this._nodeValue;
}
Xml.prototype.setNodeValue = function(v) {
	if(this.nodeType == Xml.Element || this.nodeType == Xml.Document) throw "bad nodeType";
	return this._nodeValue = v;
}
Xml.prototype.getParent = function() {
	return this._parent;
}
Xml.prototype.get = function(att) {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	return this._attributes.get(att);
}
Xml.prototype.set = function(att,value) {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	this._attributes.set(att,value);
}
Xml.prototype.remove = function(att) {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	this._attributes.remove(att);
}
Xml.prototype.exists = function(att) {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	return this._attributes.exists(att);
}
Xml.prototype.attributes = function() {
	if(this.nodeType != Xml.Element) throw "bad nodeType";
	return this._attributes.keys();
}
Xml.prototype.iterator = function() {
	if(this._children == null) throw "bad nodetype";
	return { cur : 0, x : this._children, hasNext : function() {
		return this.cur < this.x.length;
	}, next : function() {
		return this.x[this.cur++];
	}};
}
Xml.prototype.elements = function() {
	if(this._children == null) throw "bad nodetype";
	return { cur : 0, x : this._children, hasNext : function() {
		var k = this.cur;
		var l = this.x.length;
		while(k < l) {
			if(this.x[k].nodeType == Xml.Element) break;
			k += 1;
		}
		this.cur = k;
		return k < l;
	}, next : function() {
		var k = this.cur;
		var l = this.x.length;
		while(k < l) {
			var n = this.x[k];
			k += 1;
			if(n.nodeType == Xml.Element) {
				this.cur = k;
				return n;
			}
		}
		return null;
	}};
}
Xml.prototype.elementsNamed = function(name) {
	if(this._children == null) throw "bad nodetype";
	return { cur : 0, x : this._children, hasNext : function() {
		var k = this.cur;
		var l = this.x.length;
		while(k < l) {
			var n = this.x[k];
			if(n.nodeType == Xml.Element && n._nodeName == name) break;
			k++;
		}
		this.cur = k;
		return k < l;
	}, next : function() {
		var k = this.cur;
		var l = this.x.length;
		while(k < l) {
			var n = this.x[k];
			k++;
			if(n.nodeType == Xml.Element && n._nodeName == name) {
				this.cur = k;
				return n;
			}
		}
		return null;
	}};
}
Xml.prototype.firstChild = function() {
	if(this._children == null) throw "bad nodetype";
	return this._children[0];
}
Xml.prototype.firstElement = function() {
	if(this._children == null) throw "bad nodetype";
	var cur = 0;
	var l = this._children.length;
	while(cur < l) {
		var n = this._children[cur];
		if(n.nodeType == Xml.Element) return n;
		cur++;
	}
	return null;
}
Xml.prototype.addChild = function(x) {
	if(this._children == null) throw "bad nodetype";
	if(x._parent != null) x._parent._children.remove(x);
	x._parent = this;
	this._children.push(x);
}
Xml.prototype.removeChild = function(x) {
	if(this._children == null) throw "bad nodetype";
	var b = this._children.remove(x);
	if(b) x._parent = null;
	return b;
}
Xml.prototype.insertChild = function(x,pos) {
	if(this._children == null) throw "bad nodetype";
	if(x._parent != null) x._parent._children.remove(x);
	x._parent = this;
	this._children.insert(pos,x);
}
Xml.prototype.toString = function() {
	if(this.nodeType == Xml.PCData) return this._nodeValue;
	if(this.nodeType == Xml.CData) return "<![CDATA[" + this._nodeValue + "]]>";
	if(this.nodeType == Xml.Comment) return "<!--" + this._nodeValue + "-->";
	if(this.nodeType == Xml.DocType) return "<!DOCTYPE " + this._nodeValue + ">";
	if(this.nodeType == Xml.Prolog) return "<?" + this._nodeValue + "?>";
	var s = new StringBuf();
	if(this.nodeType == Xml.Element) {
		s.b[s.b.length] = "<" == null?"null":"<";
		s.add(this._nodeName);
		var $it0 = this._attributes.keys();
		while( $it0.hasNext() ) {
			var k = $it0.next();
			s.b[s.b.length] = " " == null?"null":" ";
			s.b[s.b.length] = k == null?"null":k;
			s.b[s.b.length] = "=\"" == null?"null":"=\"";
			s.add(this._attributes.get(k));
			s.b[s.b.length] = "\"" == null?"null":"\"";
		}
		if(this._children.length == 0) {
			s.b[s.b.length] = "/>" == null?"null":"/>";
			return s.b.join("");
		}
		s.b[s.b.length] = ">" == null?"null":">";
	}
	var $it1 = this.iterator();
	while( $it1.hasNext() ) {
		var x = $it1.next();
		s.add(x.toString());
	}
	if(this.nodeType == Xml.Element) {
		s.b[s.b.length] = "</" == null?"null":"</";
		s.add(this._nodeName);
		s.b[s.b.length] = ">" == null?"null":">";
	}
	return s.b.join("");
}
Xml.prototype.__class__ = Xml;
gridbee.worksource.boinc.request.FileUpload = function(p) {
}
gridbee.worksource.boinc.request.FileUpload.__name__ = ["gridbee","worksource","boinc","request","FileUpload"];
gridbee.worksource.boinc.request.FileUpload.prototype.file_info = null;
gridbee.worksource.boinc.request.FileUpload.prototype.nbytes = null;
gridbee.worksource.boinc.request.FileUpload.prototype.md5_cksum = null;
gridbee.worksource.boinc.request.FileUpload.prototype.offset = null;
gridbee.worksource.boinc.request.FileUpload.prototype.data = null;
gridbee.worksource.boinc.request.FileUpload.prototype.toXmlString = function(indent) {
	if(indent == null) indent = "";
	indent = "";
	var innerindent = indent + "";
	var xml = indent + "<file_upload>\n";
	if(this.file_info != null) xml += innerindent + this.file_info.toXmlString(innerindent);
	if(this.nbytes != null) xml += innerindent + "<nbytes>" + this.nbytes + "</nbytes>\n";
	if(this.md5_cksum != null) xml += innerindent + "<md5_cksum>" + this.md5_cksum + "</md5_cksum>\n";
	if(this.offset != null) xml += innerindent + "<offset>" + this.offset + "</offset>\n";
	xml += "<data>\n";
	xml += this.data;
	return xml;
}
gridbee.worksource.boinc.request.FileUpload.prototype.__class__ = gridbee.worksource.boinc.request.FileUpload;
gridbee.worksource.boinc.request.FileUpload.__interfaces__ = [gridbee.worksource.boinc.BoincData];
gridbee.worksource.boinc.webrpc.subclasses.Team = function(input) {
	if( input === $_ ) return;
	if(input.hasNode.resolve("id")) this.id = Std.parseInt(input.node.resolve("id").getInnerData());
	if(input.hasNode.resolve("create_time")) this.create_time = Std.parseInt(input.node.resolve("create_time").getInnerData());
	if(input.hasNode.resolve("userid")) this.userid = Std.parseInt(input.node.resolve("userid").getInnerData());
	if(input.hasNode.resolve("name")) this.name = input.node.resolve("name").getInnerData();
	if(input.hasNode.resolve("url")) this.url = input.node.resolve("url").getInnerData();
	if(input.hasNode.resolve("type")) this.type = Std.parseInt(input.node.resolve("type").getInnerData());
	if(input.hasNode.resolve("country")) this.country = input.node.resolve("country").getInnerData();
	if(input.hasNode.resolve("total_credit")) this.total_credit = Std.parseFloat(input.node.resolve("total_credit").getInnerData());
	if(input.hasNode.resolve("expavg_credit")) this.expavg_credit = Std.parseFloat(input.node.resolve("expavg_credit").getInnerData());
	if(input.hasNode.resolve("expavg_time")) this.expavg_time = Std.parseFloat(input.node.resolve("expavg_time").getInnerData());
}
gridbee.worksource.boinc.webrpc.subclasses.Team.__name__ = ["gridbee","worksource","boinc","webrpc","subclasses","Team"];
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.id = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.create_time = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.userid = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.name = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.url = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.type = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.country = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.total_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.expavg_credit = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.expavg_time = null;
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.print = function() {
	haxe.Log.trace("id: " + this.id,{ fileName : "Team.hx", lineNumber : 61, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("create_time: " + this.create_time,{ fileName : "Team.hx", lineNumber : 62, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("userid: " + this.userid,{ fileName : "Team.hx", lineNumber : 63, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("name: " + this.name,{ fileName : "Team.hx", lineNumber : 64, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("url: " + this.url,{ fileName : "Team.hx", lineNumber : 65, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("type: " + this.type,{ fileName : "Team.hx", lineNumber : 66, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("country: " + this.country,{ fileName : "Team.hx", lineNumber : 67, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("total_credit: " + this.total_credit,{ fileName : "Team.hx", lineNumber : 68, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("expavg_credit: " + this.expavg_credit,{ fileName : "Team.hx", lineNumber : 69, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
	haxe.Log.trace("expavg_time: " + this.expavg_time,{ fileName : "Team.hx", lineNumber : 70, className : "gridbee.worksource.boinc.webrpc.subclasses.Team", methodName : "print"});
}
gridbee.worksource.boinc.webrpc.subclasses.Team.prototype.__class__ = gridbee.worksource.boinc.webrpc.subclasses.Team;
$_ = {}
js.Boot.__res = {}
js.Boot.__init();
gridbee.worksource.boinc.BoincWorkSource.version = new gridbee.worksource.boinc.request.ClientVersion(3,0,0);
gridbee.js["XMLHttpRequest"] = typeof XMLHttpRequest != 'undefined'?XMLHttpRequest:typeof ActiveXObject != 'undefined'?function() {
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch( e ) {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch( e1 ) {
			throw "Unable to create XMLHttpRequest object.";
		}
	}
}:(function($this) {
	var $r;
	throw "Unable to create XMLHttpRequest object.";
	return $r;
}(this));
try {
	gridbee.js["XMLHttpRequestLevel2"] = gridbee.js.XMLHttpRequest != null && !!(new XMLHttpRequest()).upload?XMLHttpRequest:null;
} catch( e ) {
	gridbee.js["XMLHttpRequestLevel2"] = null;
}
{
	js.Lib.document = document;
	js.Lib.window = window;
	onerror = function(msg,url,line) {
		var f = js.Lib.onerror;
		if( f == null )
			return false;
		return f(msg,[url+":"+line]);
	}
}
{
	var d = Date;
	d.now = function() {
		return new Date();
	};
	d.fromTime = function(t) {
		var d1 = new Date();
		d1["setTime"](t);
		return d1;
	};
	d.fromString = function(s) {
		switch(s.length) {
		case 8:
			var k = s.split(":");
			var d1 = new Date();
			d1["setTime"](0);
			d1["setUTCHours"](k[0]);
			d1["setUTCMinutes"](k[1]);
			d1["setUTCSeconds"](k[2]);
			return d1;
		case 10:
			var k = s.split("-");
			return new Date(k[0],k[1] - 1,k[2],0,0,0);
		case 19:
			var k = s.split(" ");
			var y = k[0].split("-");
			var t = k[1].split(":");
			return new Date(y[0],y[1] - 1,y[2],t[0],t[1],t[2]);
		default:
			throw "Invalid date format : " + s;
		}
	};
	d.prototype["toString"] = function() {
		var date = this;
		var m = date.getMonth() + 1;
		var d1 = date.getDate();
		var h = date.getHours();
		var mi = date.getMinutes();
		var s = date.getSeconds();
		return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d1 < 10?"0" + d1:"" + d1) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
	};
	d.prototype.__class__ = d;
	d.__name__ = ["Date"];
}
gridbee.core.net.Downloader.databank = new Hash();
try {
	gridbee.js["XDomainRequest"] = XDomainRequest;
} catch( e ) {
	gridbee.js["XDomainRequest"] = null;
}
try {
	gridbee.js["WebWorker"] = Worker;
} catch( e ) {
	gridbee.js["WebWorker"] = null;
}
{
	Math.__name__ = ["Math"];
	Math.NaN = Number["NaN"];
	Math.NEGATIVE_INFINITY = Number["NEGATIVE_INFINITY"];
	Math.POSITIVE_INFINITY = Number["POSITIVE_INFINITY"];
	Math.isFinite = function(i) {
		return isFinite(i);
	};
	Math.isNaN = function(i) {
		return isNaN(i);
	};
}
js["XMLHttpRequest"] = window.XMLHttpRequest?XMLHttpRequest:window.ActiveXObject?function() {
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch( e ) {
		try {
			return new ActiveXObject("Microsoft.XMLHTTP");
		} catch( e1 ) {
			throw "Unable to create XMLHttpRequest object.";
		}
	}
}:(function($this) {
	var $r;
	throw "Unable to create XMLHttpRequest object.";
	return $r;
}(this));
{
	String.prototype.__class__ = String;
	String.__name__ = ["String"];
	Array.prototype.__class__ = Array;
	Array.__name__ = ["Array"];
	Int = { __name__ : ["Int"]};
	Dynamic = { __name__ : ["Dynamic"]};
	Float = Number;
	Float.__name__ = ["Float"];
	Bool = { __ename__ : ["Bool"]};
	Class = { __name__ : ["Class"]};
	Enum = { };
	Void = { __ename__ : ["Void"]};
}
{
	gridbee.core.info.BrowserInfo.detectOs();
	gridbee.core.info.BrowserInfo.detectBrowser();
	gridbee.core.info.BrowserInfo.detectHtml5();
	gridbee.core.info.BrowserInfo.detectFlash();
}
if(typeof(haxe_timers) == "undefined") haxe_timers = [];
henkolib.log.Console.main = new henkolib.log.Console(1000,henkolib.log.LogLevel.L4_Information,null);
{
	Xml.Element = "element";
	Xml.PCData = "pcdata";
	Xml.CData = "cdata";
	Xml.Comment = "comment";
	Xml.DocType = "doctype";
	Xml.Prolog = "prolog";
	Xml.Document = "document";
}
js.Lib.onerror = null;
haxe.Serializer.USE_CACHE = false;
haxe.Serializer.USE_ENUM_INDEX = false;
haxe.Serializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
gridbee.core.info.BrowserInfo.browserVendorValue = null;
gridbee.core.info.BrowserInfo.browserNameValue = null;
gridbee.core.info.BrowserInfo.browserFullVersionValue = null;
gridbee.core.info.BrowserInfo.browserMajorVersionValue = null;
gridbee.core.info.BrowserInfo.osPlatformValue = null;
gridbee.core.info.BrowserInfo.osNameValue = null;
gridbee.core.info.BrowserInfo.flashInstalledValue = null;
gridbee.core.info.BrowserInfo.flashFullVersionValue = null;
gridbee.core.info.BrowserInfo.flashMajorVersionValue = null;
gridbee.core.info.BrowserInfo.html5xmlHttpRequestLevel2Value = null;
gridbee.core.info.BrowserInfo.html5localStorageValue = null;
gridbee.core.info.BrowserInfo.html5webWorkersValue = null;
gridbee.core.info.BrowserInfo.html5webSocketsValue = null;
haxe.Unserializer.DEFAULT_RESOLVER = Type;
haxe.Unserializer.BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%:";
haxe.Unserializer.CODES = null;
DateTools.DAYS_OF_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];
Xml.enode = new EReg("^<([a-zA-Z0-9:_-]+)","");
Xml.ecdata = new EReg("^<!\\[CDATA\\[","i");
Xml.edoctype = new EReg("^<!DOCTYPE ","i");
Xml.eend = new EReg("^</([a-zA-Z0-9:_-]+)>","");
Xml.epcdata = new EReg("^[^<]+","");
Xml.ecomment = new EReg("^<!--","");
Xml.eprolog = new EReg("^<\\?[^\\?]+\\?>","");
Xml.eattribute = new EReg("^\\s*([a-zA-Z0-9:_-]+)\\s*=\\s*([\"'])([^\\2]*?)\\2","");
Xml.eclose = new EReg("^[ \r\n\t]*(>|(/>))","");
Xml.ecdata_end = new EReg("\\]\\]>","");
Xml.edoctype_elt = new EReg("[\\[|\\]>]","");
Xml.ecomment_end = new EReg("-->","");
gridbee.Main.main()