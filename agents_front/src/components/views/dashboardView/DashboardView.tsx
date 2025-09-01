'use client'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import DashboardComponent from "@/components/views/dashboardView/components/DashboardComponent";

export type DashboardViewRef = {
    setHtmlElement: (element: string|null) => void
};

const DashboardView = forwardRef<DashboardViewRef>(({}, ref) => {
    const sectionRef = useRef<HTMLElement>(null);
    const dashboardWrapperRef = useRef<HTMLDivElement>(null);
    const [ htmlElement, setHtmlElement ] = useState<string|string[]|null>(null);

    const buildDashboard = () => {
        console.log("Here", sectionRef.current);
        if (!sectionRef.current || !sectionRef.current.firstElementChild) {
            return;
        }

        const wrapper = sectionRef.current.firstElementChild
        wrapper.id = "dashboard";
        if (!wrapper) {
            return;
        }
        const root = createRoot(wrapper);
        const elements = [];
        for (let i = 0; i < wrapper.children.length; i++) {
            const section = wrapper.children[i] as HTMLElement;
            if (section.nodeName === 'SECTION') {
                const originalInnerHTML = section.innerHTML;
                elements.push(<DashboardComponent key={i} id={section.id} className={section.className} inlineStyle={section.getAttribute('style') ?? undefined} html={originalInnerHTML}/>);
            }
        }
        root.render(elements);
    }

    useEffect(() => {
        if (htmlElement !== null && sectionRef.current) {
            loadLayout(0);
            //buildDashboard();
        }
    }, [htmlElement])

    useImperativeHandle(ref, () => {
        return {
            setHtmlElement
        };
    });

    const loadLayout = (index: number) => {
        if (!htmlElement || !dashboardWrapperRef.current) {
            return;
        }
        const isDashboardLayout = typeof htmlElement !== 'string';
        const target = dashboardWrapperRef.current;
        console.log("Target", target);
        target.innerHTML = isDashboardLayout ? htmlElement[index] : htmlElement;
        console.log("Html", htmlElement);
        const borderColor = isDashboardLayout ? 'white' : 'transparent';
        target.style.width = '1920px';
        target.style.height = '1080px';
        target.id = 'dashboard';
        const style = document.createElement('style');
        style.textContent = `
        #dashboard section {
            border: 1px solid ${borderColor};
        }`;
        target.appendChild(style);
        const child = target.firstElementChild;
        if (child && child.nodeName === 'DIV' && child.id === 'dashboard') {
            target.innerHTML = child.innerHTML;
        }
    }

    return (
        <>
            <section ref={sectionRef} className="h-full w-full bg-[#2A2A2A] p-8 overflow-scroll">
                <div className="rounded-[1rem] shadow-[0px_0px_20px_-2px_#0005] bg-[#0002] w-[1930px] h-[1090px] flex items-center justify-center">
                    <div ref={dashboardWrapperRef} className="bg-[#333] w-[1920px] h-[1080px]"></div>
                </div>
            </section>
            { (htmlElement && typeof htmlElement !== 'string') && (
                <div className="h-[2rem] flex gap-x-2 mt-4 z-[10]">    
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(0)}>1</button>
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(1)}>2</button>
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(2)}>3</button>
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(3)}>4</button>
                </div>)
            }
        </>
    )
});
DashboardView.displayName = "DashboardView";

export default DashboardView;