exports.plugin = {};

const couchProvider = require('./couch.provider');
exports.couchProvider = couchProvider;

exports.plugin.register = async function (server, conf) {
	
    couchProvider.setConfiguration(conf);
    var namespace = 'couchprovider';

    if(conf.namespace){
    	namespace = conf.namespace;
    }

    var addNameSpace = function(namespace){
    	server.method({
		    name: namespace + '.getCouchDBServer',
		    method: couchProvider.getCouchDBServer,
		    options: {}
		});

		server.method({
		    name: namespace + '.uploadDocuments',
		    method: couchProvider.uploadDocuments,
		    options: {}
		});

		server.method({
		    name: namespace + '.getDocument',
		    method: couchProvider.getDocument,
		    options: {}
		});

		server.method({
		    name: namespace + '.deleteDocument',
		    method: couchProvider.deleteDocument,
		    options: {}
		});

		server.method({
		    name: namespace + '.addDocumentAttachment',
		    method: couchProvider.addDocumentAttachment,
		    options: {}
		});

		server.method({
		    name: namespace + '.getDocumentStreamAttachment',
		    method: couchProvider.getDocumentStreamAttachment,
		    options: {}
		});

		server.method({
		    name: namespace + '.getDocumentStreamAttachmentUri',
		    method: couchProvider.getDocumentStreamAttachmentUri,
		    options: {}
		});

		server.method({
		    name: namespace + '.getDocumentAttachment',
		    method: couchProvider.getDocumentAttachment,
		    options: {}
		});

		server.method({
		    name: namespace + '.getView',
		    method: couchProvider.getView,
		    options: {}
		});

		server.method({
		    name: namespace + '.getViewQs',
		    method: couchProvider.getViewQs,
		    options: {}
		});

		server.method({
		    name: namespace + '.mkdirp',
		    method: couchProvider.mkdirp,
		    options: {}
		});

		server.method({
		    name: namespace + '.removeDirectorySync',
		    method: couchProvider.removeDirectorySync,
		    options: {}
		});

		console.info('couch-provider namespace', namespace, 'initialized.');
    }


    if(Array.isArray(namespace)){
    	namespace.forEach(function(ns){
    		addNameSpace(ns);
    	});
    }else{
    	addNameSpace(namespace);
    }
}

exports.plugin.pkg = require('./package.json');
