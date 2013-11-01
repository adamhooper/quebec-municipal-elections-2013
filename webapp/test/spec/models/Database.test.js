'use strict';
(function () {
  describe('models/Database', function() {
    var topic;

    var parties = [
      { id: 'pa1', name: 'Party 1' },
      { id: 'pa2', name: 'Party 2' },
      { id: 'pa3', name: 'Party 3' }
    ];

    var boroughs = [
      { id: 'b1', name: 'Borough 1' },
      { id: 'b2', name: 'Borough 2' },
      { id: 'b3', name: 'Borough 3' }
    ];

    var districts = [
      { id: 'd1', name: 'District 1', boroughId: 'b1' },
      { id: 'd2', name: 'District 2', boroughId: 'b2' },
      { id: 'd3', name: 'District 3', boroughId: 'b3' }
    ];

    var posts = [
      {
        id: 'p1',
        name: 'Post 1',
        boroughId: 'b1',
        districtId: 'd1',
        nVoters: 1000,
        nVotes: 800,
        nBallotsRejected: 10,
        nStations: 10,
        nStationsReported: 9
      },
      {
        id: 'p2',
        name: 'Post 2',
        boroughId: 'b2',
        districtId: 'd2',
        nVoters: 2000,
        nVotes: 1600,
        nBallotsRejected: 20,
        nStations: 20,
        nStationsReported: 18
      },
      {
        id: 'p3',
        name: 'Post 3',
        boroughId: 'b3',
        districtId: 'd3',
        nVoters: 3000,
        nVotes: 2400,
        nBallotsRejected: 30,
        nStations: 30,
        nStationsReported: 27
      },
      {
        id: 'pm1',
        name: 'Borough Mayor',
        boroughId: 'b1',
        districtId: null,
        nVoters: 6000,
        nVotes: 5400,
        nBallotsRejected: 60,
        nStations: 60,
        nstationsReported: 54
      },
      {
        id: 'pm2', 
        name: 'City Mayor',
        boroughId: null,
        districtId: null,
        nVoters: 60000,
        nVotes: 54000,
        nBallotsRejected: 600,
        nStations: 600,
        nStationsReported: 540
      }
    ];

    var candidates = [
      { id: 'c12', name: 'Candidate 1.2', partyId: 'pa2', postId: 'p1', nVotes: 200 },
      { id: 'c11', name: 'Candidate 1.1', partyId: 'pa1', postId: 'p1', nVotes: 500 },
      { id: 'c13', name: 'Candidate 1.3', partyId: null, postId: 'p1', nVotes: 100 },
      { id: 'c21', name: 'Candidate 2.1', partyId: 'pa1', postId: 'p2', nVotes: 1000 },
      { id: 'c22', name: 'Candidate 2.2', partyId: 'pa2', postId: 'p2', nVotes: 400 },
      { id: 'c23', name: 'Candidate 2.3', partyId: null, postId: 'p2', nVotes: 200 },
      { id: 'cm11', name: 'Borough Mayor Candidate 1', partyId: 'pa1', postId: 'pm1', nVotes: 3000 },
      { id: 'cm12', name: 'Borough Mayor Candidate 2', partyId: 'pa2', postId: 'pm1', nVotes: 1000 },
      { id: 'cm21', name: 'Mayor Candidate 1', partyId: 'pa1', postId: 'pm2', nVotes: 3000 },
      { id: 'cm22', name: 'Mayor Candidate 2', partyId: 'pa2', postId: 'pm2', nVotes: 1000 }
    ];

    beforeEach(function() {
      topic = new QME.Models.Database({
        parties: parties,
        posts: posts,
        boroughs: boroughs,
        districts: districts,
        candidates: candidates
      });
    });

    describe('postsForDistrictId', function() {
      it('should find no posts when there are none', function() {
        expect(topic.postsForDistrictId('-1').length).to.equal(0)
      });

      it('should find all district-level posts', function() {
        var result = topic.postsForDistrictId('d1');
        expect(_.find(result, function(post) { return post.id === 'p1'; })).to.be.ok;
      });

      it('should find all borough-level posts', function() {
        var result = topic.postsForDistrictId('d1');
        expect(_.find(result, function(post) { return post.id === 'pm1'; })).to.be.ok;
      });

      it('should find all city-level posts', function() {
        var result = topic.postsForDistrictId('d1');
        expect(_.find(result, function(post) { return post.id === 'pm2'; })).to.be.ok;
      });

      it('should order from local to city-wide', function() {
        var result = topic.postsForDistrictId('d1');
        expect(result[0].id).to.equal('p1');
        expect(result[1].id).to.equal('pm1');
        expect(result[2].id).to.equal('pm2');
      });
    });

    describe('candidatesJsonForPost', function() {
      it('should find no candidates for some posts', function() {
        var post = topic.posts.get('p3');
        expect(topic.postCandidatesJson(post).length).to.equal(0);
      });

      describe('with a result', function() {
        var post, result;

        beforeEach(function() {
          post = topic.posts.get('p1');
          result = topic.postCandidatesJson(post);
        });

        it('should fill the proper fields', function() {
          expect(result[0].id).to.be.ok;
          expect(result[0].party.id).to.be.defined;
          expect(result[0].party.name).to.be.defined;
          expect(result[0].name).to.be.ok;
          expect(result[0].nVotes).to.be.ok;
        });

        it('should find all the candidates', function() {
          expect(result.length).to.equal(3);
        });

        it('should order by nVotes', function() {
          expect(result[0].nVotes).to.be.at.least(result[1].nVotes)
          expect(result[2].nVotes).to.be.at.least(result[2].nVotes)
        });

        it('should show party data when present', function() {
          expect(result[0].party.id).to.equal('pa1')
          expect(result[0].party.name).to.equal('Party 1')
        });

        it('should show null for party data when not present', function() {
          expect(result[2].party.id).to.equal(null)
          expect(result[2].party.name).to.equal(null)
        });
      });
    });
  });
})();
