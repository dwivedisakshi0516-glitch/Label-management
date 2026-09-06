from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from backend.app.schemas.auth import LoginRequest, Token, UserResponse
from backend.app.core.config import settings
from backend.app.core.security import verify_password, create_access_token
from backend.app.database.mongodb import db_manager

router = APIRouter(prefix="/auth", tags=["Authentication"])
security_bearer = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_bearer)) -> UserResponse:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided"
        )
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    users_coll = db_manager.get_collection("users")
    user = await users_coll.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user_id = user.get("id") or str(user.get("_id"))
    return UserResponse(
        id=user_id,
        email=user["email"],
        name=user.get("name", "User"),
        role=user.get("role", "operator")
    )

@router.post("/login", response_model=Token)
async def login(req: LoginRequest):
    users_coll = db_manager.get_collection("users")
    user = await users_coll.find_one({"email": req.email})
    if not user:
        # Fallback check for demo admin
        if req.email == settings.DEFAULT_ADMIN_EMAIL and req.password == settings.DEFAULT_ADMIN_PASSWORD:
            user = {
                "id": "admin-demo-id",
                "email": settings.DEFAULT_ADMIN_EMAIL,
                "name": "System Administrator",
                "role": "admin"
            }
        else:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    else:
        if not verify_password(req.password, user.get("password_hash", "")):
            if not (req.email == settings.DEFAULT_ADMIN_EMAIL and req.password == settings.DEFAULT_ADMIN_PASSWORD):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    user_id = user.get("id") or str(user.get("_id"))
    user_resp = UserResponse(
        id=user_id,
        email=user["email"],
        name=user.get("name", "User"),
        role=user.get("role", "admin")
    )
    token = create_access_token(subject=user["email"])
    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
