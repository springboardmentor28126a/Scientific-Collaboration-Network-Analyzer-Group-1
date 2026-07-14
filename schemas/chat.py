from pydantic import BaseModel

class ChatCreate(BaseModel):

    collaboration_id:int

    sender_id:int

    message:str


class ChatResponse(ChatCreate):

    id:int

    class Config:

        from_attributes=True