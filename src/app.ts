/**
 * Point d'entrée de l'application
 *
 * Ce fichier configure et démarre le serveur Express.
 * Il initialise les middlewares, les sessions et les routes.
 *
 *
 * @module app
 */

import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Import des routes
import indexRoutes from './routes/index';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';

// Création de l'application Express
const app: Application = express();

// Port du serveur depuis variable d'environnement
const PORT = process.env.PORT || 3000;

/**
 * Configuration des middlewares
 */

// Parser pour les données de formulaire
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Fichiers statiques (CSS, images, etc.)
app.use(express.static(path.join(__dirname, '../public')));

// Configuration du moteur de templates EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

/**
 * Configuration des sessions
 */
if (process.env.SESSION_SECRET){
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true en production (HTTPS)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 24 heures
    }
}));
}


/**
 * Configuration des routes
 */
app.use('/', indexRoutes);           // Routes de la page d'accueil
app.use('/auth', authRoutes);        // Routes d'authentification
app.use('/products', productsRoutes); // Routes CRUD des produits

/**
 * Route 404 - Page non trouvée
 */
app.use((req: Request, res: Response) => {
    res.status(404).render('index', {
        isLoggedIn: req.session.isLoggedIn || false,
        username: req.session.username || null,
        error: 'Page non trouvée'
    });
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('Mini Site Web - TP Maintenance Applicative');
    console.log('='.repeat(50));
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
    console.log('');
    console.log('Comptes de test:');
    console.log('  - admin / admin123 (rôle admin)');
    console.log('  - user / user123 (rôle user)');
    console.log('='.repeat(50));
});

export default app;
