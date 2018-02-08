import { MongoConn } from '/imports/lib/connection';
import { Mongo } from 'meteor/mongo';

let Media = new Mongo.Collection('media', MongoConn);
let Playlists = new Mongo.Collection('media.playlists', MongoConn);

export { Media, Playlists };
