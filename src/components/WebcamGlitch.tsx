import React, { useRef, useEffect, useState, useCallback } from 'react';
import { detectSingleFace, TinyFaceDetectorOptions } from 'face-api.js';
import { useWebcam } from './hooks/useWebcam';
import { useFaceApi } from './hooks/useFaceApi';
import { captureAndTransformImage } from './utils/imageTransform';

interface Enemy {
    x: number;
    y: number;
    speed: number;
    size: number;
    direction: 'left' | 'right';
}

const WebcamGlitch: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [life, setLife] = useState(20);
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const [gameOver, setGameOver] = useState(false);
    //const [score, setScore] = useState(0);
    const [enemyImage, setEnemyImage] = useState<HTMLImageElement | null>(null);

    const { isVideoReady } = useWebcam(videoRef);
    const { isFaceApiReady } = useFaceApi();
    const MAX_ENEMIES = 5;
    const [imageURL, setImageURL] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingText, setLoadingText] = useState("Estamos preparando la cámara sonríe 😁...");
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = 'enemy.png';
        img.onload = () => setEnemyImage(img);
    }, []);

    useEffect(() => {
        console.log('Estado de video:', { isVideoReady, isFaceApiReady });
        if (!isVideoReady) return;
        const takeInitialPhoto = async () => {
            //setLoadingText("Estamos preparando la cámara sonríe 😁...");
            try {
                console.log("asdsa")
                const data = await captureAndTransformImage(videoRef.current!);
                setImageURL(data || 'https://c.tenor.com/PWI7btui12YAAAAC/scream-i-am-legend.gif');
            } catch (err) {
                console.error(err);
                setImageURL('https://c.tenor.com/PWI7btui12YAAAAC/scream-i-am-legend.gif');
            }

            setLoadingText("¡Prepárate para jugar! No dejes que los zombies te muerdan el rostro! 😱");
            setTimeout(() => {
                setIsLoading(false);
                setGameStarted(true);
            }, 1500); // Dar tiempo para leer el mensaje final
        };

        takeInitialPhoto();
    }, [isVideoReady])

    const spawnEnemy = useCallback(() => {
        setEnemies((prevEnemies) => {
            if (prevEnemies.length >= MAX_ENEMIES) return [...prevEnemies];

            const side = Math.floor(Math.random() * 4);
            let x: number = 0, y: number = 0;
            const speed = 15;
            const direction: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right';

            switch (side) {
                case 0: x = Math.random() * window.innerWidth; y = -50; break;
                case 1: x = window.innerWidth + 50; y = Math.random() * window.innerHeight; break;
                case 2: x = Math.random() * window.innerWidth; y = window.innerHeight + 50; break;
                case 3: x = -50; y = Math.random() * window.innerHeight; break;
            }
            return [...prevEnemies, { x, y, speed, size: 100, direction }]
        });
    }, [enemies.length]);

    useEffect(() => {
        if (!isVideoReady || !isFaceApiReady || !gameStarted) return

        let animationFrameOne: number;
        let spawnInterval: number;


        const renderVideo = async () => {

            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) return;
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            const detection = await detectSingleFace(video, new TinyFaceDetectorOptions())

            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            ctx.save()
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1)
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            ctx.restore()
            if (detection?.box) {
                ctx.save()
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1)
                setEnemies((prevEnemies) => prevEnemies.map(enemy => {
                    const dx = (canvas.width - detection.box.x - detection.box.width / 2) - enemy.x;
                    const dy = (detection.box.y + detection.box.height / 2) - enemy.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 200) {
                        setLife(l => Math.max(0, l - 1));
                        return null;
                    }

                    const newX = enemy.x + (dx / distance) * enemy.speed;
                    const newY = enemy.y + (dy / distance) * enemy.speed;

                    ctx.save();
                    ctx.translate(canvas.width - newX, newY);
                    if (enemy.direction === 'right') {
                        ctx.scale(-1, 1);
                    }
                    if (!enemyImage) return null;

                    ctx.drawImage(enemyImage, -25, -25, enemy.size, enemy.size);
                    ctx.restore();
                    return { ...enemy, x: newX, y: newY, direction: dx > 0 ? 'right' : 'left' };
                }).filter(Boolean) as Enemy[])
            }
            ctx.save()
            ctx.translate(canvas.width, 0);

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            ctx.restore()
            //let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

            if (life > 0) {
                requestAnimationFrame(renderVideo)
            } else {
                setGameOver(true);
            }
        }
        spawnInterval = setInterval(spawnEnemy, 1000);
        animationFrameOne = requestAnimationFrame(renderVideo)
        //renderVideo()
        return () => {
            clearInterval(spawnInterval);
            cancelAnimationFrame(animationFrameOne)
        }

    }, [isVideoReady, gameStarted])

    useEffect(() => {
        if (life <= 0) {
            setGameOver(true);
        }
    }, [life])


    if (gameOver) {
        return (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
                <div className="absolute top-0 left-0 w-full text-center text-white text-4xl mt-4">
                    Game Over!
                </div>
                <img src={imageURL || ""} ></img>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            {isLoading && <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
                <div className="mb-4 text-2xl">{loadingText}</div>
                <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            </div>}
            <div className="absolute top-0 left-0 text-white text-2xl m-4 flex flex-col select-none bg-black/50 p-2 rounded-md">
                <span>Vida: {life}</span>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
        </div>
    );
};

export default WebcamGlitch;