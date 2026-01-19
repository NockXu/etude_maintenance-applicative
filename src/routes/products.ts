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
 * Redirige vers la liste des produits si l'utilisateur n'est pas admin
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
 * Affiche la page des produits (interface utilisateur)
 */
router.get('/', (req: Request, res: Response) => {
    res.render('products', {
        username: req.session.username,
        role: req.session.role
    });
});

/**
 * GET /products/total
 * Affiche la page du total de l'inventaire
 */
router.get('/total', (req: Request, res: Response) => {
    res.render('total', {
        username: req.session.username,
        role: req.session.role
    });
});

/**
 * GET /api/products
 * Récupère tous les produits
 */
router.get('/api/products', async (req: Request, res: Response) => {
    try {
        const [products] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM products ORDER BY created_at DESC'
        );

        // Récupérer les produits qui ont des achats associés
        const [purchases] = await pool.execute<RowDataPacket[]>(
            'SELECT DISTINCT product_id FROM purchases'
        );
        
        const productsWithPurchases = new Set(purchases.map(p => p.product_id));

        res.json({
            success: true,
            data: {
                products,
                productsWithPurchases: Array.from(productsWithPurchases)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des produits:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors du chargement des produits',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * POST /api/products
 * Crée un nouveau produit (admin seulement)
 */
router.post('/api/products', requireAdmin, async (req: Request, res: Response) => {
    const { name, description, price, quantity } = req.body;

    try {
        const [result] = await pool.execute<ResultSetHeader>(
            'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
            [name, description, price, quantity]
        );

        res.status(201).json({
            success: true,
            message: 'Produit ajouté avec succès',
            data: {
                id: result.insertId,
                name,
                description,
                price,
                quantity
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout du produit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'ajout du produit',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * PUT /api/products/:id
 * Met à jour un produit (admin seulement)
 */
router.put('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;

    try {
        await pool.execute(
            'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
            [name, description, price, quantity, id]
        );

        res.json({
            success: true,
            message: 'Produit modifié avec succès',
            data: { id, name, description, price, quantity }
        });
    } catch (error) {
        console.error('Erreur lors de la modification du produit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la modification du produit',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * DELETE /api/products/:id
 * Supprime un produit (admin seulement)
 */
router.delete('/api/products/:id', requireAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Vérifier si le produit a des achats associés
        const [purchases] = await pool.execute<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM purchases WHERE product_id = ?',
            [id]
        );

        if (purchases[0].count > 0) {
            return res.status(400).json({
                success: false,
                error: 'Impossible de supprimer ce produit car il a déjà été acheté par des utilisateurs'
            });
        }

        // Supprimer le produit s'il n'a pas d'achats associés
        await pool.execute('DELETE FROM products WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Produit supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de la suppression du produit',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

/**
 * POST /api/products/:id/buy
 * Achète un produit (diminue la quantité de 1)
 */
router.post('/api/products/:id/buy', async (req: Request, res: Response) => {
    const { id } = req.params;
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
            return res.status(400).json({
                success: false,
                error: 'Produit non disponible ou en rupture de stock'
            });
        }

        // Récupérer les informations mises à jour du produit
        const [products] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                error: 'Produit non trouvé après mise à jour'
            });
        }

        const product = products[0] as Product;

        // Enregistrer l'achat
        await connection.execute(
            'INSERT INTO purchases (user_id, product_id, quantity, total_price) VALUES (?, ?, 1, ?)',
            [req.session.userId, id, product.price]
        );

        await connection.commit();

        res.json({
            success: true,
            message: 'Achat effectué avec succès',
            data: {
                product,
                remainingQuantity: product.quantity
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erreur lors de l\'achat du produit:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'achat du produit',
            details: error instanceof Error ? error.message : String(error)
        });
    } finally {
        connection.release();
    }
});

export default router;
