document.addEventListener('DOMContentLoaded', () => {
    const projectLinks = document.querySelectorAll('.project-link');
    const projectsContainer = document.querySelector('.projects-container');
    const fullscreenBg = document.querySelector('.fullscreen-bg');
    const dateText = document.querySelector('.date-text');
    const aboutToggle = document.querySelector('.about-toggle');
    const bioContent = document.querySelector('.bio-content');
    const bioPreview = document.querySelector('.bio-preview');

    let hoverTimeout = null;

    // About toggle with bio preview
    if (aboutToggle && bioContent) {
        aboutToggle.addEventListener('click', () => {
            bioContent.classList.toggle('active');
            if (bioPreview) {
                bioPreview.classList.toggle('active');
            }
        });
    }

    // Date hover effect
    if (dateText) {
        dateText.addEventListener('mouseenter', () => {
            document.body.classList.add('june-hover');
        });
        
        dateText.addEventListener('mouseleave', () => {
            document.body.classList.remove('june-hover');
        });
    }

    // Text parting effect for bio text
    const bioText = document.querySelector('.bio-text');
    if (bioText) {
        // Preserve HTML structure while adding word spans
        const processTextNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const words = node.textContent.trim().split(/\s+/);
                if (words.length > 1) {
                    const fragment = document.createDocumentFragment();
                    words.forEach((word, index) => {
                        if (word) {
                            const span = document.createElement('span');
                            span.className = 'word';
                            span.textContent = word;
                            fragment.appendChild(span);
                            if (index < words.length - 1) {
                                fragment.appendChild(document.createTextNode(' '));
                            }
                        }
                    });
                    node.parentNode.replaceChild(fragment, node);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Process child nodes
                Array.from(node.childNodes).forEach(processTextNode);
            }
        };

        Array.from(bioText.childNodes).forEach(processTextNode);
        
        const wordSpans = bioText.querySelectorAll('.word');
        
        bioText.addEventListener('mousemove', (e) => {
            const rect = bioText.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            wordSpans.forEach(span => {
                const spanRect = span.getBoundingClientRect();
                const spanX = spanRect.left - rect.left + spanRect.width / 2;
                const spanY = spanRect.top - rect.top + spanRect.height / 2;
                
                const distance = Math.sqrt((mouseX - spanX) ** 2 + (mouseY - spanY) ** 2);
                const maxDistance = 100;
                
                if (distance < maxDistance) {
                    const force = (maxDistance - distance) / maxDistance;
                    const angle = Math.atan2(spanY - mouseY, spanX - mouseX);
                    const moveX = Math.cos(angle) * force * 20;
                    const moveY = Math.sin(angle) * force * 20;
                    
                    span.style.transform = `translate(${moveX}px, ${moveY}px)`;
                } else {
                    span.style.transform = 'translate(0, 0)';
                }
            });
        });
        
        bioText.addEventListener('mouseleave', () => {
            wordSpans.forEach(span => {
                span.style.transform = 'translate(0, 0)';
            });
        });
    }

    // Video brightness detection function
    function detectVideoBrightness(video) {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 100;
            canvas.height = 100;
            
            ctx.drawImage(video, 0, 0, 100, 100);
            const imageData = ctx.getImageData(0, 0, 100, 100);
            const data = imageData.data;
            
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
                totalBrightness += brightness;
            }
            
            const avgBrightness = totalBrightness / (data.length / 4);
            return avgBrightness > 128; // true if bright, false if dark
        } catch (e) {
            return true; // Default to bright if detection fails
        }
    }

    // Project links hover effects
    projectLinks.forEach(link => {
        const mediaElement = document.getElementById(link.dataset.media);
        
        link.addEventListener('mouseenter', () => {
            // Clear any existing timeout
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }

            // Show video/image immediately
            if (mediaElement) {
                fullscreenBg.classList.add('active');
                mediaElement.classList.add('active');
                
                if (mediaElement.tagName === 'VIDEO') {
                    mediaElement.currentTime = 0;
                    mediaElement.play();
                    
                    // Detect video brightness after a short delay
                    setTimeout(() => {
                        try {
                            const isBright = detectVideoBrightness(mediaElement);
                            document.body.classList.remove('video-dark', 'video-light');
                            document.body.classList.add(isBright ? 'video-light' : 'video-dark');
                        } catch (e) {
                            // Fallback to light mode
                            document.body.classList.remove('video-dark', 'video-light');
                            document.body.classList.add('video-light');
                        }
                    }, 100);
                }
            }
            
            // Apply hover states
            projectsContainer.classList.add('hovering');
            document.body.classList.add('project-hovering');
            if (dateText) {
                dateText.classList.add('project-active');
            }
        });
        
        link.addEventListener('mouseleave', () => {
            // Use timeout to prevent flickering on quick movements
            hoverTimeout = setTimeout(() => {
                // Hide video/image
                if (mediaElement) {
                    fullscreenBg.classList.remove('active');
                    mediaElement.classList.remove('active');
                    
                    if (mediaElement.tagName === 'VIDEO') {
                        mediaElement.pause();
                        mediaElement.currentTime = 0;
                    }
                }
                
                // Remove hover states
                projectsContainer.classList.remove('hovering');
                document.body.classList.remove('project-hovering', 'video-dark', 'video-light');
                if (dateText) {
                    dateText.classList.remove('project-active');
                }
            }, 50); // Small delay to prevent flickering
        });
        
        // Simple click navigation - NO TRANSITIONS
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'slug.html';
        });
    });

    // Touch device support
    let touchActiveLink = null;
    
    projectLinks.forEach(link => {
        link.addEventListener('touchstart', (e) => {
            e.preventDefault();
            
            // Remove previous touch active
            if (touchActiveLink && touchActiveLink !== link) {
                touchActiveLink.classList.remove('touch-active');
                projectsContainer.classList.remove('touch-hovering');
            }
            
            // Add touch active to current
            link.classList.add('touch-active');
            projectsContainer.classList.add('touch-hovering');
            touchActiveLink = link;
            
            // Show media
            const mediaElement = document.getElementById(link.dataset.media);
            if (mediaElement) {
                fullscreenBg.classList.add('active');
                mediaElement.classList.add('active');
                if (mediaElement.tagName === 'VIDEO') {
                    mediaElement.play();
                }
            }
        });
        
        link.addEventListener('touchend', (e) => {
            e.preventDefault();
            
            // Navigate on touch end
            setTimeout(() => {
                window.location.href = 'slug.html';
            }, 100);
        });
    });

    // Handle touch outside to clear
    document.addEventListener('touchstart', (e) => {
        if (!e.target.closest('.project-link')) {
            if (touchActiveLink) {
                touchActiveLink.classList.remove('touch-active');
                projectsContainer.classList.remove('touch-hovering');
                touchActiveLink = null;
                
                // Hide media
                fullscreenBg.classList.remove('active');
                document.querySelectorAll('.fullscreen-bg video, .fullscreen-bg img').forEach(media => {
                    media.classList.remove('active');
                    if (media.tagName === 'VIDEO') {
                        media.pause();
                        media.currentTime = 0;
                    }
                });
            }
        }
    });
});