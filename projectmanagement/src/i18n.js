import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Définir les ressources de traduction
const resources = {
  en: {
    translation: {
      // Hero Section
      "hero.title": "Power Up Your <br /> <span id='highlight-typed'></span> With Orkestra <br />",
      "hero.subtitle": "Orkestra is the best AI based <br />project management platform!",
      "hero.button": "Try it now",

      // About Us Section
      "about.title": "About <span class='highlight-title'>Us</span>",
      "about.description1": "At Orkestra, we harness the power of artificial intelligence to make project management smarter, more efficient, and seamlessly accessible to everyone.",
      "about.description2": "Our mission is to help engineers, project managers, and teams organize, track, and successfully complete their projects without getting lost in complex processes.",
      "about.features": [
        "AI-based task prioritization",
        "AI-based project delay prediction",
        "Predictive Analytics for Task Completion",
        "Task assignment recommendation"
      ],

      // Features Section
      "features.title": "Our Features",
      "features.subtitle": "Empowering you with the best tools for project success.",
      "features.userAuth": "User Authentication",
      "features.userAuthDesc": "Secure login and role-based access ensure that only authorized users can view or modify project details.",
      "features.projectManagement": "Project Management",
      "features.projectManagementDesc": "Easily create, track, and manage projects, keeping everything on schedule with real-time updates.",
      "features.taskManagement": "Task Management",
      "features.taskManagementDesc": "Create, assign, and prioritize tasks efficiently to boost productivity and meet deadlines.",
      "features.dashboardNotifications": "Dashboard & Smart Notifications",
      "features.dashboardNotificationsDesc": "Get a clear project overview with a customizable dashboard and stay informed with smart alerts.",
      "features.activityLog": "Activity Log & History",
      "features.activityLogDesc": "Track all project activities, decisions, and updates for transparency and accountability.",

      // Demo Section
      "demo.title": "Orkestra <span class='highlight-title'>revolutionizes</span> project management",
      "demo.subtitle": "Take a glimpse at our platform through a showcase of key features designed specifically to optimize your workflow.",

      // Dark Layout Section
      "dark.title": "Discover Our <span class='highlight-title'>Dark Layout</span>",
      "dark.subtitle": "Embrace the elegance of the dark layout, where simplicity meets sophistication. Navigate effortlessly through your admin tasks with style.",
      "dark.button": "Check Now",

      // Wrapper Section
      "wrapper.features": [
        "Prioritization of Tasks with AI Assistance",
        "Analytics Dashboard for Project Insights",
        "Predictive Analytics for Risk & Deadline Management",
        "Advanced Role-Based Access and Permissions",
        "Task Dependencies and Milestone Tracking",
        "Real-Time Project Status Updates",
        "Task and Resource Allocation",
        "Comprehensive Activity Log",
        "Integration with 3rd Party Tools",
        "Team Performance Metrics",
        "Secure Cloud Storage for Documents"
      ],

      // Footer Section
      "footer.title": "The best <span class='highlight-title'>AI powered</span> Project Management platform!",
      "footer.featuresTitle": "Our <span class='highlight-title'>Features</span>",
      "footer.features": [
        "User Authentication",
        "Project Management",
        "Task Management",
        "Dashboard & Smart Notifications",
        "Activity Log & History"
      ],
      "footer.contactTitle": "Contact <span class='highlight-title'>us</span>",

      // Header
      "header.apps": "Shortcuts",
      "header.notifications": "Notifications",
      "header.profile": "Profile",
      "header.profileDetails": "Profile Details",
      "header.logout": "Logout",
      "header.search": "Search",
      "header.searchPlaceholder": "Search...",
      "header.recentSearches": "Recent Searches:",
      "header.language": "Language"
    }
  },
  fr: {
    translation: {
      // Hero Section
      "hero.title": "Boostez Votre <br /> <span id='highlight-typed'></span> Avec Orkestra <br />",
      "hero.subtitle": "Orkestra est la meilleure plateforme de gestion de projets basée sur l'IA !",
      "hero.button": "Essayez maintenant",

      // About Us Section
      "about.title": "À propos de <span class='highlight-title'>Nous</span>",
      "about.description1": "Chez Orkestra, nous exploitons la puissance de l'intelligence artificielle pour rendre la gestion de projets plus intelligente, plus efficace et accessible à tous de manière transparente.",
      "about.description2": "Notre mission est d'aider les ingénieurs, les chefs de projet et les équipes à organiser, suivre et mener à bien leurs projets sans se perdre dans des processus complexes.",
      "about.features": [
        "Priorisation des tâches basée sur l'IA",
        "Prédiction des retards de projet basée sur l'IA",
        "Analyse prédictive pour l'achèvement des tâches",
        "Recommandation d'assignation de tâches"
      ],

      // Features Section
      "features.title": "Nos Fonctionnalités",
      "features.subtitle": "Vous offrir les meilleurs outils pour le succès de vos projets.",
      "features.userAuth": "Authentification des Utilisateurs",
      "features.userAuthDesc": "Connexion sécurisée et accès basé sur les rôles garantissent que seuls les utilisateurs autorisés peuvent voir ou modifier les détails du projet.",
      "features.projectManagement": "Gestion de Projets",
      "features.projectManagementDesc": "Créez, suivez et gérez facilement vos projets, en maintenant tout sur les rails avec des mises à jour en temps réel.",
      "features.taskManagement": "Gestion des Tâches",
      "features.taskManagementDesc": "Créez, assignez et priorisez les tâches efficacement pour augmenter la productivité et respecter les délais.",
      "features.dashboardNotifications": "Tableau de Bord & Notifications Intelligentes",
      "features.dashboardNotificationsDesc": "Obtenez une vue d'ensemble claire de vos projets avec un tableau de bord personnalisable et restez informé grâce à des alertes intelligentes.",
      "features.activityLog": "Journal d'Activité & Historique",
      "features.activityLogDesc": "Suivez toutes les activités, décisions et mises à jour des projets pour plus de transparence et de responsabilité.",

      // Demo Section
      "demo.title": "Orkestra <span class='highlight-title'>révolutionne</span> la gestion de projets",
      "demo.subtitle": "Découvrez notre plateforme à travers une présentation des fonctionnalités clés conçues spécifiquement pour optimiser votre flux de travail.",

      // Dark Layout Section
      "dark.title": "Découvrez Notre <span class='highlight-title'>Thème Sombre</span>",
      "dark.subtitle": "Adoptez l'élégance du thème sombre, où la simplicité rencontre la sophistication. Naviguez sans effort à travers vos tâches administratives avec style.",
      "dark.button": "Découvrez Maintenant",

      // Wrapper Section
      "wrapper.features": [
        "Priorisation des Tâches avec Assistance IA",
        "Tableau de Bord Analytique pour des Aperçus sur les Projets",
        "Analyse Prédictive pour la Gestion des Risques et des Délais",
        "Accès et Permissions Avancés Basés sur les Rôles",
        "Suivi des Dépendances des Tâches et des Jalons",
        "Mises à Jour en Temps Réel de l'État des Projets",
        "Allocation des Tâches et des Ressources",
        "Journal d'Activité Complet",
        "Intégration avec des Outils Tiers",
        "Métriques de Performance d'Équipe",
        "Stockage Sécurisé dans le Cloud pour les Documents"
      ],

      // Footer Section
      "footer.title": "La meilleure plateforme de gestion de projets <span class='highlight-title'>alimentée par l'IA</span> !",
      "footer.featuresTitle": "Nos <span class='highlight-title'>Fonctionnalités</span>",
      "footer.features": [
        "Authentification des Utilisateurs",
        "Gestion de Projets",
        "Gestion des Tâches",
        "Tableau de Bord & Notifications Intelligentes",
        "Journal d'Activité & Historique"
      ],
      "footer.contactTitle": "Contactez-<span class='highlight-title'>nous</span>",

      // Header
      "header.apps": "Raccourcis",
      "header.notifications": "Notifications",
      "header.profile": "Profil",
      "header.profileDetails": "Détails du Profil",
      "header.logout": "Déconnexion",
      "header.search": "Rechercher",
      "header.searchPlaceholder": "Rechercher...",
      "header.recentSearches": "Recherches récentes :",
      "header.language": "Langue"
    }
  }
};

i18n
  .use(LanguageDetector) // Détecte automatiquement la langue du navigateur
  .use(initReactI18next) // Intégration avec React
  .init({
    resources,
    fallbackLng: 'en', // Langue par défaut
    interpolation: {
      escapeValue: false // React gère déjà l'échappement
    }
  });

export default i18n;