export function playSound(soundPath) {
    const sound = new Audio(soundPath);
    sound.play();
}