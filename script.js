// Check if a username is stored in localStorage
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    if (!username && window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    } else if (username) {
        const headerElement = document.querySelector('header h3');
        if (headerElement) {
            headerElement.textContent = `Dark Hours - ${username}`;
        }
    }
});

// Existing balance and last claim
let balance = localStorage.getItem('balance') ? parseInt(localStorage.getItem('balance')) : 0;
let lastClaim = localStorage.getItem('lastClaim') ? new Date(localStorage.getItem('lastClaim')) : null;
let claimTime = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

// Task rewards tracking
let taskRewards = localStorage.getItem('taskRewards') ? JSON.parse(localStorage.getItem('taskRewards')) : {};

// Function to update balance on page load
function updateBalance() {
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance;
    }
}

// Handle claim button and countdown timer
function updateCountdown() {
    const countdownElement = document.getElementById('countdown');
    const claimButton = document.getElementById('claimButton');
    if (lastClaim) {
        const now = new Date();
        const elapsed = now - lastClaim;
        const remaining = claimTime - elapsed;
        if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            if (countdownElement) {
                countdownElement.textContent = `Time remaining: ${hours} hours ${minutes} minutes`;
            }
            if (claimButton) {
                claimButton.disabled = true;
            }
        } else {
            if (countdownElement) {
                countdownElement.textContent = '';
            }
            if (claimButton) {
                claimButton.disabled = false;
            }
        }
    }
}

// Claim hours when the claim button is clicked
function claimHours() {
    const now = new Date();
    if (!lastClaim || now - lastClaim >= claimTime) {
        balance += 4;
        updateBalance();
        lastClaim = new Date();
        localStorage.setItem('lastClaim', lastClaim);
        localStorage.setItem('balance', balance);
        updateCountdown();
    }
}

// Custom message display function
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translateX(-50%)';
    messageElement.style.backgroundColor = '#333';
    messageElement.style.color = '#fff';
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '5px';
    messageElement.style.zIndex = '1000';
    messageElement.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
    document.body.appendChild(messageElement);

    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 5000); // Message will disappear after 5 seconds
}

// Handle task completion
function startTask(taskId, url) {
    const taskButton = document.querySelector(`button[onclick*="startTask('${taskId}',"]`);
    const taskLink = document.querySelector(`a[href="${url}"]`);

    // Check if URL has changed
    if (taskRewards[taskId] && taskLink && taskLink.href !== url) {
        delete taskRewards[taskId];
        localStorage.setItem('taskRewards', JSON.stringify(taskRewards));
        if (taskButton) {
            taskButton.textContent = "Start Task";
            taskButton.disabled = false;
        }
    }

    // If task already completed, show a message and remove the link
    if (taskRewards[taskId]) {
        displayMessage("You have already completed this task and received the reward.");
        return;
    }

    window.open(url, '_blank');
    setTimeout(() => {
        displayMessage("You have received 10 hours for completing the task!");
        balance += 10;
        taskRewards[taskId] = true;
        localStorage.setItem('balance', balance);
        localStorage.setItem('taskRewards', JSON.stringify(taskRewards));
        updateBalance();

        // Show completed message and remove link
        if (taskLink) {
            taskLink.remove();
            const completionText = document.createElement('span');
            completionText.textContent = "You have completed this task.";
            taskLink.parentNode.appendChild(completionText);
        }

        if (taskButton) {
            taskButton.disabled = true;
            taskButton.textContent = "Completed";
        }
    }, 35000); // 35 seconds delay
}

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    updateBalance();
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Disable completed tasks and update text
    for (const taskId in taskRewards) {
        if (taskRewards[taskId]) {
            const button = document.querySelector(`button[onclick*="startTask('${taskId}',"]`);
            const link = document.querySelector(`a[href*="startTask('${taskId}',"]`);
            if (button) {
                button.disabled = true;
                button.textContent = "Completed";
            }
            if (link) {
                const completionText = document.createElement('span');
                completionText.textContent = "You have completed this task.";
                link.parentNode.appendChild(completionText);
                link.remove();
            }
        }
    }
});
