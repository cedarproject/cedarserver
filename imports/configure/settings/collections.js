import { MongoConn } from '/imports/lib/connection';
import { Mongo } from 'meteor/mongo';

let Settings = new Mongo.Collection('settings', MongoConn);
export { Settings };
