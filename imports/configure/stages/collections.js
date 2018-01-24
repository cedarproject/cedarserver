import { MongoConn } from '/imports/lib/connection';
import { Mongo } from 'meteor/mongo';

let Stages = new Mongo.Collection('stages', MongoConn);
export { Stages };
