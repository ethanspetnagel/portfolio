// Slug JS - Updated with Text Parting Effect

class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 60);
            this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += char;
            } else {
                output += from;
            }
        }
        this.el.textContent = output;
        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// Text Parting Sea Effect Class - Word Level
class TextPartingEffect {
    constructor() {
        this.activeElements = new Map();
        this.rafId = null;
    }
  
    init() {
        // First, wrap all words in spans
        this.wrapWordsInSpans();
        
        const interactiveTexts = document.querySelectorAll('.interactive-text');
        
        interactiveTexts.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.startParting(e.target));
            element.addEventListener('mousemove', (e) => this.updateParting(e));
            element.addEventListener('mouseleave', (e) => this.endParting(e.target));
        });
    }
  
    wrapWordsInSpans() {
        const interactiveTexts = document.querySelectorAll('.interactive-text');
        
        interactiveTexts.forEach(element => {
            // Skip if already processed
            if (element.querySelector('.word')) return;
            
            const textNodes = this.getTextNodes(element);
            
            textNodes.forEach(node => {
                const words = node.textContent.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                
                words.forEach(word => {
                    if (word.trim() !== '') {
                        const span = document.createElement('span');
                        span.className = 'word';
                        span.textContent = word;
                        fragment.appendChild(span);
                    } else {
                        // Preserve whitespace
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                
                node.parentNode.replaceChild(fragment, node);
            });
        });
    }
  
    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim() !== '') {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    }
  
    startParting(element) {
        if (!this.activeElements.has(element)) {
            const words = element.querySelectorAll('.word');
            const wordData = new Map();
            
            words.forEach(word => {
                const rect = word.getBoundingClientRect();
                wordData.set(word, {
                    rect: rect,
                    originalTransform: word.style.transform || '',
                    isActive: true
                });
            });
            
            this.activeElements.set(element, {
                words: wordData,
                isActive: true
            });
        }
    }
  
    updateParting(event) {
        const element = event.target.closest('.interactive-text');
        const data = this.activeElements.get(element);
        
        if (!data || !data.isActive) return;
  
        const mouseX = event.clientX;
        const mouseY = event.clientY;
        
        data.words.forEach((wordData, word) => {
            const rect = word.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = mouseX - centerX;
            const deltaY = mouseY - centerY;
            
            // Calculate distance from word center
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxInfluence = 150; // Influence radius in pixels
            
            if (distance < maxInfluence) {
                // Calculate parting effect strength (stronger when mouse is closer)
                const strength = (1 - distance / maxInfluence) * 25; // Max 25px displacement
                
                // Calculate direction to push word away from cursor
                const angle = Math.atan2(deltaY, deltaX);
                const pushX = -Math.cos(angle) * strength;
                const pushY = -Math.sin(angle) * strength;
                
                // Apply transform
                word.style.transform = `translate(${pushX}px, ${pushY}px)`;
                word.style.transition = 'transform 0.1s ease-out';
            } else {
                // Return to original position if outside influence radius
                word.style.transform = wordData.originalTransform;
                word.style.transition = 'transform 0.2s ease-out';
            }
        });
    }
  
    endParting(element) {
        const data = this.activeElements.get(element);
        
        if (data) {
            data.isActive = false;
            
            // Return all words to original positions
            data.words.forEach((wordData, word) => {
                word.style.transition = 'transform 0.3s ease-out';
                word.style.transform = wordData.originalTransform;
            });
            
            // Clean up after animation
            setTimeout(() => {
                if (!data.isActive) {
                    this.activeElements.delete(element);
                }
            }, 300);
        }
    }
}

// Smooth Scroll without Snap Points
class SmoothScroll {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            resistance: options.resistance || 0.8,
            damping: options.damping || 0.08,
            ...options
        };

        this.currentScroll = 0;
        this.targetScroll = 0;
        this.isScrolling = false;

        this.init();
    }

    init() {
        // Override native scroll
        this.element.style.overflow = 'hidden';
        this.element.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // Touch support
        let touchStart = 0;
        this.element.addEventListener('touchstart', (e) => {
            touchStart = e.touches[0].clientY;
        });

        this.element.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touchDelta = touchStart - e.touches[0].clientY;
            this.targetScroll += touchDelta * 0.5;
            touchStart = e.touches[0].clientY;
            this.clampScroll();
        }, { passive: false });

        // Start animation loop
        this.animate();
    }

    onWheel(e) {
        e.preventDefault();

        // Add resistance to scroll
        const delta = e.deltaY * this.options.resistance;
        this.targetScroll += delta;

        this.clampScroll();

        if (!this.isScrolling) {
            this.isScrolling = true;
            this.element.classList.add('scrolling');
        }

        // Clear timeout for scroll end detection
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.element.classList.remove('scrolling');
        }, 150);
    }

    clampScroll() {
        const maxScroll = this.element.scrollHeight - this.element.clientHeight;
        this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
    }

    animate() {
        // Smooth interpolation without snapping
        const diff = this.targetScroll - this.currentScroll;
        this.currentScroll += diff * this.options.damping;

        // Apply scroll
        this.element.scrollTop = this.currentScroll;

        // Continue animation
        requestAnimationFrame(this.animate.bind(this));
    }
}

// --- FONT FLIP CLASS ---
class FontFlip {
    constructor(el) {
        this.el = el;
        this.fonts = [
            'EB Garamond, serif',
            'UnifrakturCook, cursive',
            'Impact, sans-serif',
            'Courier New, monospace',
        ];
        this.originalFont = window.getComputedStyle(el).fontFamily;
        this._timeout = null;
        this._isAnimating = false;
    }

    setText(newText, onFinish) {
        this.text = newText;
        this.stop();
        this._animateLetter(0, onFinish);
    }

    _shuffle(array) {
        let arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    _animateLetter(index, onFinish) {
        if (index >= this.text.length) {
            this._renderWord(-1, -1);
            this._isAnimating = false;
            if (typeof onFinish === 'function') onFinish();
            return;
        }
        const shuffledFonts = this._shuffle(this.fonts);
        let fontFrame = 0;
        const animateFont = () => {
            if (fontFrame < shuffledFonts.length) {
                this._renderWord(index, fontFrame, shuffledFonts);
                fontFrame++;
                this._timeout = setTimeout(animateFont, 90);
            } else {
                this._renderWord(index, -1, shuffledFonts);
                this._timeout = setTimeout(() => this._animateLetter(index + 1, onFinish), 5);
            }
        };
        this._isAnimating = true;
        animateFont();
    }

    _renderWord(activeIndex, fontFrame, fontList = this.fonts) {
        this.el.innerHTML = '';
        for (let i = 0; i < this.text.length; i++) {
            const char = this.text[i];
            const wrapper = document.createElement('span');
            const animator = document.createElement('span');
            wrapper.style.display = 'inline-block';
            wrapper.style.position = 'relative';
            wrapper.style.fontFamily = this.originalFont;
            wrapper.textContent = char;
            wrapper.style.visibility = 'hidden';
            animator.textContent = char;
            animator.style.visibility = 'visible';
            animator.style.position = 'absolute';
            animator.style.left = '0';
            animator.style.top = '0';
            animator.style.width = '100%';
            animator.style.height = '100%';
            animator.style.textAlign = 'center';
            animator.style.transformOrigin = 'center center';
            animator.style.transition = 'transform 0.1s ease, font-family 0.1s ease';
            if (i === activeIndex && fontFrame >= 0) {
                animator.style.fontFamily = fontList[fontFrame];
                animator.style.transform = 'scale(1.2)';
            } else {
                animator.style.fontFamily = this.originalFont;
                animator.style.transform = 'scale(1)';
            }
            wrapper.appendChild(animator);
            this.el.appendChild(wrapper);
        }
    }

    stop() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._isAnimating = false;
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
    const cursorLabel = document.getElementById('cursorLabel');
    const homeLink = document.getElementById('home-link');
    const churchLink = document.getElementById('church-link');
    const homeLabel = document.getElementById('home-label');
    const churchLabel = document.getElementById('church-label');
    const tabs = document.querySelectorAll('.essay-tab');
    const essays = document.querySelectorAll('.essay-text');
    const projects = document.querySelectorAll('.project-set');
    const essaySidebar = document.querySelector('.essay-sidebar');
    const projectGallery = document.querySelector('.project-gallery');

    // Initialize text parting effect
    const textParting = new TextPartingEffect();
    textParting.init();

    // --- NAVIGATION ARROW HOVER LABELS ---
    function setupArrowHover(arrowElement, labelText) {
        if (!arrowElement) return;

        arrowElement.addEventListener('mouseenter', (e) => {
            if (cursorLabel) {
                cursorLabel.textContent = labelText;
                cursorLabel.style.display = 'block';
            }
        });

        arrowElement.addEventListener('mousemove', (e) => {
            if (cursorLabel) {
                cursorLabel.style.left = `${e.clientX}px`;
                cursorLabel.style.top = `${e.clientY}px`;
            }
        });

        arrowElement.addEventListener('mouseleave', () => {
            if (cursorLabel) {
                cursorLabel.style.display = 'none';
            }
        });
    }

    setupArrowHover(homeLink, 'HOME');
    setupArrowHover(churchLink, 'NEXT');

    // --- NAVIGATION ARROW ANIMATION ---
    if (homeLink && homeLabel) {
        const homeFlip = new FontFlip(homeLabel);
        homeLink.addEventListener('mouseenter', () => {
            homeFlip.setText('HOME');
        });
        homeLink.addEventListener('mouseleave', () => {
            homeFlip.stop();
            homeLabel.textContent = '';
        });
    }

    if (churchLink && churchLabel) {
        const churchFlip = new FontFlip(churchLabel);
        churchLink.addEventListener('mouseenter', () => {
            churchFlip.setText('CHURCH');
        });
        churchLink.addEventListener('mouseleave', () => {
            churchFlip.stop();
            churchLabel.textContent = '';
        });
    }

    // --- TAB SWITCHING LOGIC ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const index = tab.dataset.index;

            // Update active states for tabs, essays, and projects
            [tabs, essays, projects].forEach(collection => {
                collection.forEach(item => item.classList.remove('active'));
            });

            tab.classList.add('active');
            document.querySelector(`.essay-text[data-index="${index}"]`)?.classList.add('active');
            document.querySelector(`.project-set[data-index="${index}"]`)?.classList.add('active');

            // Reset scroll positions
            if (essaySidebar) essaySidebar.scrollTop = 0;
            if (projectGallery) projectGallery.scrollTop = 0;

            // Reinitialize text parting effect for new content
            setTimeout(() => {
                textParting.init();
            }, 100);
        });
    });

    // --- SLIDESHOW NAVIGATION (like church.js) ---
    document.querySelectorAll('.slideshow-zone').forEach(zone => {
        const slides = zone.querySelectorAll('.slide');
        if (slides.length === 0) return;

        let currentIndex = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.toggle('current', i === index);
                const video = slide.querySelector('video');
                if (video && i !== index) {
                    video.pause();
                }
            });
            const currentVideo = slides[index].querySelector('video');
            if (currentVideo) {
                currentVideo.play().catch(() => {});
            }
        };

        zone.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-toggle')) return;
            e.stopPropagation();

            const mediaRect = zone.querySelector('.slide.current')?.getBoundingClientRect();
            if (!mediaRect) return;

            const midpoint = mediaRect.left + (mediaRect.width / 2);
            const currentVideo = slides[currentIndex].querySelector('video');

            if (slides.length > 1) {
                if (e.clientX > midpoint) {
                    currentIndex = (currentIndex + 1) % slides.length;
                } else {
                    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                }
                showSlide(currentIndex);
            } else if (currentVideo) {
                if (currentVideo.paused) {
                    currentVideo.play();
                } else {
                    currentVideo.pause();
                }
            }
        });

        zone.addEventListener('mousemove', (e) => {
            const mediaRect = zone.querySelector('.slide.current')?.getBoundingClientRect();
            if (!mediaRect || !cursorLabel) return;

            const mouseX = e.clientX;
            const mouseY = e.clientY;

            if (mouseX >= mediaRect.left && mouseX <= mediaRect.right && mouseY >= mediaRect.top && mouseY <= mediaRect.bottom) {
                const midpoint = mediaRect.left + (mediaRect.width / 2);
                const currentVideo = slides[currentIndex].querySelector('video');
                let label = '';

                if (slides.length > 1) {
                    label = mouseX > midpoint ? 'NEXT' : 'BACK';
                } else if (currentVideo) {
                    label = currentVideo.paused ? 'PLAY' : 'PAUSE';
                }

                if (label) {
                    cursorLabel.textContent = label;
                    cursorLabel.style.display = 'block';
                    cursorLabel.style.left = `${e.clientX}px`;
                    cursorLabel.style.top = `${e.clientY}px`;
                } else {
                    cursorLabel.style.display = 'none';
                }
            } else {
                cursorLabel.style.display = 'none';
            }
        });

        zone.addEventListener('mouseleave', () => {
            if (cursorLabel) {
                cursorLabel.style.display = 'none';
            }
        });

        showSlide(0); // Initialize first slide
    });

    // --- INFO TOGGLE FOR PROJECT DETAILS ---
    document.querySelectorAll('.info-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const panel = toggle.nextElementSibling;
            const isActive = toggle.classList.contains('active');

            // Close all other panels
            document.querySelectorAll('.info-toggle.active').forEach(t => {
                if (t !== toggle) {
                    t.classList.remove('active');
                    const otherPanel = t.nextElementSibling;
                    if (otherPanel) {
                        otherPanel.classList.remove('active');
                        otherPanel.style.maxHeight = '0';
                    }
                }
            });

            // Toggle the current panel
            toggle.classList.toggle('active');
            if (panel) {
                panel.classList.toggle('active');
                panel.style.maxHeight = isActive ? '0' : panel.scrollHeight + 'px';
            }
        });
    });

    // --- INITIALIZE SMOOTH SCROLL ---
    if (essaySidebar) {
        new SmoothScroll(essaySidebar, {
            resistance: 0.8,
            damping: 0.08
        });
    }

    if (projectGallery) {
        new SmoothScroll(projectGallery, {
            resistance: 0.8,
            damping: 0.08
        });
    }

    // --- INITIALIZE FIRST TAB ---
    const firstTab = document.querySelector('.essay-tab');
    if (firstTab) {
        firstTab.click();
    }
});