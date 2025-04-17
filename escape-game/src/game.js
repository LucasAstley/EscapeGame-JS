export function message(msg) {
    // create a new message
    const message = document.createElement('div');
    message.className = 'message';
    // create the inner html of the message
    message.innerHTML = `
        <div class="message-content">
            <p>${msg}</p>
            <button class="close-message" ><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="fill: rgba(255, 255, 255, 1);transform: ;msFilter:;"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg></button>
        </div>    
    `;
    // add a close button to the message
    message.querySelector('.close-message').addEventListener('click', () => {
        message.remove();
    });

    return message;
}
// class item for the inventory
export class Item {
    constructor(name, imagePath ) {
        this.name = name;
        this.imagePath = imagePath;
    }
}


// function for lore message this will be shown only once
export function messageOnce(msg, key) {
    if (localStorage.getItem(`message_${key}`) === 'true') {
        return null;
    }

    localStorage.setItem(`message_${key}`, 'true');

    return message(msg)
}

// clear all local storage items
export function clearLocalStorage() {
    localStorage.removeItem('message_Parc');
    localStorage.removeItem('gameStatus');
    localStorage.removeItem('lastValidPage');
    localStorage.removeItem('timer');
    localStorage.removeItem('pageTransition');
    localStorage.removeItem('message_Basement');
    localStorage.removeItem('message_Bedroom');
    localStorage.removeItem('message_Corridor');
    localStorage.removeItem('inventory');
    localStorage.removeItem('basement_door_unlocked');
    localStorage.removeItem('level6_chess_result');
    localStorage.removeItem('level6_chess_attempted');
    localStorage.removeItem('life_qte');
}