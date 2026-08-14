from google import genai
from fastapi import HTTPException
from app.core.config import settings
import os


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


async def summarize_publication(file_path: str):

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="Publication file not found.",
        )

    try:
        uploaded_file = client.files.upload(
            file=file_path
        )

        prompt = """
Analyze this scientific publication and provide a concise
research-oriented summary.

Return exactly these three sections:

SUMMARY:
Give a clear 5-7 sentence summary explaining the purpose,
methodology, and main contribution of the paper.

KEY FINDINGS:
Give 3-5 important findings or contributions as bullet points.

KEYWORDS:
Give 5-10 important technical keywords related to the publication.

Do not invent information that is not present in the document.
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=[
                prompt,
                uploaded_file,
            ],
        )

        if not response.text:
            raise HTTPException(
                status_code=500,
                detail="AI did not return a summary.",
            )

        return {
            "summary": response.text
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI summarization failed: {str(e)}",
        )