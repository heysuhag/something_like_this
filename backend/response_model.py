from typing import Literal

from pydantic import BaseModel

# Mirrors the frontend's ExcalidrawElementSkeleton (see convertToExcalidrawElements
# in @excalidraw/excalidraw), narrowed to the element types a generated design
# realistically needs. Not every Excalidraw element type is here on purpose —
# freedraw/image/frame elements aren't something we'd ask a model to generate.


class ElementLabel(BaseModel):
    text: str


class ElementSkeleton(BaseModel):
    type: Literal["rectangle", "ellipse", "diamond", "text", "arrow", "line"]
    x: float
    y: float
    width: float | None = None
    height: float | None = None
    text: str | None = None  # used when type == "text"
    label: ElementLabel | None = None  # optional text shown inside a container
    strokeColor: str | None = None
    backgroundColor: str | None = None


class Variant(BaseModel):
    elements: list[ElementSkeleton]


class ClaudeRefineResponse(BaseModel):
    """The data shape we expect back from Claude for a /refine call.

    Claude-specific for now. Once OpenAI support is added, this and its
    OpenAI counterpart should converge on one shared response model — the
    seam for that isn't built yet, since there's only one provider so far.
    """

    variants: list[Variant]
