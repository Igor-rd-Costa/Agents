from pydantic import BaseModel

class LoginDTO(BaseModel):
    email: str
    password: str

class RegisterDTO(BaseModel):
    username: str
    email: str
    password: str