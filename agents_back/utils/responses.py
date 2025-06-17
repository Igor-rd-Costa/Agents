from starlette.responses import StreamingResponse


def stream_llm_response(chain):
    async def generate_stream():
        async for chunk in chain.astream({}):
            if chunk.content:
                yield f"data: {chunk.content}\n\n".encode("utf-8")
        yield b"event: end\n\n\n"
    return StreamingResponse(generate_stream(), media_type="text/event-stream")