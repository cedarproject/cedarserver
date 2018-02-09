import { Cedar, MongoConn } from '/imports/lib/connection';
import { Mongo } from 'meteor/mongo';
import { FilesCollection } from 'meteor/ostrio:files';
import { Roles } from 'meteor/alanning:roles';

let Media = new Mongo.Collection('media', MongoConn);
let Playlists = new Mongo.Collection('media.playlists', MongoConn);

let MediaFiles = new FilesCollection({
    collectionName: 'media.files',
    allowClientCode: false,
    onBeforeUpload(file) {
        if (Roles.userIsInRole(Meteor.userId(), 'editor')) return true;
        else return mf('media_upload_only_editors', 'Only users with the Editor permission may upload files');
    }
});

export { Media, Playlists, MediaFiles };
