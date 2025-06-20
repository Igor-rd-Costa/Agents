from starlette.responses import StreamingResponse


def stream_llm_response(tokens, extra_data=None):
    async def generate_stream():
        if extra_data is not None:
            yield f"extra: {{\"extra\": {extra_data} }}\n\n".encode("utf-8")
        for token in tokens:
            yield f"data: {token}\n\n".encode("utf-8")
        yield b"event: end\n\n\n"
    return StreamingResponse(generate_stream(), media_type="text/event-stream")