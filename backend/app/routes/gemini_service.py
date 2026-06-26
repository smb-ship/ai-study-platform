import os
import time
import logging
from google import genai
from google.genai import types
from google.genai.errors import APIError
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-2.0-flash"
MAX_OUTPUT_TOKENS = 512
MAX_INPUT_CHARS = 6000
MAX_RETRIES = 2
RETRY_DELAY_SECONDS = 2

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
        return prompt[:MAX_INPUT_CHARS] + "\n\n[Note: input was trimmed to fit free tier limits]"
    return prompt


def ask_tutor(prompt: str, mode: str = "explain") -> str:
    prompt = _trim_prompt(prompt)
    instruction = MODE_INSTRUCTIONS.get(mode, MODE_INSTRUCTIONS["explain"])
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=MAX_OUTPUT_TOKENS,
                    temperature=0.4,
                    system_instruction=instruction,
                ),
            )
            if response and response.text:
                return response.text
            raise TutorServiceError("Gemini returned an empty response.")

        except APIError as e:
            last_error = e
            status = getattr(e, "code", None) or getattr(e, "status_code", None)
            message = str(e).lower()

            if status == 429 or "quota" in message or "resource_exhausted" in message:
                logger.warning("Gemini quota hit on attempt %s: %s", attempt, e)
                raise TutorQuotaExceeded("Gemini free-tier quota exceeded.")

            if status in (500, 503) and attempt < MAX_RETRIES:
                time.sleep(RETRY_DELAY_SECONDS)
                continue

            logger.error("Gemini API error: %s", e)
            raise TutorServiceError(f"Gemini API error: {e}")

        except Exception as e:
            logger.error("Unexpected tutor error: %s", e)
            last_error = e
            break

    raise TutorServiceError(f"Tutor failed after {MAX_RETRIES} attempts: {last_error}")