import React, { useRef } from "react"

type DashboardComponentProps = {
    id?: string,
    className?: string,
    inlineStyle?: string,
    html: string
}

export default function DashboardComponent({ id, className, inlineStyle, html}: DashboardComponentProps) {
    const sectionRef = useRef<HTMLElement>(null);

    const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        //if (!sectionRef.current) {
        //    return;
        //}
        //const t = e.currentTarget! as HTMLElement;
        //console.log(t);
        //const rect = t.getBoundingClientRect();
        //const offsetX = e.nativeEvent.layerX - rect.left;
        //const offsetY = e.nativeEvent.layerY - rect.top;
        //console.log("e", {x: offsetX, y: offsetY});
//
        //if (offsetX < 5 || offsetY < 5 || offsetX > (rect.right - 5) || offsetY > (rect.bottom - 5)) {
        //    sectionRef.current.style.cursor = "pointer";
        //} else {
        //    sectionRef.current.style.cursor = "";
        //}
    }

    const debug =() => {
        console.log(sectionRef.current?.getBoundingClientRect())
    }

    const parseCSS = (cssText: string) => {
        const styles: {[key: string]: string} = {};
        cssText.split(';').forEach(rule => {
          if (rule.trim()) {
            const [property, value] = rule.split(':').map(s => s.trim());
            if (property && value) {
              const camelProperty = property.replace(/-([a-z])/g, (match, letter) => 
                letter.toUpperCase()
              );
              styles[camelProperty] = value;
            }
          }
        });
        return styles;
      };

    const onMouseEnter = (e: React.MouseEvent) => {
        console.log("Enter");
        const t = e.currentTarget as HTMLElement;
        t.style.borderColor = 'white';
        t.style.borderWidth = '1px';
    }
    
    const onMouseLeave = (e: React.MouseEvent) => {
        console.log("Leave");
        const t = e.currentTarget as HTMLElement;
        t.style.borderColor = '';
        t.style.borderWidth = '';
    }

    return (
        <section ref={sectionRef} onMouseLeave={onMouseLeave} onMouseEnter={onMouseEnter} onClick={debug} onMouseMove={onMouseMove} id={id ?? ''} className={(className ?? '')} style={{...parseCSS(inlineStyle ?? '')}} dangerouslySetInnerHTML={{ __html: html }}/>
    );
}