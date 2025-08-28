import React, { useRef } from "react"

type DashboardComponentProps = {
    id?: string,
    className?: string,
    html: string
}

export default function DashboardComponent({ id, className, html}: DashboardComponentProps) {
    const sectionRef = useRef<HTMLElement>(null);

    const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!sectionRef.current) {
            return;
        }
        const t = e.currentTarget! as HTMLElement;
        console.log(t);
        const rect = t.getBoundingClientRect();
        const offsetX = e.nativeEvent.layerX - rect.left;
        const offsetY = e.nativeEvent.layerY - rect.top;
        console.log("e", {x: offsetX, y: offsetY});

        if (offsetX < 5 || offsetY < 5 || offsetX > (rect.right - 5) || offsetY > (rect.bottom - 5)) {
            sectionRef.current.style.cursor = "pointer";
        } else {
            sectionRef.current.style.cursor = "";
        }
    }

    const onMouseLeave = (e: React.MouseEvent) => {

    }

    const debug =() => {
        console.log(sectionRef.current?.getBoundingClientRect())
    }

    return (
        <section ref={sectionRef} onClick={debug} onMouseMove={onMouseMove} id={id ?? ''} className={(className ?? '') + ' box-border border-1 border-transparent hover:border-white'} dangerouslySetInnerHTML={{ __html: html }}/>
    );
}