import { MongoConn } from '/imports/lib/connection';
import { Mongo } from 'meteor/mongo';

Actions = new Mongo.Collection('actions', MongoConn);
export default Actions;
