(function (window) {
	
	var styletag = {		
		domain : "",
		cdn : "http://xuanli.us/style.css?r=",
		
		utils : {
			/**
			 * Utility to return a string version of a node's textnodes and all it's descendants
			 * Similar to innerText in IE, and textContent in WebKit/Firefox
			 * However, does not return script, style, hidden
			 */
			nodeToString: function(node, ignoreNode) {
				getChildNodes = function(node, ignoreNode) {
					var child = node.firstChild;
					var result = "";
					
					while (child) {
						if (child.nodeType == Node.TEXT_NODE && child != ignoreNode) {
							result += child.nodeValue;
						} else if (child.nodeType == Node.ELEMENT_NODE && child != ignoreNode) {
							//Don't try to parse Scripts' text or style texts as they introduce noise
							if (child.tagName != "SCRIPT" && child.tagName != "STYLE" && child.tagName != "LINK" && child.tagName != "EMBED" && child.tagName != "OBJECT")
								//Do not include hidden texts, as they're not relevant to us
								if (child.style && child.style.display != "none" && window.getComputedStyle && window.getComputedStyle(child).getPropertyValue("display") != "none")
									result += getChildNodes(child);								
						}
						child = child.nextSibling;
					}
					return result;
				}		
				return getChildNodes(node, ignoreNode);
			},

			/**
			 * Resize an image to fit nicely inside a 200x200 thumbnail
			 * Returns dimensions and margin offset to optimally center the image as well as reducing its size
			 */
			resizeImage: function(width, height) {
				var new_width = 200;
				var new_height = 200;
				var margin_top = 0;
				var margin_left = 0;
				
				if (width > height) {
					new_width = Math.floor(200 * (width / height));
					margin_left = 0 - Math.floor((new_width - 200) / 2);
				} else if (width < height) {
					new_height = Math.floor(200 * (height / width));
					margin_top = 0 - Math.floor((new_height - 200) / 2);
				}
				
				return {
					width: new_width,
					height: new_height,
					top: margin_top,
					left: margin_left
				}
			}
		},
				
		/**
		 * Price Searching Heuristics
		 */
		price : {
			amazon : function() {
				return null
			},
			
			//Return a $$
			sixpm : function() {
				return null;
			},
			
			search : function(element) {
				//Currencies written such as $123,214.12 or 123,123,123원
				var suffixCurrecyRegex = /[0-9]*(,)*(\d{3},)*(,)*[0-9]+(\.[0-9][0-9])?(원|€)/;
				var affixCurrencyRegex = /(\$|£|€)[0-9]*(,)*(\d{3},)*(,)*[0-9]+(\.[0-9][0-9])?/;
				
				var current = element;
				var matches = null;
				
				//Try Site Specific rules first
				if (window.location.host.indexOf("amazon") != -1) {
					matches = styletag.price.amazon();
				} else if (window.location.host.indexOf("6pm") != -1) {
					//call macy's specific rule set
					matches = styletag.price.sixpm();
				}
				
				//We probably should look into all the Matched prices in the matches array, instead of just picking the first one -
				if (!matches) {
					//GENERIC SEARCH, Just Bubble around to the Root looking for a price -------------------------------------------------------				
					while (current.parentNode) {
						//Try Affix Regex first
						if (matches = affixCurrencyRegex.exec(styletag.utils.nodeToString(current.parentNode, current))) {
							return matches[0];							
						} else {
							if (matches = suffixCurrecyRegex.exec(styletag.utils.nodeToString(current.parentNode, current)))
								return matches[0];
						}
						current = current.parentNode;
					}					
				} else {
					//The site-sepcific callback found something for price, so return that instead.
					return matches[0];
				}
			}
		},
		
		
		/**
		 * Creates the screen to pick the images
		 */
		init : function() {
			var images = window.document.images;
			var thumbnails = [];
			
			//Get qualified images that are greater than 100 width && 100 height
			//I don't do any "processing here" to save time, it can be slow to parse for price for a large number images - although optimizations (such as quick fail, limited dom traversal, dom flattening, async search) could make it reasonably fast
			for (var i = 0, length = images.length; i < length; i++) {
				if (images[i].src && images[i].offsetWidth >= 75 && images[i].offsetHeight >= 75) {
					thumbnails.push(images[i]);
				}
			}
			
			if (thumbnails.length == 0) {
				alert("No qualified images found");
				return;
			}
			
			//Attach a custom Stylesheet to make our design nicer
			var stylesheet = document.createElement('link');
			stylesheet.type = 'text/css';
			stylesheet.rel = 'stylesheet';
			stylesheet.href = styletag.cdn + Math.random() * 99999999;
			stylesheet.media = 'screen';
			document.getElementsByTagName("head")[0].appendChild(stylesheet);
			
			//Container Div
			var containerDiv = window.document.createElement("DIV");
			containerDiv.setAttribute("id", "styletag-container");
			window.document.body.appendChild(containerDiv);
			
			//Navigation
			var navDiv = window.document.createElement("DIV");
			navDiv.setAttribute("id", "styletag-nav");
			containerDiv.appendChild(navDiv);
			
			//Logo
			var logo = window.document.createElement('DIV');
			logo.setAttribute("id", "styletag-logo");
			navDiv.appendChild(logo);
			
			//Cancel Button
			var cancelButton = window.document.createElement('A');
			var linkText = window.document.createTextNode("Cancel");
			cancelButton.appendChild(linkText);
			cancelButton.setAttribute("id", "styletag-cancel");
			cancelButton.title = "Cancel";
			cancelButton.href = "#";
			navDiv.appendChild(cancelButton);			
			
			
			//Cross Browser calculation of document height so we can cover the web page in gray;			
			var height = Math.max(
						Math.max(window.document.body.scrollHeight, window.document.documentElement.scrollHeight),	
						Math.max(window.document.body.offsetHeight, window.document.documentElement.offsetHeight),					
						Math.max(window.document.body.clientHeight, window.document.documentElement.clientHeight))
			containerDiv.style.height = height + 'px';			
			
			//Loop through the qualified image nodes and attach them to the containerDiv 
			for (var i=0; i<thumbnails.length; i++) {
				if (thumbnails[i].clientWidth >= 50 && thumbnails[i].clientHeight >= 50) {
				
					var thumbnailDiv = window.document.createElement("DIV");
					thumbnailDiv.setAttribute("class", "styletag-thumbnail");
					containerDiv.appendChild(thumbnailDiv);
					
					var frame = styletag.utils.resizeImage(thumbnails[i].clientWidth, thumbnails[i].clientHeight);		
					var img = window.document.createElement("IMG");
					img.setAttribute("src", thumbnails[i].src);
					img.setAttribute("class", "styletag-thumbnail-img");
					img.setAttribute("width", frame.width + "px");
					img.setAttribute("height", frame.height + "px");
					img.style.margin = frame.top + "px 0 0 " + frame.left + "px";
					
					//Stuff the iteration position into the data entry (we may also want to stuff more into the data attributes later on)
					img.setAttribute("data-entry", i);
					thumbnailDiv.appendChild(img);					
				}
			}
						
			/**
			 * Event Listener
			 * When User clicks an image
			 * Relies Event Bubbling
			 */ 
			containerDiv.addEventListener('click', function(e) {				
				if (e.target.className == "styletag-thumbnail-img") {
					//Retrieve the original Image node on the web page, with this node we can now look around and try to pick out price/description from siblings
					var element = thumbnails[e.target.getAttribute("data-entry")];
					
					var price = styletag.price.search(element) || "";					
					var description = element.title || element.alt || window.document.title || "";
					
					//Remove all traces of this javascript and its DOM changes (CSS injection, ContainerDIV, Listeners)
					containerDiv.removeEventListener('click', arguments.callee);
					containerDiv.parentNode.removeChild(containerDiv);
					stylesheet.parentNode.removeChild(stylesheet);
					
					//Hand it off to the new window
					//We should use GET parameters here, and let the server handle the rest (auth, cookies, etc)....
					var win = window.open('', 'Styletag','width=800,height=300,status=0,toolbar=0');
					win.document.write("Source: " + window.location.host  + " <br /> IMAGE: " + element.src  + "<br /> Price: " + price + "<br /> Description: " + description);
					
				} else if (e.target.id == "styletag-cancel") {
					containerDiv.removeEventListener('click', arguments.callee);
					containerDiv.parentNode.removeChild(containerDiv);
					stylesheet.parentNode.removeChild(stylesheet);
				}
			});
		}
	};

	scroll(0,0);
	styletag.init();

})(window);
