import { Storage } from "./storage.js";

// create a new inventory for all the game
const sharedStorage = new Storage();

document.addEventListener('DOMContentLoaded', () => {
    // show the inventory when the page is loaded
    sharedStorage.showInventory();
});

export default sharedStorage;

