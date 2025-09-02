import React, { useRef } from "react"

type DashboardComponentProps = {
    id?: string,
    className?: string,
    inlineStyle?: string,
    html: string|null,
    children?: React.ReactNode
}

export default function DashboardComponent({ id, className, inlineStyle, html, children }: DashboardComponentProps) {
    const sectionRef = useRef<HTMLElement>(null);

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

    return (
      <div className="border border-transparent hover:border-white">
        <section ref={sectionRef} id={id ?? ''} className={(className ?? '')} style={{...parseCSS(inlineStyle ?? '')}} dangerouslySetInnerHTML={{__html: html ?? ''}}>
        </section>
      </div>
    );
}