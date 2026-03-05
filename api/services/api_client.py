"""
API Client for inference API calls - supports remote OpenAI-compatible APIs and local Ollama
"""

import logging
import time
import httpx
from typing import Optional
import config
from services.observability import trace_translation

logger = logging.getLogger(__name__)


class APIClient:
    """
    Client for handling inference API calls.
    Supports remote OpenAI-compatible APIs (e.g. CodeLlama via enterprise gateway)
    and local Ollama instances.
    """

    def __init__(self):
        self.endpoint = config.INFERENCE_API_ENDPOINT
        self.token = config.INFERENCE_API_TOKEN
        self.provider = config.INFERENCE_PROVIDER
        # Ollama doesn't need auth; use dummy key for OpenAI client compatibility
        self.http_client = httpx.Client(verify=config.VERIFY_SSL)

    def get_inference_client(self):
        """
        Get OpenAI-compatible client configured for the active provider
        """
        from openai import OpenAI

        api_key = self.token if self.token else "ollama"
        return OpenAI(
            api_key=api_key,
            base_url=f"{self.endpoint}/v1",
            http_client=self.http_client
        )

    def translate_code(self, source_code: str, source_lang: str, target_lang: str) -> str:
        """
        Translate code from one language to another.

        Uses text completions for remote providers (e.g. CodeLlama enterprise gateway)
        and chat completions for Ollama (more reliable with local models).
        """
        client = self.get_inference_client()

        if self.provider == "ollama":
            return self._translate_via_chat(client, source_code, source_lang, target_lang)
        else:
            return self._translate_via_completions(client, source_code, source_lang, target_lang)

    def _translate_via_completions(self, client, source_code: str, source_lang: str, target_lang: str) -> str:
        """Text completions endpoint - for remote OpenAI-compatible gateways"""
        prompt = f"""Translate the following {source_lang} code to {target_lang}.
Only output the translated code without any explanations or markdown formatting.

{source_lang} code:
```
{source_code}
```

{target_lang} code:
```"""

        logger.info(f"[remote] Translating {source_lang} → {target_lang} via completions")

        with trace_translation(source_lang, target_lang, self.provider, config.INFERENCE_MODEL_NAME) as obs:
            obs["input"] = prompt
            t0 = time.perf_counter()

            response = client.completions.create(
                model=config.INFERENCE_MODEL_NAME,
                prompt=prompt,
                max_tokens=config.LLM_MAX_TOKENS,
                temperature=config.LLM_TEMPERATURE,
                stop=["```"]
            )

            obs["latency_ms"] = round((time.perf_counter() - t0) * 1000, 2)

            if hasattr(response, 'choices') and response.choices:
                translated = response.choices[0].text.strip()
                obs["output"] = translated
                if hasattr(response, 'usage') and response.usage:
                    obs["input_tokens"]  = response.usage.prompt_tokens
                    obs["output_tokens"] = response.usage.completion_tokens
                logger.info(f"Translation complete ({len(translated)} chars)")
                return translated

        logger.error(f"Unexpected completions response: {response}")
        return ""

    def _translate_via_chat(self, client, source_code: str, source_lang: str, target_lang: str) -> str:
        """Chat completions endpoint - for Ollama local inference"""
        system_prompt = (
            "You are an expert code translator. "
            "When asked to translate code, output ONLY the translated code with no explanations, "
            "no markdown fences, and no comments unless they were in the original."
        )
        user_prompt = (
            f"Translate this {source_lang} code to {target_lang}:\n\n{source_code}"
        )

        logger.info(f"[ollama] Translating {source_lang} → {target_lang} via chat completions")

        with trace_translation(source_lang, target_lang, self.provider, config.INFERENCE_MODEL_NAME) as obs:
            obs["input"] = user_prompt
            t0 = time.perf_counter()

            response = client.chat.completions.create(
                model=config.INFERENCE_MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=config.LLM_MAX_TOKENS,
                temperature=config.LLM_TEMPERATURE,
            )

            obs["latency_ms"] = round((time.perf_counter() - t0) * 1000, 2)

            if hasattr(response, 'choices') and response.choices:
                content = response.choices[0].message.content or ""
                # Strip markdown fences if the model still adds them
                translated = content.strip()
                if translated.startswith("```"):
                    lines = translated.split("\n")
                    translated = "\n".join(lines[1:])
                if translated.endswith("```"):
                    translated = translated[: translated.rfind("```")].rstrip()
                obs["output"] = translated
                if hasattr(response, 'usage') and response.usage:
                    obs["input_tokens"]  = response.usage.prompt_tokens
                    obs["output_tokens"] = response.usage.completion_tokens
                logger.info(f"Translation complete ({len(translated)} chars)")
                return translated

        logger.error(f"Unexpected chat response: {response}")
        return ""

    def is_authenticated(self) -> bool:
        """For Ollama, always returns True (no auth needed). For remote, checks token."""
        if self.provider == "ollama":
            return True
        return self.token is not None

    def __del__(self):
        if self.http_client:
            self.http_client.close()


_api_client: Optional[APIClient] = None


def get_api_client() -> APIClient:
    global _api_client
    if _api_client is None:
        _api_client = APIClient()
    return _api_client
