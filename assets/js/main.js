// Initialize AOS
AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const pageLoader = document.getElementById('page-loader');

// Theme Management
const theme = {
    init() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        }

        // Theme toggle event listener
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
};

// Mobile Menu Management
const mobileNav = {
    init() {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isExpanded = !mobileMenu.classList.contains('hidden');
            mobileMenuButton.setAttribute('aria-expanded', isExpanded);
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
};

// Page Loader
const loader = {
    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                pageLoader.style.opacity = '0';
                setTimeout(() => {
                    pageLoader.style.display = 'none';
                }, 300);
            }, 500);
        });
    }
};

// Smooth Scroll
const smoothScroll = {
    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    // Close mobile menu if open
                    mobileMenu.classList.add('hidden');
                }
            });
        });
    }
};

// Three.js Background Animation
const threeBackground = {
    scene: null,
    camera: null,
    renderer: null,
    particles: null,
    currentSection: 'home',
    sectionConfigs: {
        home: {
            particleColor: '#6B46C1',
            particleCount: 5000,
            particleSize: 0.005,
            rotationSpeed: 0.001,
            particleSpread: 5
        },
        about: {
            particleColor: '#F687B3',
            particleCount: 4000,
            particleSize: 0.004,
            rotationSpeed: 0.002,
            particleSpread: 4
        },
        packages: {
            particleColor: '#F6AD55',
            particleCount: 6000,
            particleSize: 0.006,
            rotationSpeed: 0.003,
            particleSpread: 6
        },
        testimonials: {
            particleColor: '#6B46C1',
            particleCount: 3000,
            particleSize: 0.003,
            rotationSpeed: 0.0015,
            particleSpread: 3
        },
        projects: {
            particleColor: '#F687B3',
            particleCount: 7000,
            particleSize: 0.007,
            rotationSpeed: 0.004,
            particleSpread: 7
        },
        appointment: {
            particleColor: '#F6AD55',
            particleCount: 4500,
            particleSize: 0.005,
            rotationSpeed: 0.0025,
            particleSpread: 5
        }
    },

    init() {
        const container = document.querySelector('.three-container');
        if (!container) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(this.renderer.domElement);

        // Initial particles setup
        this.createParticles('home');
        this.camera.position.z = 2;

        // Animation loop
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.handleResize());

        // Intersection Observer for section changes
        this.setupIntersectionObserver();
    },

    createParticles(section) {
        // Remove existing particles if any
        if (this.particles) {
            this.scene.remove(this.particles);
        }

        const config = this.sectionConfigs[section];
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = config.particleCount;
        const posArray = new Float32Array(particlesCount * 3);

        // Create particles in a more organized pattern
        for(let i = 0; i < particlesCount * 3; i += 3) {
            // Create spiral pattern
            const radius = Math.random() * config.particleSpread;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            posArray[i] = radius * Math.sin(theta) * Math.cos(phi);
            posArray[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
            posArray[i + 2] = radius * Math.cos(theta);
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Material with custom shader
        const particlesMaterial = new THREE.PointsMaterial({
            size: config.particleSize,
            color: config.particleColor,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
        this.currentSection = section;
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.particles) {
            const config = this.sectionConfigs[this.currentSection];
            this.particles.rotation.y += config.rotationSpeed;
            this.particles.rotation.x += config.rotationSpeed * 0.5;

            // Add subtle floating motion
            const time = Date.now() * 0.001;
            this.particles.position.y = Math.sin(time) * 0.1;
            this.particles.position.x = Math.cos(time) * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    },

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    },

    setupIntersectionObserver() {
        const sections = document.querySelectorAll('section[id]');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    if (this.sectionConfigs[sectionId]) {
                        this.createParticles(sectionId);
                    }
                }
            });
        }, options);

        sections.forEach(section => observer.observe(section));
    },

    // Add mouse interaction
    setupMouseInteraction() {
        const container = document.querySelector('.three-container');
        if (!container) return;

        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        container.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Smooth camera movement
        const animateCamera = () => {
            targetX = mouseX * 0.5;
            targetY = mouseY * 0.5;

            this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);

            requestAnimationFrame(animateCamera);
        };

        animateCamera();
    }
};

// Form Validation
const formValidation = {
    init() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateForm(form)) {
                    // Handle form submission
                    this.submitForm(form);
                }
            });
        });
    },

    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                this.showError(input, 'This field is required');
                isValid = false;
            } else if (input.type === 'email' && input.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    this.showError(input, 'Please enter a valid email');
                    isValid = false;
                }
            }
        });

        return isValid;
    },

    showError(input, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error mt-2';
        errorDiv.textContent = message;
        
        const existingError = input.parentNode.querySelector('.alert-error');
        if (existingError) {
            existingError.remove();
        }
        
        input.parentNode.appendChild(errorDiv);
        input.classList.add('border-red-500');
        
        setTimeout(() => {
            errorDiv.remove();
            input.classList.remove('border-red-500');
        }, 3000);
    },

    submitForm(form) {
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;

        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            submitButton.innerHTML = '<i class="fas fa-check"></i> Sent!';
            form.reset();
            
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.disabled = false;
            }, 2000);
        }, 1500);
    }
};

// Testimonials Slider
const testimonialsSlider = {
    init() {
        const swiper = new Swiper('.testimonials-slider', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                },
                1024: {
                    slidesPerView: 3,
                },
            },
        });
    }
};

// Project Gallery
const projectGallery = {
    init() {
        const galleryItems = document.querySelectorAll('.project-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                this.openLightbox(imgSrc);
            });
        });
    },

    openLightbox(imgSrc) {
        const lightbox = document.createElement('div');
        lightbox.className = 'modal';
        lightbox.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <img src="${imgSrc}" alt="Project Image" class="w-full h-auto rounded-lg">
                <button class="absolute top-4 right-4 text-white hover:text-gray-300">
                    <i class="fas fa-times text-2xl"></i>
                </button>
            </div>
        `;

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.closest('button')) {
                lightbox.remove();
                document.body.style.overflow = '';
            }
        });
    }
};

// Initialize all features
document.addEventListener('DOMContentLoaded', () => {
    theme.init();
    mobileNav.init();
    loader.init();
    smoothScroll.init();
    threeBackground.init();
    threeBackground.setupMouseInteraction();
    formValidation.init();
    testimonialsSlider.init();
    projectGallery.init();
}); 