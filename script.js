// Project media mapping with brightness info
const projectMedia = {
    'slug': {
        url: './slug.mp4',
        isDark: true  // slug video appears to be dark
    }, 
    'church': {
        url: './church video bg.mp4',
        isDark: true  // Church video appears to be dark
    },
    'talamel': '', 
    'fox-and-lion': { 
        url: './foxlionbg.mp4', 
        isDark: false  // Fixed: isDark capitalization
    }, 
    'ecoscan': '',
    'cardioscape': { 
        url: './cardio.mp4', 
        isDark: true  // Fixed: isDark capitalization
    },
    'lu-rose-gold': {
        url: './lu rose gold video bg.mp4',
        isDark: false  // Lu Rose Gold video appears to be light
    },
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
let isTransitioning = false;

// Touch device detection
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Initialize video pool for instant playback
function initializeVideoPool() {
    // Create video elements for each project
    Object.entries(projectMedia).forEach(([project, mediaInfo]) => {
        const url = typeof mediaInfo === 'string' ? mediaInfo : mediaInfo?.url;
        if (url && url.includes('.mp4')) {
            const video = document.createElement('video');
            video.src = url;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.autoplay = false;
            video.preload = 'auto';
            video.className = 'bg-video';
            video.dataset.project = project;
            
            // Start with videos hidden
            video.style.opacity = '0';
            video.style.visibility = 'hidden';
            
            // Add filter for non-church videos
            if (project !== 'church') {
                video.style.filter = 'brightness(0.9)';
            }
            
            // Add to DOM
            fullscreenBg.appendChild(video);
            videoPool[project] = video;
            
            // Force load
            video.load();
            
            // Prestart videos for instant playback
            video.addEventListener('loadeddata', () => {
                // Play and immediately pause to have frame ready
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(() => {});
            });
        }
    });
}

// Show video instantly
function showVideo(project) {
    if (isTransitioning) return false;
    
    const video = videoPool[project];
    if (!video) return false;
    
    isTransitioning = true;
    
    // Hide current video if exists
    if (currentActiveVideo && currentActiveVideo !== video) {
        currentActiveVideo.style.opacity = '0';
        currentActiveVideo.style.visibility = 'hidden';
        // Don't wait for transition - immediately pause
        currentActiveVideo.pause();
    }
    
    // Show new video instantly
    video.style.visibility = 'visible';
    video.currentTime = 0; // Reset to start
    
    // Start playing immediately
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Once playing, fade in
            requestAnimationFrame(() => {
                video.style.opacity = '1';
                video.classList.add('active');
                fullscreenBg.classList.add('active');
                isTransitioning = false;
            });
        }).catch(error => {
            console.log('Play failed:', error);
            // Still show the video even if autoplay fails
            video.style.opacity = '1';
            video.classList.add('active');
            fullscreenBg.classList.add('active');
            isTransitioning = false;
        });
    }
    
    currentActiveVideo = video;
    currentMedia = projectMedia[project];
    
    // Apply text color based on video brightness
    const mediaInfo = projectMedia[project];
    if (mediaInfo && typeof mediaInfo === 'object' && mediaInfo.isDark !== undefined) {
        if (mediaInfo.isDark) {
            document.body.classList.add('video-dark');
            document.body.classList.remove('video-light');
        } else {
            document.body.classList.add('video-light');
            document.body.classList.remove('video-dark');
        }
    }
    
    return true;
}

// Hide all media
function hideAllMedia() {
    fullscreenBg.classList.remove('active');
    
    if (currentActiveVideo) {
        currentActiveVideo.style.opacity = '0';
        currentActiveVideo.style.visibility = 'hidden';
        currentActiveVideo.pause();
        currentActiveVideo.classList.remove('active');
        currentActiveVideo = null;
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

// Project hover handling
function handleProjectHover(link, isEntering) {
    if (isEntering) {
        const project = link.getAttribute('data-project');
        const projectInfo = link.getAttribute('data-info');
        
        activeProject = project;
        projectsContainer.classList.add('hovering');
        document.body.classList.add('project-hovering');
        
        dateText.textContent = projectInfo;
        dateText.classList.add('project-active');
        
        // Show video for this project
        const mediaUrl = projectMedia[project];
        const url = typeof mediaUrl === 'string' ? mediaUrl : mediaUrl?.url;
        if (url && url.includes('.mp4')) {
            showVideo(project);
        } else {
            hideAllMedia();
        }
    } else {
        activeProject = null;
        projectsContainer.classList.remove('hovering');
        document.body.classList.remove('project-hovering');
        
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
        
        // Simple navigation without transitions
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = this.href;
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
            document.body.classList.add('project-hovering');
            
            dateText.textContent = projectInfo;
            dateText.classList.add('project-active');
            
            const mediaUrl = projectMedia[project];
            const url = typeof mediaUrl === 'string' ? mediaUrl : mediaUrl?.url;
            if (url && url.includes('.mp4')) {
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
            document.body.classList.remove('project-hovering');
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

// Initialize everything on DOM load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing video system...');
    
    // Initialize video pool immediately
    initializeVideoPool();
    
    // Attempt to start videos after user interaction
    document.addEventListener('mousemove', () => {
        Object.values(videoPool).forEach(video => {
            if (video.paused) {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(() => {});
            }
        });
    }, { once: true });
});