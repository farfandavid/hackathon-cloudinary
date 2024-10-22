import { useRef, useEffect, useState } from 'react';

export const useWebcam = (videoRef: React.RefObject<HTMLVideoElement>) => {
    const [isVideoReady, setIsVideoReady] = useState(false);

    useEffect(() => {
        const startWebcam = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                        facingMode: 'user',
                        aspectRatio: 16 / 9
                    }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current!.play();
                        setIsVideoReady(true);
                    };

                }
            } catch (err) {
                console.error("Error accessing the webcam:", err);
            }
        };

        startWebcam();

        return () => {
            if (videoRef.current && videoRef.current.srcObject instanceof MediaStream) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [videoRef]);

    return { isVideoReady };
};