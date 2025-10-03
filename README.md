# Test Technique – Produits (API Node + React, Socket.IO, JWT, Redux)

Ce dépôt contient :
 - Une API REST Node.js/Express + MongoDB (driver natif)
 - Une app React (Vite) avec Material UI, Redux Toolkit et Socket.IO pour le temps réel
 - Auth JWT (login / register)
 - ESLint + Prettier

# Configuration
Les variables d'environnement :
 - coté server dans backend/config/.env, les valeurs à renseigner :
 **client url**
CLIENT_URL = 
**port sur lequel le serveur écoute**
PORT = 
**connexion à la base de données**
MONGODB_URI = 
MONGODB_DB_NAME =
**secret pour le token**
JWT_SECRET = 
JWT_EXPIRES_IN = 1h

 - coté client dans src/.env, les valeurs à renseigner :
**API url** 
VITE_API_URL=http://localhost:+port/api/
**Websocket url** 
VITE_WS_URL=http://localhost:+port
# Authentification
POST /api/auth/register — crée un utilisateur et renvoie { token, user }
POST /api/auth/login — connecte un utilisateur et renvoie { token, user }

**Le front :**
stocke le token dans localStorage,
envoie Authorization: Bearer <token> via un interceptor axios,
transmet le token à Socket.IO (via socket.auth) pour une connexion WS protégée,
ouvre une modale LoginDialog quand l’API renvoie 401.

# EndPoints
Base URL : http://localhost:4000/api
GET /product — liste des produits (public)
GET /product/:id — détail produit (public)
POST /product — protégé (JWT) — crée un produit
payload attendu : { _id, name, type, price, rating, warranty_years, available }
PATCH /product/:id — protégé (JWT) — met à jour partiellement
(retourne le document mis à jour, pas un UpdateResult)
DELETE /product/:id — protégé (JWT) — supprime
GET /health — simple healthcheck

# Temps réel (Socket.IO)
 - Le serveur émet :
    - product:created → { ...doc }
    - product:updated → { ...doc }
    - product:deleted → { _id }

 - Le client écoute et met à jour la liste via Redux (entity adapter → upsertOne/removeOne), ce qui rend les événements idempotents.

 - Le token JWT est vérifié à la connexion WS (io.use(...) côté serveur).

# Redux Toolkit
 - Slice : src/features/products/productsSlice.js
    - fetchProducts, createProduct, updateProduct, deleteProduct (thunks HTTP)
    - productsWs.wsCreated/Updated/Deleted (actions dispatchées par Socket.IO)
    - State normalisé via createEntityAdapter (sélecteurs : selectAllProducts, etc.)

 - Intégration page : ProductsPage.jsx
    - dispatch(fetchProducts()) au mount
    - CRUD → dispatch(createProduct|updateProduct|deleteProduct).unwrap()
    - WS → dispatch(productsWs.wsCreated/Updated/Deleted(payload))

# Material UI
 - Material UI pour la table, les dialogues, les boutons.
 - ProductTable masque la colonne Actions si l’utilisateur n’est pas connecté (ouverture login à la demande).
 - ProductFormDialog gère création/édition (PATCH partiel côté API).
 - LoginDialog propose “Se connecter / Créer un compte” et connecte automatiquement après inscription.