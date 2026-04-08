# routes/auth.py — Registration & Login with JWT

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from config.database import get_db, settings

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ── Request/Response Models ──────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    phone: str                    # Primary identifier (many users lack email)
    email: str | None = None
    password: str
    village: str
    district: str
    altitude_meters: int          # Critical for crop recommendations
    land_size_acres: float
    language: str = "hi"          # "hi" = Hindi, "en" = English


class LoginRequest(BaseModel):
    phone: str
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    phone: str
    district: str
    altitude_meters: int
    language: str
    token: str


# ── Helpers ──────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.jwt_expire_hours)
    return jwt.encode(
        {"sub": user_id, "exp": expire},
        settings.jwt_secret,
        algorithm="HS256"
    )


# ── Routes ───────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest):
    db = get_db()

    # Check if phone already registered
    existing = await db.users.find_one({"phone": data.phone})
    if existing:
        raise HTTPException(400, "Phone number already registered")

    user_doc = {
        **data.model_dump(exclude={"password"}),
        "password_hash": hash_password(data.password),
        "created_at": datetime.utcnow(),
        "alerts_enabled": True,
    }

    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    token = create_token(user_id)

    return UserResponse(
        id=user_id,
        name=data.name,
        phone=data.phone,
        district=data.district,
        altitude_meters=data.altitude_meters,
        language=data.language,
        token=token
    )


@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest):
    db = get_db()

    user = await db.users.find_one({"phone": data.phone})
    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(401, "Invalid phone or password")

    token = create_token(str(user["_id"]))

    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        phone=user["phone"],
        district=user["district"],
        altitude_meters=user["altitude_meters"],
        language=user.get("language", "hi"),
        token=token
    )
