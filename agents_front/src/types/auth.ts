
export type LoginDTO = {
    email: string,
    password: string
};

export type RegisterDTO = {
    email: string,
    username: string,
    password: string
};

export type User = {
    id: number,
    username: string,
    email: string
}