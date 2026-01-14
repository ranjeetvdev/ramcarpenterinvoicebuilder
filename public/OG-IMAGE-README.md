# OG Image Generation Instructions

## Quick Start

To generate the OG image for social media sharing:

1. Open `og-image-generator.html` in your web browser
2. Click the "Download PNG" button
3. Save the file as `og-image.png` in the `public` folder

## What's Included

- **og-image.svg** - Vector version of the OG image (backup)
- **og-image-generator.html** - Interactive tool to generate the PNG
- **og-image.png** - The actual PNG file used for social sharing (you need to generate this)

## Image Specifications

- **Dimensions**: 1200x630 pixels (optimal for all platforms)
- **Format**: PNG (best compatibility)
- **Platforms**: Optimized for WhatsApp, Twitter, Facebook, LinkedIn

## Design Elements

The OG image includes:

- Blue gradient background (#1e3a8a to #3b82f6)
- White content card with rounded corners
- Invoice icon representing the app functionality
- "Ram Carpenter" branding
- "Invoice Builder" subtitle
- "Professional invoicing made simple" tagline

## Already Configured

The `index.html` file already includes all necessary Open Graph meta tags:

- `og:image` - Points to `/og-image.png`
- `og:image:width` - 1200
- `og:image:height` - 630
- `og:title` - Ram Carpenter - Invoice Builder
- `og:description` - Professional invoicing made simple
- Twitter Card tags for Twitter sharing

## Testing

After generating and placing the image:

1. Build your app: `npm run build`
2. Deploy to your hosting
3. Test with:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Notes

- The image must be publicly accessible at your domain's `/og-image.png` path
- Some platforms cache images, so you may need to use their debugging tools to refresh
- The image will appear when sharing your website link on social media
