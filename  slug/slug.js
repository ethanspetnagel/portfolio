// Add html2canvas library dynamically if not already included
if (!window.html2canvas) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);
}

// Text scramble effect class for the "OTHER PROJECTS" button/arrow
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
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

// UPDATED Page Transition Class with Screenshot Circle Effect
class PageTransition {
    constructor() {
        this.isTransitioning = false;
        this.init();
    }

    init() {
        this.attachLinkHandlers();
    }

    attachLinkHandlers() {
        // Home/Back button (bottom-left)
        const projectsButton = document.querySelector('.projects-button');
        if (projectsButton) {
            projectsButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.startScreenshotCircleTransition('../index.html');
            });
        }

        // Site title click (top-left SLUG)
        const siteTitle = document.querySelector('.site-title a');
        if (siteTitle) {
            siteTitle.addEventListener('click', (e) => {
                e.preventDefault();
                this.startScreenshotCircleTransition('../index.html');
            });
        }
    }

    async startScreenshotCircleTransition(targetUrl) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        try {
            // Wait for html2canvas to load if needed
            if (!window.html2canvas) {
                await this.waitForHtml2Canvas();
            }
            
            // Capture screenshot of current page
            const canvas = await html2canvas(document.body, {
                allowTaint: true,
                useCORS: true,
                scale: 0.5, // Reduce quality for performance
                logging: false,
                backgroundColor: null
            });
            
            // Create full-screen container
            const transitionContainer = document.createElement('div');
            transitionContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 30000;
                pointer-events: none;
            `;
            
            // Create background iframe to load the HOME page
            const homePageFrame = document.createElement('iframe');
            homePageFrame.src = targetUrl;
            homePageFrame.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
                opacity: 0;
                background: transparent;
                pointer-events: none;
            `;
            
            // Prevent iframe interactions that cause glitches
            homePageFrame.setAttribute('scrolling', 'no');
            homePageFrame.setAttribute('seamless', 'seamless');
            
            // Create screenshot circle container - START FULL SCREEN AS ELLIPSE
            const screenshotCircleContainer = document.createElement('div');
            screenshotCircleContainer.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 400vw;
                height: 200vh;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                overflow: hidden;
                z-index: 2;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            `;
            
            // Create image from canvas
            const screenshotImage = document.createElement('img');
            screenshotImage.src = canvas.toDataURL('image/jpeg', 0.8);
            screenshotImage.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                opacity: 1;
            `;
            
            screenshotCircleContainer.appendChild(screenshotImage);
            transitionContainer.appendChild(homePageFrame);
            transitionContainer.appendChild(screenshotCircleContainer);
            document.body.appendChild(transitionContainer);
            
            // Show home page background after iframe loads (or after 500ms)
            const showHomePage = () => {
                homePageFrame.style.opacity = '1';
            };
            
            homePageFrame.onload = showHomePage;
            setTimeout(showHomePage, 500); // Fallback
            
            // Force reflow
            screenshotCircleContainer.offsetHeight;
            
            // Animate circle SHRINKING to center point - 2 seconds
            screenshotCircleContainer.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            screenshotCircleContainer.style.width = '0';
            screenshotCircleContainer.style.height = '0';
            
            // Navigate when circle is almost gone
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 1900);
            
            // Clean up after navigation
            setTimeout(() => {
                if (transitionContainer.parentNode) {
                    transitionContainer.remove();
                }
                this.isTransitioning = false;
            }, 2200);
            
        } catch (error) {
            console.log('Screenshot failed, using black circle fallback');
            this.startBlackCircleTransition(targetUrl);
        }
    }
    
    // Fallback method if screenshot fails - WITH HOME PAGE BACKGROUND
    startBlackCircleTransition(targetUrl) {
        // Create full-screen container
        const transitionContainer = document.createElement('div');
        transitionContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 30000;
            pointer-events: none;
        `;
        
        // Create background iframe for home page
        const homePageFrame = document.createElement('iframe');
        homePageFrame.src = targetUrl;
        homePageFrame.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
            opacity: 0;
            background: transparent;
            pointer-events: none;
        `;
        
        homePageFrame.setAttribute('scrolling', 'no');
        homePageFrame.setAttribute('seamless', 'seamless');
        
        // Create black circle overlay AS ELLIPSE
        const circleOverlay = document.createElement('div');
        circleOverlay.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 400vw;
            height: 200vh;
            background: #000;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            z-index: 2;
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
        `;
        
        transitionContainer.appendChild(homePageFrame);
        transitionContainer.appendChild(circleOverlay);
        document.body.appendChild(transitionContainer);
        
        // Show home page background
        const showHomePage = () => {
            homePageFrame.style.opacity = '1';
        };
        
        homePageFrame.onload = showHomePage;
        setTimeout(showHomePage, 500);
        
        circleOverlay.offsetHeight;
        
        circleOverlay.style.transition = 'all 2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        circleOverlay.style.width = '0';
        circleOverlay.style.height = '0';
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 1900);
        
        setTimeout(() => {
            if (transitionContainer.parentNode) {
                transitionContainer.remove();
            }
            this.isTransitioning = false;
        }, 2200);
    }
    
    // Wait for html2canvas library to load
    waitForHtml2Canvas() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.html2canvas) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    // FIXED Page Entrance Animation Handler - Prevent Flash
    function handlePageEntrance() {
        const urlParams = new URLSearchParams(window.location.search);
        const fromTransition = urlParams.get('from_transition') === 'true';
        
        // Clean URL immediately to prevent flash
        if (urlParams.get('from_transition') || urlParams.get('transition')) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        
        // Only apply transition class if specifically from home transition
        if (fromTransition) {
            document.body.classList.add('from-transition');
            
            setTimeout(() => {
                document.body.classList.remove('from-transition');
            }, 100); // Much faster to prevent flash
        }
    }

    // Call entrance animation handler IMMEDIATELY
    handlePageEntrance();

    // Get DOM elements
    const tabs = document.querySelectorAll('.essay-tab');
    const essays = document.querySelectorAll('.essay-text');
    const projects = document.querySelectorAll('.project-set');
    const cursorLabel = document.getElementById('cursorLabel');
    const projectsButton = document.getElementById('projectsButton') || document.querySelector('.projects-button');
    const siteTitle = document.querySelector('.site-title');
    const essaySidebar = document.querySelector('.essay-sidebar');
    const projectGallery = document.querySelector('.project-gallery');
  
    // Initialize text parting effect
    const textParting = new TextPartingEffect();
    textParting.init();

    // Initialize smooth scroll WITHOUT snap
    const smoothScrollLeft = new SmoothScroll(essaySidebar, { 
        resistance: 0.7,
        damping: 0.08
    });
    
    const smoothScrollRight = new SmoothScroll(projectGallery, { 
        resistance: 0.5, // Heavier feel
        damping: 0.06 // Slower damping for heavier feel
    });

    // Initialize UPDATED page transition with screenshot effect
    const pageTransition = new PageTransition();
  
    // Create star scroll indicators
    const createScrollStars = () => {
        const starLeft = document.createElement('div');
        starLeft.className = 'star-scroll-indicator';
        starLeft.textContent = '★';
        document.querySelector('.page').appendChild(starLeft);
  
        const starRight = document.createElement('div');
        starRight.className = 'star-scroll-indicator-gallery';
        starRight.textContent = '★';
        document.querySelector('.page').appendChild(starRight);
  
        return { starLeft, starRight };
    };
  
    const { starLeft, starRight } = createScrollStars();
  
    // SCRAMBLE EFFECT for projects button
    const projectsScramble = new TextScramble(projectsButton);
    let projectsButtonState = 'arrow';
  
    projectsButton.textContent = '⬅';
    projectsButton.style.fontWeight = 'bold';
  
    projectsButton.addEventListener('mouseenter', function () {
        projectsScramble.setText('HOME');
        projectsButtonState = 'home';
    });
  
    projectsButton.addEventListener('mouseleave', function () {
        setTimeout(() => {
            projectsButton.textContent = '⬅';
            projectsButtonState = 'arrow';
        }, 50);
    });

    // Site title click to go home - REMOVED OLD NAVIGATION
    // Now handled by PageTransition class
  
    // Site title hover effect - background turns black
    let isOverTitle = false;
    
    siteTitle.addEventListener('mouseenter', function () {
        isOverTitle = true;
        document.body.classList.add('title-hover');
    });
  
    siteTitle.addEventListener('mouseleave', function () {
        isOverTitle = false;
        document.body.classList.remove('title-hover');
    });
  
    // TAB SWITCHING - FIXED
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const index = tab.dataset.index;
  
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
  
            // Update essays
            essays.forEach(e => e.classList.remove('active'));
            const currentEssay = document.querySelector(`.essay-text[data-index="${index}"]`);
            if (currentEssay) currentEssay.classList.add('active');
  
            // Update projects
            projects.forEach(p => p.classList.remove('active'));
            const currentProject = document.querySelector(`.project-set[data-index="${index}"]`);
            if (currentProject) currentProject.classList.add('active');
  
            // Scroll both to top
            smoothScrollLeft.targetScroll = 0;
            smoothScrollLeft.currentScroll = 0;
            smoothScrollRight.targetScroll = 0;
            smoothScrollRight.currentScroll = 0;
            essaySidebar.scrollTop = 0;
            projectGallery.scrollTop = 0;
  
            // Reinitialize text parting effect for new content
            setTimeout(() => {
                textParting.init();
            }, 100);
            
            // Auto-play first video in new section
            if (currentProject) {
                const firstVideo = currentProject.querySelector('video');
                if (firstVideo) {
                    firstVideo.play();
                }
            }
        });
    });
  
    // INFO TOGGLE
    document.querySelectorAll('.info-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const panel = toggle.nextElementSibling;
            const isActive = toggle.classList.contains('active');
  
            // Close all other panels
            document.querySelectorAll('.info-toggle').forEach(t => {
                if (t !== toggle) {
                    t.classList.remove('active');
                    t.nextElementSibling.classList.remove('active');
                    t.nextElementSibling.style.maxHeight = '0';
                }
            });
  
            // Toggle current panel
            toggle.classList.toggle('active');
            panel.classList.toggle('active');
  
            // Smooth content shift
            if (!isActive) {
                panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
                panel.style.maxHeight = '0';
            }
        });
    });
  
    // SLIDESHOW + VIDEO CONTROLS
    document.querySelectorAll('.slideshow-zone').forEach(zone => {
        const slides = zone.querySelectorAll('.slide');
        let currentIndex = 0;
        let isPlaying = false;
  
        function showSlide(i) {
            slides.forEach(s => s.classList.remove('current'));
            slides[i].classList.add('current');
            
            // Auto-play video if it's the current slide
            const video = slides[i].querySelector('video');
            if (video) {
                video.play();
                isPlaying = true;
            }
        }
  
        function isVideo(slide) {
            return slide.querySelector('video') !== null;
        }
  
        function getCurrentVideo() {
            const currentSlide = slides[currentIndex];
            return currentSlide ? currentSlide.querySelector('video') : null;
        }
  
        zone.addEventListener('click', (e) => {
            if (e.target.classList.contains('info-toggle')) return;
  
            e.preventDefault();
  
            const mediaElement = zone.querySelector('.slide.current img, .slide.current video, .slide.current > div');
            if (!mediaElement) return;
  
            const mediaRect = mediaElement.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
  
            if (mouseX >= mediaRect.left && mouseX <= mediaRect.right &&
                mouseY >= mediaRect.top && mouseY <= mediaRect.bottom) {
  
                const midpoint = mediaRect.left + (mediaRect.width / 2);
                const currentVideo = getCurrentVideo();
  
                if (currentVideo) {
                    if (isPlaying) {
                        currentVideo.pause();
                        isPlaying = false;
                    } else {
                        currentVideo.play();
                        isPlaying = true;
                    }
                } else {
                    // Navigate slides
                    if (mouseX > midpoint) {
                        currentIndex = (currentIndex + 1) % slides.length;
                    } else {
                        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    }
  
                    showSlide(currentIndex);
  
                    const newVideo = getCurrentVideo();
                    if (newVideo) {
                        isPlaying = false;
                        newVideo.pause();
                    }
                }
            }
        });
  
        zone.addEventListener('mousemove', (e) => {
            const mediaElement = zone.querySelector('.slide.current img, .slide.current video, .slide.current > div');
            if (!mediaElement) {
                cursorLabel.style.display = 'none';
                return;
            }
  
            const mediaRect = mediaElement.getBoundingClientRect();
            const mouseX = e.clientX;
            const mouseY = e.clientY;
  
            if (mouseX >= mediaRect.left && mouseX <= mediaRect.right &&
                mouseY >= mediaRect.top && mouseY <= mediaRect.bottom) {
  
                const midpoint = mediaRect.left + (mediaRect.width / 2);
                const currentVideo = getCurrentVideo();
  
                let label = '';
                if (currentVideo) {
                    label = isPlaying ? 'PAUSE' : 'PLAY';
                } else if (slides.length > 1) {
                    label = mouseX > midpoint ? 'NEXT' : 'BACK';
                }
  
                if (label) {
                    cursorLabel.textContent = label;
                    cursorLabel.style.display = 'block';
                    cursorLabel.style.left = `${e.clientX}px`;
                    cursorLabel.style.top = `${e.clientY}px`;
                }
            } else {
                cursorLabel.style.display = 'none';
            }
        });
  
        zone.addEventListener('mouseleave', () => {
            cursorLabel.style.display = 'none';
  
            const currentVideo = getCurrentVideo();
            if (currentVideo && isPlaying) {
                currentVideo.pause();
                isPlaying = false;
            }
        });
  
        // Initialize first slide and auto-play video
        showSlide(currentIndex);
    });
  
    // Star scrollbar functionality with 2-second fade
    let scrollTimeoutLeft, scrollTimeoutRight;
    let fadeTimeoutLeft, fadeTimeoutRight;
  
    function updateStarPosition(element, star) {
        const scrollPercentage = element.scrollTop / (element.scrollHeight - element.clientHeight);
        const viewportHeight = element.clientHeight;
        const topPosition = 120 + (viewportHeight - 240) * scrollPercentage;
        star.style.top = `${topPosition}px`;
    }
  
    function showScrollStar(element, star, scrollTimeout, fadeTimeout, isGallery = false) {
        element.classList.add('scrolling');
        star.style.opacity = isGallery ? '0.8' : '1';
        
        clearTimeout(scrollTimeout);
        clearTimeout(fadeTimeout);
        
        scrollTimeout = setTimeout(() => {
            element.classList.remove('scrolling');
        }, 1000);
        
        // Fade out after 2 seconds
        fadeTimeout = setTimeout(() => {
            star.style.opacity = '0';
        }, 2000);
        
        return { scrollTimeout, fadeTimeout };
    }
  
    essaySidebar.addEventListener('scroll', () => {
        updateStarPosition(essaySidebar, starLeft);
        const timeouts = showScrollStar(essaySidebar, starLeft, scrollTimeoutLeft, fadeTimeoutLeft);
        scrollTimeoutLeft = timeouts.scrollTimeout;
        fadeTimeoutLeft = timeouts.fadeTimeout;
    });
  
    projectGallery.addEventListener('scroll', () => {
        updateStarPosition(projectGallery, starRight, true);
        const timeouts = showScrollStar(projectGallery, starRight, scrollTimeoutRight, fadeTimeoutRight, true);
        scrollTimeoutRight = timeouts.scrollTimeout;
        fadeTimeoutRight = timeouts.fadeTimeout;
    });
  
    // Keyboard navigation for slideshows
    document.addEventListener('keydown', (e) => {
        const activeZone = document.querySelector('.project-set.active .slideshow-zone');
        if (!activeZone) return;
  
        const slides = activeZone.querySelectorAll('.slide');
        let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('current'));
  
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % slides.length;
            slides.forEach(s => s.classList.remove('current'));
            slides[currentIndex].classList.add('current');
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            slides.forEach(s => s.classList.remove('current'));
            slides[currentIndex].classList.add('current');
        }
    });
  
    // Initialize on page load
    const firstTab = document.querySelector('.essay-tab.active');
    if (firstTab) {
        const index = firstTab.dataset.index;
        const firstEssay = document.querySelector(`.essay-text[data-index="${index}"]`);
        const firstProject = document.querySelector(`.project-set[data-index="${index}"]`);
  
        if (firstEssay) firstEssay.classList.add('active');
        if (firstProject) {
            firstProject.classList.add('active');
            // Auto-play first video
            const firstVideo = firstProject.querySelector('video');
            if (firstVideo) {
                firstVideo.play();
            }
        }
    }
  
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Recalculate dimensions
            document.querySelectorAll('.slideshow-zone').forEach(zone => {
                const slides = zone.querySelectorAll('.slide');
                const currentSlide = zone.querySelector('.slide.current');
                if (!currentSlide && slides.length > 0) {
                    slides[0].classList.add('current');
                }
            });
            
            // Reinitialize text parting effect
            textParting.init();
        }, 250);
    });
  
    // Preload images
    function preloadImage(url) {
        const img = new Image();
        img.src = url;
    }
  
    document.querySelectorAll('.slide img').forEach(img => {
        preloadImage(img.src);
    });
});