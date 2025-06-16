from fastapi import APIRouter,Request, Depends
from fastapi.responses import StreamingResponse
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq
from pymongo import MongoClient
from agents_back.services.auth_service import AuthService, get_auth_service
from langchain_huggingface.embeddings import HuggingFaceEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from uuid import uuid4
import os

router = APIRouter(prefix="/agents")

EMBEDDING_MODELS = {
    'bge3': {
        'name': 'BAAI/bge-m3',
        'dimensions': 1024
    },
    '3small': {
        'name': 'text-embedding-3-small',
        'dimensions': 1536
    },
    '3large': {
        'name': 'text-embedding-3-large',
        'dimensions': 3072
    }
}

@router.get("/")
async def get(query: str, request: Request, auth_service: AuthService = Depends(get_auth_service)):
    #user = await auth_service.get_current_user(request, session)
    template = ChatPromptTemplate.from_messages([
        ("system", "Você é um assistente amigável e sua função é responder as perguntas que forem enviadas pelo usuário."),
        ("user", "{query}")
    ])
    chat = ChatGroq(model="llama-3.3-70b-versatile")
    chain = template | chat

    async def generate_stream():
        async for chunk in chain.astream({"query": query}):
            if chunk.content:
                yield f"data: {chunk.content}\n\n".encode("utf-8")
        yield b"event: end\ndata: [DONE]\n\n"

    return StreamingResponse(generate_stream(), media_type="text/event-stream")



@router.post("/")
async def test():
    client = MongoClient(os.environ.get("MONGO_URI"))
    embeddingsModel = EMBEDDING_MODELS['bge3']
    embeddings = HuggingFaceEmbeddings(model_name=embeddingsModel['name'])

    DB_NAME = "langchain_test_db"
    COLLECTION_NAME = "langchain_test_vectorstores"
    ATLAS_VECTOR_SEARCH_INDEX_NAME = "langchain-test-index-vectorstores"

    MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

    vector_store = MongoDBAtlasVectorSearch(
        collection=MONGODB_COLLECTION,
        embedding=embeddings,
        index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
        relevance_score_fn="cosine",
    )

    # Since we are using the default OpenAI embedding model (ada-v2) we need to specify the dimensions as 1536
    #vector_store.create_vector_search_index(dimensions=embeddingsModel['dimensions'])

    from langchain_core.documents import Document

    document_1 = Document(
        page_content="I had chocolate chip pancakes and scrambled eggs for breakfast this morning.",
        metadata={"source": "tweet"},
    )

    document_2 = Document(
        page_content="The weather forecast for tomorrow is cloudy and overcast, with a high of 62 degrees.",
        metadata={"source": "news"},
    )

    document_3 = Document(
        page_content="Building an exciting new project with LangChain - come check it out!",
        metadata={"source": "tweet"},
    )

    document_4 = Document(
        page_content="Robbers broke into the city bank and stole $1 million in cash.",
        metadata={"source": "news"},
    )

    document_5 = Document(
        page_content="Wow! That was an amazing movie. I can't wait to see it again.",
        metadata={"source": "tweet"},
    )

    document_6 = Document(
        page_content="Is the new iPhone worth the price? Read this review to find out.",
        metadata={"source": "website"},
    )

    document_7 = Document(
        page_content="The top 10 soccer players in the world right now.",
        metadata={"source": "website"},
    )

    document_8 = Document(
        page_content="LangGraph is the best framework for building stateful, agentic applications!",
        metadata={"source": "tweet"},
    )

    document_9 = Document(
        page_content="The stock market is down 500 points today due to fears of a recession.",
        metadata={"source": "news"},
    )

    document_10 = Document(
        page_content="I have a bad feeling I am going to get deleted :(",
        metadata={"source": "tweet"},
    )

    documents = [
        document_1,
        document_2,
        document_3,
        document_4,
        document_5,
        document_6,
        document_7,
        document_8,
        document_9,
        document_10,
    ]
    uuids = [str(uuid4()) for _ in range(len(documents))]

    vector_store.add_documents(documents=documents, ids=uuids)


@router.get('/test')
async def test():
    client = MongoClient(os.environ.get("MONGO_URI"))
    embeddingsModel = EMBEDDING_MODELS['bge3']
    embeddings = HuggingFaceEmbeddings(model_name=embeddingsModel['name'])

    DB_NAME = "langchain_test_db"
    COLLECTION_NAME = "langchain_test_vectorstores"
    ATLAS_VECTOR_SEARCH_INDEX_NAME = "langchain-test-index-vectorstores"

    MONGODB_COLLECTION = client[DB_NAME][COLLECTION_NAME]

    vector_store = MongoDBAtlasVectorSearch(
        collection=MONGODB_COLLECTION,
        embedding=embeddings,
        index_name=ATLAS_VECTOR_SEARCH_INDEX_NAME,
        relevance_score_fn="cosine",
    )

    results = vector_store.similarity_search(
        "LangChain provides abstractions to make working with LLMs easy", k=2
    )
    for res in results:
        print(f"* {res.page_content} [{res.metadata}]")