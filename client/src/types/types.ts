export interface roomType {
    id: string,
    created_at: string,
    name: string,
    token: string
}
export interface userType {
    id: string,
    joined_at: string,
    name: string,
    room_id : string,
    role: number,
    hex_code: string,
    score: number,
    was_gm: boolean
}

export interface MemberType {
  id: string;
  joined_at: string;
  name: string;
  room_id: string;
  role: number;
  hex_code: string;
  score: number;
  was_gm: boolean;
}

export interface loginDataType{
  message: string,
  room: roomType
  user:userType
}

export interface messageType {
    id:string
    value:string,
    type: "chat" | "question" | "correct" | "wrong"
}
