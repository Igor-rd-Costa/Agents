import React, {useContext, useEffect, useRef} from "react";
import SideMenu, {SideMenuRef} from "@/components/layouts/pageLayout/sideMenu/SideMenu";
import AppContext from "@/contexes/appContext";

export default function PageLayout({children}: React.PropsWithChildren) {
    const { components } = useContext(AppContext);
    const sideMenuRef = useRef<SideMenuRef>(null);

    useEffect(() => {
        components.setSideMenuRef(sideMenuRef);
    }, []);

    return (
        <div className="grid w-screen h-screen grid-cols-[auto_1fr]">
            <SideMenu ref={sideMenuRef}/>
            <div className="w-full h-full">
                {children}
            </div>
        </div>
    )
}