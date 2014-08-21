(function ($) {
    'use strict';

    /** Plugin allow to create table with fixed header and column
     *  js dependencies : jquery.js, jquery.mousewheel.js, jquery.jScrollPane.js
     *
     *  Styles based on bootstrap
     *  less dependencies : jquery-jscrollpane.less, custom-table.less
     *
     * @param container - main container that contains markup
     * @param jspOptionsObj - object that contains jscrollpane setting object
     * more info here : http://jscrollpane.kelvinluck.com/settings.html
     */
    var ScrollableTable = function (container, jspOptionsObj) {
        var that = this, isFixedColumn;
        this.version = '0.0.2';
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

        this.$globalContainer.css({overflow: 'hidden'});

        this.$globalHeaderWrapper = this.$globalContainer.find('.header-table');
        this.$globalBodyWrapper = this.$globalContainer.find('.content-table');

        // object that contains all data for scrollable part of table
        this.scroll = {};
        // table contains jquery object of tables with data
        this.scroll.table = {
            $header: that.$globalHeaderWrapper.find('.scroll-cell table'),
            $body: that.$globalBodyWrapper.find('.scroll-cell table')
        };
        // containers contains wrappers of tables which is used for scrolling
        this.scroll.container = {
            $header: that.scroll.table.$header.parent(),
            $body: that.scroll.table.$body.parent()
        };

        if (this.$globalHeaderWrapper) {
            // handler for table header click
            // trigger event 'st-header-click'
            // return to callback click event, header id, sort order
            this.$globalHeaderWrapper.find('th').bind('click', function () {
                var $th = $(this);
                var dataLink = $th.attr('data-link');
                if (dataLink) {
                    that.$globalHeaderWrapper.find('th[data-id="' + dataLink + '"]').trigger('click');
                    return;
                }
                var dataId = $th.attr('data-id');
                var order = $th.attr('data-sort');
                if (order) {
                    order = order === 'asc' ? 'desc' : 'asc';
                    $th.attr('data-sort', order);
                } else {
                    order = 'asc';
                    that.$globalHeaderWrapper.find('th').attr('data-sort', '');
                    $th.attr('data-sort', order);
                }
                that.$globalContainer.trigger('st-header-click', [dataId, order]);
            });
        }

        this.isScrollX = false;
        this.isScrollY = false;

        // handler for highlight rows in tables on hover
        this.$globalBodyWrapper.on('mouseover', 'tr', function () {
            var index = $(this).index() + 1;
            that.$globalBodyWrapper.find('tr:nth-child(' + index + ')').addClass('highlight');
        });

        // handler for removing highlight rows in tables on hover
        this.$globalBodyWrapper.on('mouseleave', 'tr', function () {
            var index = $(this).index() + 1;
            that.$globalBodyWrapper.find('tr:nth-child(' + index + ')').removeClass('highlight');
        });

        // handler for scrolling x
        // trigger event 'st-scroll-x'
        // return to callback wheel event and scroll position x
        this.scroll.container.$body.bind('jsp-scroll-x', function (event, scrollPositionX) {
            if ($(this).find('.jspDrag').hasClass('jspActive') || that.scroll.container.$body.is(':hover')) {
                that.scroll.container.$header.scrollLeft(scrollPositionX);
                that.$globalContainer.trigger('st-scroll-x', [scrollPositionX]);
            }
        });

        // handler for scrolling y
        // trigger event 'st-scroll-y'
        // return to callback wheel event and scroll position y
        this.scroll.container.$body.bind('jsp-scroll-y', function (event, scrollPositionY) {
            if ($(this).find('.jspDrag').hasClass('jspActive') || that.scroll.container.$body.is(':hover')) {
                if (that.fixed) {
                    that.fixed.container.$body.data('jsp').scrollToY(scrollPositionY);
                }
                that.$globalContainer.trigger('st-scroll-y', [scrollPositionY]);
            }
        });

        // handler for initialised jScrollPane
        // used for set margins and puddings(needs for good looking when scrolls are visible)
        // and init isScrollX and  isScrollY variables
        this.scroll.container.$body.bind('jsp-initialised', function () {
            var verticalScroll = that.scroll.container.$body.find('.jspVerticalBar');
            var horizontalScroll = that.scroll.container.$body.find('.jspHorizontalBar');
            if (horizontalScroll[0]) {
                if (that.isScrollX === false) {
                    that.isScrollX = true;
                    if (that.fixed) {
                        that.fixed.container.$body.find('table').css(
                            {
                                marginBottom: horizontalScroll.outerHeight() + 'px'
                            });
                    }

                }
            } else {
                if (that.isScrollX === true) {
                    that.isScrollX = false;
                    if (that.fixed) {
                        that.fixed.container.$body.find('table').css({marginBottom: '0px'});
                    }

                }
            }
            if (verticalScroll[0]) {
                if (that.isScrollY === false) {
                    that.isScrollY = true;
                    that.scroll.container.$header.css({marginRight: verticalScroll.outerWidth() + 'px'});
                }
            } else {
                if (that.isScrollY === false) {
                    that.isScrollY = false;
                    that.scroll.container.$header.css({marginRight: '0px'});
                }
            }
        });

        //handler mouseleave
        //used for fix jScrollPane bug with focus on touch devices
        this.$globalContainer.bind('mouseleave', function () {
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
        this.$globalContainer.bind('touchmove', function (e) {
            var pageY = +e.originalEvent.touches[0].pageY;
            var pageX = +e.originalEvent.touches[0].pageX;
            var $body = $('body');
            var bodyHeight = $body.height();
            var bodyWidth = $body.width();
            if (pageY >= bodyHeight.height() || pageY <= 0 || pageX >= bodyWidth || pageX <= 0) {
                that.scroll.container.$body.find('.jspContainer').trigger('touchend.jsp');
                if (that.fixed) {
                    that.fixed.container.$body.find('.jspContainer').trigger('touchend.jsp');
                }
            }
        });

        isFixedColumn = this.$globalContainer.hasClass('fixed-column');
        if (isFixedColumn) {
            // object that contains all data for fixed part of table
            this.fixed = {};
            // table contains jquery object of tables with data
            this.fixed.table = {
                $header: that.$globalHeaderWrapper.find('.fixed-cell table'),
                $body: that.$globalBodyWrapper.find('.fixed-cell table')
            };
            // containers contains wrappers of tables which is used for scrolling
            this.fixed.container = {
                $header: that.fixed.table.$header.parent(),
                $body: that.fixed.table.$body.parent()
            };

            this.fixed.container.$body.bind('jsp-scroll-y', function (event, scrollPositionY) {
                if ($(this).find('.jspDrag').hasClass('jspActive') || that.fixed.container.$body.is(':hover')) {
                    if (that.scroll) {
                        that.scroll.container.$body.data('jsp').scrollToY(scrollPositionY);
                    }
                    that.$globalContainer.trigger('st-scroll-y', [scrollPositionY]);
                }
            });
        }

        this.setBodyHeight();
        this.scroll.container.$body.jScrollPane(this.settings);
        // api for managing jScrollPane
        this.scroll.jspApi = this.scroll.container.$body.data('jsp');
        if (isFixedColumn) {
            this.fixed.container.$body.jScrollPane(this.settings);
            // api for managing jScrollPane
            this.fixed.jspApi = this.fixed.container.$body.data('jsp');
        }
    };

    /**
     * calculate height for body container
     */
    ScrollableTable.prototype.setBodyHeight = function () {
        var containerHeight = this.$globalContainer.outerHeight();
        var headerHeight = this.$globalHeaderWrapper.outerHeight() || 0;
        var height = containerHeight - headerHeight;
        this.scroll.container.$body.height(height);
        if (this.fixed) {
            this.fixed.container.$body.height(height);
        }
        return this;
    };

    /**
     * update table(refresh height + jScrollPane)
     * @param reset to set y and x to 0
     */
    ScrollableTable.prototype.refresh = function (reset) {
        this.setBodyHeight();
        var api = [];
        api.push(this.scroll.jspApi);
        if (this.fixed) {
            api.push(this.fixed.jspApi);
        }
        api.forEach(function (api) {
            if (reset) {
                api.scrollTo(0, 0);
            }
            api.reinitialise();
        });
        return this;
    };

    /**
     * scroll table to x
     * @param x - coordinate
     */
    ScrollableTable.prototype.scrollToX = function (x) {
        if (this.isScrollX) {
            this.scroll.jspApi.scrollToX(x);
            this.scroll.container.$header.scrollLeft(x);
        }
        return this;
    };

    /**
     * scroll table to y
     * @param y - coordinate
     */
    ScrollableTable.prototype.scrollToY = function (y) {
        if (this.isScrollY) {
            this.scroll.jspApi.scrollToY(y);
            if (this.fixed) {
                this.fixed.jspApi.scrollToY(y);
            }
        }
        return this;
    };

    /**
     * destroy scrollable table and remove all event handlers
     */
    ScrollableTable.prototype.destroy = function () {
        this.$globalBodyWrapper.unbind('mouseover');
        this.$globalContainer.unbind('touchmove');
        this.$globalBodyWrapper.unbind('mouseleave');
        this.$globalHeaderWrapper.find('th').unbind('click');
        this.scroll.container.$body.unbind('jsp-scroll-x');
        this.scroll.container.$body.unbind('jsp-scroll-y');
        this.scroll.container.$body.unbind('jsp-initialised');
        this.$globalContainer.unbind('st-header-click');
        this.$globalContainer.unbind('st-scroll-x');
        this.$globalContainer.unbind('st-scroll-y');
        this.scroll.jspApi.destroy();
        if (this.fixed) {
            this.fixed.jspApi.destroy();
        }
        this.scroll.container.$body.height('auto');
        if (this.fixed) {
            this.fixed.container.$body.height('auto');
        }
    };

    $.fn.scrollableTable = function (option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.st');
            if (!data) {
                if (typeof option === 'object') {
                    data = new ScrollableTable(this, option);
                } else {
                    data = new ScrollableTable(this, undefined);
                }
                $this.data('bs.st', data);
            }
            if (typeof option === 'string') {
                data[option]();
            }
        });
    };
    $.fn.scrollableTable.Constructor = ScrollableTable;
}(jQuery));