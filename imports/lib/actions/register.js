let ActionTypes = {};
ActionTypes.register = function (type) {
    this[type.type_id] = type;
}

export { ActionTypes };
