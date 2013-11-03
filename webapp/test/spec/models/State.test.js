'use strict';
(function () {
  describe('models/State', function() {
    var router, state, districtIdFinder;

    beforeEach(function() {
      router = new Backbone.Model();
      router.navigate = sinon.spy();
      districtIdFinder = { byPostalCode: sinon.stub(), byPostalCodeAsync: sinon.stub() };
      state = new QME.Models.State({}, { router: router, districtIdFinder: districtIdFinder });
    });

    it('should start at home with good defaults', function() {
      expect(state.get('districtId')).to.equal(null);
      expect(state.get('error')).to.equal(null);
    });

    describe('handlePostalCode', function() {
      it('should set error=Invalid when invalid', function() {
        state.handlePostalCode('H321E1');
        expect(state.get('districtId')).to.equal(null);
        expect(state.get('error')).to.equal('Invalid');
      });

      describe('when postal code is not found', function() {
        var promise;

        beforeEach(function() {
          promise = $.Deferred();
          districtIdFinder.byPostalCode.returns(null);
          districtIdFinder.byPostalCodeAsync.returns(promise);
          state.handlePostalCode('H1H1H1');
        });

        it('should set info=Searching', function() {
          expect(state.get('info')).to.equal('Searching');
        });

        it('should search asynchronously', function() {
          expect(districtIdFinder.byPostalCodeAsync.called).to.be.ok;
          expect(districtIdFinder.byPostalCodeAsync.firstCall.args[0]).to.equal('H1H1H1');
        });

        it('should set district ID on success', function() {
          promise.resolve('123');
          expect(state.get('districtId')).to.equal('123');
          expect(state.get('info')).to.equal(null);
          expect(state.get('error')).to.equal(null);
        });

        it('should navigate on success', function() {
          promise.resolve('123');
          expect(router.navigate.called).to.be.ok;
        });

        it('should set error=NotFound on null', function() {
          promise.resolve(null);
          expect(state.get('districtId')).to.equal(null);
          expect(state.get('info')).to.equal(null);
          expect(state.get('error')).to.equal('NotFound');
        });

        it('should set error=FusionError on error', function() {
          promise.reject('FusionError');
          expect(state.get('districtId')).to.equal(null);
          expect(state.get('info')).to.equal(null);
          expect(state.get('error')).to.equal('FusionError');
        });

        it('should not search when re-entering a found postal code', function() {
          promise.resolve('123');
          state.handlePostalCode('H1H1H1');
          expect(state.get('districtId')).to.equal('123');
          expect(state.get('info')).to.equal(null);
          expect(state.get('error')).to.equal(null);
        });

        it('should not handle success when search 2 races past search 1', function() {
          // promise is already set at this point; let's make something else race past it
          var promise2 = $.Deferred();
          districtIdFinder.byPostalCodeAsync.returns(promise2);
          state.handlePostalCode('H2H2H2'); // goes to promise2
          promise2.resolve('123');
          promise.resolve('456');

          expect(state.get('districtId')).to.equal('123');
        });

        it('should not handle error when search 2 races past search 1', function() {
          // promise is already set at this point; let's make something else race past it
          var promise2 = $.Deferred();
          districtIdFinder.byPostalCodeAsync.returns(promise2);
          state.handlePostalCode('H2H2H2'); // goes to promise2
          promise2.resolve('123');
          promise.reject('FusionError');

          expect(state.get('districtId')).to.equal('123');
          expect(state.get('error')).to.equal(null);
        });
      });

      it('should set districtId=something when found synchronously', function() {
        districtIdFinder.byPostalCode.returns('13');
        state.handlePostalCode('H1H1H1');
        expect(state.get('districtId')).to.equal('13');
        expect(state.get('error')).to.equal(null);
      });

      it('should not have an error on empty input', function() {
        router.trigger('route:postalCode', ' ');
        expect(state.get('districtId')).to.equal(null);
        expect(state.get('error')).to.equal(null);
      });

      it('should allow spaces in postal codes', function() {
        districtIdFinder.byPostalCode.returns('1');
        state.handlePostalCode('H1H 1H1');
        expect(state.get('districtId')).to.equal('1');
      });

      it('should call router.navigate synchronously', function() {
        districtIdFinder.byPostalCode.returns('1');
        state.handlePostalCode('H1H1H1');
        expect(router.navigate.called).to.be.ok;
      });

      it('should call router.navigate back to empty synchronously', function() {
        state.handlePostalCode('');
        expect(router.navigate.called).to.be.ok;
      });
    });

    describe('route:district handler', function() {
      it('should set district', function() {
        router.trigger('route:district', '1');
        expect(state.get('districtId')).to.equal('1');
        expect(state.get('error')).to.equal(null);
      });

      it('should call router.navigate upon successful setDistrictId', function() {
        state.setDistrictId('123');
        expect(router.navigate.called).to.be.ok;
      });

      it('should unset district', function() {
        state.setDistrictId(null);
        expect(state.get('error')).to.equal(null);
        expect(state.get('districtId')).to.equal(null);
      });
    });
  });
})();
