"use strict";
/**
 * Point d'entrée de l'application
 *
 * Ce fichier configure et démarre le serveur Express.
 * Il initialise les middlewares, les sessions et les routes.
 *
 *
 * @module app
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Charger les variables d'environnement
dotenv_1.default.config();
// Import des routes
const index_1 = __importDefault(require("./routes/index"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
// Création de l'application Express
const app = (0, express_1.default)();
// Port du serveur depuis variable d'environnement
const PORT = process.env.PORT || 3000;
/**
 * Configuration des middlewares
 */
// Parser pour les données de formulaire
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Fichiers statiques (CSS, images, etc.)
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Configuration du moteur de templates EJS
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
/**
 * Configuration des sessions
 */
if (process.env.SESSION_SECRET) {
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // true en production (HTTPS)
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 heures
        }
    }));
}
/**
 * Configuration des routes
 */
app.use('/', index_1.default); // Routes de la page d'accueil
app.use('/auth', auth_1.default); // Routes d'authentification
app.use('/products', products_1.default); // Routes CRUD des produits
/**
 * Route 404 - Page non trouvée
 */
app.use((req, res) => {
    res.status(404).render('error', {
        isLoggedIn: req.session.isLoggedIn || false,
        username: req.session.username || null,
        error: 'Page non trouvée',
        errorCode: 404
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
exports.default = app;
//# sourceMappingURL=app.js.map