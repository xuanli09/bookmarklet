javascript: void((function (dom) {
	var source = "http://xuanli.us/styletag.js?r=" + Math.random() * 99999999;  
    var script = dom.createElement('script');
	
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('charset', 'UTF-8');
    script.setAttribute('src', source);
    dom.body.appendChild(script)
})(document));