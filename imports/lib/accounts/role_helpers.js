function is_viewer (context) {
    if (context.connection === null) return true; // Caller is server
    if (!Roles.userIsInRole(context.userId, ['viewer'])) {
        if ('ready' in context) context.ready();
        else throw new Meteor.Error('not-authorized', 'User must have the Viewer role to perform this action');
    }
    return true;
}

function is_editor (context) {
    if (context.connection === null) return true; // Caller is server
    if (!Roles.userIsInRole(context.userId, ['editor'])) {
        if ('ready' in context) context.ready();
        else throw new Meteor.Error('not-authorized', 'User must have the Editor role to perform this action');
    }
    return true;
}

function is_controller (context) {
    if (context.connection === null) return true; // Caller is server
    if (!Roles.userIsInRole(context.userId, ['controller'])) {
        if ('ready' in context) context.ready();
        else throw new Meteor.Error('not-authorized', 'User must have the Controller role to perform this action');
    }
    return true;
}

function is_admin (context) {
    if (context.connection === null) return true; // Caller is server
    if (!Roles.userIsInRole(context.userId, ['admin'])) {
        if ('ready' in context) context.ready();
        else throw new Meteor.Error('not-authorized', 'User must have the Admin role to perform this action');
    }
    return true;
}

export { is_viewer, is_editor, is_controller, is_admin };2
