from sqlmodel import create_engine, Session
import os

dbUrl = os.environ.get("DATABASE_URL")
DATABASE_URL = dbUrl if dbUrl is not None else "postgresql://postgres:postgres@localhost:5432/AgentsDB"

engine = create_engine(DATABASE_URL, echo=dbUrl is None)

def get_session():
    with Session(engine) as session:
        yield session