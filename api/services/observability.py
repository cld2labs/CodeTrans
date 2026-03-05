"""
Langfuse observability for CodeTrans inference calls.

Active only when LANGFUSE_ENABLED=true. Points to the local Langfuse
instance (langfuse/docker-compose.yaml) when using Ollama or cloud APIs.
For enterprise inference leave LANGFUSE_ENABLED=false — that path is
instrumented separately via the existing enterprise Langfuse instance.
"""

import logging
import time
from contextlib import contextmanager
from typing import Any, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Static model metadata
# Keys match INFERENCE_MODEL_NAME values used in .env
# ---------------------------------------------------------------------------
_MODEL_METADATA: dict[str, dict] = {
    # ── Ollama local models ──────────────────────────────────────────────
    "codellama:7b": {
        "tier": "Tier 2", "type": "LLM",
        "memory_footprint": "~4 GB VRAM", "context_window": 4096,
        "hardware_profile": "Apple Silicon (Metal / MPS)",
    },
    "codellama:13b": {
        "tier": "Tier 2", "type": "LLM",
        "memory_footprint": "~8 GB VRAM", "context_window": 4096,
        "hardware_profile": "Apple Silicon (Metal / MPS)",
    },
    "codellama:34b": {
        "tier": "Tier 2", "type": "LLM",
        "memory_footprint": "~20 GB VRAM", "context_window": 4096,
        "hardware_profile": "Apple Silicon (Metal / MPS)",
    },
    "deepseek-coder:6.7b": {
        "tier": "Tier 2", "type": "LLM",
        "memory_footprint": "~4 GB VRAM", "context_window": 4096,
        "hardware_profile": "Apple Silicon (Metal / MPS)",
    },
    "qwen2.5-coder:7b": {
        "tier": "Tier 2", "type": "LLM",
        "memory_footprint": "~4 GB VRAM", "context_window": 4096,
        "hardware_profile": "Apple Silicon (Metal / MPS)",
    },
    # ── Remote / cloud models ────────────────────────────────────────────
    "codellama/CodeLlama-34b-Instruct-hf": {
        "tier": "Tier 2", "type": "LLM",
        "memory_footprint": "N/A (remote)", "context_window": 4096,
        "hardware_profile": "Cloud / Enterprise GPU",
    },
    "Qwen/Qwen3-4B-Instruct-2507": {
        "tier": "Tier 1", "type": "SML",
        "memory_footprint": "N/A (remote)", "context_window": 4096,
        "hardware_profile": "Cloud / Enterprise GPU",
    },
}

_DEPLOYMENT_ENV = {
    "ollama": "Local (Ollama)",
    "remote": "Remote API",
}

# ---------------------------------------------------------------------------
# Langfuse client singleton
# ---------------------------------------------------------------------------
_client: Optional[Any] = None
_client_ready: bool = False


def _get_client() -> Optional[Any]:
    global _client, _client_ready
    if _client_ready:
        return _client

    _client_ready = True

    import config
    if not getattr(config, "LANGFUSE_ENABLED", False):
        return None

    try:
        from langfuse import Langfuse  # type: ignore
        _client = Langfuse(
            secret_key=config.LANGFUSE_SECRET_KEY,
            public_key=config.LANGFUSE_PUBLIC_KEY,
            host=config.LANGFUSE_HOST,
        )
        logger.info("Langfuse observability active → %s", config.LANGFUSE_HOST)
    except Exception as exc:
        logger.warning("Langfuse init failed (observability disabled): %s", exc)
        _client = None

    return _client


# ---------------------------------------------------------------------------
# Trace context manager
# ---------------------------------------------------------------------------
@contextmanager
def trace_translation(
    source_lang: str,
    target_lang: str,
    provider: str,
    model_name: str,
):
    """
    Wraps a single translation call in a Langfuse trace + generation.

    Usage in api_client.py:
        with trace_translation(src, tgt, provider, model) as obs:
            obs["input"] = prompt
            response = client.completions.create(...)
            obs["output"]        = translated_text
            obs["input_tokens"]  = response.usage.prompt_tokens
            obs["output_tokens"] = response.usage.completion_tokens
            obs["latency_ms"]    = elapsed_ms
    """
    client = _get_client()
    obs: dict[str, Any] = {}

    if client is None:
        yield obs
        return

    meta = _MODEL_METADATA.get(model_name, {})

    trace = client.trace(
        name="code-translation",
        metadata={
            "blueprint":          "CodeTrans",
            "source_language":    source_lang,
            "target_language":    target_lang,
            "inference_provider": provider,
            "deployment_env":     _DEPLOYMENT_ENV.get(provider, provider),
            "hardware_profile":   meta.get("hardware_profile", "Unknown"),
            "model_tier":         meta.get("tier", "Unknown"),
            "model_type":         meta.get("type", "LLM"),
            "context_window":     meta.get("context_window", "Unknown"),
            "memory_footprint":   meta.get("memory_footprint", "N/A"),
            "primary_use":        "Code Translation",
        },
        tags=["codetrans", provider, source_lang, target_lang],
    )

    generation = trace.generation(
        name="translate",
        model=model_name,
    )

    start = time.perf_counter()

    try:
        yield obs
    finally:
        latency_ms = obs.get("latency_ms") or round((time.perf_counter() - start) * 1000, 2)
        input_tokens  = obs.get("input_tokens", 0)
        output_tokens = obs.get("output_tokens", 0)

        try:
            generation.end(
                input=obs.get("input", ""),
                output=obs.get("output", ""),
                usage={
                    "input":  input_tokens,
                    "output": output_tokens,
                    "unit":   "TOKENS",
                },
                metadata={"latency_ms": latency_ms},
            )

            # Custom scores
            if latency_ms > 0:
                trace.score(
                    name="throughput_rps",
                    value=round(1000 / latency_ms, 4),
                    comment="Approximate single-request throughput (1 / latency_s)",
                )

            trace.score(
                name="total_tokens",
                value=input_tokens + output_tokens,
                comment="Total tokens consumed per request",
            )

            client.flush()

        except Exception as exc:
            logger.warning("Langfuse flush failed: %s", exc)
