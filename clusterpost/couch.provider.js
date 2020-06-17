var _rollbarConfig = {
    accessToken: "de4fa827c49146b09f0eb499d6a5ae6c",
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        environment: "production"
    }
};
// Rollbar Snippet
!function(r){var e={};function o(n){if(e[n])return e[n].exports;var t=e[n]={i:n,l:!1,exports:{}};return r[n].call(t.exports,t,t.exports,o),t.l=!0,t.exports}o.m=r,o.c=e,o.d=function(r,e,n){o.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:n})},o.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},o.t=function(r,e){if(1&e&&(r=o(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var t in r)o.d(n,t,function(e){return r[e]}.bind(null,t));return n},o.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return o.d(e,"a",e),e},o.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},o.p="",o(o.s=0)}([function(r,e,o){"use strict";var n=o(1),t=o(4);_rollbarConfig=_rollbarConfig||{},_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://cdn.rollbar.com/rollbarjs/refs/tags/v2.16.2/rollbar.min.js",_rollbarConfig.async=void 0===_rollbarConfig.async||_rollbarConfig.async;var a=n.setupShim(window,_rollbarConfig),l=t(_rollbarConfig);window.rollbar=n.Rollbar,a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,l)},function(r,e,o){"use strict";var n=o(2);function t(r){return function(){try{return r.apply(this,arguments)}catch(r){try{console.error("[Rollbar]: Internal error",r)}catch(r){}}}}var a=0;function l(r,e){this.options=r,this._rollbarOldOnError=null;var o=a++;this.shimId=function(){return o},"undefined"!=typeof window&&window._rollbarShims&&(window._rollbarShims[o]={handler:e,messages:[]})}var i=o(3),s=function(r,e){return new l(r,e)},d=function(r){return new i(s,r)};function c(r){return t((function(){var e=this,o=Array.prototype.slice.call(arguments,0),n={shim:e,method:r,args:o,ts:new Date};window._rollbarShims[this.shimId()].messages.push(n)}))}l.prototype.loadFull=function(r,e,o,n,a){var l=!1,i=e.createElement("script"),s=e.getElementsByTagName("script")[0],d=s.parentNode;i.crossOrigin="",i.src=n.rollbarJsUrl,o||(i.async=!0),i.onload=i.onreadystatechange=t((function(){if(!(l||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){i.onload=i.onreadystatechange=null;try{d.removeChild(i)}catch(r){}l=!0,function(){var e;if(void 0===r._rollbarDidLoad){e=new Error("rollbar.js did not load");for(var o,n,t,l,i=0;o=r._rollbarShims[i++];)for(o=o.messages||[];n=o.shift();)for(t=n.args||[],i=0;i<t.length;++i)if("function"==typeof(l=t[i])){l(e);break}}"function"==typeof a&&a(e)}()}})),d.insertBefore(i,s)},l.prototype.wrap=function(r,e,o){try{var n;if(n="function"==typeof e?e:function(){return e||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._rollbar_wrapped&&(r._rollbar_wrapped=function(){o&&"function"==typeof o&&o.apply(this,arguments);try{return r.apply(this,arguments)}catch(o){var e=o;throw e&&("string"==typeof e&&(e=new String(e)),e._rollbarContext=n()||{},e._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=e),e}},r._rollbar_wrapped._isWrap=!0,r.hasOwnProperty))for(var t in r)r.hasOwnProperty(t)&&(r._rollbar_wrapped[t]=r[t]);return r._rollbar_wrapped}catch(e){return r}};for(var u="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleAnonymousErrors,handleUnhandledRejection,captureEvent,captureDomContentLoaded,captureLoad".split(","),p=0;p<u.length;++p)l.prototype[u[p]]=c(u[p]);r.exports={setupShim:function(r,e){if(r){var o=e.globalAlias||"Rollbar";if("object"==typeof r[o])return r[o];r._rollbarShims={},r._rollbarWrappedError=null;var a=new d(e);return t((function(){e.captureUncaught&&(a._rollbarOldOnError=r.onerror,n.captureUncaughtExceptions(r,a,!0),e.wrapGlobalEventHandlers&&n.wrapGlobals(r,a,!0)),e.captureUnhandledRejections&&n.captureUnhandledRejections(r,a,!0);var t=e.autoInstrument;return!1!==e.enabled&&(void 0===t||!0===t||"object"==typeof t&&t.network)&&r.addEventListener&&(r.addEventListener("load",a.captureLoad.bind(a)),r.addEventListener("DOMContentLoaded",a.captureDomContentLoaded.bind(a))),r[o]=a,a}))()}},Rollbar:d}},function(r,e,o){"use strict";function n(r,e,o,n){r._rollbarWrappedError&&(n[4]||(n[4]=r._rollbarWrappedError),n[5]||(n[5]=r._rollbarWrappedError._rollbarContext),r._rollbarWrappedError=null);var t=e.handleUncaughtException.apply(e,n);o&&o.apply(r,n),"anonymous"===t&&(e.anonymousErrorsPending+=1)}function t(r,e,o){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){for(var n=e.addEventListener;n._rollbarOldAdd&&n.belongsToShim;)n=n._rollbarOldAdd;var t=function(e,o,t){n.call(this,e,r.wrap(o),t)};t._rollbarOldAdd=n,t.belongsToShim=o,e.addEventListener=t;for(var a=e.removeEventListener;a._rollbarOldRemove&&a.belongsToShim;)a=a._rollbarOldRemove;var l=function(r,e,o){a.call(this,r,e&&e._rollbar_wrapped||e,o)};l._rollbarOldRemove=a,l.belongsToShim=o,e.removeEventListener=l}}r.exports={captureUncaughtExceptions:function(r,e,o){if(r){var t;if("function"==typeof e._rollbarOldOnError)t=e._rollbarOldOnError;else if(r.onerror){for(t=r.onerror;t._rollbarOldOnError;)t=t._rollbarOldOnError;e._rollbarOldOnError=t}e.handleAnonymousErrors();var a=function(){var o=Array.prototype.slice.call(arguments,0);n(r,e,t,o)};o&&(a._rollbarOldOnError=t),r.onerror=a}},captureUnhandledRejections:function(r,e,o){if(r){"function"==typeof r._rollbarURH&&r._rollbarURH.belongsToShim&&r.removeEventListener("unhandledrejection",r._rollbarURH);var n=function(r){var o,n,t;try{o=r.reason}catch(r){o=void 0}try{n=r.promise}catch(r){n="[unhandledrejection] error getting `promise` from event"}try{t=r.detail,!o&&t&&(o=t.reason,n=t.promise)}catch(r){}o||(o="[unhandledrejection] error getting `reason` from event"),e&&e.handleUnhandledRejection&&e.handleUnhandledRejection(o,n)};n.belongsToShim=o,r._rollbarURH=n,r.addEventListener("unhandledrejection",n)}},wrapGlobals:function(r,e,o){if(r){var n,a,l="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(n=0;n<l.length;++n)r[a=l[n]]&&r[a].prototype&&t(e,r[a].prototype,o)}}}},function(r,e,o){"use strict";function n(r,e){this.impl=r(e,this),this.options=e,function(r){for(var e=function(r){return function(){var e=Array.prototype.slice.call(arguments,0);if(this.impl[r])return this.impl[r].apply(this.impl,e)}},o="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleAnonymousErrors,handleUnhandledRejection,_createItem,wrap,loadFull,shimId,captureEvent,captureDomContentLoaded,captureLoad".split(","),n=0;n<o.length;n++)r[o[n]]=e(o[n])}(n.prototype)}n.prototype._swapAndProcessMessages=function(r,e){var o,n,t;for(this.impl=r(this.options);o=e.shift();)n=o.method,t=o.args,this[n]&&"function"==typeof this[n]&&("captureDomContentLoaded"===n||"captureLoad"===n?this[n].apply(this,[t[0],o.ts]):this[n].apply(this,t));return this},r.exports=n},function(r,e,o){"use strict";r.exports=function(r){return function(e){if(!e&&!window._rollbarInitialized){for(var o,n,t=(r=r||{}).globalAlias||"Rollbar",a=window.rollbar,l=function(r){return new a(r)},i=0;o=window._rollbarShims[i++];)n||(n=o.handler),o.handler._swapAndProcessMessages(l,o.messages);window[t]=n,window._rollbarInitialized=!0}}}}]);
// End Rollbar Snippet

var request = require('request');
var _ = require('underscore');
var Promise = require('bluebird');
var path = require('path');
var fs = require('fs');

var configuration;

exports.setConfiguration = function(conf){
	if(!conf || !conf.default && !conf.hostname && !conf.database){
		var confexample = {
			"default": "codename",
			"codename" : {
				"hostname" : "http://localhost:5984",
				"database" : "db"
			}
		}
		console.error("No default database name, your conf should look like:", JSON.stringify(confexample, null, 2), "or", JSON.stringify(confexample.codename, null, 2))
		throw "Bad couchdb configuration";
	}
	configuration = conf;
}

exports.getCouchDBServer = function(codename){

	var couchserver;
	if(codename){
		couchserver = configuration[codename];
	}else if(configuration.default){
		couchserver = configuration[configuration.default];
	}else if(configuration.hostname && configuration.database){
		couchserver = configuration;
	}

	if(!couchserver){
		throw "No couchdb server found in configuration with " + codename;
	}

	var url = couchserver.hostname + "/" + couchserver.database;

	return url;

}

exports.uploadDocuments = function(docs, codename){
	
	var alldocs = {};

	if(_.isArray(docs)){
		alldocs["docs"] = docs;
	}else if(_.isObject(docs)){
		alldocs["docs"] = [docs];
	}

    return new Promise(function(resolve, reject){
        var options = { 
            uri: exports.getCouchDBServer(codename) + "/_bulk_docs",
            method: 'POST', 
            json : alldocs
        };
        
        request(options, function(err, res, body){
            if(err){
            	reject({"id" : "uploadDocumentsDataProvider", "message" : err.message});
            }else if(body.error){
            	reject(body.error);
            }else{
            	resolve(body);
            }
        });
    });
}


exports.getDocument = function(id, codename){
	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + id
			}
			request(options, function(err, res, body){
				if(err){
					reject(err);
				}else{
					var doc = JSON.parse(body);
					if(doc.error){
						reject(doc.error);
					}else{
						resolve(doc);
					}
				}
			});

		}catch(e){
			reject(e);
		}
	});
}

exports.deleteDocument = function(doc, codename){
	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + doc._id + "?rev=" + doc._rev,
				method: 'DELETE'
			}				
			request(options, function(err, res, body){
				if(err){
					reject(err);
				}else{
					var doc = JSON.parse(body);
					if(doc.error){
						reject(doc);
					}else{
						resolve(doc);
					}
				}
			});

		}catch(e){
			reject(e);
		}
	});
}

exports.addDocumentAttachment = function(doc, name, stream, codename){


	return new Promise(function(resolve, reject){

		var conf;
		if(codename){
			conf = configuration[codename];
		}else{
			conf = configuration[configuration.default];
		}

		if(conf.datapath){
			var dirpath = path.join(conf.datapath, doc._id);
			if (!fs.existsSync(dirpath)){
				fs.mkdirSync(dirpath);
			}
			var dirpathfile=path.join(dirpath, name);
			if(path.dirname(name)!='.'){
				dirpath=path.join(dirpath, path.parse(name).dir);
				if (!fs.existsSync(dirpath)){
					fs.mkdirSync(dirpath);
				}
				dirpath=path.join(dirpath, path.parse(name).base);
				
				
		    }
			
			var filepath = path.join(doc._id, name);
			var fullfilepath = dirpathfile;
			var writestream = fs.createWriteStream(fullfilepath);
			writestream.on('finish', function(err){

				if(!doc.attachments){
					doc.attachments = {};
				}

				doc.attachments[name] = {
		            "path": filepath
				}
				exports.uploadDocuments(doc)
				.then(function(res){
					resolve(res);
				})
				.catch(reject)

			})
			stream.pipe(writestream);
		}else{
			try{
				var options = {
					uri: exports.getCouchDBServer(codename) + "/" + doc._id + "/" + encodeURIComponent(name) + "?rev=" + doc._rev,
					method: 'PUT',
					headers: {
						"Content-type" : "application/octet-stream"
					}
				}
				stream.pipe(request(options, function(err, res, body){
					if(err){
						reject(err);
					}else{
						resolve(body);

					}
				}));
			}catch(e){
				reject(e);
			}
		}
		
	});
}


exports.addDocumentAttachmentFolder = function(doc, pathFolder, codename, rootFolder){
	

	var files=[];
	var file=[];
	files=fs.readdirSync(pathFolder);
	var base_folder = path.parse(pathFolder).base;
	rootFolder = rootFolder?  path.join(rootFolder, base_folder) : base_folder;
	var that = this;

	return Promise.map(fs.readdirSync(pathFolder), function(filename){
		var stats = fs.statSync(path.join(pathFolder,filename));
		if(stats && stats.isFile()){
			var stream = fs.createReadStream(path.join(pathFolder,filename));
			var namefile = path.join(rootFolder, filename);
			return that.addDocumentAttachment(doc, namefile, stream, codename)
			.then(function(res){
				if(_.isArray(res)){
					doc._rev=res[0].rev;
				}else{
					var result = JSON.parse(res);
					doc._rev = result.rev;
				}	
				
			});
		}else if(stats && stats.isDirectory()){
			return that.addDocumentAttachmentFolder(doc, path.join(pathFolder, filename), codename, rootFolder);

		}else{
			return Promise.resolve();
		}
	},{concurrency: 1});

}
		



exports.getDocumentURIAttachment = function(doc, name, codename){

	codename = codename? codename: configuration.default;
	var conf = configuration[codename];
	var URI;
	if(doc._attachments){
		if(doc._attachments[name]!=null){
				URI=doc._id+'/'+name;
			return {

				uri: exports.getCouchDBServer(codename) + "/" + URI
								
				};
		}
	
	}
	if(doc.attachments){
		if(doc.attachments[name]!=null){
			return {
		 	"uri": exports.getCouchDBServer(codename) + "/" + doc._id,
		 	"onResponse": function(err, res, request, reply, settings, ttl){

		 		var filepath = path.join(conf.datapath, doc._id, name);
		 		var stream = fs.createReadStream(filepath);

		 		reply(stream)
		 		}
			}
		}
	}

	 
}

exports.getDocumentAttachment = function(doc, name, codename){

	var conf;
		if(codename){
			conf = configuration[codename];
		}else{
			conf = configuration[configuration.default];
		}
	var options = {
				uri: exports.getCouchDBServer(codename) + "/" + doc._id + "?rev=" + doc._rev
				
			}
	if(doc.attachments){
		if(doc.attachments[name]!=null){
			return new Promise(function(resolve, reject){
				try{
					var pathattchment=path.join(conf.datapath,doc._id,name);
					var content=fs.readFileSync(pathattchment).toString();
					resolve(content);

				}catch(e){
					reject(e);
				}
			});
		}		
	}
	else if(doc._attachments){
		if(doc._attachments[name]!=null){
			return new Promise(function(resolve, reject){
				try{
				var options = getDocumentURIAttachment(options.uri, codename);
				request(options, function(err, res, body){
					if(err){
						reject(err);
					}else{
						resolve(body);
					}
				});
				}catch(e){
					reject(e);
				}
			});	
	
		}
	}
	else{
		console.log("no attachment");
		return false;
	}

}

exports.getView = function(view, codename){
	return new Promise(function(resolve, reject){
		try{
			var options = {
				uri: exports.getCouchDBServer(codename) + "/" + view
			}

			request(options, function(err, res, body){					
				if(err){						
					reject(err);
				}else{
					var docs = JSON.parse(body);
					resolve(docs.rows);
				}					
			});
		}catch(e){
			reject(e);
		}
	})
}
