/**
 * Common utility functions for WhiteLabel application
 */

/**
 * Shows a status message to the user
 * @param {string} message - The message to display
 * @param {boolean} isError - Whether the message is an error (default: false)
 * @param {string} elementId - ID of the status element (default: 'statusMessage')
 * @param {number} timeout - Milliseconds before auto-hiding success messages (default: 3000ms)
 */
export function showStatus(message, isError = false, elementId = 'statusMessage', timeout = 3000) {
    const statusElement = document.getElementById(elementId);
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.classList.remove('d-none', 'alert-success', 'alert-danger');
    statusElement.classList.add(isError ? 'alert-danger' : 'alert-success');
    
    // Auto-hide success messages after timeout
    if (!isError) {
        setTimeout(() => {
            statusElement.classList.add('d-none');
        }, timeout);
    }
}

/**
 * Fetch data from an API endpoint with error handling and caching
 * @param {string} url - API endpoint URL
 * @param {Array} cache - Reference to cache array
 * @param {function} onSuccess - Callback on successful fetch
 * @param {function} onError - Callback on fetch error
 * @param {string} errorElementId - ID of element to show errors (optional)
 */
export async function fetchWithCache(url, cache, onSuccess, onError, errorElementId) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update cache
        if (Array.isArray(data)) {
            cache.splice(0, cache.length, ...data);
        } else if (data) {
            cache.push(data);
        }
        
        if (onSuccess) {
            onSuccess(data);
        }
        
        return data;
    } catch (error) {
        console.error(`Erro em fetchWithCache (${url}):`, error);
        
        if (errorElementId) {
            showStatus(`Erro ao buscar dados: ${error.message}`, true, errorElementId);
        }
        
        if (onError) {
            onError(error);
        }
        
        return null;
    }
}

/**
 * Get an item from cache by ID
 * @param {Array} cache - The cache array to search
 * @param {string|number} id - The ID to find
 * @returns {Object|null} - The found item or null
 */
export function getFromCache(cache, id) {
    return cache.find(item => item.id == id) || null;
}

/**
 * Format date string for locale display
 * @param {string} dateStr - ISO date string
 * @returns {string} - Formatted date string
 */
export function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
}

/**
 * Format currency value
 * @param {number} value - The value to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
    return `R$ ${Number(value).toFixed(2)}`;
}

/**
 * Convert date to input-friendly format (YYYY-MM-DDThh:mm)
 * @param {string} dateStr - ISO date string
 * @returns {string} - Date formatted for input fields
 */
export function toInputFormat(dateStr) {
    return dateStr ? new Date(dateStr).toISOString().slice(0, 16) : '';
}

/**
 * Calculate date difference in days
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {number} - Number of days
 */
export function dateDiffInDays(startDate, endDate) {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    
    if (isNaN(start) || isNaN(end) || start >= end) return 0;
    
    return Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
}

/**
 * Common event handler for form submission
 * @param {Element} form - The form element
 * @param {string} url - API endpoint for submission
 * @param {string} method - HTTP method (POST or PUT)
 * @param {Function} getFormData - Function that returns form data
 * @param {Function} onSuccess - Callback on successful submission
 * @param {string} statusElementId - ID of status element
 * @param {string} successMessage - Success message to display
 */
export async function handleFormSubmit(form, url, method, getFormData, onSuccess, statusElementId, successMessage) {
    try {
        const formData = getFormData();
        
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || `Erro ${response.status}`);
        }
        
        const data = await response.json();
        showStatus(successMessage, false, statusElementId);
        
        if (onSuccess) {
            onSuccess(data);
        }
        
        return data;
    } catch (error) {
        console.error('Error submitting form:', error);
        showStatus(`Falha: ${error.message}`, true, statusElementId);
        return null;
    }
}