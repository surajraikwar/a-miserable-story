// Enhanced Digital Flipbook with Advanced Features
class EnhancedDigitalFlipbook {
  constructor() {
    // State management
    this.currentPage = 1;
    this.totalPages = 0;
    this.isAnimating = false;
    this.isMobile = window.innerWidth <= 768;
    
    // Book data
    this.bookMetadata = null;
    this.chapters = [];
    this.pages = [];
    this.loadedChapters = new Map();
    this.pageMap = new Map(); // Maps page numbers to chapters
    
    // DOM elements
    this.loadingScreen = document.getElementById('loading-screen');
    this.bookCover = document.getElementById('book-cover');
    this.tableOfContents = document.getElementById('table-of-contents');
    this.bookContainer = document.getElementById('book-container');
    this.leftPage = document.getElementById('left-page');
    this.rightPage = document.getElementById('right-page');
    this.leftContent = document.getElementById('left-content');
    this.rightContent = document.getElementById('right-content');
    this.leftPageNumber = document.getElementById('left-page-number');
    this.rightPageNumber = document.getElementById('right-page-number');
    this.currentPageSpan = document.getElementById('current-page');
    this.totalPagesSpan = document.getElementById('total-pages');
    this.mobileCurrentPageSpan = document.getElementById('mobile-current-page');
    this.mobileTotalPagesSpan = document.getElementById('mobile-total-pages');
    this.progressFill = document.getElementById('progress-fill');
    this.progressText = document.getElementById('progress-text');
    this.pageFlipOverlay = document.getElementById('page-flip-overlay');
    
    // Button elements
    this.openBookBtn = document.getElementById('open-book-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.menuBtn = document.getElementById('menu-btn');
    this.closeBookBtn = document.getElementById('close-book-btn');
    this.closeTocBtn = document.getElementById('close-toc');
    this.startReadingBtn = document.getElementById('start-reading-btn');
    
    // Touch handling
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.touchEndY = 0;
    this.isDragging = false;
    
    // Initialize
    this.init();
  }
  
  async init() {
    console.log('Initializing flipbook...');
    try {
      // Show loading screen
      this.showLoading();
      
      try {
        console.log('Loading book metadata...');
        await this.loadBookMetadata();
        console.log('Book metadata loaded successfully');
        
        if (!this.bookMetadata || !this.chapters || this.chapters.length === 0) {
          throw new Error('No book metadata or chapters found');
        }
        
        console.log('Processing chapters...');
        await this.processAllChapters();
        console.log('Chapters processed successfully');
        
      } catch (error) {
        console.error('Error loading book content:', error);
        // Try to fall back to demo content
        console.log('Attempting to load demo content...');
        this.setupDemoContent();
      }
      
      // Setup UI components
      try {
        console.log('Setting up UI components...');
        this.setupEventListeners();
        this.setupTouchEvents();
        this.setupKeyboardEvents();
        this.setupResizeHandler();
        console.log('UI components set up successfully');
      } catch (error) {
        console.error('Error setting up UI components:', error);
        throw new Error('Failed to initialize user interface');
      }
      
      console.log('Enhanced Digital Flipbook initialized successfully');
      
    } catch (error) {
      console.error('Critical error during initialization:', error);
      this.showError(`Failed to initialize book: ${error.message}. Please refresh the page.`);
      
      // As a last resort, try to show demo content
      try {
        this.setupDemoContent();
      } catch (e) {
        console.error('Failed to load demo content:', e);
      }
    } finally {
      // Always hide loading screen
      this.hideLoading();
      
      // Ensure the book container is visible if we have content
      if (this.pages && this.pages.length > 0) {
        this.bookContainer.classList.remove('hidden');
      }
    }
  }
  
  showLoading() {
    this.loadingScreen.classList.remove('hidden');
    const progressBar = document.querySelector('.loading-progress');
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      progressBar.style.width = progress + '%';
    }, 100);
  }
  
  hideLoading() {
    setTimeout(() => {
      this.loadingScreen.style.opacity = '0';
      setTimeout(() => {
        this.loadingScreen.classList.add('hidden');
      }, 500);
    }, 500);
  }
  
  async loadBookMetadata() {
    try {
      // Try multiple possible paths for the metadata file
      const possiblePaths = [
        'book-metadata.json',
        '/book-metadata.json',
        'content/book-metadata.json',
        '/content/book-metadata.json',
        './book-metadata.json',
        './content/book-metadata.json'
      ];
      
      let lastError;
      for (const path of possiblePaths) {
        try {
          console.log(`Trying to load metadata from: ${path}`);
          const response = await fetch(path);
          if (response.ok) {
            this.bookMetadata = await response.json();
            this.chapters = this.bookMetadata.chapters || [];
            console.log('Successfully loaded metadata:', this.bookMetadata);
            
            // If no chapters found, throw an error
            if (this.chapters.length === 0) {
              throw new Error('No chapters found in metadata');
            }
            
            // Update cover with metadata
            this.updateCover();
            return; // Success, exit the function
          }
        } catch (e) {
          lastError = e;
          console.warn(`Failed to load metadata from ${path}:`, e.message);
          continue;
        }
      }
      
      // If we get here, all paths failed
      throw lastError || new Error('Failed to load metadata from any location');
      
    } catch (error) {
      console.error('Failed to load book metadata:', error);
      this.setupDemoContent();
    }
  }
  
  updateCover() {
    if (!this.bookMetadata) return;
    
    const title = this.bookCover.querySelector('.book-title');
    const author = this.bookCover.querySelector('.book-author');
    
    if (title) title.textContent = this.bookMetadata.title;
    if (author) author.textContent = `By ${this.bookMetadata.author}`;
  }
  
  async processAllChapters() {
    console.log('Starting to process all chapters...');
    this.pages = [];
    this.pageMap.clear();
    let pageNumber = 1;
    
    if (!this.chapters || this.chapters.length === 0) {
      console.error('No chapters found to process');
      this.setupDemoContent();
      return;
    }
    
    console.log(`Found ${this.chapters.length} chapters in metadata`);
    
    for (const chapter of this.chapters) {
      console.log(`Processing chapter ${chapter.id}: ${chapter.title}`);
      
      try {
        const chapterData = await this.loadChapter(chapter.id);
        console.log(`Loaded chapter ${chapter.id} with ${chapterData.content ? chapterData.content.length : 0} content items`);
        
        const chapterPages = this.paginateChapter(chapterData, chapter.id);
        console.log(`Paginated into ${chapterPages.length} pages`);
        
        // Map each page to its chapter
        for (const page of chapterPages) {
          this.pageMap.set(pageNumber, {
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            pageData: page
          });
          pageNumber++;
        }
        
        this.pages.push(...chapterPages);
      } catch (error) {
        console.error(`Error processing chapter ${chapter.id}:`, error);
        // Skip to next chapter on error
        continue;
      }
    }
    
    this.totalPages = this.pages.length;
    console.log(`Total pages processed: ${this.totalPages}`);
    
    if (this.totalPages === 0) {
      console.warn('No pages were processed. Falling back to demo content.');
      this.setupDemoContent();
      return;
    }
    
    this.updatePageCounters();
    this.updateProgress();
    this.generateTableOfContents();
    this.jumpToPage(1); // Start with the first page
  }
  
  async loadChapter(chapterId) {
    try {
      // Check if chapter is already loaded
      if (this.loadedChapters.has(chapterId)) {
        return this.loadedChapters.get(chapterId);
      }
      
      // Find the chapter in the metadata
      const chapter = this.chapters.find(ch => ch.id === chapterId);
      if (!chapter) throw new Error(`Chapter ${chapterId} not found in metadata`);
      
      console.log(`Loading chapter ${chapterId}: ${chapter.title}`);
      
      // Try multiple possible paths for the chapter file
      const possiblePaths = [
        // Try direct path first (as specified in metadata)
        chapter.file,
        
        // Try with various path combinations
        `content/${chapter.file}`,
        `/${chapter.file}`,
        `/content/${chapter.file}`,
        `./${chapter.file}`,
        `./content/${chapter.file}`,
        
        // Try with just the filename (in case path is included in the filename)
        chapter.file.split('/').pop(),
        `content/${chapter.file.split('/').pop()}`,
        
        // Try with chapter{id}.json pattern
        `chapter${chapterId}.json`,
        `content/chapter${chapterId}.json`,
        `/chapter${chapterId}.json`,
        `/content/chapter${chapterId}.json`
      ];
      
      // Remove duplicate paths
      const uniquePaths = [...new Set(possiblePaths)];
      
      let lastError;
      for (const path of uniquePaths) {
        try {
          console.log(`Trying to load chapter from: ${path}`);
          const response = await fetch(path);
          if (response.ok) {
            const chapterData = await response.json();
            console.log(`Successfully loaded chapter ${chapterId} from ${path}`);
            this.loadedChapters.set(chapterId, chapterData);
            return chapterData;
          } else {
            console.warn(`Request to ${path} failed with status: ${response.status}`);
          }
        } catch (e) {
          lastError = e;
          console.warn(`Failed to load from ${path}:`, e.message);
          continue;
        }
      }
      
      // If we get here, all paths failed
      const errorMessage = lastError ? lastError.message : 'Unknown error';
      console.error(`Failed to load chapter ${chapterId} from any location`);
      throw new Error(`Failed to load chapter ${chapterId}: ${errorMessage}`);
      
    } catch (error) {
      console.error(`Error loading chapter ${chapterId}:`, error);
      return {
        title: `Chapter ${chapterId}`,
        content: [
          `Content could not be loaded for Chapter ${chapterId}.`,
          `Error: ${error.message}`,
          'Please check the browser console for more details.'
        ]
      };
    }
  }
  
  paginateChapter(chapterData, chapterId) {
    const pages = [];
    const wordsPerPage = 250; // Optimal reading experience
    
    // Format content with rich text
    const formattedContent = this.formatRichText(chapterData.content);
    
    // Split content into pages
    let currentPage = '';
    let currentWordCount = 0;
    let isFirstPage = true;
    
    for (const paragraph of formattedContent) {
      const words = paragraph.split(' ').length;
      
      if (currentWordCount + words > wordsPerPage && currentPage.length > 0) {
        // Save current page
        pages.push({
          chapterId,
          content: isFirstPage ? 
            `<h1>${chapterData.title}</h1>${currentPage}` : 
            currentPage,
          isFirstPage,
          wordCount: currentWordCount
        });
        
        // Start new page
        currentPage = `<p>${paragraph}</p>`;
        currentWordCount = words;
        isFirstPage = false;
      } else {
        currentPage += `<p>${paragraph}</p>`;
        currentWordCount += words;
      }
    }
    
    // Add remaining content
    if (currentPage.length > 0) {
      pages.push({
        chapterId,
        content: isFirstPage ? 
          `<h1>${chapterData.title}</h1>${currentPage}` : 
          currentPage,
        isFirstPage,
        wordCount: currentWordCount
      });
    }
    
    return pages;
  }
  
  formatRichText(content) {
    return content.map(paragraph => {
      let formatted = paragraph;
      
      // Format scenes (bold text between ** **)
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<span class="scene">$1</span>');
      
      // Format dialogue (italic text between * *)
      formatted = formatted.replace(/\*(.*?)\*/g, '<span class="dialogue">$1</span>');
      
      // Format emphasis (italic text between _ _)
      formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
      
      // Format strong text (bold text between __ __)
      formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
      
      return formatted;
    });
  }
  
  generateTableOfContents() {
    const tocList = document.getElementById('toc-list');
    const chapterList = document.getElementById('chapter-list');
    
    if (!tocList || !chapterList) return;
    
    tocList.innerHTML = '';
    chapterList.innerHTML = '';
    
    this.chapters.forEach(chapter => {
      // Find pages for this chapter
      const chapterPages = [];
      for (const [pageNum, pageData] of this.pageMap.entries()) {
        if (pageData.chapterId === chapter.id) {
          chapterPages.push(pageNum);
        }
      }
      
      const startPage = chapterPages.length > 0 ? chapterPages[0] : 1;
      const endPage = chapterPages.length > 0 ? chapterPages[chapterPages.length - 1] : 1;
      
      // Create TOC item
      const tocItem = document.createElement('div');
      tocItem.className = 'toc-item';
      tocItem.innerHTML = `
        <div class="toc-number">${chapter.id}</div>
        <div class="toc-title">${chapter.title}</div>
        <div class="toc-pages">${startPage}${endPage !== startPage ? `-${endPage}` : ''}</div>
      `;
      tocItem.addEventListener('click', () => this.jumpToPage(startPage));
      tocList.appendChild(tocItem);
      
      // Create chapter list item for modal
      const chapterItem = document.createElement('div');
      chapterItem.className = 'chapter-item';
      chapterItem.innerHTML = `
        <div class="chapter-number">${chapter.id}</div>
        <div class="chapter-title">${chapter.title}</div>
      `;
      chapterItem.addEventListener('click', () => {
        this.jumpToPage(startPage);
        this.hideModal();
      });
      chapterList.appendChild(chapterItem);
    });
  }
  
  setupEventListeners() {
    // Cover and navigation
    this.openBookBtn.addEventListener('click', () => this.openBook());
    this.prevBtn.addEventListener('click', () => this.turnPage('prev'));
    this.nextBtn.addEventListener('click', () => this.turnPage('next'));
    this.menuBtn.addEventListener('click', () => this.showTableOfContents());
    this.closeBookBtn.addEventListener('click', () => this.closeBook());
    this.closeTocBtn.addEventListener('click', () => this.hideTableOfContents());
    this.startReadingBtn.addEventListener('click', () => this.startReading());
    
    // Modal controls
    const modalClose = document.getElementById('modal-close');
    const chapterModal = document.getElementById('chapter-modal');
    
    if (modalClose) {
      modalClose.addEventListener('click', () => this.hideModal());
    }
    
    if (chapterModal) {
      chapterModal.addEventListener('click', (e) => {
        if (e.target === chapterModal) this.hideModal();
      });
    }
  }
  
  setupTouchEvents() {
    const bookWrapper = document.getElementById('book-wrapper');
    if (!bookWrapper) return;
    
    bookWrapper.addEventListener('touchstart', (e) => {
      if (this.isAnimating) return;
      
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
      this.isDragging = true;
      
      // Add visual feedback
      if (this.isMobile) {
        this.leftPage.style.transition = 'none';
      }
    }, { passive: true });
    
    bookWrapper.addEventListener('touchmove', (e) => {
      if (!this.isDragging || this.isAnimating || !this.isMobile) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - this.touchStartX;
      const diffY = Math.abs(currentY - this.touchStartY);
      
      // Only track horizontal swipes
      if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
        e.preventDefault();
        
        // Visual feedback during swipe
        const dragPercent = Math.min(Math.max(diffX / window.innerWidth, -0.3), 0.3);
        const opacity = 1 - Math.abs(dragPercent) * 1.5;
        const scale = 1 - Math.abs(dragPercent) * 0.05;
        
        this.leftPage.style.transform = `translateX(${diffX * 0.3}px) scale(${scale})`;
        this.leftPage.style.opacity = opacity;
      }
    }, { passive: false });
    
    bookWrapper.addEventListener('touchend', (e) => {
      if (!this.isDragging || this.isAnimating) return;
      
      this.isDragging = false;
      this.touchEndX = e.changedTouches[0].clientX;
      this.touchEndY = e.changedTouches[0].clientY;
      
      // Re-enable transitions
      if (this.isMobile) {
        this.leftPage.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      }
      
      this.handleSwipe();
    }, { passive: true });
    
    bookWrapper.addEventListener('touchcancel', () => {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      
      // Reset page position
      if (this.isMobile) {
        this.leftPage.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        this.leftPage.style.transform = 'translateX(0) scale(1)';
        this.leftPage.style.opacity = '1';
      }
    }, { passive: true });
  }
  
  handleSwipe() {
    const swipeThreshold = 50;
    const diffX = this.touchStartX - this.touchEndX;
    const diffY = Math.abs(this.touchStartY - this.touchEndY);
    
    // Only register horizontal swipes
    if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
      if (diffX > 0) {
        // Swipe left - next page
        this.turnPage('next');
      } else {
        // Swipe right - previous page
        this.turnPage('prev');
      }
    } else if (this.isMobile) {
      // Reset page position if swipe wasn't completed
      this.leftPage.style.transform = 'translateX(0) scale(1)';
      this.leftPage.style.opacity = '1';
    }
  }
  
  setupKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      if (this.bookContainer.classList.contains('hidden')) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.turnPage('prev');
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.turnPage('next');
          break;
        case 'Escape':
          e.preventDefault();
          this.closeBook();
          break;
        case 'Enter':
          if (e.target.classList.contains('toc-item')) {
            e.target.click();
          }
          break;
      }
    });
  }
  
  setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
          this.loadCurrentPages();
        }
      }, 250);
    });
  }
  
  openBook() {
    this.bookCover.style.transform = 'perspective(1000px) rotateY(-15deg) scale(0.8)';
    this.bookCover.style.opacity = '0';
    
    setTimeout(() => {
      this.bookCover.classList.add('hidden');
      this.showTableOfContents();
    }, 600);
  }
  
  showTableOfContents() {
    this.tableOfContents.classList.remove('hidden');
    this.bookContainer.classList.add('hidden');
  }
  
  hideTableOfContents() {
    this.tableOfContents.classList.add('hidden');
    this.bookCover.classList.remove('hidden');
    this.bookCover.style.transform = 'perspective(1000px) rotateY(0deg) scale(1)';
    this.bookCover.style.opacity = '1';
  }
  
  startReading() {
    this.tableOfContents.classList.add('hidden');
    this.bookContainer.classList.remove('hidden');
    this.currentPage = 1;
    this.loadCurrentPages();
    this.updateNavigation();
    this.updateProgress();
    
    // Show swipe hint on mobile
    if (this.isMobile) {
      const swipeHint = document.getElementById('swipe-hint');
      if (swipeHint) {
        swipeHint.style.animation = 'fadeInOut 4s ease';
      }
    }
  }
  
  closeBook() {
    this.bookContainer.classList.add('hidden');
    this.showTableOfContents();
  }
  
  turnPage(direction) {
    if (this.isAnimating) return;
    
    const canTurnPrev = this.currentPage > 1;
    const canTurnNext = this.currentPage < this.totalPages;
    
    if (direction === 'prev' && !canTurnPrev) return;
    if (direction === 'next' && !canTurnNext) return;
    
    this.isAnimating = true;
    
    // Animate page turn
    this.animatePageTurn(direction, () => {
      // Update current page
      if (direction === 'prev') {
        this.currentPage = this.isMobile ? this.currentPage - 1 : Math.max(1, this.currentPage - 2);
      } else {
        this.currentPage = this.isMobile ? this.currentPage + 1 : Math.min(this.totalPages, this.currentPage + 2);
      }
      
      // Load new pages
      this.loadCurrentPages();
      this.updateNavigation();
      this.updateProgress();
      
      this.isAnimating = false;
    });
  }
  
  animatePageTurn(direction, callback) {
    if (this.isMobile) {
      // Enhanced mobile animation
      const page = this.leftPage;
      
      if (direction === 'next') {
        page.style.transform = 'translateX(-100%) scale(0.9)';
        page.style.opacity = '0';
      } else {
        page.style.transform = 'translateX(100%) scale(0.9)';
        page.style.opacity = '0';
      }
      
      setTimeout(() => {
        callback();
        
        // Reset and prepare for slide in
        page.style.transition = 'none';
        if (direction === 'next') {
          page.style.transform = 'translateX(100%) scale(0.9)';
        } else {
          page.style.transform = 'translateX(-100%) scale(0.9)';
        }
        page.style.opacity = '0';
        
        // Force reflow
        page.offsetHeight;
        
        // Slide in new page
        page.style.transition = 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.4s ease';
        page.style.transform = 'translateX(0) scale(1)';
        page.style.opacity = '1';
      }, 400);
    } else {
      // Enhanced desktop 3D animation
      const pageToFlip = direction === 'next' ? this.rightPage : this.leftPage;
      
      pageToFlip.classList.add('flipping');
      this.pageFlipOverlay.style.opacity = '1';
      
      if (direction === 'next') {
        pageToFlip.style.transform = 'rotateY(-180deg)';
      } else {
        pageToFlip.style.transform = 'rotateY(180deg)';
      }
      
      setTimeout(() => {
        callback();
        
        // Reset flip state
        pageToFlip.classList.remove('flipping');
        pageToFlip.style.transform = '';
        this.pageFlipOverlay.style.opacity = '0';
      }, 800);
    }
  }
  
  loadCurrentPages() {
    if (this.isMobile) {
      this.loadSinglePage();
    } else {
      this.loadSpread();
    }
  }
  
  loadSinglePage() {
    const pageData = this.pageMap.get(this.currentPage);
    if (pageData) {
      this.leftContent.innerHTML = pageData.pageData.content;
      this.leftPageNumber.textContent = this.currentPage;
    }
    this.rightPage.style.display = 'none';
  }
  
  loadSpread() {
    // Load left page
    const leftPageData = this.pageMap.get(this.currentPage);
    if (leftPageData) {
      this.leftContent.innerHTML = leftPageData.pageData.content;
      this.leftPageNumber.textContent = this.currentPage;
      this.leftPage.style.display = 'block';
    }
    
    // Load right page
    const rightPageNum = this.currentPage + 1;
    const rightPageData = this.pageMap.get(rightPageNum);
    if (rightPageData && rightPageNum <= this.totalPages) {
      this.rightContent.innerHTML = rightPageData.pageData.content;
      this.rightPageNumber.textContent = rightPageNum;
      this.rightPage.style.display = 'block';
    } else {
      this.rightPage.style.display = 'none';
    }
  }
  
  jumpToPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > this.totalPages) return;
    
    this.currentPage = pageNumber;
    this.loadCurrentPages();
    this.updateNavigation();
    this.updateProgress();
    
    // Close table of contents and show book
    this.hideTableOfContents();
    this.bookContainer.classList.remove('hidden');
  }
  
  updateNavigation() {
    // Update page indicators
    this.currentPageSpan.textContent = this.currentPage;
    if (this.mobileCurrentPageSpan) {
      this.mobileCurrentPageSpan.textContent = this.currentPage;
    }
    
    // Update button states
    this.prevBtn.disabled = this.currentPage <= 1;
    this.nextBtn.disabled = this.currentPage >= this.totalPages;
  }
  
  updateProgress() {
    const progress = Math.round((this.currentPage / this.totalPages) * 100);
    this.progressFill.style.width = progress + '%';
    this.progressText.textContent = progress + '%';
  }
  
  updatePageCounters() {
    this.totalPagesSpan.textContent = this.totalPages;
    if (this.mobileTotalPagesSpan) {
      this.mobileTotalPagesSpan.textContent = this.totalPages;
    }
  }
  
  hideModal() {
    const modal = document.getElementById('chapter-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
  
  setupDemoContent() {
    // Fallback demo content
    this.chapters = [
      { id: 1, title: "Demo Chapter", file: "demo.json" }
    ];
    
    this.pages = [{
      chapterId: 1,
      content: '<h1>Demo Chapter</h1><p>This is demo content. Please ensure the content files are properly loaded.</p>',
      isFirstPage: true,
      wordCount: 15
    }];
    
    this.pageMap.set(1, {
      chapterId: 1,
      chapterTitle: "Demo Chapter",
      pageData: this.pages[0]
    });
    
    this.totalPages = 1;
    this.updatePageCounters();
    this.generateTableOfContents();
  }
  
  showError(message) {
    console.error(message);
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #e74c3c;
      color: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: 'Open Sans', sans-serif;
      text-align: center;
      max-width: 400px;
    `;
    errorDiv.innerHTML = `
      <h3 style="margin: 0 0 10px 0;">Error</h3>
      <p style="margin: 0;">${message}</p>
    `;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      document.body.removeChild(errorDiv);
    }, 5000);
  }
}

// Initialize the enhanced flipbook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new EnhancedDigitalFlipbook();
});
