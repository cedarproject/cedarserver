scrollTo = function (element) {
    $('html, body').delay(50).animate({
        scrollTop: $(element).offset().top - window.innerHeight * 0.3
    }, 200);
};
