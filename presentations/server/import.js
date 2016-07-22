import_presentation = function (fileInfo, formData) {
    var name_parts = fileInfo.name.split('.')
    if (name_parts.length == 1) var name = fileInfo.name;
    else var name = name_parts.slice(0, -1).join('.');
    
    var presid = Meteor.call('presentationNewImported', name);
    
    var prefix = settings.findOne({key: 'mediadir'}).value;
    var orig_file_path = prefix + '/' + fileInfo.name;
    
    var pres_dir_path = prefix + '/presentations/' + presid
    
    var fs = Npm.require('fs');
    
    fs.mkdir(prefix + '/presentations', Meteor.bindEnvironment((err) => {
        fs.mkdir(pres_dir_path, Meteor.bindEnvironment((err) => {
            var child_process = Npm.require('child_process');
            
            child_process.exec(
                `soffice --headless --convert-to pdf --outdir "${pres_dir_path}" "${orig_file_path}"`,
                {},
                Meteor.bindEnvironment((error, stdout, stderr) => {
                    if (error !== null) {
                        console.log(`Error importing ${fileInfo.name}:`, error);
                        Meteor.call('presentationImportStatus', presid, 'error');
                        return;
                    }

                    fs.unlink(orig_file_path, () => {});
                    
                    Meteor.call('presentationImportStatus', presid, 'processing_2');

                    gm(pres_dir_path + '/' + name + '.pdf').out('+adjoin').write(
                        pres_dir_path + '/' + name + '-%d.png',
                        Meteor.bindEnvironment((err) => {
                            if (err) {
                                Meteor.call('presentationImportStatus', presid, 'error');
                                return;
                            }
                            
                            fs.unlink(pres_dir_path + '/' + name + '.pdf', Meteor.bindEnvironment((e) => {
                                if (e) console.log(e);
                                
                                fs.readdirSync(pres_dir_path).forEach((filename) => {
                                    // 2016 Ugly One-Liner of the Year entry. (Possibly also a "Should've Used a Regex?" entry too.)
                                    var order = parseInt(filename.split('.').slice(0, -1).pop().split('-').pop());
                                    Meteor.call('presentationAddImportedSlide', 
                                        presid,
                                        'presentations/' + presid + '/' + filename,
                                        order
                                    );
                                });
                                
                                Meteor.call('presentationImportStatus', presid, 'ready');
                            }));
                        })
                    );
                })
            );
        }))
    }));
}
