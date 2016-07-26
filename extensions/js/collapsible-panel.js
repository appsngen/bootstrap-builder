(function () {
    'use strict';
    var togglePanel = function (id) {
        var $collapsiblePanel = $('.collapsible-panel[data-id=' + id + ']');
        var $overlay = $('.collapsible-panel-overlay[data-id=' + id + ']');
        var $label = $('.collapsible-panel-label[data-id=' + id + ']');

        if ($collapsiblePanel.length === 0) {
            throw 'There is no panel for this checkbox.';
        } else {
            $label.toggleClass('opened');
            $overlay.toggleClass('opened');

            $collapsiblePanel.toggle();
        }
    };

    var onCollapsiblePanelClick = function () {
        var id = $(this).data('id');

        togglePanel(id);
    };

    $(document).on('click', '.cp-trigger', onCollapsiblePanelClick);
}());