from fastapi import FastAPI

app = FastAPI(title="Vesper Portfolio Voice API")


@app.get("/")
async def read_root():
    return {"status": "ok"}
