$(function() {
    'use strict';
    var
        Initiator,
        Presenter,
        Data;

    Data = Backbone.Model.extend({
        url: '/getimages',
        connected: false,
        dataChunk: {},
        data: {},
        fetch: function() {
            var
                source = new EventSource(this.url + '?' + this.get('website')),
                self = this;

            this.source = source;

            source.addEventListener('message', function(e) {

                self.parse(e.data);
            }, false);

            source.addEventListener('open', function() {

                console.log('connection opened');
                self.set('connected', true);
            }, false);

            source.addEventListener('error', function(e) {

                source.close();
                self.set('connected', false);
                if (e.eventPhase === EventSource.CLOSED) {

                    console.log('connection closed');
                }
            }, false);
        },
        parse: function(sdata) {
            var
                data;

            data = JSON.parse(sdata);

            this.set('data', data);
        }
    });

    Presenter = Backbone.View.extend({
        el: $('#images'),
        update: function(data) {
            var
                len = data.length;

            for (; len--;) {
                $(this.el).append('<img src="' + data[len] + '" />');
            }
        },
        reset: function() {
            $(this.el).html('');
        }
    });

    Initiator = Backbone.View.extend({
        el: $('#initiator'),
        events: {
            'submit form#getimages': 'startCrawler'
        },
        initialize: function() {
        	this.presenter = new Presenter();
        },
        startCrawler: function(e) {
        	var
        		self = this;

        	this.$input = this.$el.find('#website');

            this.model.set('website', $(e.target).serialize());
            this.model.fetch();
            this.model.on('change:connected', function(d) {
            	if ( d.changed.connected ) {

            		self.disable();
            		self.presenter.reset();
            	} else {

            		self.enable();
            	}
            });
            this.model.on('change:data', function(d) {
            	self.presenter.update(d.changed.data);
            });
            return false;
        },
        disable: function() {

            this.$input.attr('disabled', 'disabled');
        },
        enable: function() {

            this.$input.removeAttr('disabled');
        }
    });


    new Initiator({
        model: new Data()
    });
});