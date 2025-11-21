document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if (navLinks) {
                navLinks.classList.remove('active'); // Close mobile menu on click
            }

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Image Compression Helper
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const maxWidth = 500; // Max width for the image
            const quality = 0.6;  // JPEG quality (0 to 1)

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize logic
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to Base64 JPEG
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    resolve(dataUrl);
                };
                img.onerror = (error) => reject(error);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    // Form Submission Handler with EmailJS
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;

            // Loading state
            btn.innerText = 'Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Collect form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
            };

            // Handle File Upload
            const fileInput = document.getElementById('file');
            const file = fileInput.files[0];

            const sendEmail = (params) => {
                // Service ID provided: service_ndm3ffo
                // Template ID provided: template_5e6l58z
                emailjs.send('service_ndm3ffo', 'template_5e6l58z', params)
                    .then(() => {
                        btn.innerText = 'Message Sent!';
                        btn.style.backgroundColor = '#10b981'; // Green success color
                        contactForm.reset();

                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.backgroundColor = '';
                        }, 3000);

                        alert('Thank you! Your message has been sent successfully.');
                    })
                    .catch((error) => {
                        console.error('EmailJS Error:', error);
                        btn.innerText = 'Failed to Send';
                        btn.style.backgroundColor = '#ef4444'; // Red error color

                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.backgroundColor = '';
                        }, 3000);

                        if (error.status === 413) {
                            alert('The image file is too large. Please upload a smaller image.');
                        } else {
                            alert('Failed to send message. Please try again later or call us directly.');
                        }
                    });
            };

            if (file) {
                try {
                    // Check initial size (if > 5MB, reject immediately to save processing)
                    if (file.size > 5 * 1024 * 1024) {
                        alert('File is too large. Please upload an image smaller than 5MB.');
                        btn.innerText = originalText;
                        btn.disabled = false;
                        btn.style.opacity = '1';
                        return;
                    }

                    const compressedDataUrl = await compressImage(file);

                    // Check if compressed string is still too big for EmailJS (approx 50KB limit)
                    // Base64 string length * 0.75 is approx byte size
                    if (compressedDataUrl.length > 60000) { // ~45KB safety margin
                        console.warn('Compressed image still too large, sending without image.');
                        if (confirm('The image is still too large to send via email. Send message without image?')) {
                            formData.attachment = "Image too large to attach.";
                            sendEmail(formData);
                        } else {
                            btn.innerText = originalText;
                            btn.disabled = false;
                            btn.style.opacity = '1';
                        }
                    } else {
                        formData.attachment = compressedDataUrl;
                        sendEmail(formData);
                    }

                } catch (error) {
                    console.error('Compression error:', error);
                    // Fallback: try sending without image or alert
                    if (confirm('Could not process image. Send message without it?')) {
                        sendEmail(formData);
                    } else {
                        btn.innerText = originalText;
                        btn.disabled = false;
                        btn.style.opacity = '1';
                    }
                }
            } else {
                sendEmail(formData);
            }
        });
    }

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
});
