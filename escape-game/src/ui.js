const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

export function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

export function calculateImageDimensions(imageWidth, imageHeight) {
    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = imageWidth / imageHeight;

    let renderedImageWidth, renderedImageHeight, imageX, imageY;

    if (canvasRatio > imageRatio) {
        renderedImageHeight = canvas.height;
        renderedImageWidth = renderedImageHeight * imageRatio;
        imageX = (canvas.width - renderedImageWidth) / 2;
        imageY = 0;
    } else {
        renderedImageWidth = canvas.width;
        renderedImageHeight = renderedImageWidth / imageRatio;
        imageX = 0;
        imageY = (canvas.height - renderedImageHeight) / 2;
    }

    return {renderedImageWidth, renderedImageHeight, imageX, imageY};
}

export function updateClickableZones(originalZones, dimensions, imageWidth, imageHeight) {
    const {renderedImageWidth, renderedImageHeight, imageX, imageY} = dimensions;

    return originalZones.map(zone => {
        const x = imageX + (zone.x1 / imageWidth) * renderedImageWidth;
        const y = imageY + (zone.y1 / imageHeight) * renderedImageHeight;
        const width = ((zone.x2 - zone.x1) / imageWidth) * renderedImageWidth;
        const height = ((zone.y2 - zone.y1) / imageHeight) * renderedImageHeight;

        return {
            x, y, width, height,
            name: zone.name
        };
    });
}

export function isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
        y >= rect.y && y <= rect.y + rect.height;
}

export function setupMouseMoveHandler(clickableZones) {
    canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        let isOverClickable = false;
        for (const zone of clickableZones) {
            if (isPointInRect(x, y, zone)) {
                isOverClickable = true;
                break;
            }
        }

        canvas.style.cursor = isOverClickable ? 'pointer' : 'default';
    });
}

export function setupClickHandler(clickableZones, clickActions) {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        for (const zone of clickableZones) {
            if (isPointInRect(x, y, zone)) {
                const action = clickActions[zone.name];
                if (action) action();
            }
        }
    });
}

export function setupResizeHandler(resizeCallback) {
    window.addEventListener('resize', () => {
        resizeCanvas();
        resizeCallback();
    });
}

export function drawImage(image) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
}

export {canvas, ctx};
