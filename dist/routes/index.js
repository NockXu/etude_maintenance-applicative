"use strict";
/**
 * Routes de la page d'accueil
 *
 * Ce fichier gère les routes principales du site,
 * notamment la page d'accueil.
 *
 * @module routes/index
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
/**
 * GET /
 * Affiche la page d'accueil du site
 */
router.get('/', (req, res) => {
    res.render('index', {
        isLoggedIn: req.session.isLoggedIn || false,
        username: req.session.username || null
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map