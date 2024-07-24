import { Message } from "@/model/User";
export type homePageUsers = {
    username: string,
    isAcceptingMessage:boolean
}

export interface ApiResponse {
    success: boolean;
    message: string | boolean;
    isAcceptingMessages?: boolean
    messages?: Array<Message>
    users?: Array<homePageUsers>
}