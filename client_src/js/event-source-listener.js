$(function() {
	'use strict';
	var
		Initiator,
		Presenter,
		presenter,
		Data,
		data;

	Data = Backbone.Model.extend({
		url: '/getimages',
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
	            presenter.reset();
			}, false);

			source.addEventListener('error', function(e) {

	          source.close();
			  if (e.eventPhase === EventSource.CLOSED) {

	            console.log('connection closed');
			  }
			}, false);
		},
		parse: function(sdata) {
			var
				data;

			data = JSON.parse(sdata);

			presenter.update(data);
		}
	});

	Initiator = Backbone.View.extend({
		el: $('#initiator'),
        events: {
            'submit form#getimages': 'startCrawler'
        },
        startCrawler: function(e) {
        	this.model.set('website', $(e.target).serialize());
        	this.model.fetch();
			return false;
        }
	});

	Presenter = Backbone.View.extend({
		el: $('#images'),
		update: function(data) {
			var
				len = data.length;

			for ( ;len--; ) {
				$(this.el).append('<img src="' + data[len] + '" />');
			}
		},
		reset: function() {
			$(this.el).html('');
		}
	});

	data = new Data();
	presenter = new Presenter();

	new Initiator({model: data});
});
