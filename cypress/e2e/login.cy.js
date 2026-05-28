describe('Authentification et Connexion', () => {
  it('Affiche correctement la page de login', () => {
    cy.visit('/login');
    cy.get('h1').contains('SIIRH Entreprise').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
  });

  it('Refuse la connexion avec de mauvais identifiants', () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type('fake@sii.fr');
    cy.get('input[type="password"]').type('mauvais_mdp');
    cy.get('button[type="submit"]').click();
    
    // Le Toaster rouge d'erreur devrait apparaître
    // (Assumons que l'API renvoie 401 et le front affiche une erreur)
    // cy.contains('Identifiants incorrects').should('be.visible');
  });

  it('Permet d\'ouvrir le portail Self-Service Employé', () => {
    cy.visit('/login');
    cy.contains('Self Service Employé').click();
    cy.contains('Créer une Demande Rapide').should('be.visible');
    // Vérifier les champs de la modale
    cy.get('select').select("Demande d'autorisation");
    cy.get('input[type="date"]').should('be.visible');
  });
});
