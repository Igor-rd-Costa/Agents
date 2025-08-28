import React, {useContext, useEffect, useRef} from "react";
import SideMenu, {SideMenuRef} from "@/components/layouts/pageLayout/sideMenu/SideMenu";
import AppContext from "@/contexes/appContext";
import TopPanel, { TopPanelRef } from "./topPanel/TopPanel";

export default function PageLayout({children}: React.PropsWithChildren) {
    const { components } = useContext(AppContext);
    const sideMenuRef = useRef<SideMenuRef>(null);
    const topPanelRef = useRef<TopPanelRef>(null);

    useEffect(() => {
        components.setSideMenuRef(sideMenuRef);
        components.setTopPanelRef(topPanelRef);
    }, []);

    return (
        <div className="grid w-screen h-screen overflow-hidden grid-cols-[auto_1fr] grid-rows-1">
            <SideMenu ref={sideMenuRef}/>
            <div className="w-full h-full grid grid-cols-[1fr_auto] grid-rows-1">
                <TopPanel ref={topPanelRef}/>
                <div className="w-full h-full">
                    {children}
                </div>
            </div>
        </div>
    )
}