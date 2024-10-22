const base64ToFile = (base64String: string, fileName: string): File => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
};

export const captureAndTransformImage = async (video: HTMLVideoElement): Promise<string | null> => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;
    tempCtx.save()
    tempCtx.translate(tempCanvas.width, 0);
    tempCtx.scale(-1, 1)
    tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
    const imageURL = tempCanvas.toDataURL('image/png');
    const file = base64ToFile(imageURL, `toTransform.png`);
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('/api/transform', {
            method: 'POST',
            body: formData,
        });
        console.log('Image sent to transform API');
        if (!response.ok) {
            console.error('Error sending image to transform API:', response.statusText);
            return null;
        } else {

            const data = await response.blob();
            return URL.createObjectURL(data);
        }
    } catch (error) {
        console.error('Error sending image to transform API:', error);
        return null;
    }
};