'use strict';
(function () {
  describe('models/DistrictIdFinder', function() {
    var topic;

    beforeEach(function() {
      topic = new QME.Models.DistrictIdFinder({
        "1": [ "H1H1H1", "H1H1J", "H1H2", "H1J", "H2" ],
        "2": [ "X0X0X0", "X1X" ]
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
  });
})();
