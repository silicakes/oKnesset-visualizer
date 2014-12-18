var restify = require('restify');
var config = require('./config.js');


function processServiceRequest(req, res, next) {
	//restify automatically parses the body using the body parser,
	//if we're using a different client - such as postman or curl,
	//we'd like to manually parse it
	try	{
		var params = JSON.parse(req.body);
	} catch(e) {
		var params = req.body;
	}
}


//handles the preflight (OPTIONS) requests for CORS coming from using ajax POST with JSON
function unknownMethodHandler(req, res, next) {
  if (req.method.toLowerCase() === 'options') {
    console.log('received an OPTIONS method request');
	var allowHeaders = [
						'Accept', 
						'Accept-Version', 
						'Content-Type', 
						'Api-Version', 
						'Origin', 
						'X-Requested-With'
					]; 

    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
    res.header('Access-Control-Allow-Origin', req.headers.origin);

    next();
    return res.send(204);
  }
  else {
		next();
		return res.send(new restify.MethodNotAllowedError());
	}
}

function populateServices(serviceList) {
	for(var service in serviceList) {
		config.setServiceUrl(service, serviceList[service]);
	}
}

function handleApi(req, res, next) {

	console.log("getting the service list from", config.serviceAddress + config.getServiceUrl("serviceList"));
	var httpClient = restify.createStringClient({ url: config.serviceAddress });

    httpClient.get(config.getServiceUrl("serviceList"), function(cerr, creq, cres, cdata) {                                                
       var data = JSON.parse(cdata);

        console.log("generating service map");
        populateServices(data);
        console.log("service map generated");

        if(config.getServiceUrl(req.params.service)) {
        	var serviceClient =  restify.createStringClient({ url: config.serviceAddress });

        	httpClient.get(config.getServiceUrl(req.params.service), function(cerr, creq, cres, cdata) {
		        console.log("data for service [", req.params.service, "] received..");
		        res.send(JSON.parse(cdata));
        	});
        } else {
        	res.end("ERROR | no such service", req.params.service);
        	console.log("ERROR | no such service", req.params.service);
        }

        next();
    });
}

//initalizing server
var server = restify.createServer({
	name: 'oKnesset'
});

//initializing plugins
//Gzip support
server.use(restify.gzipResponse());

//cross origin request support
server.use(restify.CORS({
	origins: ["*"],
	headers: ["x-allow-cross-origin",'Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With']
}));

//handling POST data
server.use(restify.bodyParser({
	maxBodySize: 0,
	mapParams: true,
	mapFiles: false,
	overrideParams: false,
 }));


server.get({name: "url", path: "/services/:service"}, handleApi);


server.on('MethodNotAllowed', unknownMethodHandler);

//initializing listener
server.listen(5556, function() {
	console.log(server.name + " listening at " + server.url);
	console.log("Environment: ", process.env.ENVIRONMENT_TYPE);
});