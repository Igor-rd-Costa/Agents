import { Component as ComponentBlueprint } from '@/types/dsl';
import ChartComponent from './ChartComponent';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

export type ComponentProps = {
    blueprint: ComponentBlueprint
}

export type ComponentRef = {    
    reload: () => void;
}

const Component = forwardRef<ComponentRef, ComponentProps>((props, ref) => {
    const componentRef = useRef<ComponentRef>(null);

    useImperativeHandle(ref, () => {
        return {
            reload: componentRef.current?.reload ?? (() => {})
        };
    });

    const ComponentImpl = useMemo(() => {
        switch(props.blueprint.type) {
            case 'chart': return ChartComponent;
            default: return () => <div>Component not implemented</div>;
        }
    }, [props.blueprint.type]);

    return (
        <div className="w-[650px] h-[500px]">
            <ComponentImpl ref={componentRef} blueprint={props.blueprint} />
        </div>
    );
});

export default Component;