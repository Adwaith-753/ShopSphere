# ShopSphere

ShopSphere is a MERN e-commerce application with customer shopping, cart and wishlist, checkout, orders, seller applications, seller product management, and admin controls.

## Setup

### Server

1. Enter `server`.
2. Copy `.env.example` to `.env`.
3. Set `MONGO_URI`, `JWT_SECRET`, `PORT`, and `CLIENT_ORIGIN`.
4. To enable forgot-password emails, set `CLIENT_URL` and configure
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and
   optionally `SMTP_FROM`.
5. Run `npm install`.
6. Run `npm run dev`.

Use SMTP credentials from your email provider. For Gmail, use an app password
with 2-Step Verification enabled; do not use your regular account password.
The reset email contains a one-time link that expires after 30 minutes. The
user follows the link to set a new password, then signs in and can manage it
from their profile.

Optional MongoDB setup:

- Local MongoDB: use `mongodb://127.0.0.1:27017/shopsphere`.
- MongoDB Atlas: create a free database, add a database user and network access, then copy the connection string into `MONGO_URI`.

Create an initial admin:

```powershell
node scripts/createAdmin.js
```

### Client

1. Enter `client`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL` if the API is not running at `http://localhost:5000`.
4. Run `npm install`.
5. Run `npm run dev`.

## Available areas

- Customer: home, products, product details, cart, wishlist, profile, checkout and orders
- Seller: application, approval status, dashboard and product inventory management
- Admin: marketplace overview, products, categories, seller applications, customers,
  orders, inventory, coupons, reviews, COD payment records, analytics, AI assistant,
  platform settings, and activity logs

## Image uploads

Admin product and category image uploads use signed Cloudinary uploads. To enable them:

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com/).
2. In the Cloudinary dashboard, copy the cloud name, API key, and API secret.
3. Add those values to `server/.env` as `CLOUDINARY_CLOUD_NAME`,
   `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
4. Restart the server, then upload images from the admin Products or Categories tab.

Keep the API secret only in `server/.env`; never put it in client environment
variables or commit it to source control.

## Admin AI assistant

The admin AI Assistant requires an OpenAI API key:

1. Create an API key from the OpenAI platform dashboard.
2. Add it to `server/.env` as `OPENAI_API_KEY`. Optionally set `OPENAI_MODEL`;
   the default is `gpt-4o-mini`.
3. Restart the server and use the AI Assistant tab.

OpenAI API usage may incur charges according to your account and model. Keep the
key private and do not commit it.

## Payments

Checkout currently supports cash on delivery (COD) only. Admin payment records
allow manual status tracking; they do not charge customers, transfer seller
payouts, or issue refunds. Commission settings are saved for configuration but
are not yet applied to payouts.

## Testing

Run server model tests:

```powershell
cd server
npm test
```

Run client checks:

```powershell
cd client
npm run lint
npm run build
```
