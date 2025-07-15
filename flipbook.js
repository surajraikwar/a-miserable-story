// Digital Flipbook with Dynamic Content Loading
class DigitalFlipbook {
  constructor() {
    // State
    this.currentPage = 0;
    this.totalPages = 0;
    this.isAnimating = false;
    this.isMobile = window.innerWidth <= 768;
    
    // DOM Elements
    this.bookCover = document.getElementById('book-cover');
    this.bookContainer = document.getElementById('book-container');
    this.leftPage = document.getElementById('left-page');
    this.rightPage = document.getElementById('right-page');
    this.currentPageSpan = document.getElementById('current-page');
    this.totalPagesSpan = document.getElementById('total-pages');
    this.mobileCurrentPageSpan = document.getElementById('mobile-current-page');
    this.mobileTotalPagesSpan = document.getElementById('mobile-total-pages');
    this.prevBtn = document.querySelector('.prev-btn');
    this.nextBtn = document.querySelector('.next-btn');
    this.openBookBtn = document.querySelector('.open-book-btn');
    
    // Book content
    this.bookMetadata = null;
    this.chapters = [];
    this.pages = [];
    this.loadedChapters = new Map();
    
    // Initialize
    this.init();
  }
  
  async init() {
    try {
      // Load book metadata first
      await this.loadBookMetadata();
      
      // Event listeners
      this.openBookBtn.addEventListener('click', () => this.openBook());
      this.prevBtn.addEventListener('click', () => this.turnPage('prev'));
      this.nextBtn.addEventListener('click', () => this.turnPage('next'));
      
      // Touch events for mobile
      this.setupTouchEvents();
      
      // Keyboard navigation
      document.addEventListener('keydown', (e) => this.handleKeyboard(e));
      
      // Window resize handler
      window.addEventListener('resize', () => this.handleResize());
      
    } catch (error) {
      console.error('Failed to initialize book:', error);
      this.showError('Failed to load book content. Please refresh the page.');
    }
  }
  
  async loadBookMetadata() {
    try {
      const response = await fetch('content/book-metadata.json');
      if (!response.ok) throw new Error('Failed to load metadata');
      
      this.bookMetadata = await response.json();
      this.chapters = this.bookMetadata.chapters;
      
      // Set book title and author dynamically
      const coverTitle = this.bookCover.querySelector('h1');
      const coverAuthor = this.bookCover.querySelector('.author');
      if (coverTitle) coverTitle.textContent = this.bookMetadata.title;
      if (coverAuthor) coverAuthor.textContent = `By ${this.bookMetadata.author}`;
      
      // Calculate total pages (each chapter is spread across multiple pages)
      this.totalPages = this.chapters.length;
      this.totalPages = this.isMobile ? this.chapters.length : Math.ceil(this.chapters.length / 2) * 2;
      
      // Update page counters
      this.totalPagesSpan.textContent = this.totalPages;
      if (this.mobileTotalPagesSpan) {
        this.mobileTotalPagesSpan.textContent = this.totalPages;
      }
      
    } catch (error) {
      console.error('Failed to load book metadata:', error);
      // Fallback to demo content
      this.setupDemoContent();
    }
  }
  
  async loadChapter(chapterId) {
    try {
      if (this.loadedChapters.has(chapterId)) {
        return this.loadedChapters.get(chapterId);
      }
      
      const chapter = this.chapters.find(ch => ch.id === chapterId);
      if (!chapter) throw new Error(`Chapter ${chapterId} not found`);
      
      const response = await fetch(`content/${chapter.file}`);
      if (!response.ok) throw new Error(`Failed to load ${chapter.file}`);
      
      const chapterData = await response.json();
      
      // Process chapter content into formatted HTML
      const formattedContent = this.formatChapterContent(chapterData);
      
      this.loadedChapters.set(chapterId, formattedContent);
      this.pages[chapterId - 1] = formattedContent;
      
      return formattedContent;
      
    } catch (error) {
      console.error(`Failed to load chapter ${chapterId}:`, error);
      // Return placeholder content
      return {
        title: `Chapter ${chapterId}`,
        content: `<h2>Chapter ${chapterId}</h2><p>Content could not be loaded.</p>`
      };
    }
  }
  
  formatChapterContent(chapterData) {
    const title = `<h2>${chapterData.title}</h2>`;
    const content = chapterData.content
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
    
    return {
      title: chapterData.title,
      content: title + content,
      raw: chapterData.content
    };
  }
  
  setupDemoContent() {
    // Fallback demo content if JSON files can't be loaded
    this.chapters = [
      { id: 1, title: "Chapter 1: Demo", file: "chapter1.json" }
    ];
    this.totalPages = 1;
    this.totalPagesSpan.textContent = this.totalPages;
    if (this.mobileTotalPagesSpan) {
      this.mobileTotalPagesSpan.textContent = this.totalPages;
    }
    
    this.pages = [{
      title: "Demo Chapter",
      content: "<h2>Demo Chapter</h2><p>This is demo content. Please ensure the content files are properly loaded.</p>"
    }];
  }
  
  async openBook() {
    // Load first chapter before opening
    if (this.pages.length === 0 && this.chapters.length > 0) {
      await this.loadChapter(1);
    }
    
    // Animate book opening
    this.bookCover.style.transform = 'rotateY(-180deg)';
    this.bookCover.style.opacity = '0';
    
    setTimeout(() => {
      this.bookCover.classList.add('hidden');
      this.bookContainer.classList.remove('hidden');
      this.bookContainer.style.display = 'block';
      
      // Load initial pages
      this.loadPages();
      
      // Show swipe hint on mobile
      if (this.isMobile) {
        setTimeout(() => {
          const hint = document.querySelector('.swipe-hint');
          if (hint) hint.style.animation = 'fadeInOut 3s ease forwards';
        }, 1000);
      }
    }, 600);
  }
  
  async loadPages() {
    // Ensure current chapter is loaded
    const currentChapter = Math.min(this.currentPage, this.chapters.length);
    if (!this.pages[currentChapter - 1]) {
      await this.loadChapter(currentChapter);
    }
    
    if (this.isMobile) {
      this.loadSinglePage();
    } else {
      this.loadSpread();
    }
    
    this.updateNavigation();
  }
  
  loadSinglePage() {
    const pageData = this.pages[this.currentPage - 1];
    if (pageData) {
      this.leftPage.querySelector('.page-content').innerHTML = pageData.content;
      this.leftPage.querySelector('.page-number').textContent = this.currentPage;
    }
    this.rightPage.style.display = 'none';
  }
  
  async loadSpread() {
    // For desktop, show current chapter on left, next chapter on right
    let leftPageNum = this.currentPage;
    let rightPageNum = this.currentPage + 1;
    
    // Load left page
    if (leftPageNum > 0 && leftPageNum <= this.chapters.length) {
      if (!this.pages[leftPageNum - 1]) {
        await this.loadChapter(leftPageNum);
      }
      const leftPageData = this.pages[leftPageNum - 1];
      if (leftPageData) {
        this.leftPage.querySelector('.page-content').innerHTML = leftPageData.content;
        this.leftPage.querySelector('.page-number').textContent = leftPageNum;
        this.leftPage.style.display = 'block';
      }
    } else {
      this.leftPage.querySelector('.page-content').innerHTML = '';
      this.leftPage.querySelector('.page-number').textContent = '';
    }
    
    // Load right page
    if (rightPageNum <= this.chapters.length) {
      if (!this.pages[rightPageNum - 1]) {
        await this.loadChapter(rightPageNum);
      }
      const rightPageData = this.pages[rightPageNum - 1];
      if (rightPageData) {
        this.rightPage.querySelector('.page-content').innerHTML = rightPageData.content;
        this.rightPage.querySelector('.page-number').textContent = rightPageNum;
        this.rightPage.style.display = 'block';
      }
    } else {
      this.rightPage.querySelector('.page-content').innerHTML = '';
      this.rightPage.querySelector('.page-number').textContent = '';
      this.rightPage.style.display = 'block';
    }
  }
  
  turnPage(direction) {
    if (this.isAnimating) return;
    
    const canTurnPrev = this.currentPage > 0;
    const canTurnNext = this.currentPage < this.totalPages;
    
    if (direction === 'prev' && !canTurnPrev) return;
    if (direction === 'next' && !canTurnNext) return;
    
    this.isAnimating = true;
    
    // Animate page turn
    this.animatePageTurn(direction, () => {
      // Update current page
      if (direction === 'prev') {
        this.currentPage = this.isMobile ? this.currentPage - 1 : Math.max(0, this.currentPage - 2);
      } else {
        this.currentPage = this.isMobile ? this.currentPage + 1 : Math.min(this.totalPages, this.currentPage + 2);
      }
      
      // Load new pages
      this.loadPages();
      this.isAnimating = false;
    });
  }
  
  animatePageTurn(direction, callback) {
    const book = document.querySelector('.book');
    
    if (this.isMobile) {
      // 3D page flip for mobile
      const page = this.leftPage;
      page.classList.add('flipping');
      
      if (direction === 'next') {
        page.style.transform = 'rotateY(-180deg)';
      } else {
        page.style.transform = 'rotateY(0deg)';
      }
      
      setTimeout(() => {
        callback();
        page.classList.remove('flipping');
        page.style.transform = '';
      }, 600);
    } else {
      // 3D page flip for desktop
      if (direction === 'next') {
        this.rightPage.classList.add('flipping');
        this.rightPage.style.transform = 'rotateY(-180deg)';
      } else {
        this.leftPage.classList.add('flipping');
        this.leftPage.style.transform = 'rotateY(180deg)';
      }
      
      setTimeout(() => {
        callback();
        this.leftPage.classList.remove('flipping');
        this.rightPage.classList.remove('flipping');
        this.leftPage.style.transform = '';
        this.rightPage.style.transform = '';
      }, 600);
    }
  }
  
  updateNavigation() {
    // Update page indicator
    let displayPage = this.isMobile ? this.currentPage : this.currentPage;
    if (this.currentPage === 0) displayPage = 0;
    if (this.currentPage > this.totalPages) displayPage = this.totalPages;

    this.currentPageSpan.textContent = displayPage;
    if (this.mobileCurrentPageSpan) {
      this.mobileCurrentPageSpan.textContent = displayPage;
    }
    
    // Update button states
    this.prevBtn.disabled = this.currentPage <= 0;
    this.nextBtn.disabled = this.currentPage >= this.totalPages;
  }
  
  setupTouchEvents() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isDragging = false;
    
    const bookWrapper = document.querySelector('.book-wrapper');
    const page = this.leftPage;
    
    bookWrapper.addEventListener('touchstart', (e) => {
      if (this.isAnimating) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isDragging = true;
      
      // Add transition for smooth dragging
      if (this.isMobile) {
        page.style.transition = 'none';
      }
    }, { passive: true });
    
    bookWrapper.addEventListener('touchmove', (e) => {
      if (!isDragging || this.isAnimating || !this.isMobile) return;
      
      const currentX = e.touches[0].clientX;
      const diffX = currentX - touchStartX;
      const diffY = Math.abs(e.touches[0].clientY - touchStartY);
      
      // Only track horizontal swipes
      if (Math.abs(diffX) > diffY) {
        e.preventDefault();
        
        // Visual feedback during swipe
        const maxDrag = window.innerWidth * 0.3;
        const dragPercent = Math.min(Math.max(diffX / window.innerWidth, -0.3), 0.3);
        const opacity = 1 - Math.abs(dragPercent) * 2;
        
        page.style.transform = `translateX(${diffX}px) scale(${1 - Math.abs(dragPercent) * 0.1})`;
        page.style.opacity = opacity;
      }
    }, { passive: false });
    
    bookWrapper.addEventListener('touchend', (e) => {
      if (!isDragging || this.isAnimating) return;
      isDragging = false;
      
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      
      // Re-enable transitions
      if (this.isMobile) {
        page.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
      }
      
      this.handleSwipe();
    }, { passive: true });
    
    // Handle touch cancel (e.g., when call comes in)
    bookWrapper.addEventListener('touchcancel', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      // Reset page position
      if (this.isMobile) {
        page.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        page.style.transform = 'translateX(0) scale(1)';
        page.style.opacity = '1';
      }
    }, { passive: true });
    
    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diffX = touchStartX - touchEndX;
      const diffY = Math.abs(touchStartY - touchEndY);
      
      // Only register horizontal swipes (ignore vertical swipes)
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
        const page = this.leftPage;
        page.style.transform = 'translateX(0) scale(1)';
        page.style.opacity = '1';
      }
    };
    
    this.handleSwipe = handleSwipe;
  }
  
  handleKeyboard(e) {
    if (e.key === 'ArrowLeft') {
      this.turnPage('prev');
    } else if (e.key === 'ArrowRight') {
      this.turnPage('next');
    }
  }
  
  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== this.isMobile) {
      // Reload pages with new layout
      this.loadPages();
    }
  }
  
  showError(message) {
    console.error(message);
    // You can implement a user-friendly error display here
  }
}

// Initialize flipbook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DigitalFlipbook();
});
