(function() {

	var serviceAddress = "https://oknesset.org";
	var services = {
		serviceList: {
			list_endpoint: "/api/v2/?format=json",
		},
		all: { list_endpoint: true }
	};

	function setServiceUrl(name, data) {
		services[name] = data;	
	}

	function getServiceUrl(name) {
		return services[name]["list_endpoint"];
	}

	module.exports = {
		serviceAddress: serviceAddress,
		getServiceUrl: getServiceUrl,
		setServiceUrl: setServiceUrl,
		services: services
	}

}());