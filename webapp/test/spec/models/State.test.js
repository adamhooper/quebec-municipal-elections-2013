'use strict';
(function () {
  describe('models/State', function() {
    var router, state, districtIdFinder;

    beforeEach(function() {
      router = new Backbone.Model();
      districtIdFinder = { byPostalCode: sinon.stub() };
      state = new QME.Models.State({}, { router: router, districtIdFinder: districtIdFinder });
    });

    it('should start at home with good defaults', function() {
      expect(state.get('page')).to.equal('home');
      expect(state.get('postalCode')).to.equal(null);
      expect(state.get('postalCodeInput')).to.equal('');
      expect(state.get('postalCodeError')).to.equal(null);
    });

    it('should set postalCodeError=Invalid when invalid', function() {
      router.trigger('route:postalCode', 'H321E1');
      expect(state.get('page')).to.equal('home');
      expect(state.get('postalCode')).to.equal(null);
      expect(state.get('postalCodeInput')).to.equal('H321E1');
      expect(state.get('postalCodeError')).to.equal('Invalid');
    });

    it('should set postalCodeError=NotFound when not found', function() {
      districtIdFinder.byPostalCode.returns(null);
      router.trigger('route:postalCode', 'H1H1H1');
      expect(state.get('page')).to.equal('home');
      expect(state.get('postalCode')).to.equal(null);
      expect(state.get('postalCodeInput')).to.equal('H1H1H1');
      expect(state.get('postalCodeError')).to.equal('NotFound');
    });

    it('should set districtId=something when found', function() {
      districtIdFinder.byPostalCode.returns('13');
      router.trigger('route:postalCode', 'H1H1H1');
      expect(state.get('page')).to.equal('district');
      expect(state.get('districtId')).to.equal('13');
      expect(state.get('postalCode')).to.equal('H1H1H1');
      expect(state.get('postalCodeInput')).to.equal('H1H1H1');
      expect(state.get('postalCodeError')).to.equal(null);
    });

    it('should not have an error on empty input', function() {
      router.trigger('route:postalCode', ' ');
      expect(state.get('page')).to.equal('home');
      expect(state.get('postalCode')).to.equal(null);
      expect(state.get('postalCodeInput')).to.equal(' ');
      expect(state.get('postalCodeError')).to.equal(null);
    });

    it('should allow spaces in postal codes', function() {
      districtIdFinder.byPostalCode.returns('1');
      router.trigger('route:postalCode', 'H1H 1H1');
      expect(state.get('postalCode')).to.equal('H1H1H1');
      expect(state.get('postalCodeInput')).to.equal('H1H 1H1');
    });
  });
})();