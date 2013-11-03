'use strict';
(function() {
  describe('models/DistrictLoader', function() {
    var boroughs, districts, posts, candidates, topic;

    beforeEach(function() {
      boroughs = new Backbone.Collection();
      districts = new Backbone.Collection();
      posts = new Backbone.Collection();
      candidates = new Backbone.Collection();
      topic = new QME.Models.DistrictLoader({
        boroughs: boroughs,
        districts: districts,
        posts: posts,
        candidates: candidates,
        urlPrefix: 'https://example.com'
      });

      sinon.stub($, 'ajax');
    });

    afterEach(function() {
      $.ajax.restore();
    });

    it('should send an AJAX request when a new district comes up', function() {
      topic.maybeLoadDistrictById('24123');
      expect($.ajax.called).to.be.ok;
    });

    it('should not send two AJAX requests for the same district', function() {
      topic.maybeLoadDistrictById('24123');
      topic.maybeLoadDistrictById('24124');
      topic.maybeLoadDistrictById('24123');
      expect($.ajax.calledTwice).to.be.ok;
    });

    it('should send to the URL prefix', function() {
      topic.maybeLoadDistrictById('24123');
      expect($.ajax.getCall(0).args[0].url).to.equal('https://example.com/24123.json');
    });

    describe('with a successful result', function() {
      beforeEach(function() {
        $.ajax.restore();
        sinon.stub($, 'ajax').yieldsTo('success',
          /* http://donnees.electionsmunicipales.gouv.qc.ca/43027.json */
          { "ville":{"nom": "Sherbrooke","region": "Estrie","nb_electeur": "0","arrondissements": [{"id": "REB01","nom": "Brompton"},{"id": "REB02","nom": "Fleurimont"},{"id": "REB03","nom": "Lennoxville"},{"id": "REB04","nom": "Le Mont-Bellevue"},{"id": "REB05","nom": "Rock Forest--Saint-Élie--Deauville"},{"id": "REB06","nom": "Jacques-Cartier"}],"postes": [{"id": "194886","no": "0","nom": "","id_arrondissement": "","nb_votes_rejet": "0","type_poste": "M","candidats":[{"id": "12725","nom": "Patterson","prenom": "Roy","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "12708","nom": "Pellerin","prenom": "Denis","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "1529","nom": "Richard","prenom": "Hubert","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "8476","nom": "Sévigny","prenom": "Bernard","sexe": "m","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"}]},{"id": "194887","no": "1.0","nom": "de Brompton","id_arrondissement": "REB01","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "3001","nom": "Bergeron","prenom": "Nicole","sexe": "f","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"},{"id": "6605","nom": "Bourgault","prenom": "Denise","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "1929","nom": "Fortin","prenom": "Sébastien","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "11794","nom": "Lemay","prenom": "Mélanie","sexe": "f","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"}]},{"id": "194888","no": "1.1","nom": "de Beauvoir","id_arrondissement": "REB01","nb_votes_rejet": "0","type_poste": "CA","candidats":[{"id": "10890","nom": "Côté","prenom": "Sandra","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "2667","nom": "Dionne","prenom": "Benoît","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"},{"id": "12754","nom": "Ouellet-Turmel","prenom": "Alexandre","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "840","nom": "Parenteau","prenom": "Germain","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194889","no": "1.2","nom": "des Moulins","id_arrondissement": "REB01","nb_votes_rejet": "0","type_poste": "CA","candidats":[{"id": "10078","nom": "Courchesne","prenom": "Alain-Antoine","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "1526","nom": "Gélinas","prenom": "Kathleen","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "692","nom": "Lebel","prenom": "François","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194890","no": "2.1","nom": "du Pin-Solitaire","id_arrondissement": "REB02","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "4579","nom": "Dauphinais","prenom": "Hélène","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "2666","nom": "Fugère","prenom": "Mariette","sexe": "f","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "11771","nom": "Ouellette","prenom": "Mélodie","sexe": "f","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"}]},{"id": "194891","no": "2.2","nom": "des Quatre-Saisons","id_arrondissement": "REB02","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "4814","nom": "Boutin","prenom": "Vincent","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "5733","nom": "Dunn","prenom": "Cynthia","sexe": "f","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "247","nom": "Langlois","prenom": "Martin","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194892","no": "2.3","nom": "de Desranleau","id_arrondissement": "REB02","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "4669","nom": "Berthold","prenom": "Danielle","sexe": "f","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "1898","nom": "Cyr","prenom": "Pascal","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "251","nom": "Demers","prenom": "Jean Guy","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194893","no": "2.4","nom": "de Lavigerie","id_arrondissement": "REB02","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "4487","nom": "Brochu","prenom": "Louisda","sexe": "m","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "12691","nom": "Côté","prenom": "Sylvain","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194894","no": "2.5","nom": "de Marie-Rivier","id_arrondissement": "REB02","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "1903","nom": "Demers","prenom": "Rémi","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"},{"id": "5003","nom": "Martel","prenom": "Guy","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "2671","nom": "Quirion","prenom": "Michel « Mi Qui »","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"}]},{"id": "194895","no": "3.0","nom": "de Lennoxville","id_arrondissement": "REB03","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "3903","nom": "Balasi","prenom": "Nicolas","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "3719","nom": "Dorval","prenom": "Jean-Guy","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "261","nom": "Price","prenom": "David W","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194896","no": "3.1","nom": "d'Uplands","id_arrondissement": "REB03","nb_votes_rejet": "0","type_poste": "CA","candidats":[{"id": "138","nom": "Boulanger","prenom": "Linda","sexe": "f","sortant": "0","parti": "","etat": "ESO","nb_vote": "0"}]},{"id": "194897","no": "3.2","nom": "de Fairview","id_arrondissement": "REB03","nb_votes_rejet": "0","type_poste": "CA","candidats":[{"id": "1525","nom": "Charron","prenom": "Claude","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "10836","nom": "Côté","prenom": "Steve A.","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"}]},{"id": "194898","no": "4.1","nom": "du Centre-Sud","id_arrondissement": "REB04","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "6297","nom": "C. Paré","prenom": "Ariane","sexe": "f","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "12473","nom": "Guillemette","prenom": "Gavin","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "1931","nom": "Paquin","prenom": "Serge","sexe": "m","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"}]},{"id": "194899","no": "4.2","nom": "d'Ascot","id_arrondissement": "REB04","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "3632","nom": "Moreno","prenom": "Edwin","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "4753","nom": "Pouliot « Bob »","prenom": "Robert Y.","sexe": "m","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "10853","nom": "V. Buck","prenom": "Carlos","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"}]},{"id": "194900","no": "4.3","nom": "de la Croix-Lumineuse","id_arrondissement": "REB04","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "3828","nom": "Bernier","prenom": "Jean","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "9301","nom": "Bilodeau","prenom": "Jacques","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "6291","nom": "Daigle","prenom": "Antoni","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "4561","nom": "Gagnon","prenom": "Nicole A.","sexe": "f","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "2632","nom": "Houle","prenom": "Sébastien","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "13142","nom": "Martin","prenom": "Luc","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "1527","nom": "Mbatika","prenom": "Matamba Harusha Henry","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "6691","nom": "Quenneville","prenom": "Gilles","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194901","no": "4.4","nom": "de l'Université","id_arrondissement": "REB04","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "8092","nom": "Demers","prenom": "Philippe","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "4779","nom": "Lapointe","prenom": "Alain","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "355","nom": "Rouleau","prenom": "Jean-François","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194902","no": "5.1","nom": "de Deauville","id_arrondissement": "REB05","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "11755","nom": "Côté","prenom": "Kévin","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "3831","nom": "Délisle","prenom": "Diane","sexe": "f","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "8563","nom": "Doré","prenom": "Pascale","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194903","no": "5.2","nom": "des Châteaux-d'Eau","id_arrondissement": "REB05","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "5005","nom": "Nava","prenom": "Sébastien","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"},{"id": "3747","nom": "Vachon","prenom": "Bruno","sexe": "m","sortant": "1","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"}]},{"id": "194904","no": "5.3","nom": "de Rock Forest","id_arrondissement": "REB05","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "1926","nom": "Audet","prenom": "Serge","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "2476","nom": "Godbout","prenom": "Annie","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194905","no": "5.4","nom": "de Saint-Élie","id_arrondissement": "REB05","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "5532","nom": "Blanchette","prenom": "Alexandre","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "773","nom": "Lachance","prenom": "Julien","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"},{"id": "1528","nom": "Ramonda","prenom": "Nathalie","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194906","no": "6.1","nom": "de Beckett","id_arrondissement": "REB06","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "458","nom": "Allard","prenom": "Louise","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "5729","nom": "Christine","prenom": "Ouellet","sexe": "f","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "2664","nom": "Goguen","prenom": "Nathalie","sexe": "f","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"}]},{"id": "194907","no": "6.2","nom": "du Domaine-Howard","id_arrondissement": "REB06","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "730","nom": "L&#039;Espérance","prenom": "Chantal","sexe": "f","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"},{"id": "4390","nom": "Lefrançois","prenom": "Guy","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "6972","nom": "Tétreault","prenom": "Patrick","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"}]},{"id": "194908","no": "6.3","nom": "de Montcalm","id_arrondissement": "REB06","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "6376","nom": "Décarie","prenom": "Jean-Pierre","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "858","nom": "Denault","prenom": "Marc","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"},{"id": "11788","nom": "Racine","prenom": "Simon","sexe": "m","sortant": "0","parti": "Comme une eau Terre","etat": "CAN","nb_vote": "0"}]},{"id": "194909","no": "6.4","nom": "du Carrefour","id_arrondissement": "REB06","nb_votes_rejet": "0","type_poste": "CV","candidats":[{"id": "5527","nom": "Arango","prenom": "Juan Ovidio","sexe": "m","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "344","nom": "Beaudin","prenom": "Évelyne","sexe": "f","sortant": "0","parti": "","etat": "CAN","nb_vote": "0"},{"id": "5002","nom": "Leroux","prenom": "Gaston","sexe": "m","sortant": "0","parti": "Équipe Bernard Sévigny - Renouveau sherbrookois","etat": "CAN","nb_vote": "0"},{"id": "629","nom": "Tardif","prenom": "Pierre","sexe": "m","sortant": "1","parti": "","etat": "CAN","nb_vote": "0"}]}]},"saisie_termine":"non","maj":"2013-10-04 17:46"}
          /* END http://donnees.electionsmunicipales.gouv.qc.ca/43027.json */
        );
        topic.maybeLoadDistrictById('43027');
      });

      it('should add to boroughs', function() {
        expect(boroughs.length).to.equal(6);
        expect(boroughs.get('43027-REB01').toJSON()).to.deep.equal({ id: '43027-REB01', name: 'Brompton' });
      });

      it('should add to posts with an ID prefix', function() {
        expect(posts.length).to.equal(24);
        expect(posts.get('43027-194886').toJSON()).to.deep.equal({
          'id': '43027-194886',
          'type': 'M',
          'name': null,
          'districtId': '43027',
          'boroughId': null,
          'nVoters': null
        });
      });

      it('should translate borough IDs properly', function() {
        expect(posts.get('43027-194888').get('boroughId')).to.equal('43027-REB01');
      });

      it('should add borough / district names to a post in parentheses', function() {
        expect(posts.get('43027-194887').get('name')).to.equal('Brompton / de Brompton');
      });

      it('should add candidates', function() {
        expect(candidates.length).to.equal(75);
        expect(candidates.get('43027-12725').toJSON()).to.deep.equal({
          id: '43027-12725',
          postId: '43027-194886',
          name: 'Roy Patterson',
          partyId: null,
          nVotes: 0
        });
      });

      it('should add the district', function() {
        expect(districts.length).to.equal(1);
        expect(districts.at(0).toJSON()).to.deep.equal({
          id: '43027',
          name: 'Sherbrooke'
        });
      });
    });
  });
})();
