# SEO Word Frequency Analyzer

A Chrome extension that analyzes webpage content for word frequency and provides SEO insights with an interactive word cloud visualization.

## Features

- **Word Frequency Analysis**: Analyzes the frequency of words on any webpage
- **Interactive Word Cloud**: Visual representation of the top 100 most frequent words
- **Word Details**: Shows definitions and synonyms when hovering over words
- **Readable View**: Toggle to see webpage content in a clean, structured format
- **Export Options**:
  - Export webpage content as Markdown
  - Export word frequency analysis as JSON
- **Dark Theme**: Uses the Gruvbox dark color scheme for comfortable viewing

## Installation

1. Clone this repository or download the ZIP file
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should now appear in your Chrome toolbar

## Usage

1. Navigate to any webpage you want to analyze
2. Click the extension icon in your Chrome toolbar
3. The analyzer will open with the following features:
   - Word cloud visualization of the most frequent words
   - Hover over words to see frequency, definition, and synonyms
   - Toggle the readable view to see the page content in a clean format
   - Use the export buttons to save the analysis or content

## Export Formats

### Markdown Export
The Markdown export preserves the document structure with headers and paragraphs, perfect for content repurposing or analysis.

### JSON Export
The JSON export includes:
- Complete word frequency data
- Top 100 most frequent words
- URL of the analyzed page
- Timestamp of the analysis

## Development

### Project Structure
```
seo-word-analyzer/
├── manifest.json      # Extension configuration
├── background.js     # Background service worker
├── content.js        # Main analyzer logic
├── styles.css        # Visual styling
├── icons/           # Extension icons
└── README.md        # Documentation
```

### Building and Testing

1. Make changes to the source files
2. Reload the extension in `chrome://extensions/`
3. Test on various websites to ensure compatibility

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use and modify for your own projects.
