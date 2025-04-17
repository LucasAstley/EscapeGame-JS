function checkAccess() {
    // Get the current page name from the URL
    const currentPage = window.location.pathname.split('/').pop();
    // Get the game status from local storage
    const gameStatus = localStorage.getItem('gameStatus');
    // get the required status for the current page
    let requiredStatus
    let defaultPage = 'parc.html';

    switch (currentPage) {
        case 'interlude.html':
            requiredStatus = 2;
            break;
        case 'corridor.html':
            requiredStatus = 3;
            break;
        case 'living_room.html':
            requiredStatus = 3;
            defaultPage = 'corridor.html';
            break;
        case 'kitchen.html':
            requiredStatus = 3;
            defaultPage = 'corridor.html';
            break;
        case 'basement.html':
            requiredStatus = 4;
            defaultPage = 'corridor.html';
            break;
        case 'bedroom.html':
            requiredStatus = 5;
            defaultPage = 'corridor.html';
            break;
        case 'final_qte.html':
            requiredStatus = 6;
            defaultPage = 'corridor.html';
            break;
        default:
            requiredStatus = 1;
            break;

    }
    // Check if the game status is less than the required status
    if (!gameStatus || parseInt(gameStatus) < requiredStatus) {
        window.location.href = defaultPage;
        return false;
    } else {
        // set the new valid page
        localStorage.setItem('lastValidPage', currentPage);
        return true;
    }

}
// Check access when the document is loaded
document.addEventListener('DOMContentLoaded', checkAccess);