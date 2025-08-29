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
        console.log("Here", sectionRef.current);
        if (!sectionRef.current) {
            return;
        }

        const wrapper = sectionRef.current.querySelector('#dashboard') ?? sectionRef.current.firstElementChild!;
        wrapper.id = "dashboard";
        if (!wrapper) {
            return;
        }
        const root = createRoot(wrapper);
        const elements = [];
        const styles = wrapper.querySelectorAll('style')
        for (let i = 0; i < wrapper.children.length; i++) {
            const section = wrapper.children[i] as HTMLElement;
            if (section.nodeName === 'SECTION') {
                const originalInnerHTML = section.innerHTML;
                elements.push(<DashboardComponent key={i} id={section.id} className={section.className} inlineStyle={section.getAttribute('style') ?? undefined} html={originalInnerHTML}/>);
            }
        }
        root.render(elements);
        setTimeout(() => {
            let styleStr = "";
            styles.forEach(style => {
                styleStr += style.innerHTML;
            });
            console.log("Strings", styleStr);
            const el = document.createElement('style');
            el.innerText = styleStr;
            wrapper.appendChild(el);
        })
    }

    useEffect(() => {
        if (htmlElement !== null && sectionRef.current) {
            loadLayout(0);
            buildDashboard();
        }
    }, [htmlElement])

    useImperativeHandle(ref, () => {
        return {
            setHtmlElement
        };
    });

    const loadLayout = (index: number) => {
        if (!htmlElement || !sectionRef.current) {
            return;
        }
        sectionRef.current.innerHTML = typeof htmlElement === 'string' ? htmlElement : htmlElement[index];
        if (typeof htmlElement !== 'string') {
            sectionRef.current.style.width = '1920px';
            sectionRef.current.style.height = '1080px';
            sectionRef.current.id = 'dashboard';
            const style = document.createElement('style');
            style.textContent = `
            #dashboard section {
                border: 1px solid white;
            }`;
            sectionRef.current.appendChild(style);
        }
    }

    return (
        <div>
            <section ref={sectionRef} className="h-[95%] bg-[#333] overflow-scroll">
                <div className="border w-[1920px] h-[1080px]"></div>
            </section>
            { (htmlElement && typeof htmlElement !== 'string') && (
                <div className="h-[2rem] flex gap-x-2 mt-4 z-[10]">    
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(0)}>1</button>
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(1)}>2</button>
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(2)}>3</button>
                    <button className="border w-[5rem] cursor-pointer" onClick={() => loadLayout(3)}>4</button>
                </div>)
            }
        </div>
    )
});
TopPanel.displayName = "TopPanel";

export default TopPanel;