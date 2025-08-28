from fastapi import HTTPException
from agents_back.types.chat import ToolCall


def tool_error(msg: str):
    print(f"[Tool Call Error] {msg}")

def parse_and_build_tool_call(tool_call: str) -> ToolCall:
    if not tool_call.startswith("<") or not tool_call.endswith("/>"):
        tool_error(f"Invalid syntax.\nTool call: {tool_call}")
        raise HTTPException(status_code=400)

    call_obj = ToolCall()

    last_end = 1
    if tool_call.startswith("<tool:"):
        last_end = 6
    next_end = tool_call.find(':', last_end)
    call_obj.namespace = tool_call[last_end:next_end]
    last_end = next_end + 1

    next_end = tool_call.find(' ', last_end)

    call_obj.name = tool_call[last_end:next_end]
    last_end = next_end + 1

    while last_end < len(tool_call):
        next_end = tool_call.find('=', last_end)
        if next_end == -1:
            print(f"[Tool Call] Invalid arg separator. {last_end}.\n{tool_call}")
            break
        arg_name = tool_call[last_end:next_end]
        call_obj.args[arg_name] = None
        last_end = next_end + 1
        if tool_call[last_end] != '"' and tool_call[last_end] != "'":
            print(f"[Tool Call] Invalid delimiter")
            break
        delimiter = tool_call[last_end]
        last_end = last_end + 1
        next_end = tool_call.find(delimiter, last_end)
        call_obj.args[arg_name] = tool_call[last_end:next_end]
        last_end = next_end + 1

        if tool_call[last_end] == '/' and tool_call[last_end + 1] == '>':
            break

    print(f"Return tool call {call_obj}")
    return call_obj

def parse_tool_calls(tool_calls: str) -> list[ToolCall]:
    if not tool_calls.startswith('[') or not tool_calls.endswith(']'):
        tool_error(f"Invalid syntax\nTool Calls: {tool_calls}")
        raise HTTPException(status_code=400)

    tool_calls = tool_calls[1:-1].strip()

    if not tool_calls.startswith('<') or not tool_calls.endswith('>'):
        tool_error(f"Invalid syntax.\nTool Calls: {tool_calls}")
        raise HTTPException(status_code=400)

    calls = []
    first_tag = None
    opened_tags = []

    for idx, char in enumerate(tool_calls):
        if char == '<':
            if tool_calls[idx + 1] != '/':
                opened_tags.append({'start': idx, 'end': None})
                if len(opened_tags) == 1:
                    first_tag = opened_tags[0]
            else:
                opened_tags.pop()
                if len(opened_tags) == 0 and first_tag is not None:
                    for j, c in enumerate(tool_calls, start=idx):
                        if c == '>':
                            first_tag['end'] = j
                            calls.append(first_tag)
                            first_tag = None
                            idx = j
                            break
        if char == '>' and idx > 0 and tool_calls[idx - 1] == '/':
            opened_tags.pop()
            if len(opened_tags) == 0 and first_tag is not None:
                first_tag['end'] = idx+1
                calls.append(first_tag)
                first_tag = None

        if idx != (len(tool_calls) - 1):
            next_char = tool_calls[idx + 1]
            if first_tag is None:
                if next_char != ',' or next_char != ' ':
                    tool_error(f"Invalid separator.\nIdx: {idx}.\nTool Calls: {tool_calls}")
                else:
                    idx = idx + 1

    if len(opened_tags) > 0:
        tool_error(f"Invalid syntax at end.\nTool Calls: {tool_calls}")

    def get_tool_call(obj: dict):
        if obj.get('start') is None or obj.get('end') is None:
            tool_error(f"Invalid tool object.\nTool Calls: {tool_calls}")
            raise HttpException(status_code=400)
        return tool_calls[obj['start']:obj['end']]

    return list(map(parse_and_build_tool_call, list(map(get_tool_call, calls))))