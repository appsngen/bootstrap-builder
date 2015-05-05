//global:$
(function () {
    'use strict';

    var DropdownOld = $.fn.dropdown.Constructor;

    var Dropdown = function (element) {
        var self = this;
        this.element = $(element);

        this.element.on('click.bs.dropdown', function (e) {
            self.toggle.call(this, e);
            e.stopPropagation();
        });
    };

    Dropdown.prototype = Object.create(DropdownOld.prototype);
    Dropdown.prototype.constructor = Dropdown;

    function setSelectedItem(btn, menu, item) {
        var value;

        if (!btn && !(menu && menu.length) || !(item && item.length)) {
            return;
        }

        value = item.attr('data-value');
        if (value) {
            menu.find('li').removeClass('active');
            item.addClass('active');
            btn.data('value', value)
                .find('.text').text(item.text());
            btn.trigger('valueChanged', value);
        }
    }

    Dropdown.prototype.toggle = function (e) {
        DropdownOld.prototype.toggle.call(this.element || this, e);
    };

    /**
     * Get selected values
     * @returns selected value
     */
    Dropdown.prototype.getValue = function () {
        var $el = this.element || this;
        return $el.data('value');
    };

    /**
     * Set selected value
     * @param valueOrIndex can be number or string
     * if number - select option nth in a row of dropdown menu items
     * else set value with data-value === valueOrIndex
     */
    Dropdown.prototype.setValue = function (valueOrIndex) {
        var $btn = this.element || this;

        var $item,
            $menu = $btn.parent().find('.dropdown-menu');

        if (parseInt(valueOrIndex) === valueOrIndex) { // check if a number
            // if index
            $item = $menu.find('li').eq(valueOrIndex);
        } else {
            // if value
            $item = $menu.find('[data-value="' + valueOrIndex + '"]');
        }

        setSelectedItem($btn, $menu, $item);
    };

    function onDropdownClick() {
        var $menuItem = $(this); //jshint ignore:line
        var $menu = $menuItem.parent();
        var $input = $menu.find('input');
        var $btn = $menu.parent().find('[data-toggle="dropdown"]');

        $input.val('').trigger('keyup.bs.dropdown.data-api');

        setSelectedItem($btn, $menu, $menuItem);
    }

    function getItems(e) {
        return $(e.target).parent().siblings('[role=\'presentation\']');
    }

    function filterItems(e, queryString) {
        var items = getItems(e),
            itemsLength = items.length,
            currentItem,
            currentItemText = '',
            stringLength = queryString.length,
            i;

        for(i = 0; i < itemsLength; i++) {
            currentItem = $(items.get(i));
            currentItemText = currentItem.find('a').text().slice(0, stringLength).toUpperCase();

            if(currentItemText === queryString) {
                currentItem.attr('data-filtered', 'true');
            } else {
                currentItem.attr('data-filtered', 'false');
            }
        }
    }

    function onInputClick(e) {
        e.stopPropagation();
    }

    function onInputKeyup(e) {
        var queryString = $(e.target).val();

        filterItems(e, queryString.toUpperCase());
        e.stopPropagation();
    }

    // DROPDOWN PLUGIN DEFINITION
    // ==========================

    function Plugin(option) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.dropdown');

            if (!data) {
                $this.data('bs.dropdown', (data = new Dropdown($this)));
            }
            if (typeof option === 'string') {
                data[option].call($this);
            }
        });
    }

    $.fn.dropdown = Plugin;
    $.fn.dropdown.Constructor = Dropdown;

    $(document).on('click.bs.dropdown.data-api', '.dropdown-menu li', onDropdownClick);
    $(document).on('click.bs.dropdown.data-api', '.dropdown-menu .filtered-input', onInputClick);
    $(document).on('click.bs.dropdown.data-api', '.dropdown-menu input', onInputClick);
    $(document).on('keyup.bs.dropdown.data-api', '.dropdown-menu input', onInputKeyup);

}());