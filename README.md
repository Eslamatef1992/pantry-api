# Pantry API (makanifoods.com backend)

Node.js + Express + MySQL (Sequelize) REST API for the Makani Foods / Pantry e-commerce platform.

Sibling repos:
- Storefront: https://github.com/Eslamatef1992/Pantry-website
- Admin panel: https://github.com/Eslamatef1992/Pantry-admin

## Setup

```bash
cp .env.example .env   # set DB credentials + JWT_SECRET
npm install
npm run seed             # creates admin user + sample payment methods/products
npm run dev               # http://localhost:5000
```

Seeded admin login: `admin@makanifoods.com` / `ChangeMe123!` — change this immediately.

## Payment methods

KNET, Sadad and Cash on Delivery are each rows in `PaymentSettings`, toggled on/off from the
admin panel's Settings page. Add real KNET/Sadad merchant credentials to `.env` and wire the
gateway redirect/callback flow in `src/controllers/orderController.js` (marked with a `NOTE:`
comment) before enabling them for real checkouts.

## Deployment

Target: Ubuntu VPS, Nginx reverse proxy, PM2 (`pm2 start src/index.js --name pantry-api`),
MySQL, SSL via Certbot. Domain and VPS details to be added once available.
