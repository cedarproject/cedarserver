import { _ } from 'meteor/underscore';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { Cedar } from '/imports/lib/connection';
import { Media, Playlists, MediaFiles } from '../collections.js';

import './media_upload_modal.html';


// Most of this stolen from meteor-file's multi-file demo.
Template.media_upload_modal.onCreated(function () {
    const self          = this;
    
    this.upload_id      = new Mongo.ObjectID().toHexString();
    this.uploads        = new ReactiveVar(false);
    this.error          = new ReactiveVar(false);
    this.paused         = new ReactiveVar(false);
    
    this.reset = () => {
        this.upload_id = new Mongo.ObjectID().toHexString();
        this.uploads.set(false);
        this.error.set(false);
        this.paused.set(false);
    }
    
    this.initiateUpload = (event, files) => {
        if (self.uploads.get()) {
            return false;
        }

        if (!files.length) {
            this.error.set('Please select a file to upload');
            return false;
        }

        const uploads = [];

        _.each(files, (file, i) => {
            MediaFiles.insert({
                file: file,
                meta: {
                    upload_id: this.upload_id
                },
                streams: 'dynamic',
                chunkSize: 'dynamic',
                transport: 'http'
            }, false).on('error', function (error) {
                console.error(error);
                // What the heck is that terenary even doing??? I'm kinda scared to change it.
                self.error.set((self.error.get() ? self.error.get() + '<br />' : '') + this.file.name + ': ' + ((error != null ? error.reason : void 0) || error));
                Meteor.setTimeout( () => {
                    self.error.set(false);
                }, 15000);
            }).on('start', function () {
                uploads.push(this);
                self.uploads.set(uploads);
                Cedar.subscribe('media.upload', self.upload_id);
            }).on('uploaded', function (error, file) {
                // Set ID reference so getMedia helper can find Media entry
                this._id = file._id;
            }).start();
        });
        
        return true;
    };
});

Template.media_upload_modal.helpers({
    error() {
        return Template.instance().error.get();
    },
  
    uploads() {
        return Template.instance().uploads.get();
    },
    
    uploaded() {
        return Media.find({_upload_id: Template.instance().upload_id});
    },
    
    paused() {
        return Template.instance().paused.get();
    },
    
    getProgress() {
        return this.progress.get() + '%';
    },
    
    completed() {
        console.log(this.state.get());
        return this.state.get() == 'completed';
    },
    
    getMedia() {
        return Media.findOne({file: this._id});
    },
    
    getTimeRemaining() {
        const second = 1000;
        const minute = 60 * second;
        const hour = 60 * minute;
        
        const remaining = this.estimateTime.get();
        
        if (remaining > hour) {
            let hours = Math.floor(remaining / hour);
            let remainder = remaining % hour;
            return hours + '.' + remainder.toString().slice(0, 1) + ' ' + mf('hours_remaining', 'hours remaining');
        } else if (remaining > minute) {
            let minutes = Math.floor(remaining / minute);
            let remainder = remaining % minute;
            return minutes + '.' + remainder.toString().slice(0, 1) + ' ' + mf('minutes_remaining', 'minutes remaining');
        } else {
            let seconds = Math.round(remaining / second);
            return seconds + ' ' + mf('seconds_remaining', 'seconds remaining');
        }
    },
    
    isUploading() {
        let uploads = Template.instance().uploads.get();
        if (uploads) {
            return _.some(uploads, (u) => {return u.state.get() != 'completed'});
        } else {
            return false;
        }
    }
});


Template.media_upload_modal.events({
    'change #file-input'(event, template) {
        if (event.currentTarget.files) {
            template.initiateUpload(event, event.currentTarget.files);
        }
    },
    
    'click #pause-upload'(event, template) {
        _.each(template.uploads.get(), (u) => {
            u.pause();
        });
        
        template.paused.set(true);
    },
    
    'click #resume-upload'(event, template) {
        _.each(template.uploads.get(), (u) => {
            u.continue();
        });

        template.paused.set(false);
    },
    
    'click #abort-upload'(event, template) {
        _.each(template.uploads.get(), (u) => {
            u.abort();
        });
        
        template.reset();
    },
    
    'hide.bs.modal #media-upload-modal'(event, template) {
        let uploads = template.uploads.get();
        if (uploads && _.some(uploads, (u) => {return u.state.get() != 'completed'})) {
            event.preventDefault();
        }
    },
    
    'hidden.bs.modal #media-upload-modal'(event, template) {
        template.reset();
    }
});
