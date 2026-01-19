# Mini Shop - Gestion de Produits

[DAVID Gabriel](https://github.com/NockXu)
[GUILMIN Leny](https://github.com/TarzanHR)

Application web de gestion d'inventaire et d'achat de produits, construite avec **Node.js**, **Express**, **TypeScript** et **MySQL**.

## Fonctionnalités

### Pour les utilisateurs
- Inscription et connexion
- Consultation du catalogue de produits
- Achat de produits (mise à jour automatique du stock)
- Consultation de la valeur totale de l'inventaire

### Pour les administrateurs
- Gestion complète des produits (CRUD)
  - Ajout de nouveaux produits
  - Modification des produits existants
  - Suppression de produits
- Suivi des stocks

## Technologies

| Catégorie | Technologie |
|-----------|-------------|
| Backend | Node.js, Express.js |
| Langage | TypeScript |
| Base de données | MySQL |
| Templates | EJS |
| Sessions | express-session |

## Installation

### Prérequis

- Node.js v14+
- MySQL v5.7+
- npm

### Configuration

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd mini-shop
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Initialiser la base de données**
   ```bash
   mysql -u root -p < database/init.sql
   ```

4. **Configurer la connexion MySQL**

   Modifier `src/config/database.ts` avec vos identifiants :
   ```typescript
   host: 'localhost',
   user: 'votre_utilisateur',
   password: 'votre_mot_de_passe',
   database: 'mini_site'
   ```

5. **Lancer l'application**

   Mode développement :
   ```bash
   npm run dev
   ```

   Mode production :
   ```bash
   npm run build && npm start
   ```

6. **Accéder au site** : http://localhost:3000

## Structure du projet

```
mini-shop/
├── src/
│   ├── app.ts                 # Point d'entrée
│   ├── config/
│   │   └── database.ts        # Configuration MySQL
│   ├── routes/
│   │   ├── index.ts           # Page d'accueil
│   │   ├── auth.ts            # Authentification
│   │   └── products.ts        # Gestion des produits
│   └── types/
│       └── index.ts           # Types TypeScript
├── views/                     # Templates EJS
│   ├── index.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── products.ejs
│   ├── product-form.ejs
│   └── total.ejs
├── public/css/                # Styles
├── database/
│   └── init.sql               # Script d'initialisation
└── package.json
```

## API Routes

### Authentification

| Route | Méthode | Description |
|-------|---------|-------------|
| `/auth/login` | GET | Page de connexion |
| `/auth/login` | POST | Traitement connexion |
| `/auth/register` | GET | Page d'inscription |
| `/auth/register` | POST | Traitement inscription |
| `/auth/logout` | GET | Déconnexion |

### Produits

| Route | Méthode | Accès | Description |
|-------|---------|-------|-------------|
| `/products` | GET | Tous | Liste des produits |
| `/products/add` | GET | Admin | Formulaire d'ajout |
| `/products/add` | POST | Admin | Créer un produit |
| `/products/edit/:id` | GET | Admin | Formulaire de modification |
| `/products/edit/:id` | POST | Admin | Modifier un produit |
| `/products/delete/:id` | GET | Admin | Supprimer un produit |
| `/products/buy/:id` | POST | User | Acheter un produit |
| `/products/total` | GET | Tous | Valeur totale inventaire |

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement avec hot-reload |
| `npm run build` | Compilation TypeScript |
| `npm start` | Serveur de production |

## Base de données

### Tables

- **users** : Utilisateurs (id, username, password, role)
- **products** : Produits (id, name, description, price, quantity)
- **purchases** : Historique des achats (id, user_id, product_id, quantity, total_price)

### Rôles

- `admin` : Gestion complète des produits
- `user` : Consultation et achat de produits

## Licence

MIT
