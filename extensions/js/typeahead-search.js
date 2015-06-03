(function ($) {
    'use strict';

    var TypeaheadSearch = function ($container, typeaheadOptions, typeaheadDataset) {
        if (!typeaheadOptions || !typeaheadDataset) {
            throw new Error('Initialization error - options are required.');
        }

        var $searchButton = $container.find('.search-icon'),
            $cancelButton = $container.find('.cancel'),
            $searchInput = $container.find('input'),
            $searchInputOverlay = $container.find('.search-input'),
            $removeButton = $container.find('.remove-button');

        this.$container = $container;
        this.$searchInput = $searchInput;
        this.$searchInput.typeahead(
            typeaheadOptions,
            typeaheadDataset
        );

        this.$searchInput.bind('typeahead:selected', function (e, value) {
            $container.trigger('valueChanged', value);
        });

        this.$searchInput.bind('keyup', function(e) {
            if(e.target.value) {
                $removeButton.removeClass('disabled');
            } else {
                $removeButton.addClass('disabled');
            }
        });

        var toggleFunction = function () {
            $searchButton.toggle();
            $searchInputOverlay.toggleClass('search-input-animation');
            $container.trigger('toggleState');
        };

        var clearFunction = function () {
            $searchInput.typeahead('val', '');
            $searchInput.trigger('keyup');
        };

        $cancelButton.on('click', toggleFunction);
        $searchButton.on('click', toggleFunction);
        $removeButton.on('click', clearFunction);
    };

    TypeaheadSearch.prototype.typeaheadSearch = function (/*method, value*/) {
        //filter args which are undefined because typeahead realize undefined as value
        var args = [].slice.apply(arguments).filter(function (arg) {
            return arg !== undefined;
        });

        var returnedValue = this.$searchInput.typeahead.apply(this.$searchInput, args);

        return (typeof returnedValue === 'string') ? returnedValue : this.$container;
    };

    var Plugin = function (typeaheadOptions, typeaheadDataset) {
        var returnedValue;

        this.each(function () {
            var $this = $(this);
            var data = $this.data('bs.ts');

            if (!data) {
                data = new TypeaheadSearch($this, typeaheadOptions, typeaheadDataset);

                $this.data('bs.ts', data);
            }
            if (typeof typeaheadOptions === 'string') {
                returnedValue = data.typeaheadSearch(typeaheadOptions, typeaheadDataset);
            }
        });

        return (typeof returnedValue === 'string') ? returnedValue : this;
    };

    $.fn.typeaheadSearch = Plugin;
}(jQuery));