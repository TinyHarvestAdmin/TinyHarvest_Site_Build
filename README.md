# Madylan Microgreens website

GitHub Pages-ready static site export.

## Publish
1. Copy all files and folders to the repository root.
2. In GitHub Settings > Pages, deploy from your chosen branch and root folder.
3. Rename `CNAME.example` to `CNAME` and replace its content with the final domain.
4. Replace `YOUR-DOMAIN` in `robots.txt` and `sitemap.xml`.
5. Replace placeholder policy pages with approved content.
6. Update social links and payment links before launch.

## Structure
- `index.html`: homepage
- `assets/css/styles.css`: site styling
- `assets/js/app.js`: basket and checkout interactions
- `assets/images/`: location for future local image assets
- `policies/`: legal and delivery pages

## Important
The checkout buttons remain a front-end demonstration until real Stripe, PayPal, or ecommerce payment links are connected. Embedded product imagery remains inside HTML as base64 data so the current design is preserved without missing image files.
