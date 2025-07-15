document.addEventListener('DOMContentLoaded', () => {
    const book = {
        pages: [],
        currentPage: 0,
        isFlipping: false,
        async init() {
            try {
                const response = await fetch('content/book-metadata.json');
                if (!response.ok) throw new Error('Failed to load book metadata');
                const metadata = await response.json();

                for (const chapter of metadata.chapters) {
                    const chapterResponse = await fetch(`content/${chapter.file}`);
                    if (!chapterResponse.ok) throw new Error(`Failed to load chapter: ${chapter.file}`);
                    const chapterData = await chapterResponse.json();
                    await this.renderChapter(chapterData);
                }

                this.renderIndex(metadata.chapters);
                this.renderPages();
                this.updatePageVisibility();
                this.addEventListeners();
            } catch (error) {
                console.error('Error initializing book:', error);
                const bookContainer = document.getElementById('book');
                if (bookContainer) {
                    bookContainer.innerHTML = `<p style="color: red; text-align: center;">Error loading book. Please check the console for details.</p>`;
                }
            }
        },
        async renderChapter(chapter) {
            return new Promise(resolve => {
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

                const processWords = () => {
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
                    resolve();
                };

                // Allow the browser to render before processing words
                setTimeout(processWords, 0);
            });
        },
        formatText(text) {
            return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>');
        },
        renderIndex(chapters) {
            let indexContent = '<h2>Index</h2><ul>';
            let pageOffset = 1;
            chapters.forEach((chapter, i) => {
                indexContent += `<li><a href="#" data-page="${pageOffset}">${chapter.title}</a></li>`;
                pageOffset += this.getChapterPageCount(i);
            });
            indexContent += '</ul>';
            this.pages.unshift(indexContent);
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

            if (direction === 'next' && this.currentPage < this.pages.length - 2) {
                this.isFlipping = true;
                this.currentPage += 2;
                this.updatePageVisibility();
                setTimeout(() => this.isFlipping = false, 600);
            } else if (direction === 'prev' && this.currentPage > 1) {
                this.isFlipping = true;
                this.currentPage -= 2;
                this.updatePageVisibility();
                setTimeout(() => this.isFlipping = false, 600);
            }
        },
        goToPage(pageNumber) {
            if (this.isFlipping) return;
            this.isFlipping = true;
            this.currentPage = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
            if (this.currentPage === 0) this.currentPage = 1;
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
