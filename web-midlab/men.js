$(document).ready(function () {

    // ── Variables ──
    var $track = $('#sliderTrack');
    var $cards = $track.find('.product-card');
    var totalCards = $cards.length;
    var currentIndex = 0;
    var autoPlayTimer = null;

    // ── Calculate how far to slide ──
    function getCardWidth() {
        // card width + gap (20px)
        return $cards.first().outerWidth(true) + 20;
    }

    // ── Update slider position ──
    function goToSlide(index) {
        // Clamp index between 0 and last card
        if (index < 0) index = 0;
        if (index >= totalCards) index = totalCards - 1;

        currentIndex = index;

        var offset = currentIndex * getCardWidth();
        $track.css('transform', 'translateX(-' + offset + 'px)');

        // Update counter
        $('#slideCounter').text('Showing ' + (currentIndex + 1) + ' of ' + totalCards);

        // Enable / disable buttons
        $('#prevBtn').prop('disabled', currentIndex === 0);
        $('#nextBtn').prop('disabled', currentIndex === totalCards - 1);
    }

    // ── Button clicks (jQuery) ──
    $('#nextBtn').on('click', function () {
        goToSlide(currentIndex + 1);
    });

    $('#prevBtn').on('click', function () {
        goToSlide(currentIndex - 1);
    });

    // ── Auto-play every 5 seconds ──
    function startAutoPlay() {
        autoPlayTimer = setInterval(function () {
            if (currentIndex >= totalCards - 1) {
                goToSlide(0);           // loop back to first
            } else {
                goToSlide(currentIndex + 1);
            }
        }, 5000);
    }

    // ── Pause on hover, resume on mouse leave ──
    $('.product-card').on('mouseenter', function () {
        clearInterval(autoPlayTimer);
    });

    $('.product-card').on('mouseleave', function () {
        startAutoPlay();
    });

    // ── Initialize ──
    goToSlide(0);
    startAutoPlay();
});
