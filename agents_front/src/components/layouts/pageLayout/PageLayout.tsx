'use client'
import React, {useContext, useEffect, useRef, useState} from "react";
import SideMenu, {SideMenuRef} from "@/components/layouts/pageLayout/sideMenu/SideMenu";
import AppContext from "@/contexes/appContext";

export default function PageLayout({children}: React.PropsWithChildren) {
    const { components } = useContext(AppContext);
    const sideMenuRef = useRef<SideMenuRef>(null);

    const isExpanded = (localStorage.getItem('side-menu-isExpanded') ?? 'true') === 'true';
    const sideMenuExpandedWidth = parseInt(localStorage.getItem('side-menu-expandedWidth') ?? '350');
    const [ sideMenuSize, setSideMenuSize ] = useState<number>(sideMenuExpandedWidth);
    const [ sideMenuIsExpanded, setSideMenuIsExpanded ] = useState<boolean>(isExpanded);

    useEffect(() => {
        components.setSideMenuRef(sideMenuRef);
    }, []);

    useEffect(() => {
        localStorage?.setItem('side-menu-isExpanded', String(sideMenuIsExpanded));
    }, [sideMenuIsExpanded]);

    const onResizeBarMouseDown = (e: React.MouseEvent) => {
        if (!sideMenuRef.current) {
            return;
        }
        const windowWidth = window.innerWidth;
        const maxWidth = windowWidth - 2 - 350;
        const minWidth = 350;

        document.body.style.cursor = 'col-resize';
        let currentPos = e.pageX;
        let size = sideMenuSize;
        const onResizeBarMouseMove = (e: MouseEvent) => {
            if (!sideMenuRef.current) {
                return;
            }
            const offset = e.pageX - currentPos;
            currentPos = e.pageX;
            size = Math.max(Math.min(size - offset, maxWidth), minWidth);
            sideMenuRef.current.setWidth(size);
        }

        const onResizeBarMouseUp = () => {
            setSideMenuSize(size);
            localStorage.setItem('side-menu-expandedWidth', String(size));
            document.removeEventListener('mousemove', onResizeBarMouseMove);
            document.removeEventListener('mouseup', onResizeBarMouseMove);
            document.body.style.cursor = ''
        }


        document.addEventListener('mousemove', onResizeBarMouseMove);
        document.addEventListener('mouseup', onResizeBarMouseUp);
    }

    return (
        <div className="grid w-screen h-screen overflow-hidden grid-cols-[1fr_auto] grid-rows-1">
            <div className="w-full h-full overflow-hidden relative">
                <div className="w-full h-full overflow-scroll">
                    {children}
                </div>
                <button className="absolute top-0 right-0 h-full w-[5px] bg-transparent hover:enabled:cursor-col-resize"
                 onMouseDown={onResizeBarMouseDown} disabled={!sideMenuIsExpanded}></button>
            </div>
            <SideMenu isExpanded={sideMenuIsExpanded} setIsExpanded={setSideMenuIsExpanded} expandedWidth={sideMenuSize} ref={sideMenuRef}/>
        </div>
    )
}