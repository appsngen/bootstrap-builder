/**
 * version 0.0.1
 */

(function ($) {
    'use strict';

    /** Plugin allow to create container with custom scrolls
     *  js dependencies : jquery.js, jquery.mousewheel.js, jquery.jScrollPane.js
     *
     *  Styles based on bootstrap
     *  less dependencies : jquery-jscrollpane.less, scrollable-container.less
     *
     * @param container - main container that contains markup
     * @param jspOptionsObj - object that contains jscrollpane setting object
     * more info here : http://jscrollpane.kelvinluck.com/settings.html
     */
    var ScrollableContainer = function (container, jspOptionsObj) {
        var that = this;
        this.version = '0.0.1';
        this.settings = {
            mouseWheelSpeed: 30,
            horizontalGutter: 1,
            verticalGutter: 1
        };
        $.extend(this.settings, jspOptionsObj);

        this.$globalContainer = $(container);
        if (!this.$globalContainer) {
            throw  new Error('Parameter container can\'t be undefined');
        }

        this.$dataContainer = this.$globalContainer.find('.scrollable-data');

        this.$globalContainer.css({overflow: 'hidden'});
        this.isScrollX = false;
        this.isScrollY = false;

        // handler for scrolling x
        // trigger event 'st-scroll-x'
        // return to callback wheel event and scroll position x
        this.$globalContainer.bind('jsp-scroll-x.st', function (event, scrollPositionX) {
            if ($(this).find('.jspDrag').hasClass('jspActive') || that.$globalContainer.is(':hover')) {
                that.$globalContainer.trigger('st-scroll-x', [scrollPositionX]);
            }
        });

        // handler for scrolling y
        // trigger event 'st-scroll-y'
        // return to callback wheel event and scroll position y
        this.$globalContainer.bind('jsp-scroll-y.st', function (event, scrollPositionY) {
            if ($(this).find('.jspDrag').hasClass('jspActive') || that.$globalContainer.is(':hover')) {
                that.$globalContainer.trigger('st-scroll-y', [scrollPositionY]);
            }
        });

        // handler for initialised jScrollPane
        // used for set margins and puddings(needs for good looking when scrolls are visible)
        // and init isScrollX and  isScrollY variables
        this.$globalContainer.bind('jsp-initialised.st', function () {
            var verticalScroll = that.$globalContainer.find('.jspVerticalBar');
            var horizontalScroll = that.$globalContainer.find('.jspHorizontalBar');
            that.isScrollX = horizontalScroll[0] ? true : false;
            that.isScrollY = verticalScroll[0] ? true : false;
        });

        //handler mouseleave
        //used for fix jScrollPane bug with focus on touch devices
        this.$globalContainer.bind('mouseleave.st', function () {
            $('html').unbind('dragstart.jsp selectstart.jsp mousemove.jsp mouseup.jsp mouseleave.jsp');
            var horizontalBar = $('.jspHorizontalBar');
            var horizontalTrack = horizontalBar.find('.jspTrack');
            var horizontalDrag = horizontalTrack.find('.jspDrag');

            var verticalBar = $('.jspVerticalBar');
            var verticalTrack = verticalBar.find('.jspTrack');
            var verticalDrag = verticalTrack.find('.jspDrag');
            if (verticalDrag) {
                verticalDrag.removeClass('jspActive');
            }
            if (horizontalDrag) {
                horizontalDrag.removeClass('jspActive');
            }
        });

        //handler touchmove
        //used for fix jScrollPane bug with touch devices focus
        this.$globalContainer.bind('touchmove.st', function (e) {
            var pageY = +e.originalEvent.touches[0].pageY;
            var pageX = +e.originalEvent.touches[0].pageX;
            var $body = $('body');
            var bodyHeight = $body.height();
            var bodyWidth = $body.width();
            if (pageY >= bodyHeight.height() || pageY <= 0 || pageX >= bodyWidth || pageX <= 0) {
                that.$globalContainer.find('.jspContainer').trigger('touchend.jsp');
            }
        });

        this.setBodyHeight();
        this.$dataContainer.jScrollPane(this.settings);
        this.jspApi = this.$dataContainer.data('jsp');
    };

    /**
     * calculate height for data container
     */
    ScrollableContainer.prototype.setBodyHeight = function () {
        var globalContainerHeight = this.$globalContainer.outerHeight();
        this.$dataContainer.height(globalContainerHeight);
        return this;
    };

    /**
     * update container(refresh height + jScrollPane)
     * @param reset to set y and x to 0
     */
    ScrollableContainer.prototype.refresh = function (reset) {
        this.setBodyHeight();
        if (reset) {
            this.jspApi.scrollTo(0, 0);
        }
        this.jspApi.reinitialise();
        return this;
    };

    /**
     * scroll container to x
     * @param x - coordinate
     */
    ScrollableContainer.prototype.scrollToX = function (x) {
        if (this.isScrollX) {
            this.jspApi.scrollToX(x);
        }
        return this;
    };

    /**
     * scroll table to y
     * @param y - coordinate
     */
    ScrollableContainer.prototype.scrollToY = function (y) {
        if (this.isScrollY) {
            this.jspApi.scrollToY(y);
        }
        return this;
    };

    /**
     * destroy scrollable container and remove all event handlers
     */
    ScrollableContainer.prototype.destroy = function () {
        this.$globalContainer.css({
            overflow: 'auto',
            height: 'auto'
        });
        this.$dataContainer.css({
            overflow: 'auto',
            height: 'auto'
        });
        this.$globalContainer.unbind('.st');
        this.$globalContainer.unbind('touchmove');
        this.$globalContainer.unbind('jsp-scroll-x');
        this.$globalContainer.unbind('jsp-scroll-y');
        this.$globalContainer.unbind('jsp-initialised');
        this.$globalContainer.unbind('st-scroll-x');
        this.$globalContainer.unbind('st-scroll-y');

        this.jspApi.destroy();
        this.$globalContainer.removeData('bs.sc');
    };

    $.fn.scrollableContainer = function (option, value) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.st');
            if (!data) {
                if (typeof option === 'object') {
                    data = new ScrollableContainer(this, option);
                } else {
                    data = new ScrollableContainer(this, undefined);
                }
                $this.data('bs.sc', data);
            }
            if (typeof option === 'string') {
                data[option](value);
            }
        });
    };
    $.fn.scrollableContainer.Constructor = ScrollableContainer;
}(jQuery));