import { useEffect, useRef } from "react";

/**
 * Adds the common dismissal behavior used by menus, popovers, drawers, and
 * modal dialogs. The ref should cover the complete interactive layer,
 * including its trigger when the trigger is rendered alongside the layer.
 */
export default function useDismissibleLayer(onDismiss, enabled = true) {
    const layerRef = useRef(null);

    useEffect(() => {
        if (!enabled) return undefined;

        const handlePointerDown = (event) => {
            if (layerRef.current && !layerRef.current.contains(event.target)) {
                onDismiss();
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onDismiss();
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [enabled, onDismiss]);

    return layerRef;
}
