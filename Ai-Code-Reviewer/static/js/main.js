// Dashboard Functions
function loadDashboard() {
    fetch('/api/reviews')
        .then(response => response.json())
        .then(reviews => {
            updateDashboardStats(reviews);
            displayRecentReviews(reviews);
        });
}

function updateDashboardStats(reviews) {
    const total = reviews.length;
    const completed = reviews.filter(r => r.status === 'completed').length;
    const pending = total - completed;

    document.getElementById('totalReviews').textContent = total;
    document.getElementById('completedReviews').textContent = completed;
    document.getElementById('pendingReviews').textContent = pending;
}

function displayRecentReviews(reviews) {
    const container = document.getElementById('recentReviews');
    const recentReviews = reviews.slice(-5).reverse();

    if (recentReviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-code"></i>
                <p>No reviews yet</p>
                <a href="/code_review" class="btn btn-primary">Start New Review</a>
            </div>
        `;
        return;
    }

    container.innerHTML = recentReviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-language">${review.language}</span>
                <span class="review-date">${review.date}</span>
            </div>
            <div class="review-code">${review.code}</div>
            <div class="review-status status-${review.status}">${review.status}</div>
        </div>
    `).join('');
}

// Code Review Functions
function setupCodeReview() {
    const reviewBtn = document.getElementById('reviewBtn');
    const codeInput = document.getElementById('codeInput');
    const languageSelect = document.getElementById('languageSelect');

    if (reviewBtn) {
        reviewBtn.addEventListener('click', performCodeReview);
    }

    // Load sample code
    if (codeInput) {
        codeInput.value = `# Sample Python Code
def calculate_factorial(n):
    if n == 0:
        return 1
    else:
        return n * calculate_factorial(n-1)

# Test the function
x = 5
result = calculate_factorial(x)
print(f"Factorial of {x} is {result}")`;
    }
}

function performCodeReview() {
    const code = document.getElementById('codeInput').value;
    const language = document.getElementById('languageSelect').value;
    const reviewBtn = document.getElementById('reviewBtn');

    if (!code.trim()) {
        alert('Please enter some code to review');
        return;
    }

    // Show loading state
    reviewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    reviewBtn.disabled = true;

    fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            code: code,
            language: language
        })
    })
    .then(response => response.json())
    .then(result => {
        displayReviewResults(result);
        reviewBtn.innerHTML = '<i class="fas fa-robot"></i> Analyze Code';
        reviewBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error performing code review');
        reviewBtn.innerHTML = '<i class="fas fa-robot"></i> Analyze Code';
        reviewBtn.disabled = false;
    });
}

function displayReviewResults(result) {
    const resultsSection = document.getElementById('reviewResults');
    const scoreBadge = document.getElementById('scoreBadge');
    const reviewSummary = document.getElementById('reviewSummary');
    const issuesContainer = document.getElementById('issuesContainer');
    const suggestionsContainer = document.getElementById('suggestionsContainer');

    resultsSection.style.display = 'block';
    
    // Update score
    scoreBadge.textContent = result.review.score.toFixed(1);
    
    // Update summary
    reviewSummary.textContent = result.review.summary;
    
    // Display issues
    if (result.review.issues && result.review.issues.length > 0) {
        issuesContainer.innerHTML = result.review.issues.map(issue => `
            <div class="issue-item">
                <span class="issue-severity severity-${issue.severity}">${issue.severity.toUpperCase()}</span>
                <strong>Line ${issue.line}:</strong> ${issue.message}
            </div>
        `).join('');
    } else {
        issuesContainer.innerHTML = '<p>No issues found!</p>';
    }

    // Display suggestions
    if (result.review.suggestions && result.review.suggestions.length > 0) {
        suggestionsContainer.innerHTML = result.review.suggestions.map(suggestion => `
            <div class="suggestion-item">
                <i class="fas fa-lightbulb"></i> ${suggestion}
            </div>
        `).join('');
    } else {
        suggestionsContainer.innerHTML = '<p>No additional suggestions.</p>';
    }

    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Style Guides Functions
function loadStyleGuides() {
    fetch('/api/style_guides')
        .then(response => response.json())
        .then(guides => {
            console.log('Style guides loaded:', guides);
        });
}

// Training Data Functions
function loadTrainingData() {
    fetch('/api/training_data')
        .then(response => response.json())
        .then(data => {
            console.log('Training data loaded:', data);
        });
}

// Initialize page specific functions
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/' || currentPath === '/dashboard') {
        loadDashboard();
    } else if (currentPath === '/code_review') {
        setupCodeReview();
    } else if (currentPath === '/style_guides') {
        loadStyleGuides();
    } else if (currentPath === '/training_data') {
        loadTrainingData();
    }
});
