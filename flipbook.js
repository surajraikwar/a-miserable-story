// Flipbook JavaScript
class DigitalFlipbook {
  constructor() {
    // State
    this.currentPage = 1;
    this.totalPages = 10;
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
    this.pages = this.generateBookContent();
    
    // Initialize
    this.init();
  }
  
  init() {
    // Set total pages
    this.totalPagesSpan.textContent = this.totalPages;
    if (this.mobileTotalPagesSpan) {
      this.mobileTotalPagesSpan.textContent = this.totalPages;
    }
    
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
    
    // Load initial pages
    this.loadPages();
  }
  
  generateBookContent() {
    // Sample book content - replace with your actual content
    const chapters = [
      {
        title: "Chapter 1: The Beginning",
        content: `In the realm of digital storytelling, where pixels dance and code weaves narratives, our journey begins. This is not just a book, but an experience that bridges the tactile pleasure of traditional reading with the infinite possibilities of the digital world.

        The art of creating digital books has evolved significantly over the years. What started as simple PDFs has transformed into interactive experiences that engage readers in ways previously unimaginable.`
      },
      {
        title: "Chapter 2: The Digital Revolution",
        content: `The transition from physical to digital books marked a pivotal moment in human history. Libraries that once required vast buildings could now fit in the palm of your hand. The democratization of knowledge had truly begun.

        Yet, something was lost in this transition—the sensory experience of turning pages, the weight of knowledge in your hands, the smell of paper and ink. Digital flipbooks aim to restore some of that magic.`
      },
      {
        title: "Chapter 3: Interactive Elements",
        content: `Modern digital books can include videos, animations, and interactive diagrams. Readers can highlight text, make notes, and share passages with friends instantly. The book has become a living document.

        <img src="https://via.placeholder.com/400x300/667eea/ffffff?text=Interactive+Diagram" alt="Interactive diagram example" />
        
        These capabilities open new avenues for education and entertainment alike.`
      },
      {
        title: "Chapter 4: The Reading Experience",
        content: `User experience design plays a crucial role in digital book creation. The interface must be intuitive, the typography readable, and the navigation seamless. Every element should enhance, not distract from, the reading experience.

        Consider factors like font size, line spacing, and color contrast. These seemingly minor details can make the difference between a book that's a joy to read and one that causes eye strain.`
      },
      {
        title: "Chapter 5: Responsive Design",
        content: `A digital book must adapt to various screen sizes and orientations. What looks perfect on a desktop might be unreadable on a phone. Responsive design ensures that your content is accessible to all readers, regardless of their device.

        This flexibility is one of the greatest advantages of digital books. A single publication can serve readers on smartphones, tablets, e-readers, and desktop computers.`
      },
      {
        title: "Chapter 6: Animation and Effects",
        content: `Subtle animations can enhance the reading experience without being distracting. Page turns should feel natural, transitions smooth. The goal is to create an interface that feels as intuitive as a physical book while leveraging the unique capabilities of digital media.

        Effects should serve the content, not overshadow it. A well-placed animation can guide the reader's attention or provide visual feedback that enhances understanding.`
      },
      {
        title: "Chapter 7: Accessibility",
        content: `Digital books have the potential to be more accessible than their physical counterparts. Text can be resized, colors adjusted for better contrast, and screen readers can voice the content for visually impaired users.

        Implementing proper accessibility features isn't just good practice—it's essential for creating truly inclusive digital experiences.`
      },
      {
        title: "Chapter 8: Performance",
        content: `Loading times and smooth animations are crucial for user satisfaction. Optimize images, lazy-load content, and minimize JavaScript execution to ensure your digital book performs well even on older devices.

        Remember that not all readers have high-speed internet or powerful devices. Performance optimization ensures your book reaches the widest possible audience.`
      },
      {
        title: "Chapter 9: The Future",
        content: `As technology advances, so too will the possibilities for digital books. Virtual reality, augmented reality, and artificial intelligence all promise to revolutionize how we create and consume written content.

        Imagine books that adapt their narrative based on reader preferences, or educational texts that provide personalized learning experiences. The future of digital publishing is limited only by our imagination.`
      },
      {
        title: "Chapter 10: Conclusion",
        content: `Our journey through the digital flipbook comes to an end, but this is just the beginning of your own adventure. Whether you're a reader enjoying this new format or a creator inspired to build your own digital books, the possibilities are endless.

        Thank you for joining us on this exploration of what books can be in the digital age. May your own stories, whether read or written, be filled with wonder and discovery.

        <em>The End</em>`
      }
    ];
    
    // Convert chapters to pages format
    const pages = [];
    chapters.forEach((chapter, index) => {
      pages.push({
        number: index + 1,
        content: `<h2>${chapter.title}</h2>${chapter.content.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('')}`
      });
    });
    
    return pages;
  }
  
  openBook() {
    // Animate book opening
    this.bookCover.style.transform = 'rotateY(-180deg)';
    this.bookCover.style.opacity = '0';
    
    setTimeout(() => {
      this.bookCover.classList.add('hidden');
      this.bookContainer.classList.remove('hidden');
      this.bookContainer.style.display = 'block';
      
      // Show swipe hint on mobile
      if (this.isMobile) {
        setTimeout(() => {
          const hint = document.querySelector('.swipe-hint');
          if (hint) hint.style.animation = 'fadeInOut 3s ease forwards';
        }, 1000);
      }
    }, 600);
  }
  
  loadPages() {
    if (this.isMobile) {
      // Mobile: show one page at a time
      this.loadSinglePage();
    } else {
      // Desktop: show two pages
      this.loadSpread();
    }
    
    this.updateNavigation();
  }
  
  loadSinglePage() {
    const page = this.pages[this.currentPage - 1];
    if (page) {
      this.leftPage.querySelector('.page-content').innerHTML = page.content;
      this.leftPage.querySelector('.page-number').textContent = page.number;
    }
    this.rightPage.style.display = 'none';
  }
  
  loadSpread() {
    // Calculate left and right page numbers for spread view
    let leftPageNum, rightPageNum;
    
    if (this.currentPage === 1) {
      leftPageNum = 1;
      rightPageNum = 2;
    } else if (this.currentPage % 2 === 0) {
      leftPageNum = this.currentPage;
      rightPageNum = this.currentPage + 1;
    } else {
      leftPageNum = this.currentPage - 1;
      rightPageNum = this.currentPage;
    }
    
    // Load left page
    const leftPageData = this.pages[leftPageNum - 1];
    if (leftPageData) {
      this.leftPage.querySelector('.page-content').innerHTML = leftPageData.content;
      this.leftPage.querySelector('.page-number').textContent = leftPageData.number;
      this.leftPage.style.display = 'block';
    } else {
      this.leftPage.style.display = 'none';
    }
    
    // Load right page
    const rightPageData = this.pages[rightPageNum - 1];
    if (rightPageData && rightPageNum <= this.totalPages) {
      this.rightPage.querySelector('.page-content').innerHTML = rightPageData.content;
      this.rightPage.querySelector('.page-number').textContent = rightPageData.number;
      this.rightPage.style.display = 'block';
    } else {
      this.rightPage.style.display = 'none';
    }
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
      this.loadPages();
      this.isAnimating = false;
    });
  }
  
  animatePageTurn(direction, callback) {
    const book = document.querySelector('.book');
    
    if (this.isMobile) {
      // Smooth swipe animation for mobile
      const page = this.leftPage;
      const pageContent = page.querySelector('.page-content');
      
      // Store current content
      const currentContent = pageContent.innerHTML;
      
      // Add swipe out animation
      if (direction === 'next') {
        page.style.transform = 'translateX(-110%) scale(0.95)';
        page.style.opacity = '0';
      } else {
        page.style.transform = 'translateX(110%) scale(0.95)';
        page.style.opacity = '0';
      }
      
      // After swipe out, update content and swipe in
      setTimeout(() => {
        // Update page content
        callback();
        
        // Reset and prepare for slide in
        page.style.transition = 'none';
        if (direction === 'next') {
          page.style.transform = 'translateX(100%)';
        } else {
          page.style.transform = 'translateX(-100%)';
        }
        page.style.opacity = '0';
        
        // Force reflow
        page.offsetHeight;
        
        // Slide in new page
        page.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        page.style.transform = 'translateX(0)';
        page.style.opacity = '1';
      }, 300);
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
    this.currentPageSpan.textContent = this.currentPage;
    if (this.mobileCurrentPageSpan) {
      this.mobileCurrentPageSpan.textContent = this.currentPage;
    }
    
    // Update button states
    this.prevBtn.disabled = this.currentPage <= 1;
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
}

// Initialize flipbook when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DigitalFlipbook();
});
