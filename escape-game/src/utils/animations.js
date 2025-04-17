/*
 * Export the flame animation controller
 */
export function flameAnimation(ctx, background, flameImages) {
    const flames = typeof flameImages[0] === 'string'
        ? flameImages.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        })
        : flameImages;

    let frameCount = 0;
    let animationId = null;

    const flameParams = flames.map(() => ({
        phase: Math.random() * Math.PI * 2,
        frequency: 0.8 + Math.random() * 0.4,
        amplitude: 0.8 + Math.random() * 0.4
    }));

    function animate() {
        ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);

        flames.forEach((flame, index) => {
            if (flame.complete) {
                ctx.save();

                const param = flameParams[index];
                const rotation = Math.sin((frameCount * param.frequency / 30) + param.phase)
                    * 0.015 * param.amplitude;

                const centerX = ctx.canvas.width / 2;
                const centerY = ctx.canvas.height / 2;
                ctx.translate(centerX, centerY);
                ctx.rotate(rotation);
                ctx.translate(-centerX, -centerY);

                ctx.globalAlpha = 0.9 + Math.sin(frameCount / 5) * 0.1;

                ctx.drawImage(flame, 0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.restore();
            }
        });

        frameCount++;
        animationId = requestAnimationFrame(animate);
    }

    animate();

    return {
        stop: () => animationId && cancelAnimationFrame(animationId),
        resume: () => !animationId && animate()
    };
}
