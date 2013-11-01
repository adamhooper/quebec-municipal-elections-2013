'use strict';
(function () {
  describe('views/PostalCode', function() {
    var state, topic;

    describe('Starting with no error', function() {
      beforeEach(function() {
        state = new Backbone.Model({
          postalCode: null,
          postalCodeInput: '',
          postalCodeError: null
        });
        topic = new QME.Views.PostalCode({ state: state });
        topic.render();
      });

      it('should present an input box with a placeholder', function() {
        expect(topic.$el.find('input[placeholder]').length).to.be.ok;
      });

      it('should present a button for searching', function() {
        var $button = topic.$el.find('button');
        var spy = sinon.spy();
        expect($button.length).to.be.ok;
        topic.on('search', spy);
        $button.click();
        expect(spy.calledWith('')).to.be.ok;
      });

      it('should send postal code when searching', function() {
        topic.$el.find('input').val('foo');
        var spy = sinon.spy();
        topic.on('search', spy);
        topic.$el.find('button').click();
        expect(spy.calledWith('foo')).to.be.ok;
      });

      it('should show Invalid error', function() {
        state.set({ postalCodeError: 'Invalid' });
        expect(topic.$el.find('.error')).not.to.have.class('no-error');
        expect(topic.$el.find('.error').text()).to.match(/H1H 1H1/);
      });

      it('should show NotFound error', function() {
        state.set({ postalCodeError: 'NotFound' });
        expect(topic.$el.find('.error')).not.to.have.class('no-error');
        expect(topic.$el.find('.error').text()).to.match(/not/i);
      });
    });

    describe('Starting with an error', function() {
      beforeEach(function() {
        state = new Backbone.Model({
          postalCode: null,
          postalCodeInput: 'H2B',
          postalCodeError: 'Invalid'
        });
        topic = new QME.Views.PostalCode({ state: state });
        topic.render();
      });

      it('should render the input', function() {
        expect(topic.$el.find('input').val()).to.equal('H2B');
      });

      it('should render an error', function() {
        expect(topic.$el.find('.error')).not.to.have.class('no-error');
        expect(topic.$el.find('.error').text()).to.match(/H1H 1H1/);
      });

      it('should hide error', function() {
        state.set({ postalCodeError: null });
        expect(topic.$el.find('.error').text()).to.equal('');
        expect(topic.$el.find('.error')).to.have.class('no-error');
      });
    });
  });
})();
