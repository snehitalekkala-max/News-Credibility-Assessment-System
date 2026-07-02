from pydantic import BaseModel, EmailStr


# -----------------------------
# Register User
# -----------------------------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# -----------------------------
# Login User
# -----------------------------
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -----------------------------
# User Response
# -----------------------------
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


# -----------------------------
# JWT Token Response
# -----------------------------
class Token(BaseModel):
    access_token: str
    token_type: str