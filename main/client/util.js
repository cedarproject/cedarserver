scrollTo = function (element) {
    $('html, body').animate({
        scrollTop: $(element).offset().top - window.innerHeight * 0.3
    }, 200);
};
