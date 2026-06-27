import os
import logging
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq, APIStatusError, APIConnectionError, RateLimitError

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

logger = logging.getLogger(__name__)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_NAME = "llama-3.3-70b-versatile"  # free tier, strong general model
MAX_OUTPUT_TOKENS = 512
MAX_INPUT_CHARS = 6000

MODE_INSTRUCTIONS = {
    "explain": "Explain the concept simply, like to a beginner, with one short example.",
    "quiz": "Ask the user one quiz question about this topic, then wait for their answer. Do not answer it yourself.",
    "exam_prep": "Give a tight, exam-focused summary with key terms in bold and 3 likely exam questions at the end.",
}


class TutorQuotaExceeded(Exception):
    pass


class TutorServiceError(Exception):
    pass


def _trim_prompt(prompt: str) -> str:
    if len(prompt) > MAX_INPUT_CHARS:
        return prompt[:MAX_INPUT_CHARS] + "\n\n[Note: input was trimmed to fit limits]"
    return prompt


def ask_tutor(prompt: str, mode: str = "explain") -> str:
    prompt = _trim_prompt(prompt)
    instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["explain"])

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": instruction},
                {"role": "user", "content": prompt},
            ],
            max_tokens=MAX_OUTPUT_TOKENS,
            temperature=0.4,
        )
        answer = response.choices[0].message.content
        if not answer:
            raise TutorServiceError("Groq returned an empty response.")
        return answer

    except RateLimitError as e:
        logger.warning("Groq rate limit hit: %s", e)
        raise TutorQuotaExceeded("Groq free-tier limit exceeded.")

    except APIConnectionError as e:
        logger.error("Groq connection error: %s", e)
        raise TutorServiceError(f"Could not reach Groq: {e}")

    except APIStatusError as e:
        logger.error("Groq API error (status %s): %s", e.status_code, e)
        if e.status_code == 429:
            raise TutorQuotaExceeded("Groq free-tier limit exceeded.")
        raise TutorServiceError(f"Groq API error: {e}")

    except Exception as e:
        logger.error("Unexpected tutor error: %s", e)
        raise TutorServiceError(f"Unexpected error: {e}")