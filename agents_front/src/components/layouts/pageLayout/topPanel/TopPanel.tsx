import DashboardComponent from "@/components/dashboard/DashboardComponent";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

export type TopPanelRef = {
    setHtmlElement: (element: string|null) => void
};

const TopPanel = forwardRef<TopPanelRef>(({}, ref) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [ htmlElement, setHtmlElement ] = useState<string|null>(null);

    const buildDashboard = () => {
        if (!sectionRef.current) {
            return;
        }

        const wrapper = sectionRef.current.querySelector('#dashboard');
        if (!wrapper) {
            return;
        }
        const root = createRoot(wrapper);
        const elements = [];
        console.log("Wrapper", wrapper)
        for (let i = 0; i < wrapper.children.length; i++) {
            const section = wrapper.children[i];
            const originalInnerHTML = section.innerHTML;
            elements.push(<DashboardComponent key={i} id={section.id} className={section.className} html={originalInnerHTML}/>);
        }
        root.render(elements);
    }

    useEffect(() => {
        if (htmlElement !== null && sectionRef.current) {
            sectionRef.current.innerHTML = htmlElement;
            buildDashboard();
        }
    }, [htmlElement])

    useImperativeHandle(ref, () => {
        return {
            setHtmlElement
        };
    });

    return (
        <section ref={sectionRef} className="h-full bg-[#333] overflow-scroll"/>
    )
});
TopPanel.displayName = "TopPanel";

export default TopPanel;