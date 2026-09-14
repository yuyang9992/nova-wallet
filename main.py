from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Crypto Wallet Demo")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

wallets = {
    1: {
        "USDT": 1000.0,
        "BTC": 0.01
    }
}


class WithdrawRequest(BaseModel):
    user_id: int
    asset: str
    amount: float
    address: str


@app.get("/")
def home():
    return {
        "message": "Crypto Wallet Demo API is running"
    }


@app.get("/wallet/{user_id}")
def get_wallet(user_id: int):
    if user_id not in wallets:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found"
        )

    return wallets[user_id]


@app.post("/wallet/withdraw")
def withdraw(request: WithdrawRequest):
    if request.user_id not in wallets:
        raise HTTPException(
            status_code=404,
            detail="Wallet not found"
        )

    if request.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than zero"
        )

    asset = request.asset.upper()

    if asset not in wallets[request.user_id]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported asset"
        )

    if wallets[request.user_id][asset] < request.amount:
        raise HTTPException(
            status_code=400,
            detail="Insufficient balance"
        )

    wallets[request.user_id][asset] -= request.amount

    return {
        "status": "demo withdrawal completed",
        "asset": asset,
        "amount": request.amount,
        "destination": request.address,
        "remaining_balance": wallets[request.user_id][asset]
    }