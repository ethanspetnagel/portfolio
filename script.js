// Loading images array - use local loading images
const loadingImages = [
    { src: './loading screen image 1.jpeg', caption: 'Image 1' },
    { src: './loading screen image 2.png', caption: 'Image 2' }
];

// Project media mapping - CORRECTED FOR YOUR FOLDER STRUCTURE
const projectMedia = {
    'slug': '', // No slug video file in your folder
    'church': './church video bg.mp4',
    'talamel': '', // No video file visible
    'fox-and-lion': '', // No video file visible
    'cardioscape': '', // No video file visible
    'lu-rose-gold': './lu rose gold video bg.mp4',
    'green-lake-law': '', // No video file visible
    'artwork': '', // No video file visible
    'june-2025': '' // No video
};

// Bio link images - update these with your local images when you add them
const bioImages = {
    'church-company': '',
    'talamel-health': '',
    'slug-soap': '',
    'crowe': '',
    'colorado': ''
};

// DOM Elements - use let for reassignment
const loadingScreen = document.getElementById('loadingScreen');
const loadingImage = document.getElementById('loadingImage');
const loadingCaption = document.getElementById('loadingCaption');
const fullscreenBg = document.getElementById('fullscreenBg');
let bgVideo = document.getElementById('bgVideo');
let bgImage = document.getElementById('bgImage');
const projectLinks = document.querySelectorAll('.project-link');
const projectsContainer = document.querySelector('.projects-container');
const dateText = document.getElementById('dateText');
const aboutToggle = document.getElementById('aboutToggle');
const bioContent = document.getElementById('bioContent');
const bioLinks = document.querySelectorAll('.bio-text a[data-bio]');
const bioPreview = document.getElementById('bioPreview');
const bioPreviewImage = document.getElementById('bioPreviewImage');

// Variables
let currentMedia = null;
let activeProject = null;
let hoverTimeout = null;
let mediaTransitionTimeout = null;

// Touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Text scramble effect - letters only
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.update = this.update.bind(this);
    }
    
    setText(newText, showDesigner = false, showName = false) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length, 15);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        this.showDesigner = showDesigner;
        this.showName = showName;
        this.targetText = newText;
        this.nameText = 'ETHAN SPETNAGEL';
        
        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 60);
            this.queue.push({ from, to, start, end });
        }
        
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.nameShown = false;
        this.namePauseComplete = false;
        this.nameRevealComplete = false;
        this.update();
        return promise;
    }
    
    update() {
        let output = '';
        let complete = 0;
        
        // Progressive name reveal
        if (this.showName && this.frame >= 20 && !this.nameRevealComplete) {
            const nameProgress = Math.min((this.frame - 20) / 40, 1);
            const nameCharsToShow = Math.floor(this.nameText.length * nameProgress);
            
            for (let i = 0; i < this.nameText.length; i++) {
                if (i < nameCharsToShow) {
                    output += this.nameText[i];
                } else {
                    output += this.randomChar();
                }
            }
            
            this.el.textContent = output;
            
            if (nameProgress >= 1) {
                this.nameRevealComplete = true;
            }
        } else if (this.nameRevealComplete && this.frame < 120 && !this.namePauseComplete) {
            this.el.textContent = this.nameText;
            if (this.frame >= 120) {
                this.namePauseComplete = true;
            }
        } else if (this.namePauseComplete || !this.showName) {
            const adjustedFrame = this.showName ? this.frame - 120 : this.frame;
            
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                
                if (adjustedFrame >= end) {
                    complete++;
                    output += to;
                } else if (adjustedFrame >= start) {
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
        }
        
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

// Text Parting Effect Class - Word Level
class TextPartingEffect {
    constructor() {
        this.activeElements = new Map();
        this.rafId = null;
    }

    init() {
        // First, wrap all words in spans
        this.wrapWordsInSpans();
        
        const bioTexts = document.querySelectorAll('.bio-text');
        
        bioTexts.forEach(element => {
            element.addEventListener('mouseenter', (e) => this.startParting(e.target));
            element.addEventListener('mousemove', (e) => this.updateParting(e));
            element.addEventListener('mouseleave', (e) => this.endParting(e.target));
        });
    }

    wrapWordsInSpans() {
        const bioTexts = document.querySelectorAll('.bio-text p, .bio-text a');
        
        bioTexts.forEach(element => {
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
        const element = event.target.closest('.bio-text');
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

// Function to get random loading image
function getRandomLoadingImage() {
    const lastIndex = localStorage.getItem('lastLoadingImageIndex');
    let newIndex;
    
    do {
        newIndex = Math.floor(Math.random() * loadingImages.length);
    } while (newIndex == lastIndex && loadingImages.length > 1);
    
    localStorage.setItem('lastLoadingImageIndex', newIndex);
    return loadingImages[newIndex];
}

// Function to check if URL is video
function isVideo(url) {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.mov'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
}

// Function to show fullscreen media
function showFullscreenMedia(mediaUrl) {
    if (!mediaUrl) {
        console.log('No media URL provided');
        return;
    }
    
    console.log('showFullscreenMedia called with:', mediaUrl);
    
    if (currentMedia === mediaUrl && fullscreenBg.classList.contains('active')) {
        return;
    }
    
    if (mediaTransitionTimeout) {
        clearTimeout(mediaTransitionTimeout);
        mediaTransitionTimeout = null;
    }
    
    hideFullscreenMedia();
    
    setTimeout(() => {
        switchMedia(mediaUrl);
    }, 100);
}

// Function to switch media
function switchMedia(mediaUrl) {
    console.log('switchMedia called with:', mediaUrl);
    currentMedia = mediaUrl;
    
    // Reset both media elements
    if (bgVideo) {
        bgVideo.pause();
        bgVideo.classList.remove('active');
    }
    if (bgImage) {
        bgImage.src = '';
        bgImage.classList.remove('active');
    }
    
    const isChurch = activeProject === 'church';
    
    if (isVideo(mediaUrl)) {
        console.log('Loading video:', mediaUrl);
        
        // Remove all existing event listeners to prevent conflicts
        const newVideo = bgVideo.cloneNode(false);
        bgVideo.parentNode.replaceChild(newVideo, bgVideo);
        bgVideo = newVideo;
        
        // Set video properties
        bgVideo.src = mediaUrl;
        bgVideo.muted = true;
        bgVideo.loop = true;
        bgVideo.playsInline = true;
        bgVideo.autoplay = true;
        bgVideo.preload = 'auto';
        
        if (!isChurch && mediaUrl !== projectMedia['church']) {
            bgVideo.style.filter = 'brightness(0.9)';
        } else {
            bgVideo.style.filter = 'none';
        }
        
        const handleCanPlay = function() {
            console.log('Video can play through');
            bgVideo.classList.add('active');
            fullscreenBg.classList.add('active');
            fullscreenBg.style.opacity = '1';
            bgVideo.play().then(() => {
                console.log('Video playing successfully');
            }).catch(e => {
                console.error('Video play error:', e);
            });
        };
        
        const handleError = function(e) {
            console.error('Video loading error:', e);
            console.error('Failed URL:', mediaUrl);
            if (bgVideo.error) {
                console.error('Error code:', bgVideo.error.code);
                console.error('Error message:', bgVideo.error.message);
            }
        };
        
        bgVideo.addEventListener('canplaythrough', handleCanPlay, { once: true });
        bgVideo.addEventListener('error', handleError);
        
        bgVideo.load();
    } else if (mediaUrl) {
        console.log('Loading image/GIF:', mediaUrl);
        
        const img = new Image();
        img.onload = () => {
            console.log('Image loaded successfully');
            bgImage.src = mediaUrl;
            bgImage.classList.add('active');
            fullscreenBg.classList.add('active');
            fullscreenBg.style.opacity = '1';
            
            if (!isChurch) {
                bgImage.style.filter = 'brightness(0.9)';
            } else {
                bgImage.style.filter = 'none';
            }
        };
        img.onerror = (e) => {
            console.error('Image loading error:', e);
            console.error('Failed URL:', mediaUrl);
        };
        img.src = mediaUrl;
    }
}

// Function to hide fullscreen media
function hideFullscreenMedia() {
    currentMedia = null;
    
    fullscreenBg.classList.remove('active');
    fullscreenBg.style.opacity = '0';
    
    if (bgVideo && bgVideo.src) {
        bgVideo.pause();
        bgVideo.currentTime = 0;
        bgVideo.src = '';
    }
    
    if (bgImage) {
        bgImage.src = '';
    }
    
    setTimeout(() => {
        if (bgVideo) bgVideo.classList.remove('active');
        if (bgImage) bgImage.classList.remove('active');
    }, 100);
}

// Improved project hover management
function handleProjectHover(link, isEntering) {
    if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
    }
    
    if (isEntering) {
        const project = link.getAttribute('data-project');
        let projectInfo = link.getAttribute('data-info');
        const mediaUrl = projectMedia[project];
        
        // Update project info for specific projects
        if (project === 'slug') {
            projectInfo = 'PRODUCT & IDENTITY – 2024';
        } else if (project === 'green-lake-law') {
            projectInfo = 'UX & IDENTITY – 2025';
        }
        
        console.log(`Hovering over ${project}, media URL: ${mediaUrl || 'No media'}`);
        
        activeProject = project;
        projectsContainer.classList.add('hovering');
        
        dateText.textContent = projectInfo;
        dateText.classList.add('project-active');
        
        if (mediaUrl) {
            showFullscreenMedia(mediaUrl);
        }
    } else {
        if (activeProject === link.getAttribute('data-project')) {
            activeProject = null;
            projectsContainer.classList.remove('hovering');
            
            dateText.textContent = 'JUNE 2025';
            dateText.classList.remove('project-active');
            
            hideFullscreenMedia();
        }
    }
}

// Initialize text parting effect
const textParting = new TextPartingEffect();

// About toggle functionality
const aboutScramble = new TextScramble(aboutToggle);
let isAboutOpen = false;

aboutToggle.textContent = 'ABOUT';

aboutToggle.addEventListener('click', function() {
    bioContent.classList.toggle('active');
    isAboutOpen = !isAboutOpen;
    
    if (isAboutOpen) {
        aboutScramble.setText('HIDE', false, true);
        
        // Initialize text parting effect after bio is visible
        setTimeout(() => {
            textParting.init();
        }, 100);
    } else {
        aboutScramble.setText('ABOUT');
    }
});

aboutToggle.addEventListener('mouseenter', function() {
    if (!isAboutOpen) {
        aboutScramble.setText('ABOUT');
    } else {
        aboutScramble.setText('HIDE');
    }
});

// Project link events
if (!isTouchDevice) {
    projectLinks.forEach(link => {
        link.addEventListener('mouseenter', function(e) {
            handleProjectHover(this, true);
        });
        
        link.addEventListener('mouseleave', function(e) {
            handleProjectHover(this, false);
        });
    });
} else {
    let lastTouchedLink = null;
    
    projectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const project = this.getAttribute('data-project');
            const projectInfo = this.getAttribute('data-info');
            const mediaUrl = projectMedia[project];
            
            if (lastTouchedLink === this) {
                window.location.href = this.href;
                return;
            }
            
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            
            lastTouchedLink = this;
            this.classList.add('touch-active');
            projectsContainer.classList.add('touch-hovering');
            
            dateText.textContent = projectInfo;
            dateText.classList.add('project-active');
            
            if (mediaUrl) {
                showFullscreenMedia(mediaUrl);
            }
        });
    });
    
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.project-link')) {
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            projectsContainer.classList.remove('touch-hovering');
            dateText.textContent = 'JUNE 2025';
            dateText.classList.remove('project-active');
            hideFullscreenMedia();
            lastTouchedLink = null;
        }
    });
}

// Date text hover event
dateText.addEventListener('mouseenter', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.add('june-hover');
        
        if (fullscreenBg.classList.contains('active')) {
            hideFullscreenMedia();
        }
    }
});

dateText.addEventListener('mouseleave', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.remove('june-hover');
    }
});

// Bio link hover events
bioLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        const bioType = this.getAttribute('data-bio');
        const imageUrl = bioImages[bioType];
        
        if (imageUrl) {
            bioPreviewImage.src = imageUrl;
            bioPreviewImage.alt = this.textContent;
            bioPreview.classList.add('active');
        }
    });
    
    link.addEventListener('mouseleave', function() {
        bioPreview.classList.remove('active');
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing');
    
    // Set random loading image
    const selectedImage = getRandomLoadingImage();
    if (loadingImage && selectedImage) {
        loadingImage.src = selectedImage.src;
        if (loadingCaption) {
            loadingCaption.textContent = selectedImage.caption;
        }
    }
    
    // Hide loading screen after 4 seconds
    setTimeout(() => {
        console.log('Hiding loading screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                // Make sure main content is visible
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.classList.add('visible');
                }
            }, 500);
        }
    }, 4000);
    
    // Log all project media paths for debugging
    console.log('Project media paths:');
    Object.entries(projectMedia).forEach(([project, path]) => {
        console.log(`- ${project}: ${path || 'No media'}`);
    });
    
    // Initialize page transition
    const pageTransition = new PageTransition();
});

// Fallback: Force hide loading screen
window.addEventListener('load', () => {
    console.log('Window fully loaded');
    setTimeout(() => {
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('Force hiding loading screen on window load');
            loadingScreen.style.display = 'none';
        }
    }, 1000);
});

// Emergency fallback
setTimeout(() => {
    if (loadingScreen && loadingScreen.style.display !== 'none') {
        console.log('Emergency hide loading screen');
        loadingScreen.style.display = 'none';
    }
}, 5000);

// NEW Page Transition System with Curved Slide
class PageTransition {
    constructor() {
        this.isTransitioning = false;
        this.init();
    }

    init() {
        // Create transition elements
        this.createTransitionElements();
        
        // Override default link behavior for project links
        this.attachLinkHandlers();
    }

    createTransitionElements() {
        // Create main transition container
        const transitionContainer = document.createElement('div');
        transitionContainer.className = 'page-transition-container';
        
        // Create current page wrapper
        const currentPageWrapper = document.createElement('div');
        currentPageWrapper.className = 'transition-current-page';
        
        // Create next page wrapper (will be populated with iframe)
        const nextPageWrapper = document.createElement('div');
        nextPageWrapper.className = 'transition-next-page';
        
        transitionContainer.appendChild(currentPageWrapper);
        transitionContainer.appendChild(nextPageWrapper);
        
        // Add to body
        document.body.appendChild(transitionContainer);
        
        // Store references
        this.elements = {
            container: transitionContainer,
            currentPage: currentPageWrapper,
            nextPage: nextPageWrapper
        };
    }

    attachLinkHandlers() {
        const projectLinks = document.querySelectorAll('.project-link');
        
        projectLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.isTransitioning) {
                    e.preventDefault();
                    const href = link.href;
                    this.startTransition(href);
                }
            });
        });
    }

    startTransition(targetUrl) {
        this.isTransitioning = true;
        document.body.classList.add('transitioning');
        
        // Clone current page content
        const mainContent = document.querySelector('.main-content').cloneNode(true);
        this.elements.currentPage.appendChild(mainContent);
        
        // Create iframe for next page
        const iframe = document.createElement('iframe');
        iframe.src = targetUrl + '?transition=true';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        
        // Load next page content
        iframe.onload = () => {
            // Start animation after iframe loads
            setTimeout(() => {
                this.animateTransition(targetUrl);
            }, 100);
        };
        
        this.elements.nextPage.appendChild(iframe);
        
        // Activate transition container
        this.elements.container.classList.add('active');
    }

    animateTransition(targetUrl) {
        // Apply curved slide animation
        const duration = 2000; // 2 seconds
        const easing = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; // Smooth deceleration
        
        // Animate current page sliding down with slight scale
        this.elements.currentPage.style.transition = `transform ${duration}ms ${easing}`;
        this.elements.currentPage.style.transform = 'translateY(100vh) scale(0.95)';
        
        // Animate next page sliding in with curve
        this.elements.nextPage.style.transition = `transform ${duration}ms ${easing}`;
        this.elements.nextPage.style.transform = 'translateY(0) translateX(0)';
        
        // Add curve effect using multiple keyframes
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Create curved path
            const curve = Math.sin(progress * Math.PI * 0.5) * 50; // Curve amplitude
            const yProgress = this.easeOutCubic(progress);
            
            this.elements.nextPage.style.transform = `translateY(${(1 - yProgress) * -100}vh) translateX(${curve * (1 - progress)}px)`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Transition complete, navigate
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 100);
            }
        };
        
        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}