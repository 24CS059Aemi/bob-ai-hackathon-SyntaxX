"""
Authentication routes for User Registration, Login, and Session retrieval.
"""

import hashlib
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db, engine, Base
from ..models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Ensure users table is created immediately in database
Base.metadata.create_all(bind=engine)

SALT = "grid_advisor_secure_salt_2026"

def hash_password(password: str) -> str:
    return hashlib.sha256(f"{SALT}{password}".encode("utf-8")).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "operator"


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    token: str


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    name = payload.name.strip()
    email = payload.email.strip().lower()
    password = payload.password

    if not name:
        raise HTTPException(status_code=400, detail="Name is required.")
    if not email:
        raise HTTPException(status_code=400, detail="Email or username is required.")
    if not password:
        raise HTTPException(status_code=400, detail="Password is required.")

    # Check if already exists (case-insensitive)
    existing = db.query(User).filter(func.lower(User.email) == email).first()
    if existing:
        # If the user already registered earlier with the same password, return their account
        if verify_password(password, existing.password_hash):
            token = f"token_{existing.id}_{secrets.token_hex(16)}"
            return AuthResponse(
                id=existing.id,
                email=existing.email,
                name=existing.name,
                role=existing.role or "operator",
                token=token,
            )
        raise HTTPException(
            status_code=400,
            detail="An account with this email/username already exists. Please log in.",
        )

    # Create new user
    new_user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        role=payload.role or "operator",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = f"token_{new_user.id}_{secrets.token_hex(16)}"
    return AuthResponse(
        id=new_user.id,
        email=new_user.email,
        name=new_user.name,
        role=new_user.role or "operator",
        token=token,
    )


@router.post("/login", response_model=AuthResponse)
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    password = payload.password

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required.")

    # Case-insensitive lookup
    user = db.query(User).filter(func.lower(User.email) == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email/username or password. Please register first.")

    if not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

    token = f"token_{user.id}_{secrets.token_hex(16)}"
    return AuthResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role or "operator",
        token=token,
    )


@router.get("/me", response_model=AuthResponse)
def get_current_user(email: Optional[str] = None, db: Session = Depends(get_db)):
    if not email:
        user = db.query(User).first()
    else:
        user = db.query(User).filter(func.lower(User.email) == email.strip().lower()).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return AuthResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role or "operator",
        token=f"token_{user.id}_{secrets.token_hex(8)}",
    )
