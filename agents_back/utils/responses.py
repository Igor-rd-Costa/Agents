from starlette.responses import StreamingResponse


def stream_llm_response(tokens):
    async def generate_stream():
        async for token in tokens:
            yield f"data: {token}\n\n".encode("utf-8")
        yield b"event: end\n\n\n"
    return StreamingResponse(generate_stream(), media_type="text/event-stream")