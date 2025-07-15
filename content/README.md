# Content Management for Digital Flipbook

## How to Add Content

### 1. Book Metadata
Edit `book-metadata.json` to:
- Change book title and author
- Add or remove chapters
- Update chapter order

### 2. Chapter Files
Each chapter is stored as a separate JSON file with this structure:

```json
{
  "title": "Chapter Title",
  "content": [
    "First paragraph...",
    "Second paragraph...",
    "Third paragraph..."
  ]
}
```

### 3. Adding a New Chapter

1. Create a new JSON file in the `content` folder (e.g., `chapter11.json`)
2. Add the chapter content following the structure above
3. Update `book-metadata.json` to include the new chapter:

```json
{
  "id": 11,
  "title": "Chapter 11: New Chapter",
  "file": "chapter11.json"
}
```

### 4. Content Guidelines

- Each string in the "content" array becomes a separate paragraph
- Use standard HTML entities for special characters (e.g., `&amp;` for &)
- Escape quotes within content using backslash: `\"`
- You can include basic HTML tags like `<em>`, `<strong>`, `<br>`

### 5. Images in Content

To include images, use HTML img tags within the content:

```json
"content": [
  "Regular paragraph text...",
  "<img src='images/chapter3-image.jpg' alt='Description'>",
  "More text after the image..."
]
```

### 6. Dynamic Loading

The flipbook loads chapters dynamically as needed:
- Only the current chapter is loaded initially
- Adjacent chapters are preloaded for smooth navigation
- This allows for books with hundreds of chapters without performance issues

### 7. Sample Chapter Template

```json
{
  "title": "Chapter X: Title Here",
  "content": [
    "Opening paragraph that sets the scene...",
    "Development of the narrative...",
    "Character dialogue and interactions...",
    "Descriptive passages...",
    "Closing thoughts or cliffhanger..."
  ]
}
```

## Performance Tips

1. Keep individual chapter files under 100KB
2. Optimize any images used in content
3. Consider splitting very long chapters into parts
4. Use a CDN for hosting content files in production

## Internationalization

To support multiple languages:
1. Create language-specific folders (e.g., `content/en/`, `content/es/`)
2. Duplicate the structure for each language
3. Update the main JavaScript to load from the appropriate folder
