$(function () {
    var $cards = $("#product-list .onsale-card");
    var itemsPerPage = 10;
    var totalItems = $cards.length;
    var totalPages = Math.ceil(totalItems / itemsPerPage);
    var currentPage = totalItems === 0 ? 0 : 1;

    function updateControls() {
        if (totalItems === 0) {
            $("#page-indicator").text("Page 0 of 0");
            $("#prev-page, #next-page").prop("disabled", true).addClass("disabled");
            return;
        }

        $("#page-indicator").text("Page " + currentPage + " of " + totalPages);
        $("#prev-page").prop("disabled", currentPage === 1).toggleClass("disabled", currentPage === 1);
        $("#next-page").prop("disabled", currentPage === totalPages).toggleClass("disabled", currentPage === totalPages);
    }

    function showPage(page) {
        if (totalItems === 0) {
            updateControls();
            return;
        }

        var start = (page - 1) * itemsPerPage;
        var end = start + itemsPerPage;
        $cards.hide().slice(start, end).show();
        currentPage = page;
        updateControls();
    }

    $cards.hide();
    if (totalItems > 0) {
        showPage(1);
    } else {
        updateControls();
    }

    $("#next-page").on("click", function () {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });

    $("#prev-page").on("click", function () {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
});
