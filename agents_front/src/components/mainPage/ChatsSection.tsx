import Button from "@mui/material/Button";
import Add from "@mui/icons-material/Add"

export default function ChatsSection() {

    const newChat = () => {

    }

    return (
        <section className="w-full h-full">
            <Button onClick={newChat} type="button" variant="contained">
                <Add/> Nova Conversa
            </Button>

            <div className="w-full h-full pt-4">
                <div className="w-full p-1 pl-2 pr-2 hover:bg-[#222] rounded-md">Nova Conversa</div>
            </div>
        </section>
    );
}