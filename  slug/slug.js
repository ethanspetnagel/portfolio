document.addEventListener('DOMContentLoaded', () => {
    const essayTabs = document.querySelectorAll('.essay-tab');
    const essayTexts = document.querySelectorAll('.essay-text');
    const projectsButton = document.querySelector('.projects-button');
    const siteTitle = document.querySelector('.site-title');

    // Set first essay as active by default
    if (essayTabs.length > 0 && essayTexts.length > 0) {
        essayTabs[0].classList.add('active');
        essayTexts[0].classList.add('active');
    }

    // Essay tab switching
    essayTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and texts
            essayTabs.forEach(t => t.classList.remove('active'));
            essayTexts.forEach(text => text.classList.remove('active'));
            
            // Add active to clicked tab
            tab.classList.add('active');
            
            // Show corresponding text
            const targetText = document.getElementById(tab.dataset.essay);
            if (targetText) {
                targetText.classList.add('active');
            }
        });
    });

    // Site title hover effect
    if (siteTitle) {
        siteTitle.addEventListener('mouseenter', () => {
            document.body.classList.add('title-hover');
        });
        
        siteTitle.addEventListener('mouseleave', () => {
            document.body.classList.remove('title-hover');
        });
    }

    // Simple navigation - NO TRANSITIONS
    if (projectsButton) {
        projectsButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }

    // Info toggles for project details
    const infoToggles = document.querySelectorAll('.info-toggle');
    infoToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const infoPanel = toggle.nextElementSibling;
            if (infoPanel && infoPanel.classList.contains('info-panel')) {
                toggle.classList.toggle('active');
                infoPanel.classList.toggle('active');
            }
        });
    });

    // Text parting effect for interactive text
    const interactiveTexts = document.querySelectorAll('.interactive-text');
    interactiveTexts.forEach(text => {
        const words = text.textContent.split(' ');
        text.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
        
        const wordSpans = text.querySelectorAll('.word');
        
        text.addEventListener('mousemove', (e) => {
            const rect = text.getBoundingClientRect();
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
        
        text.addEventListener('mouseleave', () => {
            wordSpans.forEach(span => {
                span.style.transform = 'translate(0, 0)';
            });
        });
    });

    // Scroll indicator functionality
    const starScrollIndicator = document.querySelector('.star-scroll-indicator');
    const starScrollIndicatorGallery = document.querySelector('.star-scroll-indicator-gallery');

    // Essay sidebar scroll indicator
    if (starScrollIndicator) {
        const essayContainer = document.querySelector('.essay-container');
        if (essayContainer) {
            essayContainer.addEventListener('scroll', () => {
                const scrollTop = essayContainer.scrollTop;
                const scrollHeight = essayContainer.scrollHeight - essayContainer.clientHeight;
                const scrollPercent = scrollTop / scrollHeight;
                
                // Show/hide star based on scroll
                if (scrollTop > 50) {
                    starScrollIndicator.style.opacity = '1';
                } else {
                    starScrollIndicator.style.opacity = '0';
                }
                
                // Move star based on scroll position
                const maxMovement = 200; // Maximum pixels to move
                const movement = scrollPercent * maxMovement;
                starScrollIndicator.style.top = `${15 + movement}px`;
            });
        }
    }

    // Gallery scroll indicator
    if (starScrollIndicatorGallery) {
        const galleryContainer = document.querySelector('.gallery-container');
        if (galleryContainer) {
            galleryContainer.addEventListener('scroll', () => {
                const scrollTop = galleryContainer.scrollTop;
                const scrollHeight = galleryContainer.scrollHeight - galleryContainer.clientHeight;
                const scrollPercent = scrollTop / scrollHeight;
                
                // Show/hide star based on scroll
                if (scrollTop > 50) {
                    starScrollIndicatorGallery.style.opacity = '1';
                } else {
                    starScrollIndicatorGallery.style.opacity = '0';
                }
                
                // Move star based on scroll position
                const maxMovement = 200; // Maximum pixels to move
                const movement = scrollPercent * maxMovement;
                starScrollIndicatorGallery.style.top = `${15 + movement}px`;
            });
        }
    }

    // Image slideshow functionality
    const slideshowContainers = document.querySelectorAll('.slideshow-container');
    slideshowContainers.forEach(container => {
        const images = container.querySelectorAll('.slideshow-image');
        const prevButton = container.querySelector('.slideshow-prev');
        const nextButton = container.querySelector('.slideshow-next');
        const counter = container.querySelector('.slideshow-counter');
        
        let currentSlide = 0;
        
        function updateSlideshow() {
            images.forEach((img, index) => {
                img.classList.toggle('active', index === currentSlide);
            });
            
            if (counter) {
                counter.textContent = `${currentSlide + 1} / ${images.length}`;
            }
        }
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + images.length) % images.length;
                updateSlideshow();
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % images.length;
                updateSlideshow();
            });
        }
        
        // Initialize slideshow
        updateSlideshow();
        
        // Auto-advance slideshow every 5 seconds
        setInterval(() => {
            currentSlide = (currentSlide + 1) % images.length;
            updateSlideshow();
        }, 5000);
    });

    // Project sets switching
    const projectSetButtons = document.querySelectorAll('.project-set-button');
    const projectSets = document.querySelectorAll('.project-set');
    
    projectSetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSet = button.dataset.set;
            
            // Remove active from all buttons and sets
            projectSetButtons.forEach(btn => btn.classList.remove('active'));
            projectSets.forEach(set => set.classList.remove('active'));
            
            // Add active to clicked button
            button.classList.add('active');
            
            // Show target set
            const targetSetElement = document.getElementById(targetSet);
            if (targetSetElement) {
                targetSetElement.classList.add('active');
            }
        });
    });
});