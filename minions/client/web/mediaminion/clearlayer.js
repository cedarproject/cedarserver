MediaMinionClearLayer = class MediaMinionClearLayer {
    constructor (action, minion) {
        this.action = action;
        this.minion = minion;
    }

    show (old) {
        old.hide();
        old.remove();
    }
    
    hide () {}

    remove () {}
}
