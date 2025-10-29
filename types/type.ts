export interface JoinedUserTypes{
    username:string,
    index: number
}

export interface UserType {
  id: string;
  name: string;
  role: number;
  room_id: string;
  color_id: number;
  joined_at: string;
}

export interface RoomType {
  id: string;
  token?:string
  name: string;
  created_at: string;
}

export interface ChatType {
  user: UserType; 
  message: string;
  color:string;
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