'use strict';
(function () {
  describe('views/PostalCode', function() {
    var state, topic;

    describe('Starting with no error', function() {
      beforeEach(function() {
        state = new Backbone.Model({
          info: null,
          error: null
        });
        topic = new QME.Views.PostalCode({ state: state });
        topic.render();
      });

      it('should present an input box with a placeholder', function() {
        expect(topic.$('input[placeholder]').length).to.be.ok;
      });

      it('should present a button for searching', function() {
        var $button = topic.$('button');
        var spy = sinon.spy();
        expect($button.length).to.be.ok;
        topic.on('search', spy);
        $button.click();
        expect(spy.calledWith('')).to.be.ok;
      });

      it('should send postal code when searching', function() {
        topic.$('input').val('foo');
        var spy = sinon.spy();
        topic.on('search', spy);
        topic.$('button').click();
        expect(spy.calledWith('foo')).to.be.ok;
      });

      it('should show Invalid error', function() {
        state.set({ error: 'Invalid' });
        expect(topic.$('.error')).not.to.have.class('no-error');
        expect(topic.$('.error').text()).to.match(/H1H 1H1/);
      });

      it('should show NotFound error', function() {
        state.set({ error: 'NotFound' });
        expect(topic.$('.error')).not.to.have.class('no-error');
        expect(topic.$('.error').text()).to.match(/not/i);
      });

      it('should show Searching info', function() {
        state.set({ info: 'Searching' });
        expect(topic.$('.info')).not.to.have.class('no-info');
        expect(topic.$('.info').text()).to.match(/earching/);
      });
    });

    describe('Starting with an error', function() {
      beforeEach(function() {
        state = new Backbone.Model({
          info: null,
          error: 'Invalid'
        });
        topic = new QME.Views.PostalCode({ state: state });
        topic.render();
      });

      it('should render an error', function() {
        expect(topic.$('.error')).not.to.have.class('no-error');
        expect(topic.$('.error').text()).to.match(/H1H 1H1/);
      });

      it('should hide error', function() {
        state.set({ error: null });
        expect(topic.$('.error').text()).to.equal('');
        expect(topic.$('.error')).to.have.class('no-error');
      });
    });

    describe('Starting with info', function() {
      beforeEach(function() {
        state = new Backbone.Model({ info: 'Searching', error: null });
        topic = new QME.Views.PostalCode({ state: state });
        topic.render();
      });

      it('should render info', function() {
        expect(topic.$('.info')).not.to.have.class('no-info');
        expect(topic.$('.info').text()).to.match(/earching/);
      });

      it('should hide the info', function() {
        state.set({ info: null });
        expect(topic.$('.info')).to.have.class('no-info');
        expect(topic.$('.info').text()).to.equal('');
      });
    });
  });
})();
