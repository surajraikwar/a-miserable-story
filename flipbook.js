document.addEventListener('DOMContentLoaded', () => {
    const book = {
        pages: [],
        currentPage: 0,
        isFlipping: false,
        init() {
            const metadata = JSON.parse(document.getElementById('book-data').text);
            const chapters = metadata.chapters.map(chapter => {
                const chapterData = document.getElementById(`chapter-${chapter.id}`);
                return chapterData ? JSON.parse(chapterData.text) : null;
            }).filter(Boolean);

            this.renderCover(metadata);

            chapters.forEach(chapter => this.renderChapter(chapter));

            this.renderIndex(metadata.chapters);
            this.renderPages();
            this.updatePageVisibility();
            this.addEventListeners();
        },
        renderCover(metadata) {
            this.pages.push(`
                <div class="cover-content">
                    <h1>${metadata.title}</h1>
                    <p class="author">By ${metadata.author}</p>
                    <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Book Cover" class="cover-image">
                </div>
            `);
        },
        renderChapter(chapter) {
            const pagesContainer = document.createElement('div');
            pagesContainer.style.width = '50vw';
            pagesContainer.style.height = '90vh';
            pagesContainer.style.overflow = 'hidden';
            pagesContainer.style.visibility = 'hidden';
            pagesContainer.style.position = 'absolute';
            document.body.appendChild(pagesContainer);

            const content = chapter.content.join(' ');
            const words = content.split(' ');
            let pageContent = `<h2>${chapter.title}</h2>`;

            for (const word of words) {
                const testContent = pageContent + ' ' + this.formatText(word);
                const testDiv = document.createElement('div');
                testDiv.classList.add('page-content');
                testDiv.innerHTML = testContent;
                pagesContainer.appendChild(testDiv);
                if (testDiv.scrollHeight > pagesContainer.clientHeight - 80) {
                    this.pages.push(pageContent);
                    pageContent = `<h2>${chapter.title} (cont.)</h2><p>${this.formatText(word)}</p>`;
                } else {
                    pageContent = testContent;
                }
                pagesContainer.removeChild(testDiv);
            }
            this.pages.push(pageContent);
            document.body.removeChild(pagesContainer);
        },
        formatText(text) {
            return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
        },
        renderIndex(chapters) {
            let indexContent = '<h2>Index</h2><ul>';
            let pageOffset = 2; // Start after cover and index
            chapters.forEach((chapter, i) => {
                indexContent += `<li><a href="#" data-page="${pageOffset}">${chapter.title}</a></li>`;
                pageOffset += this.getChapterPageCount(i);
            });
            indexContent += '</ul>';
            this.pages.splice(1, 0, indexContent);
        },
        renderPages() {
            const pagesContainer = document.getElementById('pages');
            pagesContainer.innerHTML = '';
            this.pages.forEach((pageContent, i) => {
                const pageDiv = document.createElement('div');
                pageDiv.classList.add('page');
                if (i % 2 === 0) {
                    pageDiv.style.right = '0';
                    pageDiv.style.transformOrigin = 'left center';
                } else {
                    pageDiv.style.right = '50%';
                    pageDiv.style.transformOrigin = 'right center';
                }
                pageDiv.innerHTML = `<div class="page-content">${pageContent}</div><div class="page-number">${i}</div>`;
                pagesContainer.appendChild(pageDiv);
            });
        },
        getChapterPageCount(chapterIndex) {
            let count = 0;
            const title = `Chapter ${chapterIndex + 1}`;
            this.pages.forEach(p => {
                if (p.includes(title)) {
                    count++;
                }
            });
            return count;
        },
        updatePageVisibility() {
            const pages = document.querySelectorAll('.page');
            pages.forEach((page, i) => {
                if (i < this.currentPage) {
                    page.classList.add('flipped');
                    page.style.zIndex = i;
                } else {
                    page.classList.remove('flipped');
                    page.style.zIndex = this.pages.length - i;
                }
            });
        },
        turnPage(direction) {
            if (this.isFlipping) return;

            if (direction === 'next' && this.currentPage < this.pages.length - 1) {
                this.isFlipping = true;
                this.currentPage += 2;
                if(this.currentPage > this.pages.length) this.currentPage = this.pages.length
                this.updatePageVisibility();
                setTimeout(() => this.isFlipping = false, 600);
            } else if (direction === 'prev' && this.currentPage > 0) {
                this.isFlipping = true;
                this.currentPage -= 2;
                if(this.currentPage < 0) this.currentPage = 0
                this.updatePageVisibility();
                setTimeout(() => this.isFlipping = false, 600);
            }
        },
        goToPage(pageNumber) {
            if (this.isFlipping) return;
            this.isFlipping = true;
            this.currentPage = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
            this.updatePageVisibility();
            setTimeout(() => this.isFlipping = false, 600);
        },
        addEventListeners() {
            document.getElementById('next-page').addEventListener('click', () => this.turnPage('next'));
            document.getElementById('prev-page').addEventListener('click', () => this.turnPage('prev'));

            document.addEventListener('click', e => {
                if (e.target.matches('a[data-page]')) {
                    e.preventDefault();
                    this.goToPage(parseInt(e.target.dataset.page));
                }
            });

            let touchstartX = 0;
            let touchendX = 0;
            const pagesContainer = document.getElementById('pages');

            pagesContainer.addEventListener('touchstart', e => {
                touchstartX = e.changedTouches[0].screenX;
            }, { passive: true });

            pagesContainer.addEventListener('touchend', e => {
                touchendX = e.changedTouches[0].screenX;
                if (touchendX < touchstartX) this.turnPage('next');
                if (touchendX > touchstartX) this.turnPage('prev');
            }, { passive: true });
        }
    };
    book.init();
});
