export interface JoinedUserTypes{
    username:string,
    index: number
}

export interface UserType {
  id: string;
  name: string;
  role: number;
  room_id: string;
  hex_code: string;
  joined_at: string;
}

export interface ChatUserType {
    id: string;
    name: string;
    room_id: string;
    role: number;
    hex_code: string;
}

export interface RoomType {
  id: string;
  token?:string
  name: string;
  created_at: string;
}

export interface ChatType {
  user: ChatUserType; 
  message: string;
  timeStamp: number;
}

export interface sessionType{
    id:string
    is_active:boolean
    room_id:string
    gm_id:string
    question:string
    answer:string
    end_time:number
}