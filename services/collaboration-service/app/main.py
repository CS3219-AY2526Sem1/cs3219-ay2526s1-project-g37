from fastapi import FastAPI

app = FastAPI()

## API for testing connection
@app.get("/ping")
def ping():
    return {"message": "Pong"}
