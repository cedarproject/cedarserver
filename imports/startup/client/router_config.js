Router.configure({
    layoutTemplate: 'layout'
});

Router.plugin('ensureSignedIn');

AccountsTemplates.configure({
    defaultLayout: 'layout',
});

AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('verifyEmail');
AccountsTemplates.configureRoute('resendVerificationEmail');
