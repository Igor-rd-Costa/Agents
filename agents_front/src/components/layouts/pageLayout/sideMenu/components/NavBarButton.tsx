import React from "react";

export type NavBarButtonProps = React.PropsWithChildren & {
    selected?: boolean,
    onClick?: (e: React.MouseEvent) => void
    title?: string,
    disabled?: boolean
};

export default function NavBarButton({children, onClick, title, selected = false, disabled = false }: NavBarButtonProps) {
    return (
        <button style={{color: (selected && !disabled) ? 'var(--color-primaryDark)' : ''}} title={title} className="h-[48px]
        flex items-center overflow-x-hidden text-primary cursor-pointer hover:text-primaryDark disabled:text-gray-500" onClick={onClick} disabled={disabled}>
            <div className="w-[48px] h-[48px] flex items-center justify-center">
                {children}
            </div>
        </button>
    );
}