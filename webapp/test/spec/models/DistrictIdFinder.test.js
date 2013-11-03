'use strict';
(function () {
  describe('models/DistrictIdFinder', function() {
    var topic;

    beforeEach(function() {
      topic = new QME.Models.DistrictIdFinder({
        knownDistricts: {
          "1": [ "H1H1H1", "H1H1J", "H1H2", "H1J", "H2" ],
          "2": [ "X0X0X0", "X1X" ]
        },
        fusionTableId: 'abcdef',
        googleApiKey: 'APIKEY'
      });
    });

    describe('byPostalCode', function() {
      it('should find an exact match', function() {
        expect(topic.byPostalCode('H1H1H1')).to.equal('1');
      });

      it('should find a prefix match', function() {
        expect(topic.byPostalCode('H1H1J2')).to.equal('1');
        expect(topic.byPostalCode('H1H2K2')).to.equal('1');
        expect(topic.byPostalCode('H1J0J0')).to.equal('1');
        expect(topic.byPostalCode('H2K1K1')).to.equal('1');
      });

      it('should return null on non-match', function() {
        expect(topic.byPostalCode('H3H1Z1')).to.equal(null);
      });
    });

    describe('byPostalCodeAsync', function() {
      var google = null;
      var geocoder = null;

      beforeEach(function() {
        geocoder = {
          geocode: sinon.stub()
        };
        google = {
          maps: {
            Geocoder: sinon.stub().returns(geocoder),
            GeocoderStatus: {
              ZERO_RESULTS: '0',
              OK: '1'
            }
          }
        };
      });

      describe('when called before Google Maps is loaded', function() {
        beforeEach(function() { topic.byPostalCodeAsync('H3H1Z1'); });

        it('should not try to initialize geocoder', function() {
          expect(google.maps.Geocoder.called).to.be.falsy;
        });

        it('should start geocoding once geocoder is initialized', function() {
          topic.setGoogle(google);
          expect(google.maps.Geocoder.calledWithNew).to.be.ok;
        });
      });

      describe('when called after Google Maps is loaded', function() {
        var promise;

        beforeEach(function() {
          topic.setGoogle(google);
          promise = topic.byPostalCodeAsync('H3H1Z1');
        });

        it('should initialize the geocoder', function() {
          expect(google.maps.Geocoder.called).to.be.ok;
        });

        it('should request to geocode the given postal code', function() {
          expect(geocoder.geocode.called).to.be.ok;
          var arg = geocoder.geocode.firstCall.args[0];
          expect(arg).to.deep.equal({
            address: 'H3H1Z1',
            region: 'CA',
            componentRestrictions: { postalCode: 'H3H1Z1' }
          });
        });

        it('should reject with NotFound when not found', function() {
          var err;
          promise.fail(function(e) { err = e; });
          geocoder.geocode.firstCall.args[1]([], google.maps.GeocoderStatus.ZERO_RESULTS);
          expect(err).to.equal('NotFound');
        });

        describe('on success', function() {
          var fusionTablesDeferred;

          beforeEach(function() {
            fusionTablesDeferred = $.Deferred();
            sinon.stub($, 'ajax').returns(fusionTablesDeferred);
            geocoder.geocode.firstCall.args[1]([
              { geometry: { location: { lat: function() { return 1; }, lng: function() { return 2; } } } }
            ], google.maps.GeocoderStatus.OK);
          });

          afterEach(function() {
            $.ajax.restore();
          });

          it('should send a fusion tables request with the lat/lng', function() {
            expect($.ajax.called).to.be.ok;
            var arg = $.ajax.firstCall.args[0];
            expect(arg.url).to.equal('https://www.googleapis.com/fusiontables/v1/query')
            expect(arg.data.key).to.equal('APIKEY')
            expect(arg.data.sql).to.equal("SELECT id FROM abcdef WHERE ST_INTERSECTS(geometry,RECTANGLE(LATLNG(1,2),LATLNG(1,2)))")
          });

          it('should resolve to a 5-digit (last five digits of Census Subdivision UID) ID when found', function() {
            var stub = sinon.stub();
            promise.done(stub);
            $.ajax.firstCall.args[0].success(
              {"kind": "fusiontables#sqlresponse","columns": ["id"],"rows":[["2491902"]]}
            );
            expect(stub.called).to.be.ok;
            expect(stub.firstCall.args[0]).to.equal('91902');
          });

          it('should resolve to a 3-digit (Montreal district) ID when found', function() {
            var stub = sinon.stub();
            promise.done(stub);
            $.ajax.firstCall.args[0].success(
              {"kind": "fusiontables#sqlresponse","columns": ["id"],"rows":[["102"]]}
            );
            expect(stub.called).to.be.ok;
            expect(stub.firstCall.args[0]).to.equal('102');
          });

          it('should resolve to null when no ID found', function() {
            var stub = sinon.stub();
            promise.done(stub);
            $.ajax.firstCall.args[0].success(
              {"kind": "fusiontables#sqlresponse","columns":["id"]}
            );
            expect(stub.called).to.be.ok;
            expect(stub.firstCall.args[0]).to.equal(null);
          });

          it('should reject with FusionError on failure', function() {
            var stub = sinon.stub();
            promise.fail(stub);
            $.ajax.firstCall.args[0].error();
            expect(stub.called).to.be.ok;
            expect(stub.firstCall.args[0]).to.equal('FusionError');
          });
        });
      });
    });
  });
})();
