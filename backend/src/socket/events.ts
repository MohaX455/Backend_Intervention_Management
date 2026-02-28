export interface ServerToClientEvents {
    "newUser": (data: {
        name: string,
        email: string,
        roleId: number,
        isActive: string
    }) => void;
}