from google import genai
from fastapi import HTTPException
from app.core.config import settings
import os
import tempfile
import httpx


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


async def summarize_publication(
    file_path: str,
    original_filename: str = None
):
    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="Publication file not found.",
        )

    temp_file_path = None

    try:
        # Get the original file extension
        suffix = ""

        if original_filename:
            suffix = os.path.splitext(
                original_filename
            )[1].lower()

        # Create temporary file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:
            temp_file_path = temp_file.name

        # Download file from Cloudinary
        async with httpx.AsyncClient() as http_client:

            response = await http_client.get(
                file_path,
                follow_redirects=True
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=404,
                    detail="Could not retrieve publication file from storage."
                )

            with open(temp_file_path, "wb") as f:
                f.write(response.content)

        # Upload temporary file to Gemini
        uploaded_file = client.files.upload(
            file=temp_file_path
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

    finally:
        # Delete temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass