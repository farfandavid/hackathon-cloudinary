export const applyGlitchEffect = (imageData: ImageData): ImageData => {
    const data = imageData.data;
    const glitchAmount = Math.floor(Math.random() * 20);
    const affectRed = Math.random() < 0.5;
    const affectGreen = Math.random() < 0.5;
    const affectBlue = Math.random() < 0.5;

    for (let i = 0; i < data.length; i += 4) {
        const offset = Math.floor(Math.random() * glitchAmount) - Math.floor(glitchAmount / 2);
        if (affectRed) {
            data[i] = data[i + 4 * offset] || data[i];
        }
        if (affectGreen) {
            data[i + 1] = data[i + 1 + 4 * offset] || data[i + 1];
        }
        if (affectBlue) {
            data[i + 2] = data[i + 2 + 4 * offset] || data[i + 2];
        }
    }
    return imageData;
};