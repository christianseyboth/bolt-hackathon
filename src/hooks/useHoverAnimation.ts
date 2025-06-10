import { useMotionValue, useSpring, useTransform } from "motion/react";

export const useHoverAnimation = () => {
    const springConfig = { stiffness: 100, damping: 5 };
    const x = useMotionValue(0);
    const translateX = useSpring(
        useTransform(x, [-100, 100], [-50, 50]),
        springConfig
    );
    const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
        const target = event.currentTarget;
        const halfWidth = target.offsetWidth / 2;
        x.set(event.nativeEvent.offsetX - halfWidth);
    };

    return { translateX, handleMouseMove };
};
