// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Blog Posts Storage
let blogPosts = [];

// Load posts from JSON file on page load
window.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

// Load posts from JSON file
async function loadPosts() {
    try {
        const response = await fetch('blog-posts.json');
        if (response.ok) {
            blogPosts = await response.json();
            displayPosts();
        } else {
            console.error('Failed to load blog posts');
            blogPosts = [];
            displayPosts();
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogPosts = [];
        displayPosts();
    }
}

// Note: Posts are now managed via blog-posts.json file
// This function is kept for backward compatibility but does nothing
function savePosts() {
    console.log('Posts are now managed in blog-posts.json file');
}

// Display posts in the grid
function displayPosts(filter = 'all') {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    let filteredPosts = blogPosts;
    if (filter !== 'all') {
        filteredPosts = blogPosts.filter(post => post.category === filter);
    }

    blogGrid.innerHTML = '';

    if (filteredPosts.length === 0) {
        blogGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: var(--text-color);">No blog posts yet. Create your first post!</p>';
        return;
    }

    filteredPosts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'blog-card';
        const readButton = post.externalLink 
            ? `<a href="${post.externalLink}" class="btn btn-secondary">Read Full Walkthrough</a>`
            : `<button class="btn btn-secondary" onclick="readPost(${post.id})">Read More</button>`;
        
        const readingTime = calculateReadingTime(post.content);
        
        card.innerHTML = `
            <img src="${post.image || 'https://via.placeholder.com/800x400/0a192f/00ff88?text=Blog+Post'}" alt="${post.title}" class="blog-image">
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="blog-category">${formatCategory(post.category)}</span>
                    <span class="blog-date">${formatDate(post.date)}</span>
                    <span class="reading-time"><i class="fas fa-clock"></i> ${readingTime}</span>
                </div>
                <h3>${post.title}</h3>
                <p class="blog-excerpt">${post.excerpt}</p>
                <div class="blog-actions">
                    ${readButton}
                    <button class="delete-btn" onclick="deletePost(${post.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        blogGrid.appendChild(card);
    });
}

// Format category for display
function formatCategory(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Calculate reading time
function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
}

// Filter functionality
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        displayPosts(filter);
    });
});

// Modal functionality
const newPostModal = document.getElementById('newPostModal');
const readPostModal = document.getElementById('readPostModal');
const newPostBtn = document.getElementById('newPostBtn');
const closeBtns = document.querySelectorAll('.close');

if (newPostBtn) {
    newPostBtn.addEventListener('click', () => {
        newPostModal.style.display = 'block';
    });
}

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        newPostModal.style.display = 'none';
        readPostModal.style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target === newPostModal) {
        newPostModal.style.display = 'none';
    }
    if (e.target === readPostModal) {
        readPostModal.style.display = 'none';
    }
});

// New post form submission
const newPostForm = document.getElementById('newPostForm');
if (newPostForm) {
    newPostForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('postTitle').value;
        const category = document.getElementById('postCategory').value;
        const excerpt = document.getElementById('postExcerpt').value;
        const content = document.getElementById('postContent').value;
        const image = document.getElementById('postImage').value;

        const newPost = {
            id: Date.now(),
            title,
            category,
            excerpt,
            content,
            image: image || `https://via.placeholder.com/800x400/0a192f/00ff88?text=${encodeURIComponent(title)}`,
            date: new Date().toISOString().split('T')[0]
        };

        blogPosts.unshift(newPost);
        savePosts();
        displayPosts();

        newPostModal.style.display = 'none';
        newPostForm.reset();

        // Show success message
        alert('Blog post published successfully!');
    });
}

// Read post function
function readPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    const postContent = document.getElementById('postContent');
    const currentUrl = encodeURIComponent(window.location.href);
    const postTitle = encodeURIComponent(post.title);
    
    postContent.innerHTML = `
        <h2>${post.title}</h2>
        <div class="post-meta">
            <span class="blog-category">${formatCategory(post.category)}</span>
            <span class="blog-date">${formatDate(post.date)}</span>
            <span class="reading-time"><i class="fas fa-clock"></i> ${calculateReadingTime(post.content)}</span>
        </div>
        <div class="share-buttons">
            <span>Share:</span>
            <a href="https://twitter.com/intent/tweet?text=${postTitle}&url=${currentUrl}" target="_blank" title="Share on Twitter"><i class="fab fa-twitter"></i></a>
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}" target="_blank" title="Share on LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${currentUrl}" target="_blank" title="Share on Facebook"><i class="fab fa-facebook"></i></a>
            <a href="mailto:?subject=${postTitle}&body=Check out this post: ${currentUrl}" title="Share via Email"><i class="fas fa-envelope"></i></a>
        </div>
        <img src="${post.image}" alt="${post.title}" style="width: 100%; border-radius: 10px; margin-bottom: 2rem;">
        <div class="post-body">
            ${post.content}
        </div>
    `;

    readPostModal.style.display = 'block';
}

// Delete post function
function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        blogPosts = blogPosts.filter(p => p.id !== id);
        savePosts();
        displayPosts();
    }
}

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(10, 25, 47, 0.98)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 25, 47, 0.95)';
    }
});
