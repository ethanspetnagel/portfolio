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
            'skincare 1.mp4': {
                title: 'botanical clay cleanser advertisement',
                details: `<strong>botanical clay cleanser advertisement</strong><br>
                <br>
                software: after effects, premiere pro<br>
                duration: 15s, 30s, 60s cuts<br>
                <br>
                this campaign piece features imagery captured in<br>
                the marin headlands, establishing a direct visual<br>
                connection between our products and their natural<br>
                origins. the juxtaposition of raw landscape footage<br>
                with refined product shots creates a narrative that<br>
                reinforces our commitment to botanical ingredients.<br>
                <br>
                i developed custom logo animations in after effects,<br>
                employing organic motion curves that mirror the<br>
                fluidity of natural elements while maintaining<br>
                brand sophistication.`
            },
            'skincare 2.mp4': {
                title: 'shampoo & conditioner bar campaign',
                details: `<strong>shampoo & conditioner bar campaign</strong><br>
                <br>
                software: after effects<br>
                platform: instagram reels, stories<br>
                <br>
                this video demonstrates the practical application<br>
                of our solid haircare products while reinforcing<br>
                our all-natural brand identity. created entirely<br>
                in after effects, the piece combines product<br>
                demonstration with lifestyle messaging.<br>
                <br>
                the animation techniques employed create a seamless<br>
                narrative flow that educates consumers on product<br>
                usage while building emotional connection to the<br>
                brand's sustainable ethos.`
            },
            'skincare 3.mp4': {
                title: 'multi-product showcase',
                details: `<strong>multi-product showcase</strong><br>
                <br>
                software: after effects, premiere pro<br>
                concept: nature-product synthesis<br>
                <br>
                a comprehensive brand piece showcasing our complete<br>
                skincare line against natural backdrops. this<br>
                instagram-optimized content weaves together product<br>
                beauty shots with environmental footage, creating<br>
                a visual metaphor for our farm-to-face philosophy.<br>
                <br>
                the editing rhythm and color grading establish<br>
                a cohesive aesthetic that has become synonymous<br>
                with church california's digital presence.`
            },
            'skincare 4.mp4': {
                title: 'integrated campaign spot',
                details: `<strong>integrated campaign spot</strong><br>
                <br>
                software: after effects, premiere pro<br>
                deployment: multi-platform<br>
                <br>
                this versatile campaign asset features advanced<br>
                motion graphics created in after effects, combined<br>
                with editorial finesse in premiere pro. the spot<br>
                serves multiple strategic purposes—from social<br>
                media engagement to conversion-focused advertising.<br>
                <br>
                the visual effects reinforce product benefits<br>
                while maintaining the authentic, artisanal<br>
                quality that defines our brand.`
            },
            'pomade 1.mp4': {
                title: 'customer testimonial animation',
                details: `<strong>customer testimonial animation</strong><br>
                <br>
                software: after effects<br>
                platforms: instagram, google ads, youtube<br>
                <br>
                as my inaugural project for church california,<br>
                this testimonial-driven advertisement leverages<br>
                authentic customer reviews to build trust and<br>
                credibility. the kinetic typography treatment<br>
                emphasizes key product benefits while maintaining<br>
                readability across multiple viewing contexts.<br>
                <br>
                strategic pacing and hierarchical animation<br>
                create moments of emphasis that align with<br>
                conversion-focused messaging.`
            },
            'pomade 2.mp4': {
                title: '3d product visualization',
                details: `<strong>3d product visualization</strong><br>
                <br>
                software: blender, after effects<br>
                technique: 3d motion graphics<br>
                <br>
                these 3d pomade renderings were meticulously<br>
                crafted in blender before being integrated into<br>
                after effects for animation. the piece showcases<br>
                press recognition and editorial features, lending<br>
                third-party credibility to our products.<br>
                <br>
                the photorealistic 3d elements elevate the<br>
                production value while maintaining consistency<br>
                with our premium positioning in the grooming market.`
            },
            'pomade 3.mp4': {
                title: 'cyclical brand animation',
                details: `<strong>cyclical brand animation</strong><br>
                <br>
                software: after effects<br>
                purpose: instagram brand content<br>
                <br>
                this looping motion design piece serves as<br>
                evergreen content for our social channels.<br>
                the cyclical nature of the animation mirrors<br>
                the habitual use of our products while<br>
                incorporating our pomade tagline.<br>
                <br>
                created entirely in after effects, this piece<br>
                demonstrates how strategic motion design can<br>
                reinforce brand messaging through visual<br>
                rhythm and repetition.`
            },
            'pomade 4.mp4': {
                title: 'rapid-fire product showcase',
                details: `<strong>rapid-fire product showcase</strong><br>
                <br>
                software: after effects<br>
                format: quick-cut montage<br>
                <br>
                these attention-grabbing still image animations<br>
                are optimized for short-form content consumption.<br>
                by creating dynamic movement from static product<br>
                photography, these pieces maximize engagement<br>
                in the critical first seconds of viewing.<br>
                <br>
                the technique proves particularly effective for<br>
                social media algorithms that favor<br>
                high-engagement content.`
            },
            'pomade 5.mp4': {
                title: 'kinetic product photography',
                details: `<strong>kinetic product photography</strong><br>
                <br>
                software: after effects<br>
                strategy: scroll-stopping content<br>
                <br>
                continuing our quick-cut series, this piece<br>
                transforms product stills into compelling motion<br>
                content. the rapid transitions and dynamic effects<br>
                are calibrated to capture attention in crowded<br>
                social feeds while maintaining brand sophistication.<br>
                <br>
                each frame is designed to work as both a<br>
                standalone image and part of the kinetic whole.`
            },
            'pomade 6.mp4': {
                title: 'product application demonstration',
                details: `<strong>product application demonstration</strong><br>
                <br>
                software: after effects<br>
                focus: user experience<br>
                <br>
                this piece combines intimate product shots with<br>
                real-world application footage. created in after<br>
                effects, the advertisement bridges the gap between<br>
                aspiration and practical use.<br>
                <br>
                close-up texture shots highlight product quality<br>
                while usage demonstrations build consumer<br>
                confidence in the application process.`
            },
            'brand 1.mp4': {
                title: 'barbershop documentary series',
                details: `<strong>barbershop documentary series</strong><br>
                <br>
                software: after effects, premiere pro<br>
                concept: product authenticity narrative<br>
                <br>
                this brand film showcases the symbiotic<br>
                relationship between church california products<br>
                and the barbershop where they're conceived and<br>
                tested. through dynamic zoom transitions created<br>
                in after effects, the piece weaves together the<br>
                dual narratives of craftsmanship and commerce.<br>
                <br>
                the documentary approach legitimizes our<br>
                "made by barbers, for everyone" positioning<br>
                while highlighting the rigorous product<br>
                development process that occurs within<br>
                the shop's walls.`
            },
            'brand 2.mov': {
                title: 'barber tutorial series',
                details: `<strong>barber tutorial series</strong><br>
                <br>
                software: premiere pro, after effects<br>
                featuring: cam - church barber<br>
                <br>
                this tutorial features cam, one of our senior<br>
                barbers, demonstrating professional pomade<br>
                application techniques. the piece serves dual<br>
                purposes—educating consumers while reinforcing<br>
                product credibility through professional endorsement.<br>
                <br>
                by showcasing actual barbers using our products<br>
                in their daily practice, we substantiate our<br>
                claim of professional-grade quality.`
            },
            'brand 3.mp4': {
                title: 'barbershop lifestyle montage',
                details: `<strong>barbershop lifestyle montage</strong><br>
                <br>
                software: after effects<br>
                source: brand photoshoot archives<br>
                <br>
                this rapid-cut brand piece leverages our extensive<br>
                photography archive to create a dynamic snapshot<br>
                of barbershop culture. the editing style captures<br>
                the energy and authenticity of our retail<br>
                environment while reinforcing the message that<br>
                church products are born from professional expertise.<br>
                <br>
                each frame is carefully selected to balance<br>
                product visibility with lifestyle authenticity.`
            }
        };
    }

    updateInfoPanel(slideElement, infoPanel) {
        const video = slideElement.querySelector('video');
        if (!video) return;
        
        const source = video.querySelector('source');
        if (!source) return;
        
        const filename = source.src.split('/').pop();
        const info = this.videoInfo[filename];
        
        if (info) {
            infoPanel.innerHTML = `<p>${info.details}</p>`;
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
        window.location.href = '../index.html';
    });

    // Site title click to go home
    const siteTitleLink = document.querySelector('.site-title a');
    if (siteTitleLink) {
        siteTitleLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '../index.html';
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
});