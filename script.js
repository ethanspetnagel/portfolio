// Project media mapping
const projectMedia = {
    'slug': '', 
    'church': './church video bg.mp4',
    'talamel': '', 
    'fox-and-lion': '', 
    'cardioscape': '', 
    'lu-rose-gold': './lu rose gold video bg.mp4',
    'green-lake-law': '', 
    'artwork': '', 
    'june-2025': ''
};

// Bio link images
const bioImages = {
    'church-company': '',
    'talamel-health': '',
    'slug-soap': '',
    'crowe': '',
    'colorado': ''
};

// DOM Elements
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
let videoPool = {};
let currentActiveVideo = null;
let brightnessCheckInterval = null;

// Touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Function to analyze video brightness
function getVideoBrightness(video) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Sample size for performance
    canvas.width = 50;
    canvas.height = 50;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let brightness = 0;
    
    // Calculate average brightness
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate perceived brightness
        brightness += (0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    brightness = brightness / (data.length / 4);
    return brightness / 255; // Normalize to 0-1
}

// Function to update text colors based on video brightness
function updateTextColors() {
    if (!currentActiveVideo || currentActiveVideo.paused) return;
    
    const brightness = getVideoBrightness(currentActiveVideo);
    const isDark = brightness < 0.5;
    
    // Apply appropriate text color class
    if (isDark) {
        document.body.classList.add('video-dark');
        document.body.classList.remove('video-light');
    } else {
        document.body.classList.add('video-light');
        document.body.classList.remove('video-dark');
    }
}

// Initialize video pool for instant playback
function initializeVideoPool() {
    // Remove old video/image elements
    if (bgVideo) bgVideo.remove();
    if (bgImage) bgImage.remove();
    
    // Create video elements for each project
    Object.entries(projectMedia).forEach(([project, url]) => {
        if (url && url.includes('.mp4')) {
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = false;
            video.preload = 'auto';
            video.style.position = 'absolute';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            video.style.opacity = '0';
            video.style.display = 'none';
            video.style.transition = 'opacity 0.1s linear';
            video.dataset.project = project;
            
            // Hardware acceleration
            video.style.transform = 'translateZ(0)';
            video.style.webkitTransform = 'translateZ(0)';
            video.style.backfaceVisibility = 'hidden';
            
            // Add to DOM
            fullscreenBg.appendChild(video);
            videoPool[project] = video;
            
            // Force load
            video.load();
            
            // Ensure video is ready
            video.addEventListener('canplaythrough', () => {
                console.log(`${project} video ready`);
            });
        }
    });
}

// Show video instantly
function showVideo(project) {
    const video = videoPool[project];
    if (!video) return false;
    
    // Hide current video if exists
    if (currentActiveVideo && currentActiveVideo !== video) {
        currentActiveVideo.style.opacity = '0';
        setTimeout(() => {
            currentActiveVideo.style.display = 'none';
            currentActiveVideo.pause();
        }, 100);
    }
    
    // Apply filter
    if (project !== 'church') {
        video.style.filter = 'brightness(0.9)';
    } else {
        video.style.filter = 'none';
    }
    
    // Show new video instantly
    video.style.display = 'block';
    video.play().catch(e => {
        console.log('Play failed, retrying...', e);
        // Retry on interaction
        document.addEventListener('click', () => {
            video.play();
        }, { once: true });
    });
    
    // Fade in
    requestAnimationFrame(() => {
        video.style.opacity = '1';
        fullscreenBg.classList.add('active');
        fullscreenBg.style.opacity = '1';
    });
    
    currentActiveVideo = video;
    currentMedia = projectMedia[project];
    
    // Start brightness monitoring
    if (brightnessCheckInterval) {
        clearInterval(brightnessCheckInterval);
    }
    
    // Initial check after video starts playing
    setTimeout(updateTextColors, 100);
    
    // Continue checking periodically
    brightnessCheckInterval = setInterval(updateTextColors, 500);
    
    return true;
}

// Hide all media
function hideAllMedia() {
    fullscreenBg.classList.remove('active');
    fullscreenBg.style.opacity = '0';
    
    if (currentActiveVideo) {
        currentActiveVideo.style.opacity = '0';
        setTimeout(() => {
            currentActiveVideo.style.display = 'none';
            currentActiveVideo.pause();
            currentActiveVideo = null;
        }, 100);
    }
    
    // Clear brightness monitoring
    if (brightnessCheckInterval) {
        clearInterval(brightnessCheckInterval);
        brightnessCheckInterval = null;
    }
    
    // Remove video color classes
    document.body.classList.remove('video-dark', 'video-light');
    
    currentMedia = null;
}

// Text scramble effect
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.update = this.update.bind(this);
    }
    
    setText(newText, showName = false) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length, 15);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
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

// Text Parting Effect
class TextPartingEffect {
    constructor() {
        this.activeElements = new Map();
    }

    init() {
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

        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        data.words.forEach((wordData, word) => {
            const rect = word.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const deltaX = cursorX - centerX;
            const deltaY = cursorY - centerY;
            
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxInfluence = 150;
            
            if (distance < maxInfluence) {
                const strength = (1 - distance / maxInfluence) * 25;
                const angle = Math.atan2(deltaY, deltaX);
                const pushX = -Math.cos(angle) * strength;
                const pushY = -Math.sin(angle) * strength;
                
                word.style.transform = `translate(${pushX}px, ${pushY}px)`;
                word.style.transition = 'transform 0.1s ease-out';
            } else {
                word.style.transform = wordData.originalTransform;
                word.style.transition = 'transform 0.2s ease-out';
            }
        });
    }

    endParting(element) {
        const data = this.activeElements.get(element);
        
        if (data) {
            data.isActive = false;
            
            data.words.forEach((wordData, word) => {
                word.style.transition = 'transform 0.3s ease-out';
                word.style.transform = wordData.originalTransform;
            });
            
            setTimeout(() => {
                if (!data.isActive) {
                    this.activeElements.delete(element);
                }
            }, 300);
        }
    }
}

// Project hover handling with inverse effect
function handleProjectHover(link, isEntering) {
    if (isEntering) {
        const project = link.getAttribute('data-project');
        const projectInfo = link.getAttribute('data-info');
        
        activeProject = project;
        projectsContainer.classList.add('hovering');
        document.body.classList.add('project-hovering'); // Add body class for inverse effect
        
        dateText.textContent = projectInfo;
        dateText.classList.add('project-active');
        
        // Show video for this project
        const mediaUrl = projectMedia[project];
        if (mediaUrl && mediaUrl.includes('.mp4')) {
            showVideo(project);
        } else {
            hideAllMedia();
        }
    } else {
        activeProject = null;
        projectsContainer.classList.remove('hovering');
        document.body.classList.remove('project-hovering'); // Remove body class
        
        dateText.textContent = 'JUNE 2025';
        dateText.classList.remove('project-active');
        
        hideAllMedia();
    }
}

// Initialize text effects
const textParting = new TextPartingEffect();
const aboutScramble = new TextScramble(aboutToggle);
let isAboutOpen = false;

// About toggle functionality
aboutToggle.addEventListener('click', function() {
    bioContent.classList.toggle('active');
    isAboutOpen = !isAboutOpen;
    
    if (isAboutOpen) {
        aboutScramble.setText('HIDE', true);
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
            
            if (lastTouchedLink === this) {
                window.location.href = this.href;
                return;
            }
            
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            
            lastTouchedLink = this;
            this.classList.add('touch-active');
            projectsContainer.classList.add('touch-hovering');
            document.body.classList.add('project-hovering'); // Add for touch devices too
            
            dateText.textContent = projectInfo;
            dateText.classList.add('project-active');
            
            const mediaUrl = projectMedia[project];
            if (mediaUrl && mediaUrl.includes('.mp4')) {
                showVideo(project);
            } else {
                hideAllMedia();
            }
        });
    });
    
    document.addEventListener('touchstart', function(e) {
        if (!e.target.closest('.project-link')) {
            projectLinks.forEach(l => l.classList.remove('touch-active'));
            projectsContainer.classList.remove('touch-hovering');
            document.body.classList.remove('project-hovering'); // Remove for touch devices
            dateText.textContent = 'JUNE 2025';
            dateText.classList.remove('project-active');
            hideAllMedia();
            lastTouchedLink = null;
        }
    });
}

// Date text hover
dateText.addEventListener('mouseenter', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.add('june-hover');
        if (fullscreenBg.classList.contains('active')) {
            hideAllMedia();
        }
    }
});

dateText.addEventListener('mouseleave', function() {
    if (!dateText.classList.contains('project-active')) {
        document.body.classList.remove('june-hover');
    }
});

// Bio link hover
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

// Page Transition System
class PageTransition {
    constructor() {
        this.isTransitioning = false;
        this.init();
    }

    init() {
        this.createTransitionElements();
        this.attachLinkHandlers();
    }

    createTransitionElements() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        
        const currentClone = document.createElement('div');
        currentClone.className = 'transition-clone-current';
        
        const nextClone = document.createElement('div');
        nextClone.className = 'transition-clone-next';
        
        overlay.appendChild(currentClone);
        overlay.appendChild(nextClone);
        document.body.appendChild(overlay);
        
        this.elements = {
            overlay: overlay,
            currentClone: currentClone,
            nextClone: nextClone
        };
    }

    attachLinkHandlers() {
        const projectLinks = document.querySelectorAll('.project-link');
        
        projectLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (!this.isTransitioning && !isTouchDevice) {
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
        
        const mainContent = document.querySelector('body').cloneNode(true);
        const overlayInClone = mainContent.querySelector('.page-transition-overlay');
        if (overlayInClone) overlayInClone.remove();
        
        this.elements.currentClone.innerHTML = mainContent.innerHTML;
        
        const nextContent = document.createElement('div');
        nextContent.innerHTML = '<div style="height: 100vh; display: flex; align-items: center; justify-content: center;"><h1 style="font-size: 4rem;">Loading...</h1></div>';
        this.elements.nextClone.appendChild(nextContent);
        
        this.elements.overlay.classList.add('active');
        
        setTimeout(() => {
            this.elements.currentClone.classList.add('animating');
            this.elements.nextClone.classList.add('animating');
            
            // Navigate after animation - faster timing
            setTimeout(() => {
                window.location.href = targetUrl + '?transition=true';
            }, 600); // Changed to 600ms for quicker transition
        }, 50);
    }
}

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing video system...');
    
    // Initialize video pool immediately
    initializeVideoPool();
    
    // Initialize page transition
    const pageTransition = new PageTransition();
    
    // Force start videos after a brief delay
    setTimeout(() => {
        Object.values(videoPool).forEach(video => {
            video.play().catch(() => {});
        });
    }, 1000);
});