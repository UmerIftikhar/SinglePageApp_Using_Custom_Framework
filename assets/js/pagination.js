/* * * * * * * * * * * * * * * * *
 * Pagination
 * javascript page navigation
 
 TODO	=>		MAKE functions as prototypes instead of private or public, to improve performance and increase memory efficiency.
 * * * * * * * * * * * * * * * * */

var Pagination = (function () {
	
	var code='';
	var page,size,step,element;
	var notifyPageChange;		//Topic to send information when page is changed.
	
    // converting initialize data
    var Extend = function(data) {
        data = data || {};
        size = data.size || 5;
        page = data.page || 1;
        step = data.step || 3;
    };
	
	// add pages by number (from [s] to [f])
    var Add = function(s, f) {
        for (var i = s; i < f; i++) {
            code += '<a>' + i + '</a>';
        }
    };
	
    // --------------------
    // Handlers
    // --------------------
    // change page
    var Click = function() {
        
		if( page !== +this.innerHTML){
			  page = +this.innerHTML;	//use plus or convert to integer.
			  Start();
		}
    };
	
    // previous page
    var Prev = function() {
        page--;
        if (page < 1) {
            page = 1;
        }
        Start();
    };

    // next page
    var Next = function() {
        page++;
        if (page > size) {
            page = size;
        }
        Start();
    };
	
    // --------------------
    // Script
    // --------------------

    // binding pages
    var Bind = function() {
        var a = element.getElementsByTagName('a');
        for (var i = 0; i < a.length; i++) {
            if (a[i].innerHTML == page) a[i].className = 'active';
            a[i].addEventListener('click', Click, false);
        }
    };

    // write pagination
    var Finish = function() {
        element.innerHTML = code;
        code = '';
        Bind();	//Attach click functions :).....
		//Instead of explicitly declaring functio here, use the PUBSUB to notify the change in the topic "notifyPageChange".
		_PubSub.publish(notifyPageChange, page );
    };
	
    // find pagination type
    var Start = function() {
		
		step = 5
		//Pagination.step > 3 ? Pagination.step = 3 : null;
		var sendNotification = true;
		
        if (size < step) {		//Display Maxnimum of FIVE options per page.
            Add(1, size + 1);			//1, 12 + 1 = 13.	Pagination.size = 12.
        }
        else if (page < step) {	//Now Check Whether the selected page is less than the Required Length(fixed at FIVE).
            Add(1, step + 1);		//As long as current page is between 1 and 5 every thing is goood :)..........
        }
        else if (page >= step) {		//Now Check Whether the selected page is greater than the Required Length(fixed at FIVE).
			//Suppose the page is SIX. we wan to display << 2,3,4,5,6 >>
			//Suppose the page is TEN. we wan to display << 6,7,8,9,10 >>
            Add(page - step + 1, page + 1);
        }
        else {
				console.log("SOME THING IS FISHY.......");
        }
        Finish();
		
		sendNotification ? console.log("PUBLISHED THE PAGE NUMBER: ",page) : console.log("Error In Pagination"); 
	
    };

    // --------------------
    // Initialization
    // --------------------

    // binding buttons
    var Buttons = function(e) {
		//e contain "<a>&laquo;</a><span></span><a>&raquo;</a>"
		//we are attaching click functionality to the Next and Previous Buttons.
        var nav = e.getElementsByTagName('a');
        nav[0].addEventListener('click', Prev, false);
        nav[1].addEventListener('click', Next, false);
    };

    // create skeleton
    var Create = function(e) {

        var html = [
            '<a>&laquo;</a>', // previous button
            '<span></span>',  // pagination container
            '<a>&raquo;</a>'  // next button
        ];

        e.innerHTML = html.join('');	//Convert array to String.
        element = e.getElementsByTagName('span')[0];	//Span will further contain the number 1,2,3,......,N.
        Buttons(e);	//Attach the Previous and Next Functionality to the << and >> Buttons.
    };

    // init
    this.init = function(e, data, publishPageTopic) {
		notifyPageChange = publishPageTopic || "TestPagination/newPage";
        Extend(data);		//SETS....  Pagination.size, Pagination.page, Pagination.step .....from the data provided.
        Create(e);			//Create the very basic functionality.
        Start();				//MAJOR stuff is done here.
    };
	
});
