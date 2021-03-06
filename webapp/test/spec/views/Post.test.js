'use strict';
(function () {
  describe('views/Post', function() {
    var post, candidatesJson, topic;

    beforeEach(function() {
      post = new Backbone.Model({
        id: 'p1',
        type: 'CV',
        boroughId: 'b1',
        districtId: 'd1',
        name: 'District blah',
        nVoters: 1000,
        nVotes: 800,
        nBallotsRejected: 10,
        nStations: 10,
        nStationsReported: 9
      });

      candidatesJson = [
        { id: 'c1', party: { id: 'pa1', name: 'Party 1' }, name: 'Candidate 1', nVotes: 500 },
        { id: 'c2', party: { id: 'pa2', name: 'Party 2' }, name: 'Candidate 2', nVotes: 200 },
        { id: 'c3', party: { id: null, name: null }, name: 'Candidate 1', nVotes: 75 }
      ];

      topic = new QME.Views.Post({ model: post, candidatesJson: candidatesJson });
      topic.render();
    });

    it('should set its post ID', function() {
      expect(topic.$el.attr('data-post-id')).to.equal('p1');
    });

    it('should render the post type', function() {
      expect(topic.$el.find('h3.post-type').text()).to.match(/City Councillor/);
    });

    it('should render the candidates', function() {
      var $ul = topic.$el.find('ul');
      expect($ul.children().length).to.equal(3);
      expect($ul.children(':eq(0)').attr('data-candidate-id')).to.equal('c1');

      var $li = $ul.find('li[data-candidate-id=c1]');
      expect($li.find('h4.candidate-name').text()).to.equal('Candidate 1')
      expect($li.find('.party').attr('data-party-id')).to.equal('pa1')
      expect($li.find('.party').text()).to.equal('Party 1')
    });

    it('should render nVotes as percent and amount', function() {
      var $li = topic.$el.find('li[data-candidate-id=c3]');
      var $nVotes = $li.find('.num-votes');
      expect($nVotes.find('.bar').attr('style')).to.equal('width:9.4%;');
      expect($nVotes.find('.text').text()).to.equal('9.4%');
      expect($nVotes.find('abbr').attr('title')).to.equal('75 votes');
    });

    it('should render district name', function() {
      expect(topic.$('.post-name').text()).to.equal('(District blah)');
    });

    it('should render the winner', function() {
      expect(topic.$('.winner').text()).to.match(/Candidate 1/);
    });

    it('should not render a winner when two candidates have the same number of votes', function() {
      candidatesJson[0].nVotes = 75;
      candidatesJson[1].nVotes = 75;
      candidatesJson[2].nVotes = 75;
      topic = new QME.Views.Post({ model: post, candidatesJson: candidatesJson });
      topic.render();
      expect(topic.$el.hasClass('undecided')).to.be.ok;
      expect(topic.$('.no-winner').length).to.be.ok;
    });

    it('should not render a ul when there is a winner by acclamation', function() {
      topic = new QME.Views.Post({ model: post, candidatesJson: candidatesJson.slice(0, 1) });
      topic.render();
      expect(topic.$('ul').length).to.equal(0);
    });
  });
})();
