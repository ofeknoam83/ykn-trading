"""LLM orchestrator - route to expert, run with tools."""

from app.config import settings
from app.llm.tools import TOOLS_SCHEMA, TOOL_HANDLERS
from app.llm.experts import EXPERT_PROMPTS


def _get_system_prompt(expert_slug: str) -> str:
    """Get full system prompt for expert."""
    base = "You are a professional financial analyst. Use the provided tools to fetch real market data. Never invent numbers. Analyze the user's request and produce a structured, actionable report."
    return EXPERT_PROMPTS.get(expert_slug, base)


async def _execute_tool(name: str, args: dict) -> str:
    """Execute a tool by name with given args. Returns result string."""
    handler = TOOL_HANDLERS.get(name)
    if not handler:
        return f"Unknown tool: {name}"
    try:
        result = await handler(**args)
        return str(result) if result is not None else ""
    except Exception as e:
        return f"Tool error: {e}"


async def _run_anthropic(system_prompt: str, user_message: str) -> str:
    """Run with Anthropic Claude. Tool-call loop until final text response."""
    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
        messages = [{"role": "user", "content": user_message}]
        max_iterations = 10

        for _ in range(max_iterations):
            msg = await client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4096,
                system=system_prompt,
                messages=messages,
                tools=TOOLS_SCHEMA,
            )

            text_parts = []
            tool_results = []

            for block in msg.content:
                if getattr(block, "type", None) == "text" and hasattr(block, "text"):
                    text_parts.append(block.text)
                elif getattr(block, "type", None) == "tool_use":
                    tool_id = getattr(block, "id", "")
                    tool_name = getattr(block, "name", "")
                    tool_input = getattr(block, "input", {}) or {}
                    result = await _execute_tool(tool_name, tool_input)
                    tool_results.append({"type": "tool_result", "tool_use_id": tool_id, "content": result})

            if tool_results:
                messages.append({"role": "assistant", "content": msg.content})
                messages.append({"role": "user", "content": tool_results})
            else:
                return "\n".join(text_parts) if text_parts else str(msg)
        return "Max tool iterations reached."
    except Exception as e:
        return f"[Claude error: {e}]"


async def run_expert(expert_slug: str, user_input: str) -> str:
    """Run LLM expert with tool-calling. Returns report text."""
    system_prompt = _get_system_prompt(expert_slug)
    user_message = f"User request:\n\n{user_input}"

    if settings.llm_provider == "openai" and settings.openai_api_key:
        return await _run_openai(system_prompt, user_message)
    if settings.anthropic_api_key:
        return await _run_anthropic(system_prompt, user_message)
    return "[LLM not configured - set ANTHROPIC_API_KEY or OPENAI_API_KEY. Expert would run here with tool-calling.]"


async def _run_openai(system_prompt: str, user_message: str) -> str:
    """Run with OpenAI GPT-4. Tool-call loop until final text response."""
    try:
        import json as _json
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.openai_api_key)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ]
        # Convert Anthropic tool format (input_schema) to OpenAI format (parameters)
        openai_tools = [
            {
                "type": "function",
                "function": {
                    "name": t["name"],
                    "description": t.get("description", ""),
                    "parameters": t.get("input_schema", {"type": "object", "properties": {}}),
                },
            }
            for t in TOOLS_SCHEMA
        ]
        max_iterations = 10

        for _ in range(max_iterations):
            resp = await client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                tools=openai_tools,
            )
            if not resp.choices:
                return str(resp)
            c = resp.choices[0].message

            # If no tool calls, return text
            if not c.tool_calls:
                return c.content or str(c)

            # Execute tool calls and add results
            messages.append(c)
            for tool_call in c.tool_calls:
                result = await _execute_tool(
                    tool_call.function.name,
                    _json.loads(tool_call.function.arguments or "{}"),
                )
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result,
                })

        return "Max tool iterations reached."
    except Exception as e:
        return f"[OpenAI error: {e}]"
