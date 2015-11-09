MediaMinionClearLayer = class MediaMinionClearLayer {
    constructor (action, minion) {
        this.action = action;
        this.minion = minion;
    }

    show (old) {
        if (old) {
            old.hide();
            old.remove();
        }
    }
    
    hide () {}

    remove () {}
}
