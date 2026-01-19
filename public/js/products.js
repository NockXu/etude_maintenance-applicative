class ProductsApp {
    constructor() {
        this.products = [];
        this.productsWithPurchases = new Set();
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.render();
    }

    async loadProducts() {
        console.log('Chargement des produits...');
        try {
            const response = await fetch('/products/api/products');
            console.log('Réponse reçue:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Données reçues:', result);
            
            if (result.success) {
                this.products = result.data.products;
                this.productsWithPurchases = new Set(result.data.productsWithPurchases);
                console.log('Produits chargés:', this.products.length);
            } else {
                console.error('Erreur dans la réponse:', result);
                this.showError('Erreur lors du chargement des produits');
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    setupEventListeners() {
        console.log('Configuration des événements...');
        
        // Événements pour les formulaires
        const addForm = document.getElementById('addProductFormElement');
        if (addForm) {
            console.log('Formulaire d\'ajout trouvé');
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Soumission du formulaire d\'ajout');
                this.addProduct();
            });
        } else {
            console.error('Formulaire d\'ajout non trouvé');
        }

        const editForm = document.getElementById('editProductFormElement');
        if (editForm) {
            console.log('Formulaire de modification trouvé');
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Soumission du formulaire de modification');
                this.updateProduct();
            });
        } else {
            console.error('Formulaire de modification non trouvé');
        }

        // Événements pour les actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-buy')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                console.log('Achat du produit:', productId);
                this.buyProduct(productId);
            }

            if (e.target.classList.contains('btn-edit')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                console.log('Modification du produit:', productId);
                this.showEditForm(productId);
            }

            if (e.target.classList.contains('btn-delete')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                console.log('Suppression du produit:', productId);
                this.deleteProduct(productId);
            }

            if (e.target.classList.contains('btn-cancel')) {
                e.preventDefault();
                console.log('Annulation');
                this.hideForms();
            }
        });
    }

    render() {
        this.renderProductsList();
        this.renderTotal();
    }

    renderProductsList() {
        const tbody = document.querySelector('.products-table tbody');
        if (!tbody) return;

        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-state">
                        <p>Aucun produit trouvé.</p>
                        ${this.isAdmin() ? '<button class="btn btn-primary" onclick="app.showAddForm()">Ajouter votre premier produit</button>' : ''}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${this.escapeHtml(product.name)}</td>
                <td>${this.escapeHtml(product.description)}</td>
                <td>${parseFloat(product.price).toFixed(2)} €</td>
                <td>${product.quantity}</td>
                <td class="actions">
                    ${this.renderActions(product)}
                </td>
            </tr>
        `).join('');
    }

    renderActions(product) {
        if (this.isAdmin()) {
            const canDelete = !this.productsWithPurchases.has(product.id);
            return `
                <button class="btn btn-small btn-edit" data-product-id="${product.id}">
                    Modifier
                </button>
                ${canDelete 
                    ? `<button class="btn btn-small btn-delete" data-product-id="${product.id}">Supprimer</button>`
                    : `<span class="btn btn-small btn-disabled" title="Ce produit ne peut pas être supprimé car il a été acheté">Supprimer</span>`
                }
            `;
        } else {
            return product.quantity > 0 
                ? `<button class="btn btn-small btn-primary btn-buy" data-product-id="${product.id}">Acheter</button>`
                : `<span class="btn btn-small btn-disabled">Rupture de stock</span>`;
        }
    }

    renderTotal() {
        const totalElement = document.querySelector('.total-value');
        const countElement = document.querySelector('.total-info strong');
        const tbody = document.querySelector('.calc-table tbody');
        const expectedTotal = document.querySelector('tfoot tr:first-child td:last-child strong');
        const systemTotal = document.querySelector('tfoot tr.bug-row td:last-child strong');

        if (!totalElement) return;

        const total = this.products.reduce((sum, p) => sum + (parseFloat(p.price) * p.quantity), 0);
        
        totalElement.textContent = `${total.toFixed(2)} €`;
        if (countElement) countElement.textContent = this.products.length;

        if (tbody) {
            tbody.innerHTML = this.products.map(product => `
                <tr>
                    <td>${this.escapeHtml(product.name)}</td>
                    <td>${parseFloat(product.price).toFixed(2)} €</td>
                    <td>${product.quantity}</td>
                    <td>${(parseFloat(product.price) * product.quantity).toFixed(2)} €</td>
                </tr>
            `).join('');
        }

        if (expectedTotal) {
            expectedTotal.textContent = `${total.toFixed(2)} €`;
        }
        if (systemTotal) {
            systemTotal.textContent = `${total.toFixed(2)} €`;
        }
    }

    async addProduct() {
        const form = document.getElementById('addProductFormElement');
        if (!form) {
            console.error('Formulaire d\'ajout non trouvé');
            return;
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Données du formulaire:', data);

        try {
            const response = await fetch('/products/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Réponse du serveur:', response.status);
            const result = await response.json();
            console.log('Résultat:', result);

            if (result.success) {
                this.showSuccess('Produit ajouté avec succès');
                this.hideForms();
                await this.loadProducts();
                this.render();
            } else {
                this.showError(result.error || 'Erreur lors de l\'ajout du produit');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    async updateProduct() {
        const form = document.getElementById('editProductFormElement');
        if (!form) {
            console.error('Formulaire de modification non trouvé');
            return;
        }
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const productId = form.dataset.productId;
        
        console.log('Données du formulaire:', data);
        console.log('ID du produit:', productId);

        try {
            const response = await fetch(`/products/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            console.log('Réponse du serveur:', response.status);
            const result = await response.json();
            console.log('Résultat:', result);

            if (result.success) {
                this.showSuccess('Produit modifié avec succès');
                this.hideForms();
                await this.loadProducts();
                this.render();
            } else {
                this.showError(result.error || 'Erreur lors de la modification du produit');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    async deleteProduct(productId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            return;
        }

        try {
            const response = await fetch(`/products/api/products/${productId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Produit supprimé avec succès');
                await this.loadProducts();
                this.render();
            } else {
                this.showError(result.error || 'Erreur lors de la suppression du produit');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    async buyProduct(productId) {
        try {
            const response = await fetch(`/products/api/products/${productId}/buy`, {
                method: 'POST'
            });

            const result = await response.json();

            if (result.success) {
                this.showSuccess('Achat effectué avec succès');
                await this.loadProducts();
                this.render();
            } else {
                this.showError(result.error || 'Erreur lors de l\'achat');
            }
        } catch (error) {
            console.error('Erreur:', error);
            this.showError('Erreur de connexion au serveur');
        }
    }

    showAddForm() {
        console.log('Affichage du formulaire d\'ajout');
        this.hideForms();
        const popup = document.getElementById('addProductForm');
        if (popup) {
            popup.style.display = 'flex';
            const form = document.getElementById('addProductFormElement');
            if (form) {
                form.reset();
            }
        } else {
            console.error('Popup d\'ajout non trouvé');
        }
    }

    showEditForm(productId) {
        const product = this.products.find(p => p.id == productId);
        if (!product) {
            console.error('Produit non trouvé:', productId);
            return;
        }

        console.log('Affichage du formulaire de modification pour:', product);

        this.hideForms();
        const form = document.getElementById('editProductFormElement');
        if (form) {
            form.dataset.productId = productId;
            
            // Remplir le formulaire
            document.getElementById('editName').value = product.name;
            document.getElementById('editDescription').value = product.description;
            document.getElementById('editPrice').value = product.price;
            document.getElementById('editQuantity').value = product.quantity;
            
            // Afficher le popup
            const popup = document.getElementById('editProductForm');
            if (popup) {
                popup.style.display = 'flex';
            }
        } else {
            console.error('Formulaire de modification non trouvé');
        }
    }

    hideForms() {
        document.querySelectorAll('.form-popup').forEach(form => {
            form.style.display = 'none';
        });
    }

    showSuccess(message) {
        this.showAlert(message, 'success');
    }

    showError(message) {
        this.showAlert(message, 'error');
    }

    showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.products-section, .total-section');
        if (container) {
            container.insertBefore(alertDiv, container.firstChild);
        }

        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    isAdmin() {
        return document.body.dataset.userRole === 'admin';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProductsApp();
});
