import { useEffect, useState } from 'react';
import { nets } from 'face-api.js';

export const useFaceApi = () => {
    const [isFaceApiReady, setIsFaceApiReady] = useState(false);

    useEffect(() => {
        const loadFaceApiModels = async () => {
            try {
                await nets.tinyFaceDetector.loadFromUri('/models');
                console.log('Face-api models loaded successfully');
                setIsFaceApiReady(true);
            } catch (error) {
                console.error('Error loading face-api models:', error);
            }
        };

        loadFaceApiModels();
    }, []);

    return { isFaceApiReady };
};