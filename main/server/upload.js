function handle_upload (fileInfo, formFields) {
    if (formFields.type == 'importsong') import_song(fileInfo, formFields);
    else if (formFields.type == 'importpresentation') import_presentation(fileInfo, formFields);
    else if (formFields.type == 'uploadmedia') process_media(fileInfo, formFields);
    else throw new Meteor.Error('upload-failed', 'What was I supposed to do with that?');
}

Meteor.startup(function () {
    var dir = settings.findOne({key: 'mediadir'}).value;
    UploadServer.init({
        uploadDir: dir,
        tmpDir: dir + '/tmp',
        checkCreateDirectories: true,
        finished: handle_upload
    })
});
