describe('Portail Employé (Self-Service)', () => {
  beforeEach(() => {
    // Cypress exécute les tests de façon isolée, nous devons simuler la connexion
    // On pourrait utiliser cy.request() pour s'authentifier par API ou stub le localStorage
    // Ici on suppose qu'un utilisateur standard se connecte.
    cy.visit('/login');
    cy.get('input[type="email"]').type('employee@sii.fr');
    cy.get('input[type="password"]').type('SIIRH');
    cy.get('button[type="submit"]').click();
  });

  it('Affiche correctement les widgets principaux', () => {
    cy.visit('/my-space'); // Supposons que le portail employé soit sur /my-space
    
    // Vérifie le header
    cy.contains('Bonjour').should('be.visible');
    
    // Vérifie le widget Ma Paie
    cy.contains('Ma Paie').should('be.visible');
    
    // Vérifie le widget Mes Congés
    cy.contains('Mes Congés').should('be.visible');
    
    // Vérifie le widget Présence (Pointage)
    cy.contains('Présence').should('be.visible');
    cy.contains('Signaler mon ARRIVÉE').should('be.visible');
  });

  it('Permet d\'ouvrir la modale de demande d\'absence (Actions Rapides)', () => {
    cy.visit('/my-space');
    
    // Clique sur le bouton d'action rapide "Je suis absent"
    cy.contains('Je suis absent').click();
    
    // La modale doit s'ouvrir
    cy.contains('Déclarer une Absence').should('be.visible');
    
    // Remplir le formulaire
    cy.get('select').select('Retard');
    cy.get('textarea').type('Bloqué dans les embouteillages.');
    
    // On ne soumet pas pour ne pas polluer la DB, ou on peut le faire et vérifier le Toaster
    // cy.contains('Envoyer la demande').click();
  });
});
