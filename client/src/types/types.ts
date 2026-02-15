export interface roomType {
    id: string,
    created_at: string,
    name: string,
    token: string
}
export interface userType {
    id: string,
    name: string,
    room_id : string,
    role: number,
    hex_code: string,
    score: number,
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
    user: {
      id: string,
      name: string,
      room_id: string,
      role: number,
      hex_code: string,
    },
    message: string,
    timeStamp: number
    id:string
    type: "chat" | "question" | "correct" | "wrong" | "answer"
}

export interface sessionType{
    id:string
    is_active:boolean
    question:string
    answer:string
    end_time:number
    room_id:string
    gm_id:string
}