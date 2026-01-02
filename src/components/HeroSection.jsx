import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        const container = containerRef.current;
        const title = titleRef.current;

        if (!video || !container || !title) return;

        // Animación del título al cargar
        gsap.from(title.children, {
            y: 100,
            opacity: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: 'expo.out',
            delay: 0.3
        });

        // Scroll-linked video (el video avanza/retrocede con el scroll)
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: 'bottom top',
                scrub: 1,
                pin: false,
            }
        });

        tl.to(video, {
            onUpdate: function () {
                const progress = this.progress();
                if (video.duration) {
                    video.currentTime = progress * video.duration;
                }
            }
        });

        // Parallax del título
        gsap.to(title, {
            yPercent: 50,
            opacity: 0,
            scrollTrigger: {
                trigger: container,
                start: 'top top',
                end: 'bottom top',
                scrub: 1
            }
        });

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative w-full h-screen overflow-hidden"
        >
            {/* Video de fondo */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="auto"
            >
                <source src="/FoodVideoHD.mp4" type="video/mp4" />
            </video>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

            {/* Hero Content */}
            <div ref={titleRef} className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
                <div className="overflow-hidden">
                    <h1 className="hero-title text-white font-black tracking-tighter">
                        FreeCooking
                    </h1>
                </div>
                <div className="overflow-hidden mt-4">
                    <p className="text-2xl md:text-4xl text-gray-200 font-light tracking-wide max-w-3xl">
                        Tu cocina, tus costos, <span className="text-primary-400 font-semibold">bajo control</span>
                    </p>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
                    <svg
                        className="w-6 h-6 text-white/70"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                    </svg>
                </div>
            </div>
        </section>
    );
}
