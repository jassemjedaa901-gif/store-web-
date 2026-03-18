# Store Web

Projet e‑commerce (MVP) organisé en **monorepo**:
- `frontend/`: application web (Vite + React + TypeScript)
- `backend/`: API (Express + TypeScript) — skeleton prêt pour brancher MongoDB/JWT/Stripe

## Stack technique (réel dans ce repo)

- **Frontend**: Vite, React 18 (JS/JSX), TailwindCSS, shadcn/ui (Radix UI), React Router, TanStack Query, Framer Motion.
- **Backend**: Node.js + Express (JavaScript/ESM), MongoDB (Mongoose), Auth JWT + rôles, Stripe (Checkout + Webhook).

## Fonctionnalités déjà faites (frontend)

- Inscription / connexion (API) via **JWT** + refresh token.
- Catalogue produits (API) + filtre catégories + **recherche par nom**.
- Page **détails produit** (`/product/:id`).
- Panier (persisté en `localStorage`).
- Validation commande: création d’order + historique (`/orders`) via API.
- Dashboard admin (`/admin`) pour CRUD produits via API + reset produits (seed).
- Paiement Stripe: création Checkout Session côté API (et webhook côté backend).

## Ce qui manque pour un MVP “production”

- **Stripe prod**: clés live, gestion erreurs, refunds, gestion TVA/factures.
- **Admin complet**: gestion commandes (statuts), gestion utilisateurs/roles (merchant).
- **Hardening**: logs structurés, monitoring, tests API, CI/CD.

## Lancer le projet

### Frontend

```bash
npm install
npm run dev
```

Le frontend démarre sur `http://localhost:5173`.

### Backend

```bash
npm run dev:backend
```

Backend sur `http://localhost:4000` (voir `backend/src/index.ts`).

## Stripe (Payment Link)

Dans `frontend/.env`:

```bash
VITE_STRIPE_PAYMENT_LINK="https://buy.stripe.com/..."
```

