import React from "react";

export type NavBarButtonProps = React.PropsWithChildren & {
    selected?: boolean,
    onClick?: (e: React.MouseEvent) => void
    title?: string
};

export default function NavBarButton({children, onClick, selected = false }: NavBarButtonProps) {
    return (
        <button style={{color: selected ? 'var(--color-primaryDark)' : ''}} className="h-[48px]
        flex items-center overflow-x-hidden text-primary cursor-pointer hover:text-primaryDark" onClick={onClick}>
            <div className="w-[48px] h-[48px] flex items-center justify-center">
                {children}
            </div>
        </button>
    );
}