'use strict';
(function () {
  describe('models/Router', function () {
    var stub = null;
    var router = new QME.Models.Router();

    beforeEach(function() {
      stub = sinon.stub(Backbone.History.prototype, 'navigate', function(fragment) {
        this.loadUrl(fragment);
      });
    });

    afterEach(function() {
      stub.restore();
      stub = null;
    });

    it('should route empty string to route:district', function() {
      var spy = sinon.spy();
      router.on('route:district', spy);
      router.navigate('', { trigger: true });
      expect(spy.calledWith()).to.be.ok;
    });

    it('should route district/123 to route:district', function() {
      var spy = sinon.spy();
      router.on('route:district', spy);
      router.navigate('/district/123', { trigger: true });
      expect(spy.calledWith('123')).to.be.ok;
    });
  });
})();
