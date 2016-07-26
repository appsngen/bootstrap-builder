(function () {
    'use strict';
    var togglePanel = function ($label) {
        var id = $label.attr('id');
        var $collapsiblePanel = $('.collapsible-panel[data-id=' + id + ']');

        if ($collapsiblePanel.length === 0) {
            throw 'There is no panel for this checkbox.';
        } else {
            $label.toggleClass('opened');
            $collapsiblePanel.toggle();
        }
    };

    var onCollapsiblePanelClick = function () {
        var $label = $(this);

        togglePanel($label);
    };

    $(document).on('click', '.collapsible-panel-label', onCollapsiblePanelClick);
}());