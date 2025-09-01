from enum import IntEnum
from langchain_groq.chat_models import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from agents_back.types.chat import Message

def chat_messages_to_agent_message(message: Message):
    src = "user" if message.type == "user" else "ai"
    return src, message.content


MODEL_SOURCE_BITS_OFFSET = 5


class AgentModelSource(IntEnum):
    GROQ_API=       0b00000
    OPENAI_API=     0b00001
    ANTHROPIC_API = 0b00010
    GOOGLE_API =    0b00100
    MAX_VALUE =     0b11111


class AgentModel(IntEnum):
    OPENAI_OSS_GROQ =       AgentModelSource.GROQ_API & (1 < MODEL_SOURCE_BITS_OFFSET)
    MOONSHOT_KIMI_K2_GROQ = AgentModelSource.GROQ_API & (2 < MODEL_SOURCE_BITS_OFFSET)
    OPENAI_5 =              AgentModelSource.OPENAI_API & (3 < MODEL_SOURCE_BITS_OFFSET)
    OPENAI_5_MINI =         AgentModelSource.OPENAI_API & (4 < MODEL_SOURCE_BITS_OFFSET)
    OPENAI_4o_MINI =        AgentModelSource.OPENAI_API & (5 < MODEL_SOURCE_BITS_OFFSET)


def get_model_class(model: AgentModel):
    model_source = model & AgentModelSource.MAX_VALUE
    match model_source:
        case AgentModelSource.GROQ_API:
            return ChatGroq
        case AgentModelSource.OPENAI_API:
            return ChatOpenAI
        case AgentModelSource.ANTHROPIC_API:
            return ChatAnthropic
        case AgentModelSource.GOOGLE_API:
            return ChatGoogleGenerativeAI
        case _:
            return None


def get_model_name(model: AgentModel):
    match model:
        case AgentModel.OPENAI_OSS_GROQ:
            return 'openai/gpt-oss-120b'
        case AgentModel.MOONSHOT_KIMI_K2_GROQ:
            return 'moonshotai/kimi-k2-instruct'
        case AgentModel.OPENAI_5:
            return 'gpt-5'
        case AgentModel.OPENAI_5_MINI:
            return 'gpt-5-mini'
        case AgentModel.OPENAI_4o_MINI:
            return 'gpt-4o-mini'
        case _:
            return None


def get_agent_model(model: AgentModel):
    model_class = get_model_class(model)
    model_name = get_model_name(model)

    if model_class is None or model_name is None:
        return None

    return model_class(
        model=model_name,
    )