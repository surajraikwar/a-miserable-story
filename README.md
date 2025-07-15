# Digital Flipbook

A beautiful, interactive digital book experience for the web with realistic page-turning animations and responsive design.

## Features

✨ **Realistic Book Experience**
- Beautiful book cover with open animation
- Smooth page-turning animations
- Paper texture and shadows for authentic feel

📱 **Fully Responsive**
- Desktop: Two-page spread view (like a real book)
- Mobile: Single page view with swipe navigation
- Tablet: Optimized layout

🎯 **User-Friendly Navigation**
- Click arrows or page edges to turn pages
- Swipe left/right on touch devices
- Keyboard navigation (arrow keys)
- Page indicator showing current position

🎨 **Beautiful Design**
- Clean, elegant typography
- Subtle animations and effects
- Customizable color scheme
- Paper-like texture

⚡ **Performance Optimized**
- Smooth animations
- Lazy loading ready
- Minimal resource usage

## Quick Start

1. Open `index.html` in a modern web browser
2. Click "Open Book" to start reading
3. Navigate using:
   - Arrow buttons
   - Keyboard arrows
   - Swipe gestures (mobile)

## Customization

### Adding Your Content

Content is now loaded dynamically from JSON files in the `content` folder:

1. **Edit book metadata**: Update `content/book-metadata.json` with your book details
2. **Add chapters**: Create JSON files for each chapter (e.g., `content/chapter1.json`)
3. **Chapter format**:
```json
{
  "title": "Chapter Title",
  "content": [
    "First paragraph...",
    "Second paragraph..."
  ]
}
```

See `content/README.md` for detailed instructions.

### Styling

Customize the look by editing CSS variables in `styles.css`:

```css
:root {
  --primary-color: #2c3e50;      /* Main text color */
  --secondary-color: #34495e;     /* Secondary text */
  --accent-color: #e74c3c;        /* Accent elements */
  --text-color: #333333;          /* Body text */
  --page-bg: #fdfdf8;            /* Page background */
}
```

### Book Cover

To add a custom book cover image:

1. Add your image to the project folder
2. Update the cover section in `index.html`:

```html
<div class="cover-content" style="background-image: url('your-cover.jpg');">
  <h1>Your Book Title</h1>
  <p class="author">By Your Name</p>
</div>
```

## Deployment

### GitHub Pages

To deploy this project to GitHub Pages:

1. Initialize a git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Link to your GitHub repository:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main
```

3. Deploy to GitHub Pages:
```bash
npm run deploy
```

Your website will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`

## Advanced Features

### Adding Images

Include images in your content:

```javascript
content: `<img src="path/to/image.jpg" alt="Description" />
         <p>Your text content...</p>`
```

### Interactive Elements

The framework supports any HTML content, including:
- Videos
- Interactive diagrams
- Forms
- Embedded content

### Performance Tips

1. **Optimize Images**: Use appropriate formats and sizes
2. **Lazy Loading**: For books with many pages, implement lazy loading
3. **Content Chunking**: Load content progressively for large books

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## File Structure

```
digital-flipbook/
├── index.html      # Main HTML structure
├── styles.css      # All styling
├── flipbook.js     # JavaScript functionality
└── README.md       # Documentation
```

## Future Enhancements

- [ ] Bookmark functionality
- [ ] Search within book
- [ ] Table of contents
- [ ] Social sharing
- [ ] Offline support (PWA)
- [ ] Multiple theme options
- [ ] Page annotations
- [ ] Audio narration support

## License

This project is open source and available for personal and commercial use.

## Credits

Created with modern web technologies: HTML5, CSS3, and vanilla JavaScript.
