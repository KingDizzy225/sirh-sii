import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // URL locale du frontend Vite
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false, // Pas besoin de fichier de support compliqué pour l'instant
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Désactive l'enregistrement vidéo pour la rapidité
    screenshotOnRunFailure: true,
  },
});
