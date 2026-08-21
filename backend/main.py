import base64

import anthropic
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from response_model import ClaudeRefineResponse
from utils.settings import settings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

claude = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

REFINE_INSTRUCTIONS = (
    "You are looking at a rough hand-drawn UI sketch. Generate 3 distinct "
    "variants that refine it into a plausible interface layout. Each variant "
    "is a list of elements (rectangle, ellipse, diamond, text, arrow, line), "
    "positioned with x/y/width/height in pixels, matching the general "
    "structure and intent of the sketch."
)


@app.get("/")
def health_check():
    return {"status": "ok"}


@app.post("/refine", response_model=ClaudeRefineResponse)
async def refine(sketch: UploadFile):
    image_bytes = await sketch.read()
    image_base64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    try:
        response = claude.messages.parse(
            model="claude-opus-5",
            max_tokens=16000,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": sketch.content_type or "image/png",
                                "data": image_base64,
                            },
                        },
                        {"type": "text", "text": REFINE_INSTRUCTIONS},
                    ],
                }
            ],
            output_format=ClaudeRefineResponse,
        )
    except anthropic.AuthenticationError:
        raise HTTPException(status_code=500, detail="Invalid Claude API key")
    except anthropic.RateLimitError:
        raise HTTPException(
            status_code=429, detail="Rate limited by Claude — try again shortly"
        )
    except anthropic.APIStatusError as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e.message}")

    return response.parsed_output
