// Custom JavaScript for Club Équitation & Balades en Mer

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeTooltips();
    initializeModals();
    initializeFormValidation();
    initializeAutoHideAlerts();
    initializeLoadingStates();
    initializeDatePicker();
    initializeTimePicker();
});

// Initialize Bootstrap tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize modal behaviors
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function (e) {
            // Reset form when modal is opened
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                clearValidationErrors(form);
            }
        });
    });
}

// Initialize form validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
        });
    });
}

// Validate individual field
function validateField(field) {
    const isValid = field.checkValidity();
    field.classList.remove('is-valid', 'is-invalid');
    
    if (field.value.trim()) {
        field.classList.add(isValid ? 'is-valid' : 'is-invalid');
    }
}

// Clear validation errors
function clearValidationErrors(form) {
    const fields = form.querySelectorAll('.is-valid, .is-invalid');
    fields.forEach(field => {
        field.classList.remove('is-valid', 'is-invalid');
    });
}

// Auto-hide alerts after 5 seconds
function initializeAutoHideAlerts() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

// Initialize loading states for buttons
function initializeLoadingStates() {
    const buttons = document.querySelectorAll('[data-loading-text]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.innerHTML;
            const loadingText = this.dataset.loadingText || 'Chargement...';
            
            this.disabled = true;
            this.innerHTML = `<span class="spinner me-2"></span>${loadingText}`;
            
            // Reset after 3 seconds (adjust as needed)
            setTimeout(() => {
                this.disabled = false;
                this.innerHTML = originalText;
            }, 3000);
        });
    });
}

// Initialize date picker
function initializeDatePicker() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        input.setAttribute('min', today);
        
        // Add date formatting
        input.addEventListener('change', function() {
            const date = new Date(this.value);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // You could display this formatted date somewhere if needed
            console.log('Date sélectionnée:', formattedDate);
        });
    });
}

// Initialize time picker
function initializeTimePicker() {
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
        // Set time restrictions if needed
        input.addEventListener('change', function() {
            const time = this.value;
            const hour = parseInt(time.split(':')[0]);
            
            // Example: restrict times between 8:00 and 20:00
            if (hour < 8 || hour > 20) {
                this.setCustomValidity('Les heures doivent être entre 8h et 20h');
            } else {
                this.setCustomValidity('');
            }
        });
    });
}

// Utility function to show loading spinner
function showLoading(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = '<div class="spinner"></div>';
        spinner.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
        `;
        
        element.style.position = 'relative';
        element.appendChild(spinner);
    }
}

// Utility function to hide loading spinner
function hideLoading(element) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
        
        const spinner = element.querySelector('.spinner-overlay');
        if (spinner) {
            spinner.remove();
        }
    }
}

// Function to confirm actions
function confirmAction(message, callback) {
    if (confirm(message || 'Êtes-vous sûr de vouloir continuer ?')) {
        if (typeof callback === 'function') {
            callback();
        }
        return true;
    }
    return false;
}

// Function to format currency
function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Function to format date
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    return new Date(date).toLocaleDateString('fr-FR', finalOptions);
}

// Function to debounce input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('[data-search-target]');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase();
            const targetSelector = this.dataset.searchTarget;
            const targetElements = document.querySelectorAll(targetSelector);
            
            targetElements.forEach(element => {
                const text = element.textContent.toLowerCase();
                const parent = element.closest('tr, .card, .list-item');
                
                if (text.includes(searchTerm)) {
                    parent.style.display = '';
                } else {
                    parent.style.display = 'none';
                }
            });
        }, 300));
    });
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSearch);

// Print functionality
function printPage(elementSelector) {
    const element = document.querySelector(elementSelector);
    if (element) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Impression</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    ${element.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    }
}

// Export to CSV functionality
function exportToCSV(tableSelector, filename = 'export.csv') {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    const csv = [];
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        
        cols.forEach(col => {
            rowData.push(col.textContent.trim());
        });
        
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(link.href);
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Erreur JavaScript:', e.error);
    
    // You could send this to a logging service
    // or show a user-friendly message
});

// Global AJAX error handler
window.addEventListener('unhandledrejection', function(e) {
    console.error('Erreur AJAX non gérée:', e.reason);
    
    // Show user-friendly error message
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        Une erreur est survenue. Veuillez réessayer.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
