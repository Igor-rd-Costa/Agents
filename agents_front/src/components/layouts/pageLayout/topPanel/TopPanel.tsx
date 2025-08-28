import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type TopPanelRef = {
    setHtmlElement: (element: string|null) => void
};

const TopPanel = forwardRef<TopPanelRef>(({}, ref) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [ htmlElement, setHtmlElement ] = useState<string|null>(null);

    useEffect(() => {
        if (htmlElement !== null && sectionRef.current) {
            sectionRef.current.innerHTML = htmlElement;
        }
    }, [htmlElement])

    useImperativeHandle(ref, () => {
        return {
            setHtmlElement
        };
    });

    return (
        <section ref={sectionRef} className="h-[500px] bg-[#333] w-full"/>
    )
});
TopPanel.displayName = "TopPanel";

export default TopPanel;