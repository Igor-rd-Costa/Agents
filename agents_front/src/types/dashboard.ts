import ChatConnection from "@/types/chat/ChatConnection";
import {ChatDTO} from "@/types/chat/ChatDTO";


export type DashboardDTO = {
    id: string|null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Dashboard {
    private id: string|null;
    private name: string;
    private createdAt: Date;
    private updatedAt: Date;
    private connection: ChatConnection;

    public constructor(id?: string|null, name?: string, createdAt?: Date, updatedAt?: Date, currentConnection?: ChatConnection) {
        const now = new Date(Date.now());
        this.id = id ?? null;
        this.name = name ?? '';
        this.createdAt = createdAt ?? now;
        this.updatedAt = updatedAt ?? now;
        if (currentConnection) {
            this.connection = currentConnection;
            this.connection.setDashboardId(id ?? null);
            console.log("Current", currentConnection);
        } else {
            this.connection = new ChatConnection(id ?? null);
        }
    }

    public getId() {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public getCreatedAt() {
        return this.createdAt;
    }

    public getUpdatedAt() {
        return this.updatedAt;
    }

    public getConnection(): ChatConnection {
        if (this.id !== null && this.connection.getDashboardId() === null) {
            this.connection = new ChatConnection(this.id)
        }
        return this.connection;
    }

    public toDashboardDTO(): ChatDTO {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}