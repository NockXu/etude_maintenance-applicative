/**
 * Routes CRUD pour les produits
 *
 * Ce fichier gère toutes les opérations sur les produits:
 * - Liste des produits (Read)
 * - Ajout d'un produit (Create)
 * - Modification d'un produit (Update)
 * - Suppression d'un produit (Delete)
 * - Calcul du total de l'inventaire
 *
 * @module routes/products
 */

import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Product } from '../types';

const router = Router();

/**
 * Middleware pour vérifier l'authentification
 * Redirige vers la page de login si l'utilisateur n'est pas connecté
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/auth/login');
    }
    next();
};

/**
 * Middleware pour vérifier si l'utilisateur est admin
 * Seuls les admins peuvent créer, modifier et supprimer des produits
 */
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.role !== 'admin') {
        return res.redirect('/products');
    }
    next();
};

// Appliquer le middleware d'authentification à toutes les routes
router.use(requireAuth);

/**
 * GET /products
 * Affiche la liste de tous les produits
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const [products] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM products ORDER BY created_at DESC'
        );

        // Récupérer les produits qui ont des achats associés
        const [purchases] = await pool.execute<RowDataPacket[]>(
            'SELECT DISTINCT product_id FROM purchases'
        );
        
        const productsWithPurchases = new Set(purchases.map(p => p.product_id));

        res.render('products', {
            products,
            username: req.session.username,
            role: req.session.role,
            productsWithPurchases
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        res.render('products', {
            products: [],
            username: req.session.username,
            role: req.session.role,
            productsWithPurchases: new Set(),
            error: 'Erreur lors du chargement des produits'
        });
    }
});

/**
 * GET /products/add
 * Affiche le formulaire d'ajout d'un produit (admin seulement)
 */
router.get('/add', requireAdmin, (req: Request, res: Response) => {
    res.render('product-form', {
        product: null,
        action: 'add',
        username: req.session.username
    });
});

/**
 * POST /products/add
 * Traite le formulaire d'ajout d'un nouveau produit (admin seulement)
 */
router.post('/add', requireAdmin, async (req: Request, res: Response) => {
    const { name, description, price, quantity } = req.body;

    try {
        await pool.execute(
            'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
            [name, description, price, quantity]
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        res.render('product-form', {
            product: { name, description, price, quantity },
            action: 'add',
            username: req.session.username,
            error: 'Erreur lors de l\'ajout du produit'
        });
    }
});

/**
 * GET /products/edit/:id
 * Affiche le formulaire de modification d'un produit (admin seulement)
 */
router.get('/edit/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [products] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0) {
            return res.redirect('/products');
        }

        res.render('product-form', {
            product: products[0],
            action: 'edit',
            username: req.session.username
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        res.redirect('/products');
    }
});

/**
 * POST /products/edit/:id
 * Traite le formulaire de modification d'un produit (admin seulement)
 */
router.post('/edit/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;

    try {
        await pool.execute(
            'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
            [name, description, price, quantity, id]
        );

        res.redirect('/products');
    } catch (error) {
        console.error('Erreur lors de la modification du produit:', error);
        res.render('product-form', {
            product: { id, name, description, price, quantity },
            action: 'edit',
            username: req.session.username,
            error: 'Erreur lors de la modification du produit'
        });
    }
});

/**
 * GET /products/delete/:id
 * Supprime un produit (admin seulement, pas de confirmation - mauvaise UX volontaire)
 */
router.get('/delete/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Vérifier si le produit a des achats associés
        const [purchases] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM purchases WHERE product_id = ?',
            [id]
        );

        if (purchases[0].count > 0) {
            // Récupérer les produits pour afficher la page avec message d'erreur
            const [products] = await pool.execute<RowDataPacket[]>(
                'SELECT * FROM products ORDER BY created_at DESC'
            );

            // Récupérer les produits qui ont des achats associés
            const [purchasesList] = await pool.execute<RowDataPacket[]>(
                'SELECT DISTINCT product_id FROM purchases'
            );
            
            const productsWithPurchases = new Set(purchasesList.map(p => p.product_id));

            return res.render('products', {
                products,
                username: req.session.username,
                role: req.session.role,
                productsWithPurchases,
                error: 'Impossible de supprimer ce produit car il a déjà été acheté par des utilisateurs'
            });
        }

        // Supprimer le produit s'il n'a pas d'achats associés
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        res.redirect('/products');
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        res.redirect('/products');
    }
});

/**
 * POST /products/buy/:id
 * Permet à un utilisateur d'acheter un produit (diminue la quantité de 1)
 */
router.post('/buy/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    // Démarrer une transaction pour éviter les race conditions
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Vérifier et décrémenter le stock en une seule opération atomique
        const [result] = await connection.execute<ResultSetHeader>(
            'UPDATE products SET quantity = quantity - 1 WHERE id = ? AND quantity > 0',
            [id]
        );

        // Vérifier si le produit existait et avait du stock
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.redirect('/products');
        }

        // Récupérer les informations mises à jour du produit
        const [products] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0) {
            await connection.rollback();
            return res.redirect('/products');
        }

        const product = products[0] as Product;

        // Enregistrer l'achat
        await connection.execute(
            'INSERT INTO purchases (user_id, product_id, quantity, total_price) VALUES (?, ?, 1, ?)',
            [req.session.userId, id, product.price]
        );

        // Valider la transaction
        await connection.commit();

    } catch (error) {
        await connection.rollback();
        console.error('Erreur lors de l\'achat du produit:', error);
        return res.redirect('/products');
    } finally {
        connection.release();
    }

    res.redirect('/products');
});

/**
 * GET /products/total
 * Calcule le total de l'inventaire (prix * quantité pour chaque produit)
 */
router.get('/total', async (req: Request, res: Response) => {
    try {
        const [products] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM products'
        );

        let total = 0;

        for (const product of products as Product[]) {
            total += Number(product.price) * Number(product.quantity);
        }

        res.render('total', {
            products,
            total: total.toFixed(2),
            username: req.session.username
        });
    } catch (error) {
        console.error('Erreur lors du calcul du total:', error);
        res.redirect('/products');
    }
});

export default router;
