export class Storage {
    // constructor
    constructor() {
        //initialize the inventory
        const saveInventory = localStorage.getItem('inventory');
        this.inventory = saveInventory ? JSON.parse(saveInventory) : [];
        this.container = document.querySelector('.Inventory');
    }

    // function to add item in the inventory
    addItem(item) {
        // the item should be an object
        if(typeof item === 'object') {
            if(!this.hasItem(item)) {
                this.inventory.push(item);
                this.savedToLocalStorage()
            }
        }else {
            // if the item is not an object, log an error
            console.log("Invalid item type. Item should be an object.");
        }
    }

    // function to remove item from the inventory
    removeItem(item) {
        // get the index of the item in the inventory
        const index = this.inventory.findIndex(inventoryItem => inventoryItem.name === item.name);
        if (index !== -1) {
            // remove the item from the inventory
            this.inventory.splice(index, 1);
            this.savedToLocalStorage();
        }
    }

    // function to show the inventory
    showInventory(){
        // for each item in the inventory, create a div and append it to the container
        this.container.innerHTML = '';
        this.inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';

            const itemContainer = document.createElement('div');
            itemContainer.className = 'inventory-image-container';

            const itemImage = document.createElement('img');
            itemImage.src = item.imagePath;
            itemImage.alt = item.name;
            itemImage.className = 'inventory-image';
            itemContainer.appendChild(itemImage);

            const itemName = document.createElement('div');
            itemName.className = 'item-name';
            itemName.textContent = item.name;

            itemElement.appendChild(itemContainer);
            itemElement.appendChild(itemName);

            // add the in the container
            this.container.appendChild(itemElement);
        })
    }

    // show if the item is already in the inventory
    hasItem(items) {
        return this.inventory.some(item => item.name === items.name);
    }

    // saved in local storage
    savedToLocalStorage() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    }
}




