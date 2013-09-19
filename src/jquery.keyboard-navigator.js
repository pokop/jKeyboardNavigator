(function($){
	$("<style type='text/css'> .kn-disable-user-agent-focus:focus{ outline: none; } </style>").appendTo("head");

    $.fn.keyboardNavigator = function(options) {
        var config = {
            'selector': '>*',
			'mouseHover': true,
			'disableUserAgentOutline': true,
			'disableFocusLostOnTabKeydown': true,
        };
		
        if (options) {
			$.extend(config, options);
		}
 
        return this.each(function() {
            var $this = $(this);
			
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
			
			$this.addClass('kn-container').keydown(function(e) {
				console.log(e.which);
				// TODO: more logic here.
				
				if (e.which == 9 && config.disableFocusLostOnTabKeydown) {
					return false;
				}
			}).focus(function() {
				//$this.find(config.selector).first().addClass('kn-selected');
				// TODO: select by logic and not only the first.
			}).blur(function() {
				$this.find(config.selector).removeClass('kn-selected');
			}).on('mouseenter', config.selector, function() {
				$this.find(config.selector).removeClass('kn-selected');
				$(this).addClass('kn-selected');
			});
        });
    };
})(jQuery);