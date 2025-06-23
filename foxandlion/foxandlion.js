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

// Video Info Manager - Manages dynamic info panels for video slideshows
class VideoInfoManager {
    constructor() {
        this.videoInfo = {
            // Fox & Lion specific videos
            'fox4.mp4': {
                title: 'interactive wine experience',
                details: `<strong>interactive wine experience</strong><br>
                <br>
                software: three.js, blender<br>
                interaction: click-based navigation<br>
                <br>
                this interactive 3d environment allows users<br>
                to explore fox & lion's wine selection as if<br>
                they were physically present in the space.<br>
                the experience prioritizes intuitive navigation<br>
                while maintaining visual fidelity to the<br>
                actual bakery interior.`
            },
            // Placeholder entries for potential future videos
            'fox5.mp4': {
                title: '3d development process',
                details: `<strong>3d development process</strong><br>
                <br>
                technical pipeline: meshy → blender → three.js<br>
                textures: custom illustrator designs<br>
                <br>
                the development process involved generating<br>
                base models with ai, refining geometry and<br>
                materials in blender, and implementing<br>
                interactive elements in three.js. custom<br>
                textures were created to match the bakery's<br>
                aesthetic while optimizing for web performance.`
            },
            // Additional image info for slideshows
            'FOX1.png': {
                title: 'interior space documentation',
                details: `<strong>spatial analysis</strong><br>
                <br>
                photography: digital capture<br>
                purpose: reference documentation<br>
                <br>
                these photographs document the physical space<br>
                that inspired the digital recreation. each image<br>
                captures key elements that define fox & lion's<br>
                unique atmosphere—from the curated wine selection<br>
                to the thoughtful interior design choices.`
            },
            'FOX2.png': {
                title: 'wine shelf display',
                details: `<strong>wine curation showcase</strong><br>
                <br>
                focus: product arrangement<br>
                detail: shelf organization<br>
                <br>
                documentation of the wine display system,<br>
                highlighting the careful curation and<br>
                presentation methods that make fox & lion's<br>
                beverage selection stand out. this reference<br>
                was crucial for accurate 3d modeling.`
            },
            'FOX 3.png': {
                title: 'beverage refrigerator',
                details: `<strong>cold storage display</strong><br>
                <br>
                equipment: commercial refrigeration<br>
                content: beer and non-alcoholic drinks<br>
                <br>
                the refrigerated displays complement the wine<br>
                selection, offering a full range of beverage<br>
                options. the lighting and glass surfaces<br>
                presented unique challenges for 3d recreation.`
            }
        };
    }

    updateInfoPanel(slideElement, infoPanel) {
        // Check for video first
        const video = slideElement.querySelector('video');
        if (video) {
            const source = video.querySelector('source');
            if (source) {
                const filename = source.src.split('/').pop();
                const info = this.videoInfo[filename];
                
                if (info) {
                    infoPanel.innerHTML = `<p>${info.details}</p>`;
                }
                return;
            }
        }
        
        // Check for images
        const img = slideElement.querySelector('img');
        if (img) {
            const filename = img.src.split('/').pop();
            const info = this.videoInfo[filename];
            
            if (info) {
                infoPanel.innerHTML = `<p>${info.details}</p>`;
            }
        }
    }
}

// Main initialization
// Remove page loading state when page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Remove loading state
    document.body.classList.remove('page-navigating');
    
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

    // Initialize video info manager
    const videoInfoManager = new VideoInfoManager();

    // Initialize smooth scroll WITHOUT snap
    const smoothScrollLeft = new SmoothScroll(essaySidebar, { 
        resistance: 0.7,
        damping: 0.08
    });
    
    const smoothScrollRight = new SmoothScroll(projectGallery, { 
        resistance: 0.5, // Heavier feel
        damping: 0.06 // Slower damping for heavier feel
    });
  
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

    // Simple navigation without transitions
    projectsButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'https://ethanspetnagel.online';
    });

    // Site title click to go home
    const siteTitleLink = document.querySelector('.site-title a');
    if (siteTitleLink) {
        siteTitleLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'https://ethanspetnagel.online';
        });
    }
  
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
  
    // TAB SWITCHING - Updated for only 2 tabs
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
            
            // Auto-play all videos in new section
            if (currentProject) {
                const videos = currentProject.querySelectorAll('video');
                videos.forEach(video => {
                    video.play().catch(e => console.log('Video autoplay prevented:', e));
                });
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
  
            // Update info panel content for videos
            if (!isActive) {
                const slideshow = toggle.closest('.slideshow-zone');
                const currentSlide = slideshow.querySelector('.slide.current');
                if (currentSlide && currentSlide.querySelector('video')) {
                    videoInfoManager.updateInfoPanel(currentSlide, panel);
                }
                panel.style.maxHeight = panel.scrollHeight + 'px';
            } else {
                panel.style.maxHeight = '0';
            }
        });
    });
  
    // ENHANCED SLIDESHOW + VIDEO CONTROLS
    document.querySelectorAll('.slideshow-zone').forEach(zone => {
        const slides = zone.querySelectorAll('.slide');
        let currentIndex = 0;
        let isPlaying = true; // Videos auto-play by default
  
        function showSlide(i) {
            // Hide all slides
            slides.forEach(s => {
                s.classList.remove('current');
                // Pause any videos in hidden slides
                const video = s.querySelector('video');
                if (video) {
                    video.pause();
                }
            });
            
            // Show current slide
            slides[i].classList.add('current');
            
            // Auto-play video if it's the current slide
            const video = slides[i].querySelector('video');
            if (video) {
                video.play().catch(e => console.log('Video autoplay prevented:', e));
                isPlaying = true;
            }
            
            // Update info panel if it's open
            const infoToggle = zone.querySelector('.info-toggle');
            const infoPanel = zone.querySelector('.info-panel');
            if (infoToggle && infoToggle.classList.contains('active') && infoPanel) {
                videoInfoManager.updateInfoPanel(slides[i], infoPanel);
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
                    // For videos, clicking on the right advances to next slide
                    // clicking on the left goes to previous slide
                    // No pause/play functionality - videos always play
                    if (mouseX > midpoint) {
                        currentIndex = (currentIndex + 1) % slides.length;
                    } else {
                        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    }
                    showSlide(currentIndex);
                } else {
                    // Navigate slides for images
                    if (mouseX > midpoint) {
                        currentIndex = (currentIndex + 1) % slides.length;
                    } else {
                        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
                    }
                    showSlide(currentIndex);
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
                if (slides.length > 1) {
                    // Always show NEXT/BACK for videos and images when multiple slides
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
        });
  
        // Initialize first slide and auto-play video
        showSlide(currentIndex);
        
        // Ensure all videos in the slideshow have proper attributes
        zone.querySelectorAll('video').forEach(video => {
            video.setAttribute('loop', '');
            video.setAttribute('muted', '');
            video.setAttribute('autoplay', '');
            video.setAttribute('playsinline', '');
        });
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
        const activeZone = document.querySelector('.project-set.active .slideshow-zone:hover');
        if (!activeZone) return;
  
        const slides = activeZone.querySelectorAll('.slide');
        let currentIndex = Array.from(slides).findIndex(slide => slide.classList.contains('current'));
  
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % slides.length;
            slides.forEach(s => {
                s.classList.remove('current');
                const video = s.querySelector('video');
                if (video) video.pause();
            });
            slides[currentIndex].classList.add('current');
            const newVideo = slides[currentIndex].querySelector('video');
            if (newVideo) newVideo.play();
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            slides.forEach(s => {
                s.classList.remove('current');
                const video = s.querySelector('video');
                if (video) video.pause();
            });
            slides[currentIndex].classList.add('current');
            const newVideo = slides[currentIndex].querySelector('video');
            if (newVideo) newVideo.play();
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
            // Auto-play all videos in the active section
            const videos = firstProject.querySelectorAll('video');
            videos.forEach(video => {
                video.play().catch(e => console.log('Video autoplay prevented:', e));
            });
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
  
    // Preload images and ensure videos are ready
    function preloadImage(url) {
        const img = new Image();
        img.src = url;
    }
  
    document.querySelectorAll('.slide img').forEach(img => {
        preloadImage(img.src);
    });
    
    // Ensure all videos have proper attributes for autoplay
    document.querySelectorAll('video').forEach(video => {
        video.setAttribute('loop', '');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        // Try to play videos that are visible
        if (video.closest('.slide.current')) {
            video.play().catch(e => console.log('Video autoplay prevented:', e));
        }
    });
    
    // Additional slideshow enhancement for image info panels
    document.querySelectorAll('.slideshow-zone').forEach(zone => {
        const infoToggle = zone.querySelector('.info-toggle');
        const infoPanel = zone.querySelector('.info-panel');
        
        // Update info panel when slideshow changes
        zone.addEventListener('slideChanged', () => {
            if (infoToggle && infoToggle.classList.contains('active') && infoPanel) {
                const currentSlide = zone.querySelector('.slide.current');
                videoInfoManager.updateInfoPanel(currentSlide, infoPanel);
            }
        });
    });
    
    // Dispatch custom event when slide changes
    function dispatchSlideChanged(zone) {
        zone.dispatchEvent(new CustomEvent('slideChanged'));
    }
    
    // Update all slideshow click handlers to dispatch event
    document.querySelectorAll('.slideshow-zone').forEach(zone => {
        const originalClickHandler = zone.onclick;
        zone.onclick = function(e) {
            if (originalClickHandler) originalClickHandler.call(this, e);
            setTimeout(() => dispatchSlideChanged(zone), 100);
        };
    });
});