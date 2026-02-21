import os
import io
import docx
import pdfplumber
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)

# Use gemini-2.5-flash-lite as the default model
MODEL_ID = "gemini-2.5-flash-lite"
model = genai.GenerativeModel(MODEL_ID)

app = FastAPI(title="ClgReportAI Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class GenerateRequest(BaseModel):
    userMessage: str
    sampleDocument: Optional[str] = ""
    contentDocument: Optional[str] = ""
    constraints: List[str] = []
    previousMessages: List[Message] = []

@app.post("/api/extract")
async def extract_text(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    filename = file.filename.lower()
    content = await file.read()
    text = ""
    
    try:
        if filename.endswith(".docx"):
            doc = docx.Document(io.BytesIO(content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        elif filename.endswith(".pdf"):
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                pages_text = []
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        pages_text.append(page_text)
                text = "\n".join(pages_text)
        elif filename.endswith(".txt"):
            text = content.decode("utf-8")
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
            
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate")
async def generate_document(request: GenerateRequest):
    context_message = f"""
## SAMPLE DOCUMENT (Format Reference):
{request.sampleDocument}

## CONTENT TO REFORMAT:
{request.contentDocument}

## SPECIFIC CONSTRAINTS:
{chr(10).join(['- ' + c for c in request.constraints]) if request.constraints else '- Maintain professional tone and standard markdown.'}
"""

    system_instruction = """You are an expert document formatter and content specialist. 
Your primary goal is to take the "Content to Reformat" and apply the exact structural, stylistic, and formatting patterns found in the "Sample Document". 
Always output high-quality Markdown. Explain your formatting decisions briefly at the end of the response."""

    # Build conversation history
    # Gemini uses 'user' and 'model' roles. Translate standard chat roles.
    contents = []
    for msg in request.previousMessages:
        role = "user" if msg.role == "user" else "model"
        contents.append({"role": role, "parts": [msg.content]})
    custom_model = genai.GenerativeModel(
        model_name=MODEL_ID
    )

    # The new user prompt includes the context AND the system instruction
    user_prompt = f"{system_instruction}\n\n{context_message}\n\nUser Request: {request.userMessage}"
    contents.append({"role": "user", "parts": [user_prompt]})

    try:
        response = custom_model.generate_content(
            contents=contents,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
            )
        )
        
        # Approximate usage (Gemini python SDK returns partial usages depending on version,
        # but usage_metadata is often available)
        input_tokens = 0
        output_tokens = 0
        if hasattr(response, 'usage_metadata'):
            input_tokens = getattr(response.usage_metadata, 'prompt_token_count', 0)
            output_tokens = getattr(response.usage_metadata, 'candidates_token_count', 0)
            
        return {
            "content": response.text,
            "usage": {
                "inputTokens": input_tokens,
                "outputTokens": output_tokens
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print("Gemini Generation Error:", e)
        raise HTTPException(status_code=500, detail=f"[ReportGen AI] Generation Failed: {str(e)}")

# Added for basic healthcheck
@app.get("/")
def read_root():
    return {"status": "Backend is running"}
