'use strict';
(function () {
  describe('views/District', function() {
    var topic;

    beforeEach(function() {
      topic = new QME.Views.District();
      topic.render();
    });

    it('should have no district ID', function() {
      expect(topic.$el.attr('data-district-id')).to.be.falsy;
    });

    it('should have no content', function() {
      expect(topic.$el.html()).to.equal('');
    });

    describe('when setting data', function() {
      beforeEach(function() {
        topic.setDistrictAndPosts(
          new Backbone.Model({
            id: 'd1',
            name: 'District 1'
          }),
          [
            { post: new Backbone.Model({ id: 1, type: 'CV' }), candidatesJson: [] },
            { post: new Backbone.Model({ id: 2, type: 'CV' }), candidatesJson: [] },
          ]
        );
      });

      it('should render the district ID', function() {
        expect(topic.$el.attr('data-district-id')).to.equal('d1');
      });

      it('should render the district name', function() {
        expect(topic.$('h2.district-name').text()).to.equal('District 1');
      });

      it('should render each post', function() {
        expect(topic.$('li.post').length).to.equal(2);
      });
    });
  });
})();
