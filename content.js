class ReadabilityAnalyzer {
  constructor(text) {
    this.text = text;
    this.sentences = this.getSentences();
    this.words = this.getWords();
    this.syllables = this.countSyllables();
  }

  getSentences() {
    return this.text.split(/[.!?]+/).filter((sent) => sent.trim().length > 0);
  }

  getWords() {
    return this.text.toLowerCase().match(/\b\w+\b/g) || [];
  }

  countSyllables() {
    return this.words.reduce((total, word) => {
      return total + this.countWordSyllables(word);
    }, 0);
  }

  countWordSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    return (
      word
        .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
        .replace(/^y/, "")
        .match(/[aeiouy]{1,2}/g)?.length || 1
    );
  }

  getFleschScore() {
    const wordsPerSentence = this.words.length / this.sentences.length;
    const syllablesPerWord = this.syllables / this.words.length;
    return 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  }

  getReadingLevel() {
    const score = this.getFleschScore();
    if (score >= 90) return "Very Easy";
    if (score >= 80) return "Easy";
    if (score >= 70) return "Fairly Easy";
    if (score >= 60) return "Standard";
    if (score >= 50) return "Fairly Difficult";
    if (score >= 30) return "Difficult";
    return "Very Difficult";
  }

  getStats() {
    const wordCount = this.words.length;
    const sentenceCount = this.sentences.length;
    const avgSentenceLength = wordCount / sentenceCount;
    const longSentences = this.sentences.filter(
      (s) => s.split(/\s+/).length > 20,
    ).length;

    return {
      fleschScore: Math.round(this.getFleschScore()),
      readingLevel: this.getReadingLevel(),
      stats: {
        wordCount,
        sentenceCount,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        longSentences,
        avgSyllablesPerWord: Math.round((this.syllables / wordCount) * 10) / 10,
      },
    };
  }
}

class SEOAnalyzer {
  constructor() {
    this.originalHTML = "";
    this.wordFrequency = new Map();
    this.commonWords = new Set([
      "the",
      "be",
      "to",
      "of",
      "and",
      "a",
      "in",
      "that",
      "have",
      "i",
      "it",
      "for",
      "not",
      "on",
      "with",
      "he",
      "as",
      "you",
      "do",
      "at",
      "this",
      "but",
      "his",
      "by",
      "from",
      "they",
      "we",
      "say",
      "her",
      "she",
    ]);
    this.colors = [
      "#fb4934",
      "#b8bb26",
      "#fabd2f",
      "#83a598",
      "#d3869b",
      "#8ec07c",
      "#fe8019",
      "#cc241d",
      "#98971a",
      "#d79921",
      "#458588",
      "#b16286",
    ];
    this.definitions = new Map();
    this.readabilityStats = null;
    this.keywordDensity = new Map();
    this.metaInfo = null;
    this.technicalSEO = null;
  }

  async analyze() {
    this.originalHTML = document.documentElement.outerHTML;
    await this.extractTextContent();
    this.processWordFrequency();
    this.analyzeReadability();
    this.analyzeKeywordDensity();
    this.analyzeMetaTags();
    this.analyzeTechnicalSEO();
    this.renderUI();
  }

  async extractTextContent() {
    this.textContent = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            return NodeFilter.FILTER_ACCEPT;
          }
          const tagName = node.tagName.toLowerCase();
          if (["script", "style", "noscript"].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (["h1", "h2", "h3", "h4", "h5", "h6", "p"].includes(tagName)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        },
      },
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const text = currentNode.textContent.trim();
        if (text) {
          this.textContent.push({
            type: currentNode.tagName.toLowerCase(),
            content: text,
            isHeading: /^h[1-6]$/.test(currentNode.tagName.toLowerCase()),
          });
        }
      }
    }
  }

  processWordFrequency() {
    const text = this.textContent
      .map((item) => item.content)
      .join(" ")
      .toLowerCase();

    const words = text.match(/\b\w+\b/g) || [];
    const totalWords = words.length;

    this.wordFrequency.clear();
    words.forEach((word) => {
      if (!this.commonWords.has(word) && word.length > 2) {
        this.wordFrequency.set(word, (this.wordFrequency.get(word) || 0) + 1);
      }
    });

    // Calculate keyword density
    this.wordFrequency.forEach((count, word) => {
      this.keywordDensity.set(word, ((count / totalWords) * 100).toFixed(2));
    });
  }

  async getWordDetails(word) {
    if (this.definitions.has(word)) {
      return this.definitions.get(word);
    }

    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      );
      const data = await response.json();

      const details = {
        definition:
          data[0]?.meanings[0]?.definitions[0]?.definition ||
          "Definition not found",
        synonyms: data[0]?.meanings[0]?.synonyms || [],
        partOfSpeech: data[0]?.meanings[0]?.partOfSpeech || "unknown",
      };

      this.definitions.set(word, details);
      return details;
    } catch (error) {
      return {
        definition: "Definition not available",
        synonyms: [],
        partOfSpeech: "unknown",
      };
    }
  }

  analyzeReadability() {
    const textContent = this.textContent.map((item) => item.content).join(" ");

    const analyzer = new ReadabilityAnalyzer(textContent);
    this.readabilityStats = analyzer.getStats();
  }

  analyzeKeywordDensity() {
    // Analyze keyword placement in headings
    const headingWords = new Set();
    this.textContent
      .filter((item) => item.isHeading)
      .forEach((item) => {
        const words = item.content.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach((word) => headingWords.add(word));
      });

    // Update keyword data with placement info
    this.keywordDensity.forEach((density, word) => {
      const inHeadings = headingWords.has(word);
      const frequency = this.wordFrequency.get(word);
      this.keywordDensity.set(word, {
        density: parseFloat(density),
        frequency,
        inHeadings,
        isOverused: density > 5, // Flag if density is over 5%
      });
    });
  }

  analyzeMetaTags() {
    this.metaInfo = {
      title: document.title,
      description:
        document.querySelector('meta[name="description"]')?.content || "",
      keywords: document.querySelector('meta[name="keywords"]')?.content || "",
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      ogTags: Array.from(
        document.querySelectorAll('meta[property^="og:"]'),
      ).map((tag) => ({
        property: tag.getAttribute("property"),
        content: tag.content,
      })),
    };
  }

  analyzeTechnicalSEO() {
    // Basic technical SEO checks
    this.technicalSEO = {
      images: {
        total: document.images.length,
        missingAlt: Array.from(document.images).filter((img) => !img.alt)
          .length,
      },
      links: {
        internal: Array.from(document.links).filter(
          (link) => link.hostname === window.location.hostname,
        ).length,
        external: Array.from(document.links).filter(
          (link) => link.hostname !== window.location.hostname,
        ).length,
        broken: 0, // Would need actual HTTP checks
      },
      headings: {
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        h3: document.querySelectorAll("h3").length,
      },
      hasStructuredData:
        document.querySelector('script[type="application/ld+json"]') !== null,
    };
  }

  renderUI() {
    const template = `
      <div class="seo-wrapper">
        <header class="seo-header">
          <h1>SEO Word Frequency Analyzer</h1>
          <div class="seo-controls">
            <button id="seo-toggle-readable" class="seo-button">Toggle Readable View</button>
            <button id="seo-toggle-technical" class="seo-button">Technical SEO</button>
            <button id="seo-dismiss" class="seo-dismiss">✕</button>
          </div>
        </header>

        <main class="seo-content">
          <div class="seo-split-view">
            <div class="seo-primary-panel">
              <section class="seo-word-cloud-container">
                <h2>Word Frequency Cloud</h2>
                <div id="seo-word-cloud"></div>
                <div id="seo-word-details" class="seo-word-details hidden">
                  <h3 class="seo-word-title"></h3>
                  <p class="seo-word-count"></p>
                  <p class="seo-word-density"></p>
                  <p class="seo-word-definition"></p>
                  <div class="seo-word-synonyms"></div>
                </div>
              </section>

              <section class="seo-readability-card">
                <h2>Readability Analysis</h2>
                <div class="seo-readability-score">
                  <div class="score-circle ${this.getScoreClass()}">
                    ${this.readabilityStats.fleschScore}
                  </div>
                  <p>Flesch Reading Ease: ${this.readabilityStats.readingLevel}</p>
                </div>
                <div class="seo-readability-stats">
                  ${this.renderReadabilityStats()}
                </div>
              </section>
            </div>

            <div class="seo-secondary-panel">
              <section class="seo-meta-info">
                <h2>Meta Information</h2>
                ${this.renderMetaInfo()}
              </section>

              <section id="seo-technical" class="seo-technical hidden">
                <h2>Technical SEO Analysis</h2>
                ${this.renderTechnicalSEO()}
              </section>

              <div id="seo-readable-view" class="seo-readable-view hidden">
                ${this.renderReadableContent()}
              </div>
            </div>
          </div>
        </main>

        <footer class="seo-footer">
          <button id="seo-export-md" class="seo-button">Export Markdown</button>
          <button id="seo-export-json" class="seo-button">Export Analysis</button>
          <button id="seo-export-report" class="seo-button">Export Full Report</button>
        </footer>
      </div>
    `;

    document.body.innerHTML = template;
    this.renderWordCloud();
    this.attachEventListeners();
  }

  renderWordCloud() {
    const container = document.getElementById("seo-word-cloud");
    const words = Array.from(this.wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);

    const maxFreq = Math.max(...words.map(([_, freq]) => freq));
    const minFreq = Math.min(...words.map(([_, freq]) => freq));

    words.forEach(([word, freq], index) => {
      const size = this.mapRange(freq, minFreq, maxFreq, 1, 4);
      const span = document.createElement("span");
      span.textContent = word;
      span.className = "seo-word";
      span.style.fontSize = `${size}rem`;
      span.style.color = this.colors[index % this.colors.length];

      span.addEventListener("mouseover", async () => {
        const details = await this.getWordDetails(word);
        const density = this.keywordDensity.get(word);
        this.updateWordDetails(word, freq, details, density);
      });

      container.appendChild(span);
    });
  }

  renderReadabilityStats() {
    const { stats } = this.readabilityStats;
    return Object.entries(stats)
      .map(
        ([key, value]) => `
      <div class="stat-item">
        <label>${this.formatLabel(key)}</label>
        <span>${value}</span>
      </div>
    `,
      )
      .join("");
  }

  renderMetaInfo() {
    return `
        <div class="seo-meta-grid">
          <div class="meta-item">
            <label>Title (${this.metaInfo.title.length} chars)</label>
            <p>${this.metaInfo.title}</p>
          </div>
          <div class="meta-item">
            <label>Description (${this.metaInfo.description.length} chars)</label>
            <p>${this.metaInfo.description}</p>
          </div>
          <div class="meta-item">
            <label>Keywords</label>
            <p>${this.metaInfo.keywords || "No keywords meta tag found"}</p>
          </div>
          <div class="meta-item">
            <label>Canonical URL</label>
            <p>${this.metaInfo.canonical || "No canonical tag found"}</p>
          </div>
        </div>
      `;
  }

  renderTechnicalSEO() {
    return `
        <div class="seo-technical-grid">
          <div class="technical-item">
            <h3>Images</h3>
            <p>Total: ${this.technicalSEO.images.total}</p>
            <p>Missing Alt: ${this.technicalSEO.images.missingAlt}</p>
          </div>
          <div class="technical-item">
            <h3>Links</h3>
            <p>Internal: ${this.technicalSEO.links.internal}</p>
            <p>External: ${this.technicalSEO.links.external}</p>
          </div>
          <div class="technical-item">
            <h3>Heading Structure</h3>
            <p>H1: ${this.technicalSEO.headings.h1}</p>
            <p>H2: ${this.technicalSEO.headings.h2}</p>
            <p>H3: ${this.technicalSEO.headings.h3}</p>
          </div>
          <div class="technical-item">
            <h3>Structured Data</h3>
            <p>${this.technicalSEO.hasStructuredData ? "Present" : "Not found"}</p>
          </div>
        </div>
      `;
  }

  renderReadableContent() {
    return this.textContent
      .map(({ type, content }) => `<${type}>${content}</${type}>`)
      .join("\n");
  }

  updateWordDetails(word, count, details, density) {
    const container = document.getElementById("seo-word-details");
    container.classList.remove("hidden");

    container.querySelector(".seo-word-title").textContent = word;
    container.querySelector(".seo-word-count").textContent =
      `Frequency: ${count}`;
    container.querySelector(".seo-word-density").textContent =
      `Density: ${density.density}% ${density.isOverused ? "(Potential keyword stuffing)" : ""}`;
    container.querySelector(".seo-word-definition").textContent =
      `Definition: ${details.definition}`;

    const synonymsContainer = container.querySelector(".seo-word-synonyms");
    synonymsContainer.innerHTML = details.synonyms.length
      ? `Synonyms: ${details.synonyms.join(", ")}`
      : "No synonyms found";
  }

  mapRange(value, in_min, in_max, out_min, out_max) {
    return (
      ((value - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    );
  }

  formatLabel(key) {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([A-Z])/g, " $1")
      .trim();
  }

  getScoreClass() {
    const score = this.readabilityStats.fleschScore;
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-fair";
    return "score-poor";
  }

  attachEventListeners() {
    document
      .getElementById("seo-dismiss")
      .addEventListener("click", () => this.dismiss());

    document
      .getElementById("seo-toggle-readable")
      .addEventListener("click", () => {
        document.getElementById("seo-readable-view").classList.toggle("hidden");
        document.getElementById("seo-technical").classList.add("hidden");
      });

    document
      .getElementById("seo-toggle-technical")
      .addEventListener("click", () => {
        document.getElementById("seo-technical").classList.toggle("hidden");
        document.getElementById("seo-readable-view").classList.add("hidden");
      });

    document
      .getElementById("seo-export-md")
      .addEventListener("click", () => this.exportMarkdown());

    document
      .getElementById("seo-export-json")
      .addEventListener("click", () => this.exportJSON());

    document
      .getElementById("seo-export-report")
      .addEventListener("click", () => this.exportFullReport());
  }

  dismiss() {
    document.documentElement.innerHTML = this.originalHTML;
    location.reload();
  }

  exportMarkdown() {
    const markdown = this.textContent
      .map(({ type, content }) => {
        const headerLevel = type.match(/h(\d)/)?.[1] || "";
        return headerLevel
          ? `${"#".repeat(parseInt(headerLevel))} ${content}`
          : content;
      })
      .join("\n\n");

    this.downloadFile("webpage-content.md", markdown, "text/markdown");
  }

  exportJSON() {
    const data = {
      wordFrequency: Object.fromEntries(this.wordFrequency),
      keywordDensity: Object.fromEntries(this.keywordDensity),
      readabilityStats: this.readabilityStats,
      metaInfo: this.metaInfo,
      technicalSEO: this.technicalSEO,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    this.downloadFile(
      "seo-analysis.json",
      JSON.stringify(data, null, 2),
      "application/json",
    );
  }

  exportFullReport() {
    const report = `# SEO Analysis Report
  Generated for: ${window.location.href}
  Date: ${new Date().toLocaleDateString()}

  ## Readability Analysis
  - Flesch Reading Ease: ${this.readabilityStats.fleschScore} (${this.readabilityStats.readingLevel})
  - Word Count: ${this.readabilityStats.stats.wordCount}
  - Average Sentence Length: ${this.readabilityStats.stats.avgSentenceLength}
  - Long Sentences: ${this.readabilityStats.stats.longSentences}

  ## Top Keywords
  ${Array.from(this.keywordDensity.entries())
    .sort((a, b) => b[1].density - a[1].density)
    .slice(0, 20)
    .map(
      ([word, data]) =>
        `- ${word}: ${data.density}% (${data.frequency} occurrences)${data.inHeadings ? " (Used in headings)" : ""}`,
    )
    .join("\n")}

  ## Meta Information
  - Title: ${this.metaInfo.title}
  - Description: ${this.metaInfo.description}
  - Keywords: ${this.metaInfo.keywords}
  - Canonical URL: ${this.metaInfo.canonical}

  ## Technical SEO Analysis
  ### Images
  - Total Images: ${this.technicalSEO.images.total}
  - Images Missing Alt Text: ${this.technicalSEO.images.missingAlt}

  ### Links
  - Internal Links: ${this.technicalSEO.links.internal}
  - External Links: ${this.technicalSEO.links.external}

  ### Heading Structure
  - H1 Tags: ${this.technicalSEO.headings.h1}
  - H2 Tags: ${this.technicalSEO.headings.h2}
  - H3 Tags: ${this.technicalSEO.headings.h3}

  ### Other Checks
  - Structured Data: ${this.technicalSEO.hasStructuredData ? "Present" : "Not found"}

  ## Recommendations
  ${this.generateRecommendations()}`;

    this.downloadFile("seo-full-report.md", report, "text/markdown");
  }

  generateRecommendations() {
    const recs = [];

    // Title recommendations
    if (this.metaInfo.title.length < 30 || this.metaInfo.title.length > 60) {
      recs.push("- Adjust title length to be between 30-60 characters");
    }

    // Description recommendations
    if (
      this.metaInfo.description.length < 120 ||
      this.metaInfo.description.length > 160
    ) {
      recs.push(
        "- Optimize meta description length to be between 120-160 characters",
      );
    }

    // Heading structure
    if (this.technicalSEO.headings.h1 !== 1) {
      recs.push("- Ensure page has exactly one H1 tag");
    }

    // Image recommendations
    if (this.technicalSEO.images.missingAlt > 0) {
      recs.push(
        `- Add alt text to ${this.technicalSEO.images.missingAlt} images`,
      );
    }

    // Readability recommendations
    if (this.readabilityStats.fleschScore < 60) {
      recs.push(
        "- Improve readability by using shorter sentences and simpler words",
      );
    }

    // Keyword density warnings
    const overusedKeywords = Array.from(this.keywordDensity.entries())
      .filter(([_, data]) => data.density > 5)
      .map(([word]) => word);

    if (overusedKeywords.length > 0) {
      recs.push(
        `- Review potential keyword stuffing for: ${overusedKeywords.join(", ")}`,
      );
    }

    return recs.join("\n");
  }

  downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize analyzer and listen for messages
window.seoAnalyzer = new SEOAnalyzer();
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyze") {
    window.seoAnalyzer.analyze();
    sendResponse({ success: true });
  }
});
