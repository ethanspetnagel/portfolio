// Loading images array - use local loading images
const loadingImages = [
    { src: './loading screen image 1.jpeg', caption: 'Image 1' },
    { src: './loading screen image 2.png', caption: 'Image 2' }
];

// Project media mapping - LOCAL FILES ONLY
const projectMedia = {
    'slug': './slug archive video.mp4',
    'church': './church video bg.mp4',
    'talamel': '', // No video yet
    'fox-and-lion': '', // No video yet
    'cardioscape': '', // No video yet
    'lu-rose-gold': './lu rose gold video bg.mp4',
    'green-lake-law': '', // No video yet
    'artwork': '', // No video yet
    'june-2025': '' // No video
};

// Bio link images - update these with your local images
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
    if (!mediaUrl) return;
    
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
        bgVideo.src = '';
        bgVideo.classList.remove('active');
    }
    if (bgImage) {
        bgImage.src = '';
        bgImage.classList.remove('active');
    }
    
    const isChurch = activeProject === 'church';
    
    if (isVideo(mediaUrl)) {
        console.log('Loading video:', mediaUrl);
        
        // Simple video loading
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
            bgVideo.removeEventListener('canplaythrough', handleCanPlay);
            bgVideo.classList.add('active');
            fullscreenBg.classList.add('active');
            fullscreenBg.style.opacity = '1';
            bgVideo.play().then(() => {
                console.log('Video playing successfully');
            }).catch(e => {
                console.error('Video play error:', e);
            });
        };
        
        bgVideo.addEventListener('canplaythrough', handleCanPlay);
        
        bgVideo.addEventListener('error', function(e) {
            console.error('Video loading error:', e);
            console.error('Failed URL:', mediaUrl);
            console.error('Error code:', bgVideo.error?.code);
            console.error('Error message:', bgVideo.error?.message);
        });
        
        bgVideo.load();
    } else {
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
        const projectInfo = link.getAttribute('data-info');
        const mediaUrl = projectMedia[project];
        
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

// About toggle functionality
const aboutScramble = new TextScramble(aboutToggle);
let isAboutOpen = false;

aboutToggle.textContent = 'ABOUT';

const bioTextElements = document.querySelectorAll('.bio-text p, .bio-text a, .contact-links a');
const bioScramblers = Array.from(bioTextElements).map(el => ({
    element: el,
    scrambler: new TextScramble(el),
    originalText: el.innerText
}));

aboutToggle.addEventListener('click', function() {
    bioContent.classList.toggle('active');
    isAboutOpen = !isAboutOpen;
    
    if (isAboutOpen) {
        aboutScramble.setText('HIDE', false, true);
        
        bioScramblers.forEach((item, index) => {
            setTimeout(() => {
                item.scrambler.setText(item.originalText);
            }, index * 150 + 300);
        });
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
    if (loadingImg && selectedImage) {
        loadingImg.src = selectedImage.src;
        loadingCaption.textContent = selectedImage.caption;
    }
    
    // Hide loading screen after 4 seconds
    setTimeout(() => {
        console.log('Hiding loading screen');
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 4000);
});

// Fallback: Force hide loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        if (loadingScreen && loadingScreen.style.display !== 'none') {
            console.log('Force hiding loading screen');
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