import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animación de reveal con stagger para elementos de lista
 * @param {string} selector - CSS selector de los elementos
 * @param {object} options - Opciones de animación
 */
export function revealStagger(selector, options = {}) {
    const {
        trigger = selector,
        start = 'top 80%',
        stagger = 0.15,
        duration = 0.8,
        y = 60,
        opacity = 0,
    } = options;

    return gsap.fromTo(
        selector,
        {
            opacity,
            y,
        },
        {
            opacity: 1,
            y: 0,
            duration,
            stagger,
            ease: 'expo.out',
            scrollTrigger: {
                trigger,
                start,
                toggleActions: 'play none none reverse',
            },
        }
    );
}

/**
 * Parallax sutil para elementos
 * @param {string|Element} element - Selector o elemento DOM
 * @param {number} speed - Velocidad del parallax (0.5 = mitad de velocidad)
 */
export function parallax(element, speed = 0.5) {
    return gsap.to(element, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
            trigger: element,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
        },
    });
}

/**
 * Animación de entrada para modales/cards
 * @param {string|Element} element - Selector o elemento DOM
 */
export function modalEntrance(element) {
    return gsap.fromTo(
        element,
        {
            opacity: 0,
            scale: 0.95,
            y: 20,
        },
        {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'expo.out',
        }
    );
}

/**
 * Hover effect premium para cards
 * @param {string|Element} element - Selector o elemento DOM
 */
export function cardHoverEffect(element) {
    const el = typeof element === 'string' ? document.querySelectorAll(element) : [element];

    el.forEach((card) => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -8,
                scale: 1.02,
                duration: 0.3,
                ease: 'expo.out',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: 'expo.out',
            });
        });
    });
}

/**
 * Loading/Processing animation
 * @param {string|Element} element - Selector o elemento DOM
 */
export function pulseAnimation(element) {
    return gsap.to(element, {
        scale: 1.05,
        opacity: 0.8,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
    });
}
