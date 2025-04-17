import {message} from './game.js';

/*
 * Set the hints for each page and for each game status
 */
const hints = {
    'parc.html': {
        1: "Peut-être que quelque chose est caché dans le sable...",
        2: "Génial ! Tu as trouvé une clé ! Tu peux maintenant aller dans la maison en cliquant sur la flèche",
        default: "Tu as déjà tout trouvé dans le parc, explore d'autres endroits !"
    },
    'corridor.html': {
        3: "La cave semble fermée à clé... Il faudrait chercher un code avec des couleurs...",
        4: "La cave est dévrouillée désormais ! Tu peux y aller !",
        5: "Je crois que Tibbers est caché dans la chambre...",
        6: "Maintenant que j'ai Tibbers je peux partir de la maison !",
        default: "Il n'y a plus rien à trouver ici..."
    },
    'bedroom.html': {
        5: "Tibbers doit être caché sous ces planches !",
        default: "Tu as trouvé Tibbers ! Il est temps de partir..."
    },
    'kitchen.html': {
        3: "Peut-être que des éléments sont cachés sur le frigo ? Ou dans un placard ?",
        default: "La cuisine t'a déjà révélé tous ses secrets..."
    },
    'living_room.html': {
        3: "Il y a peut-être quelque chose dans le tiroir ?",
        default: "Tu as déjà tout trouvé ici..."
    },
    'basement.html': {
        default: "Mince Tibbers n'est pas là... Peut-être qu'il est dans la chambre ?",
    }
};

function getHint() {
    const currentPage = window.location.pathname.split('/').pop();
    const gameStatus = parseInt(localStorage.getItem('gameStatus') || '1');

    if (!hints[currentPage]) {
        return "Je n'ai pas d'indice pour cette page.";
    }

    return hints[currentPage][gameStatus] || hints[currentPage].default;
}

export function initAnnieHints() {
    const annieElement = document.querySelector('.Annie');

    if (annieElement) {
        annieElement.addEventListener('click', () => {
            const gameWindow = document.querySelector('.game-window') || document.body;
            const hint = getHint();
            gameWindow.appendChild(message(hint));
        });

        annieElement.classList.add('clickable');
    }
}

document.addEventListener('DOMContentLoaded', initAnnieHints);
