import React from "react";
import SideMenu from "@/components/layouts/pageLayout/sideMenu/SideMenu";

export default function PageLayout({children}: React.PropsWithChildren) {
    return (
        <div className="grid w-screen h-screen grid-cols-[auto_1fr]">
            <SideMenu/>
            <div className="w-full h-full overflow-y-hidden grid grid-rows-[1fr_auto] p-4 justify-items-center pt-0 pr-8 gap-8">
                {children}
            </div>
        </div>
    )
}