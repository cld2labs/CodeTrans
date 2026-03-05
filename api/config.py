"""
Configuration settings for Code Translation API
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Inference Provider: "remote" (OpenAI-compatible) or "ollama" (local)
INFERENCE_PROVIDER = os.getenv("INFERENCE_PROVIDER", "remote")

# Inference API Configuration
INFERENCE_API_ENDPOINT = os.getenv(
    "INFERENCE_API_ENDPOINT",
    "http://host.docker.internal:11434" if os.getenv("INFERENCE_PROVIDER", "remote") == "ollama" else None
)
INFERENCE_API_TOKEN = os.getenv("INFERENCE_API_TOKEN")
INFERENCE_MODEL_NAME = os.getenv(
    "INFERENCE_MODEL_NAME",
    "codellama:34b" if os.getenv("INFERENCE_PROVIDER", "remote") == "ollama" else "codellama/CodeLlama-34b-Instruct-hf"
)

# Application Settings
APP_TITLE = "CodeTrans API"
APP_DESCRIPTION = "AI-powered code translation service"
APP_VERSION = "2.0.0"

# File Upload Settings
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf"}

# Code Translation Settings
SUPPORTED_LANGUAGES = ["java", "c", "cpp", "python", "rust", "go"]
# MAX_CODE_LENGTH: For Enterprise Inference with CodeLlama-34b (max tokens: 5196)
# Set to 4000 characters to stay safely under the token limit with prompt overhead
MAX_CODE_LENGTH = int(os.getenv("MAX_CODE_LENGTH", "4000"))  # characters
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.2"))  # Lower temperature for more deterministic code generation
LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "4096"))

# SSL Verification Settings
VERIFY_SSL = os.getenv("VERIFY_SSL", "true").lower() == "true"

# Langfuse Observability
# Enable only for Ollama or cloud API providers.
# Leave disabled for enterprise inference (handled separately).
LANGFUSE_ENABLED    = os.getenv("LANGFUSE_ENABLED", "false").lower() == "true"
LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY", "")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY", "")
LANGFUSE_HOST       = os.getenv("LANGFUSE_HOST", "http://host.docker.internal:3001")

# CORS Settings
CORS_ALLOW_ORIGINS = ["*"]  # Update with specific origins in production
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]
