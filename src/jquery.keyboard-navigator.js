(function($){
	$("<style type='text/css'> .kn-disable-user-agent-focus:focus{ outline: none; } </style>").appendTo("head");

    $.fn.keyboardNavigator = function(options) {
        var config = {
            'selector': '>*',
			'mouseHover': true,
			'disableUserAgentOutline': true,
        };
		
        if (options) {
			$.extend(config, options);
		}
 
        return this.each(function() {
            var $this = $(this),
				  $items = $this.find(config.selector);
			
			// Make sure the tabindex is set for the container, in order to be focusable.
			if ($this.attr('tabindex') === undefined) {
				$this.attr('tabindex', '-1');
			}
			
			// disable user agent outline of focus element.
			if (config.disableUserAgentOutline) {
					$this.addClass('kn-disable-user-agent-focus');
			}
			
			// Set the focus to the container on mouse hover.
			if (config.mouseHover) {
				$this.hover(function() {
					$this.focus();
				}, function() {
					$this.blur();
				});
			}
			
			$this.keydown(function(e) {
				console.log(e.which);
				// TODO: more logic here.
			}).focus(function() {
				$this.addClass('kn-focused');
				$items.first().addClass('kn-selected');
				// TODO: select by logic and not only the first.
			}).blur(function() {
				$this.removeClass('kn-focused');
				$items.removeClass('kn-selected');
			});
			
			if ($this.is(':focus')) {
				$this.addClass('kn-focused');
			}
        });
    };
})(jQuery);