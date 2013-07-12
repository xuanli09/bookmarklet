javascript: void((function (dom) {
    var source = "http://xuanli.us/styletag.js?r=" + Math.random() * 99999999;	
    var script_id = "styletag_bookmarket_js";
    var script = document.getElementById(script_id);
    
    //Remove the Script to avoid adding the JS all the time - 
    //Although this is not necessary since each instance of the script is wrapped in a closure, and will run once anyway.
    if (script) {
    	script.parentNode.removeChild(script);
    }
    
    script = dom.createElement('script');
    script.id = script_id;
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('charset', 'UTF-8');
    script.setAttribute('src', source);
    dom.body.appendChild(script);          
})(document));
