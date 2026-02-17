# TS-Backend (TypeScript Express Application)

## Aperçu
Ce projet est le backend d'une application de gestion d'interventions, développé avec **Node.js**, **Express** et **TypeScript**. Il suit une architecture en couches (Layered Architecture) pour assurer la maintenabilité, la testabilité et la séparation des préoccupations.

Il s'agit de la version TypeScript du dossier `backend/` (qui est la version JavaScript) situé à la racine du projet.

## Architecture du Projet
Le projet est organisé comme suit :
- **src/app** : Initialisation de l'application Express et du serveur.
- **src/config** : Configurations globales (base de données, variables d'environnement).
- **src/modules** : Contient la logique métier découpée par domaines (ex: Auth).
  - **Controller** : Gère les requêtes HTTP.
  - **Service** : Contient la logique métier.
  - **Repository** : Gère l'accès aux données (SQL).
- **src/shared** : Composants partagés (middleware, gestion d'erreurs, utilitaires).
- **tests** : Tests unitaires et d'intégration.

## Technologies Utilisées
- **Langage** : TypeScript
- **Framework** : Express.js
- **Base de données** : MySQL (via `mysql2`)
- **Authentification** : JWT (JSON Web Tokens) avec cookies sécurisés
- **Sécurité** : Helmet, CORS, Bcryptjs pour le hachage des mots de passe
- **Validation** : Zod
- **Tests** : Vitest & Supertest
- **Logging** : Pino

## Fonctionnalités Actuelles
- **Authentification** : 
  - Connexion (Login) avec génération de token JWT stocké dans un cookie.
  - Déconnexion (Logout).
- **Gestion des Erreurs** : Système centralisé de gestion des erreurs avec des réponses JSON cohérentes.
- **Sécurité** : Protection des headers HTTP et gestion des politiques CORS.

## Installation et Utilisation

### Prérequis
- Node.js (version 18 ou supérieure)
- Une instance MySQL

### Installation
1. Accédez au dossier :
   ```bash
   cd ts-backend/backend
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```

### Scripts Disponibles
- `npm run dev` : Lance le serveur en mode développement avec rechargement automatique (`tsx`).
- `npm run build` : Compile le code TypeScript en JavaScript dans le dossier `dist/`.
- `npm run start` : Lance l'application compilée.
- `npm test` : Exécute les tests avec Vitest.
- `npm run lint` : Vérifie la qualité du code avec ESLint.

## Tests
Le projet utilise **Vitest** pour les tests.
- Pour lancer tous les tests : `npm test`
- Pour les tests d'intégration uniquement : `npm run test:integration`
- Pour les tests unitaires uniquement : `npm run test:unit`
