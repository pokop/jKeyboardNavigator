(function($){
	$("<style type='text/css'> .kn-disable-user-agent-focus:focus{ outline: none; } </style>").appendTo("head");

	function getPosition() {
		var $this = $(this),
			offset = $this.offset(),
			height = $this.height(),
			width = $this.width();
		
		return {left: offset.left, right: offset.left + width, top: offset.top, bottom: offset.top + height};
	}

	$.navigators = {
		next: function (key, currentSelectedIndex, $items) {
			return (currentSelectedIndex + 1) % $items.length;
		},
		prev: function (key, currentSelectedIndex, $items) {
			if (currentSelectedIndex == -1) {
				currentSelectedIndex = 0;
			}
			return (currentSelectedIndex + $items.length - 1) % $items.length;
		},
		first: function (key, currentSelectedIndex, $items) {
			return 0;
		},
		last: function (key, currentSelectedIndex, $items) {
			return $items.length - 1;
		},
		// TODO: add more navigators.
	};
	
	function keyToStr(e) {
		switch (e.which) {
			case 37: return 'left';
			case 38: return 'up';
			case 39: return 'right';
			case 40: return 'down';
			// TODO: add page-down, page-up, end, home
		}
		
		return '';
	}
	
	var keys = Object.keys || (function () {
		'use strict';
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;
	
			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
	
	$.kn = $keyboardNavigators = {
		upDown: {
			up: $.navigators.prev,
			down: $.navigators.next,
		},
		leftRight: {
			left: $.navigators.prev,
			right: $.navigators.next,
		},
		rightLeft: {
			right: $.navigators.prev,
			left: $.navigators.next,
		}
		// TODO: add more pre-configurations for common uses.
	}
	
    $.fn.kn = $.fn.keyboardNavigator = function(options) {
        var config = {
            selector: '>*',
			mouseHover: true,
			disableUserAgentOutline: true,
			disableFocusLostOnTabKeydown: true,
			navigator: $.kn.upDown,
			mouseClick: true,
			selectByMouseHover: true,
			// TODO: add option to map keys to strings(name of event to trigger) and functions(handlers)
        };
		
        if (options) {
			$.extend(config, options);
		}
 
        return this.each(function() {
            var $this = $(this), isSelectedPermanently = false;
			
			// Make sure the tabindex is set for the container, in order to be focusable.
			if ($this.attr('tabindex') === undefined) {
				$this.attr('tabindex', '-1');
			}
			
			// Disable user agent outline of focus element.
			if (config.disableUserAgentOutline) {
				$this.addClass('kn-disable-user-agent-focus');
			}
			
			// Set the focus to the container on mouse hover.
			if (config.mouseHover) {
				$this.hover(function() {
					$this.focus();
				}, function() {
					if (!isSelectedPermanently) {
						$this.blur();
					}
				});
			}
			
			$this.addClass('kn-container').keydown(function(e) {
				console.log(e.which);
				
				// If the key is an arrow key.
				// TODO: implement logic for holded ctrl support.
				if ($.inArray(keyToStr(e), keys(config.navigator)) != -1) {
					var $newSelected, currentIndex = -1,
					
						// Get the items.
						$items = $this.find(config.selector),
					
						// Get the selected item.
						$selected = $items.filter('.kn-selected');
					
					//var positions = $items.map(getPosition).get();
					//console.log(positions);
					
					if ($selected.length > 0) {
						currentIndex = $.inArray($selected[0], $items);
					}
					
					// TODO: implement logic for holded ctrl support.
					ret = config.navigator[keyToStr(e)].call(this, e.which, currentIndex, $items);
					
					if (ret === undefined || ret === -1) {
						$newSelected = $();
					}
					else if ($.isNumeric(ret)) {
						$newSelected = $items.eq(Math.floor(ret));
					}
					else {
						$newSelected = $(ret);
					}
					
					$selected.removeClass('kn-selected');
					$newSelected.addClass('kn-selected');
					
					return false;
				}
				// Disable focus lost on tab key down.
				else if (e.which == 9 && config.disableFocusLostOnTabKeydown) {
					return false;
				}
				// TODO: if the key is in the configurable mapping, trigger the event/handler.
				// TODO: if the key is registered on inner item of the selected item as event-name or handler, trigger it.
				
			}).focus(function() {
				//$this.find(config.selector).first().addClass('kn-selected');
			}).blur(function() {
				//$this.find(config.selector).removeClass('kn-selected');
			}).on('mouseenter', config.selector, function() {
				if (!isSelectedPermanently && config.selectByMouseHover) {
					// TODO: scroll to the selected element is he is not fully visible.
					$this.find(config.selector).removeClass('kn-selected');
					$(this).addClass('kn-selected');
				}
				$(this).addClass('kn-hover');
			}).on('mouseleave', config.selector, function () {
				$(this).removeClass('kn-hover');
			}).on('DOMNodeRemoved', function (e) {
				// This event is not supported in all browsers, but it better to have it where it is supported than not implmenet it at all.
				// If the selected item is removed from the DOM, clear the isSelectedPermanently flag.
				if (isSelectedPermanently && ($(e.target).find('.kn-selected').length > 0 || $(e.target).hasClass('kn-selected'))) {
					isSelectedPermanently = false;
				}
			});
			
			if (config.mouseClick) {
				$this.on('click', config.selector, function () {
					if (!isSelectedPermanently || !$(this).hasClass('kn-selected')) {
						$this.find(config.selector).removeClass('kn-selected');
						$(this).addClass('kn-selected');
						isSelectedPermanently = true;
					} else {
						$this.find(config.selector).removeClass('kn-selected');
						isSelectedPermanently = false;
					}
				});
			}
        });
    };
})(jQuery);