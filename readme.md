# Clique Guessing game
Clique is a social bonding chat room / guessing game where you can connect with your friends,play guessing games and get to know each other better.

## Features
- Chat rooms
- Messaging
- Session management
- Question and answers
- Notifications

## Stack
- Socket.io
- ExpressJS
- Postgres
- Typescript

## Installation

1. ### Clone the repository:
   ```bash
   git clone https://github.com/Onetyten/clique.git
   cd clique
   ```

2. ### Install dependencies(make sure you have npm and node installed):
   ```bash
   npm install
   ```
4. ### A postgres Database with tables
    1. colors
    ```sql
        create table colors (
        id smallint primary key generated always as identity,
        hexcode text not null
        );
    ```
    2. members
    ```sql
        create table public.members (
        id uuid primary key default gen_random_uuid(),
        joined_at timestamp not null default now(),
        name text not null,
        room_id uuid not null,
        role smallint not null,
        color_id smallint,
        score integer not null default 0,
        was_gm boolean default false,
        constraint members_color_id_fkey foreign key (color_id) references public.colors(id),
        constraint members_role_fkey foreign key (role) references public.roles(id),
        constraint members_room_id_fkey foreign key (room_id) references public.rooms(id)
        );
    ```
    3. roles
    ```sql
        create table roles (
        id smallint primary key generated always as identity,
        name text not null
        );
    ```
    4. rooms
    ```sql
        create table rooms (
        id uuid primary key default gen_random_uuid(),
        created_at timestamp not null default now(),
        clique_key text unique not null,
        name text
        );
    ```
    5. sessions
    ```sql
        create table sessions (
        id uuid primary key default gen_random_uuid(),
        is_active boolean not null default true,
        question text not null,
        answer text not null,
        end_time bigint not null,
        room_id uuid not null,
        gm_id uuid not null,
        constraint session_room_id_fkey foreign key (room_id) references rooms(id),
        constraint session_gm_id_fkey foreign key (gm_id) references members(id)
        );
    ```
    

3. ### Create a .env file following this format
   Create a .env file in the root of the project and add the following environment variables:
   ```env
    PORT: 3500
    NEONURL=This can be any Postgres database's connection string like supabase, neon and so on.
    REDIS_URL= A redis connection string.
   ```
4. ### Start the server
   ```bash
   npm run dev
   ```
## Architecture
    - Server: handles sockets, rooms and general game logic.
    - Client: using ejs to render UI, event triggering and question timeouts
    - Postgres database: Database: stores users, rooms, sessions and game states
### File structure
 📦clique
 ┣ 📂cache
 ┃ ┗ 📜cacheRoleID.ts
 ┣ 📂config
 ┃ ┣ 📜pgConnect.ts
 ┃ ┗ 📜redisConfig.ts
 ┣ 📂controller
 ┃ ┗ 📜fetchGuests.controller.ts
 ┣ 📂handlers
 ┃ ┣ 📜AskQuestion.handler.js
 ┃ ┣ 📜AskQuestion.handler.ts
 ┃ ┣ 📜chatMessage.handler.ts
 ┃ ┣ 📜createClique.handler.ts
 ┃ ┣ 📜endClique.handler.ts
 ┃ ┣ 📜handleSessionOver.ts
 ┃ ┣ 📜incorrectAnswer.handler.ts
 ┃ ┗ 📜joinClique.handler.ts
 ┣ 📂node_modules
 ┣ 📂public
 ┃ ┣ 📂css
 ┃ ┃ ┣ 📜output.css
 ┃ ┃ ┗ 📜style.css
 ┃ ┣ 📂images
 ┃ ┃ ┗ 📜favicon.ico
 ┃ ┗ 📂js
 ┃ ┃ ┣ 📜cliqueManager.js
 ┃ ┃ ┣ 📜login.js
 ┃ ┃ ┗ 📜reconnectSocket.js
 ┣ 📂routes
 ┃ ┗ 📂guest
 ┃ ┃ ┗ 📜fetchGuests.route.ts
 ┣ 📂schema
 ┣ 📂test
 ┣ 📂types
 ┃ ┗ 📜type.ts
 ┣ 📂validation
 ┃ ┣ 📜createRoom.validation.ts
 ┃ ┣ 📜endSessionSchema.ts
 ┃ ┗ 📜joinRoom.validation.ts
 ┣ 📂views
 ┃ ┣ 📂partials
 ┃ ┃ ┣ 📜messageInput.ejs
 ┃ ┃ ┣ 📜questionDisplay.ejs
 ┃ ┃ ┣ 📜questionForm.ejs
 ┃ ┃ ┗ 📜sidebar.ejs
 ┃ ┣ 📜index.ejs
 ┃ ┗ 📜room.ejs
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜app.ts
 ┣ 📜d.txt
 ┣ 📜eslint.config.mjs
 ┣ 📜package.json
 ┣ 📜readme.md
 ┗ 📜tsconfig.json

## API & Socket Events
1. Create Clique : To create a new room
    Client -> Server
``` json
    {
    "event": "CreateClique",
    "data": {
        "cliqueKey": "key",
        "username": "My name",
        "cliqueName": "My Room"
    }
    }
```
2. Join Clique : To join a room
    Client -> Server
``` json
    {
    "event": "joinClique",
    "data": {
        "cliqueKey": "key",
        "username": "My name",
        "isFirstConn": false
    }}
```
3. Session Over: Marks session as complete(Triggers cleanup )
    Client -> Server
``` json
    {
    "event": "sessionOver",
    "data": {
        "currentSession": "session_id",
        "isAnswer": true,
        "user": {
        "id": "uuid",
        "name": "string",
        "role": 1,
        "room_id": "uuid",
        "color_id": 3,
        "joined_at": "timestamp"
        }
    }
    }
```
4. Answered Incorrectly: Triggered when a user answers incorrectly.
    Client -> Server
``` json
    {
    "event": "answeredIncorrectly",
    "data": {
        "user": { "...UserType" },
        "message": "string",
        "color": "#hexcode",
        "timeStamp": 1700000000000
    }
    }
```
5. Chat Message: Send a chat message to the room.
    Client -> Server
``` json
    {
    "event": "ChatMessage",
    "data": {
        "user": { "...UserType" },
        "message": "string",
        "color": "#hexcode",
        "timeStamp": 1700000000000
    }
    }
```
6. Ask Question: GM asks a question to the room.
    Client -> Server
``` json
    {
    "event": "askQuestion",
    "data": {
        "question": "What is 2 + 2?",
        "answer": "4",
        "user": { "...UserType" },
        "endTime": 1700000000000
    }
    }
```
7. Error : Sent when there’s invalid input.
    Server -> Client
``` json
    {
    "event": "askQuestion",
    "data": {
        "question": "What is 2 + 2?",
        "answer": "4",
        "user": { "...UserType" },
        "endTime": 1700000000000
    }
    }
```
8. Question Error : Sent when conditions to start a session are not met.
    Server -> Client
``` json
    {
    "event": "questionError",
    "data": {
        "message": "There must be more than two players to start a game session"
    }
    }
```
9. Question Success : Confirmation that a question has been successfully asked.
    Server -> Client
``` json
    {
    "event": "questionSuccess",
    "data": {
        "message": "Your question has been asked successfully!",
        "session": { "...SessionType" },
        "roundNum": 1
    }
    }
```
10. Message Success : Confirmation that a chat message was sent.
    Server -> Client
``` json
    {
    "event": "messageSuccess",
    "data": {
        "user": { "...UserType" },
        "message": "string",
        "timeStamp": 1700000000000,
        "color": "#hexcode"
    }
    }
```
11. Clique Created : Room successfully created.
    Server -> Client
``` json
    {
    "event": "CliqueCreated",
    "data": {
        "message": "Clique created",
        "room": { "...RoomType" },
        "user": { "...UserType" },
        "colorHex": "#hexcode"
    }
    }
```
12. Mid-Session Error : Attempt to start/join when a session is already active.
    Server -> Client
``` json
    {
    "event": "midSessionError",
    "data": {
        "message": "A session is currently going on in room MyRoom, rejoin in 30s",
        "timeLeft": 30
    }
    }
```
13. Joined Clique : Successfully joined an existing clique.
    Server -> Client
``` json
    {
    "event": "JoinedClique",
    "data": {
        "message": "Successfully joined MyRoom",
        "room": { "...RoomType" },
        "user": { "...UserType" },
        "colorHex": "#hexcode"
    }
    }
```
14. Question Asked : A new question has been broadcasted to the room.
    Server -> Client
``` json
    {
    "event": "questionAsked",
    "data": {
        "session": { "...SessionType" }
    }
    }
```
15. Message Sent : A chat message broadcasted to the room.
    Server -> Client
``` json
{
  "event": "messageSent",
  "data": {
    "user": { "...UserType" },
    "message": "string",
    "timeStamp": 1700000000000,
    "color": "#hexcode"
  }
}
```
16. User Joined : Notification when a user joins the room.
    Server -> Client
``` json
{
  "event": "userJoined",
  "data": {
    "message": "tayo has joined the room",
    "newUser": { "...UserType" },
    "colorHex": "#hexcode"
  }
}
```
17. Question Answered Wrong : Notification when a user answers incorrectly.
    Server -> Client
``` json
{
  "event": "questionAnsweredWrong",
  "data": {
    "user": { "...UserType" },
    "message": "string",
    "timeStamp": 1700000000000,
    "color": "#hexcode"
  }
}
```
17. Answer Correct : A user answered correctly, points updated, and possibly GM reassigned.
    Server -> Client
``` json
{
  "event": "answerCorrect",
  "data": {
    "message": "Correct, 10 points to Onetyten",
    "adminMessage": "The new Game Master is tayo",
    "correctUser": { "...UserType" },
    "session": { "...SessionType" },
    "roundNum": 2
  }
}
```
18. Timeout Handled : The question timed out, session updated, and GM reassigned.
    Server -> Client
``` json
{
  "event": "timeoutHandled",
  "data": {
    "adminMessage": "The new Game Master is tayo",
    "session": { "...SessionType" },
    "roundNum": 2
  }
}
```

### Endpoints

1. Fetch Guests:
Fetches all members of a given room by its name. Returns player details, including their assigned colors.
Endpoint: /room/guests/fetch/:roomName

**Response**  

- **200 OK** – Members successfully fetched  
```json
{
  "message": "members of clique MyRoom fetched successfully",
  "members": [
    {
      "id": "uuid",
      "joined_at": "2025-09-30T12:00:00Z",
      "name": "Alice",
      "room_id": "uuid",
      "role": 1,
      "color_id": 2,
      "score": 10,
      "was_gm": false,
      "color_hex": "#FF5733"
    }
  ]
}
```
- **404 Not Found** – No members in the room
```json
{
  "message": "There is no one in this clique"
}

```
- **500 Internal Server Error** – Server-side failure
```json
{
  "message": "Failed to get clique members due to a server error.",
  "error": "detailed error message",
  "success": false
}
```
**Example Usage (Client)**
```ts
    const response = await fetch(`/room/guests/fetch/${encodeURIComponent(room.name)}`);
    const data = await response.json();
    console.log(data.members);
```


### Game Rules

The game session functions like a chat-based quiz game with defined roles and flow:

#### 1. Roles
- Game Master (GM): 
  - Responsible for starting the game session.  
  - Creates the question and answer for the players to guess.  
- Players:
  - Join a game session created by the GM.  
  - Attempt to answer the question posed by the GM.


#### 2. Session Setup
- A Game Master can start a new game session.  
- Other users can join the game session as players before the game starts.   
- A game session cannot start unless there are at least 3 players (GM + 2 players).  
- Once the session starts, no new players can join until it ends.

#### 3. Gameplay
- When the session begins:
  - The GM’s question is displayed to all players.  
  - Each player has 3 attempts to guess the correct answer.  
  - The session has a timer of 60 seconds.  

#### 4. Session End Conditions
A game session ends if any of the following occurs:
1. A player guesses the correct answer.
2. The 60-second timer expires.

#### 5. Outcomes
- If a player guesses correctly: 
  - The winning player is announced to all players (`You have won!`).  
  - The correct answer is revealed to everyone.  
  - 10 points are awarded to the winning player.  

- If the timer expires:   
  - No points are awarded.
  - The correct answer is revealed to everyone.  


#### 6. Scoring & Progression  
- After a session ends:  
  - Another player becomes the **new Game Master**.  
  - That player creates a new question and answer for the next round.  


#### 7. Session Cleanup
- A game session is deleted automatically after 2 minutes when all players have left the session.

6. Contribution Guide (if open source)


### License
ISC
