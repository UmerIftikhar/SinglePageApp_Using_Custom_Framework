var FrameWork = (function () {
	'use strict';
	var Resources = {
		
		'routes': [],														//contains controller name against the router.
		'controller_dependency': {},										//contains the controller dependencies against the controller name.
		'controller':{},													//contains the controller function against the controller name.		
		'factory': {														//a predefined factory for extracting parameters from the HASH.
			'$location': (function(){
				var params = function(){
					var hash = decodeURI(window.location.hash);
					return Api._getControllerParams(hash);
				}
				
				return {
					params: params
				}
			}())	
		},		
		'_loadSpecificDependency': function(dependencyType, dependencyToLoad){
			//dependencyType =>	it tels whether to load the dependency from factory or some other module.
			//TODO => add checks to ensure dependencyType and dependencyToLoad both exists.
			return Resources[dependencyType][dependencyToLoad];		
		},		
		'_loadDependencies': function(requiredDependencies){
			
			var dependencies = [], iter;
			for (iter = 0; iter < requiredDependencies.length; iter += 1) {
					if (typeof requiredDependencies[iter] === "string") {
						
						if (Resources.factory.hasOwnProperty(requiredDependencies[iter])) {
							dependencies.push(Resources._loadSpecificDependency('factory',requiredDependencies[iter]));
						}
						else{
							console.log("Error: " + requiredDependencies[iter] + " is not Found in the Factories");
						}
									
					}
					
			}
			return dependencies;
		}	
		
	};
	var Api = {
		
		'_addRoute': function _addRoute(routeName, routeControllerName) {	//first Argument is the route name and the 2nd one is the controller name.
				var controllerName = routeControllerName!== undefined ? routeControllerName : null;
				Resources.routes.push({ route: routeName, handler: controllerName });
		},
		'_addController': function(controllerName, handler){	//handler is any array which will contain dependencies and the last argument will be the controller function itself.
			//Store contoller realted dependencies in controller_dependency object.
			//Add one more check for handler and controllerName.
			var last_index = handler.length-1;
			var dependencies = handler.slice(0, -1);
			if (typeof handler[last_index] === "function") {
				Resources.controller[controllerName] = handler[last_index];			//Added controller function against the controller name.
				Resources.controller_dependency[controllerName] =  dependencies;	//Array of dependencies.
			} 
			else{
				console.log("LAST ARGUMENT MUST BE A FUNCTION....");
			}		

		},		
		'_addFactory': function (factoryName, handler) {
			
			var last_index = handler.length-1;
			var dependencies = handler.slice(0, -1);
			if (typeof handler[last_index] === "function") {
					Resources.factory[factoryName] = handler[last_index].apply(this, Resources._loadDependencies(dependencies)); // handler[last_index];
			}
			else{
					console.log("FUNCTIONALITY MISSING FOR THE FACTORY.....");
			}
		},
		'_getControllerParams': function(hash){		//This function should return any parameters.
				var keys, match, routeParams={};
				for(var i = 0, max = Resources.routes.length; i < max; i++ ) {
						keys = Resources.routes[i].route.match(/:([^\/]+)/g);	
						var rexString = Resources.routes[i].route.replace(/:([^\/]+)/g, "([^\/]*)");
						var rex = new RegExp(rexString); 
						match = hash.match(rex);
						if(match){
								match.shift();
								match.forEach(function (value, i) {
									routeParams[keys[i].replace(":", "")] = value;
								});
							return routeParams;
						}
					
				}
				return null;	
		},		
		'_loadRouteController': function(hash){	//Controller to be executed on Route Change Event.
			
				var keys, match, routeParams={}, handler=null, controllerDependencies, flag=true;
				var simplifiedRouteName, controllerName;
				for(var i = 0, max = Resources.routes.length; i < max; i++ ) {
						flag=true;
						keys = Resources.routes[i].route.match(/:([^\/]+)/g);
						var rexString = Resources.routes[i].route.replace(/:([^\/]+)/g, "([^\/]*)");
						var rex = new RegExp(rexString); 
						match = hash.match(rex);
						//When hash is not '' but cuurent route contains it.
						if(hash.length != 0 && Resources.routes[i].route.length==0){	//Means its hash =>	''
								//When we are sure that its not a hash.
								flag=false;
						}
						
						if(match && flag){
								controllerName = Resources.routes[i].handler;			//Get the controller name to retrieve the respective function and dependencies against that controller.
								match.shift();
								match.forEach(function (value, i) {
									routeParams[keys[i].replace(":", "")] = value;
								});
							continue;
						}								
				}
				controllerName = controllerName || 'defaultController';
				//IF MATCH is empty then redirect to the default page. (may be some page showing the error or not found.....)
				//IMPORTANT => THIS will be API, since its an object.
				//Better to create a new Object?
				function F() {};
				var $scope = new F();
				handler = Resources.controller[controllerName];
				controllerDependencies = Resources.controller_dependency[controllerName];
				handler.apply($scope,Resources._loadDependencies(controllerDependencies));
		}		
		
	};

	function _addRoute(){
		Api._addRoute(arguments[0], arguments[1]);
	}
	function _addController(){
		Api._addController(arguments[0], arguments[1]);
	}
	function _addFactory(){
		Api._addFactory(arguments[0], arguments[1]);
	}	
	function _loadRouteController(){
		Api._loadRouteController(arguments[0]);
	}

    return {
        'addRoute': _addRoute,
        'addFactory': _addFactory,
        'addController': _addController,
		'loadRouteController': _loadRouteController
    }

})();