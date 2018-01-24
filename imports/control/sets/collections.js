import { MongoConn } from '/imports/lib/connection';
import { Mongo } from 'meteor/mongo';

let Sets = new Mongo.Collection('sets', MongoConn);
export default Sets;
