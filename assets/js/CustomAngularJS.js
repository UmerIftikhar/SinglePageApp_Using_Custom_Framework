

var singleProductPage = $('.single-product');

singleProductPage.on('click', function (e) {
	if (singleProductPage.hasClass('visible')) {
		var clicked = $(e.target);
		// If the close button or the background are clicked go to the previous page.
		if (clicked.hasClass('close') || clicked.hasClass('overlay')) {
			// Change the url hash with the last used filters.
			window.location.hash='/index';
		}
	}
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

FrameWork.addController("productController", ['$location', 'getBooks', function($location, getBooks){
	var productId = $location.params().productId;
	// Hide whatever page is currently shown.
	$('.main-content .page').removeClass('visible');
	var booksPromise = getBooks.getData();
	booksPromise.done(function(data) {
						renderSingleProductPage(productId, data.items);
				  })  .fail(function(err) {
							console.log('error', err);
					});

}]);

FrameWork.addRoute("/product/:productId","productController");



FrameWork.addController("indexController", ['getBooks', function(getBooks){
	// Hide whatever page is currently shown.
	$('.main-content .page').removeClass('visible');
	var self=this;
	self.products = [];
	self.myPage = new Pagination();
	var init = function(pageSize) {
		self.myPage.init(document.getElementById('pagination'), {
			size: pageSize, // pages size
			page: 1,  // selected page
			step: 5   // pages before and after current ..... After that the dots(...) will follow and will display the first and last page. e.g:	<< 1...6 7 8 [9] 10 11 12...30 >>
		});
	};

	var booksPromise = getBooks.getData();
	booksPromise.done(function(data) {
						var length=data.items.length;
						var itemPerPage = 8;
						var pageSize = Math.ceil(length / itemPerPage);

						//console.log('success', data);
						//console.log('THIS OBJECT ', self);
					    self.products = data.items;
					    window.products = data.items;	//to be removed later.
						generateAllProductsHTML(self.products);
						renderProductsPage(self.products);
						init(pageSize);									//STUFF DONE FOR PAGINATION...........

				  })  .fail(function(err) {
							console.log('error', err);
					});


	var _displayPageData = function (topic, page){
		var itemPerPage = 8;
		page = page || 1;
		var list = $('.all-products .products-list');
		//console.log(list);
		var lisItems = list.children("li");
		var startIndex = (page - 1)*itemPerPage;		//	Pagination.page=>1..... 0 ;	Pagination.page=>2..... 8
		var stopIndex = page*itemPerPage -1;			//	Pagination.page=>1..... 7 ;	Pagination.page=>2..... 15
		lisItems.css("display","none");
		for(var i=startIndex; i<=stopIndex && i<lisItems.length; i++){
				lisItems[i].style.display = "";
		}
	}

	var subscription = _PubSub.subscribe( "TestPagination/newPage", _displayPageData );



}]);

FrameWork.addRoute("/index","indexController");


//	DEFAULT ROUTE CONTROLLER.
//
//If a route is not mentioned, then add a default controller to handle that, may be to show some error.
FrameWork.addController("defaultController", [ function(){
	// Hide whatever page is currently shown.
	$('.main-content .page').removeClass('visible');
	renderErrorPage();

}]);


FrameWork.addFactory('getBooks', [function(){

	var baseUrl = "https://www.googleapis.com/books/v1/volumes?";
	var _data = null;
	var service = {
            getData: getData
    };

    return service;

	function getData(jsonData,refresh) {
		//&max-results=40
		//url: "https://www.googleapis.com/books/v1/volumes?q=harry potter",
		if (refresh || !_data) {
			console.log("MAKING AN HTTP REQUEST......");
			jsonData = jsonData || 'q=harry potter';
			var url = baseUrl + jsonData;
			return $.ajax({
								url: "https://www.googleapis.com/books/v1/volumes?q=harry potter&maxResults=40&startIndex=0",
								method: "GET"
							}).done(function(data) {
									//console.log("_data ......", _data);
									_data = data;
									return data;
							  }).fail(function(err) {
										//console.log('error', err);
										return err;
								});
		}
		else {
			console.log("GETTING DATA FROM CAHCE......");
			var deferrer = $.Deferred();
			deferrer.resolve(_data);
			return deferrer.promise();
		}
	}


}]);


function generateAllProductsHTML(data){
	console.log("DATA:	",data);
	var list = $('.all-products .products-list');
	var theTemplateScript = $("#products-template").html();
	//Compile the template​
	//console.log(theTemplateScript);
	var theTemplate = TemplateEngine(theTemplateScript, {
		data: data
	});
	list.append (theTemplate);
	// Each products has a data-index attribute.
	// On click change the url hash to open up a preview for this product only.
	// Remember: every hashchange triggers the render function.
	list.find('li').on('click', function (e) {
		e.preventDefault();
		var productIndex = $(this).data('index');
		//console.log("productIndex............ ",productIndex);
		window.location.hash = '/product/' + productIndex;
	})
}

function renderProductsPage(data){
	var page = $('.all-products'),
		allProducts = $('.all-products .products-list > li');
	// Show the page itself.
	// (the render function hides all pages so we need to show the one we want).
	page.addClass('visible');
}

function renderSingleProductPage(index, data){

	var page = $('.single-product'),
		container = $('.preview-large');

	// Find the wanted product by iterating the data object and searching for the chosen index.
	if(data.length){
		data.forEach(function (item) {
			if(item.id == index){
				// Populate '.preview-large' with the chosen product's data.
				container.find('h3').text(item.volumeInfo.title);
				container.find('img').attr('src', item.volumeInfo.imageLinks.thumbnail);
				container.find('p').text(item.volumeInfo.description);
			}
		});
	}

	// Show the page.
	page.addClass('visible');

}

// Shows the error page.
function renderErrorPage(){
	var page = $('.error');
	page.addClass('visible');
}


var LightTableFilter = (function(Arr) {
	var _input;
	function _onInputEvent(e) {
		_input = e.target;
		var lists = document.getElementsByClassName(_input.getAttribute('data-list'));
		Arr.forEach.call(lists, function(list) {
			Arr.forEach.call(list.children, function(li) {
				if(li.localName !== "script"){
						_filter(li);
				}
			});
		});
	}

	function _filter(li) {
		var text = li.textContent.toLowerCase(), val = _input.value.toLowerCase();
		li.style.display = text.indexOf(val) === -1 ? 'none' : '';
	}

	return {
		init: function() {
			var inputs = document.getElementsByClassName('search-input');
			console.log(inputs[0]);
			Arr.forEach.call(inputs, function(input) {
				input.oninput = _onInputEvent;
			});
		}
	};
})(Array.prototype);






//////////////////////////////////////////////////////////
//	MAKE INIT FUNCTION PART OF ROUTER AS WELL.
//////////////////////////////////////////////////////////

//Invoke the function once after the Route Variable is initialized.
function init(){
	LightTableFilter.init();
	window.onhashchange = function(){
		var currHash = decodeURI(window.location.hash);
		console.log("-------------  " + currHash + "  ------------------");
		FrameWork.loadRouteController(decodeURI(window.location.hash));
	}
	//window.location.hash='/index';
	var currHash = decodeURI(window.location.hash)
	if(currHash === "" || currHash === "#/"){
		window.location.hash='/index';
		//FrameWork.loadRouteController('#/index');
	}
	else{
		FrameWork.loadRouteController(decodeURI(window.location.hash));
	}
	//FrameWork.loadRouteController(decodeURI(window.location.hash));
	//FrameWork.loadRouteController('#/index');
}


init();

//console.log("AFTER INIT.....");
