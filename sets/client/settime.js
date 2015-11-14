Template.setTime.onRendered(function () {
    this.$('.set-time').datetimepicker({defaultDate: moment(this.data), sideBySide: true});
});
