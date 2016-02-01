// Misc global utilities. It's terrible practice to have a 'misc' file, but I'm doing it anyway. 

scrollTo = function (element) {
    $('html, body').delay(50).animate({
        scrollTop: $(element).offset().top - window.innerHeight * 0.3
    }, 200);
};

secondsToTimeString = function (t) {    
    if (t < 0) {
        var sign = '-';
        t = Math.abs(t);
    } else {
        var sign = '';
    }
    
    // And the award for 'worst abuse of template strings' goes to...
    var hours = `0${Math.floor(t / 3600)}`.slice(-2);
    var minutes = `0${Math.floor((t - hours * 3600) / 60)}`.slice(-2);
    var seconds = `0${Math.floor(t % 60)}`.slice(-2);
    
    return `${sign}${hours}:${minutes}:${seconds}`;
};
