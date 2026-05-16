import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from dotenv import dotenv_values, load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BASE_DIR / '.env'
DEFAULT_MODEL = 'gemini-2.5-flash'
LOCAL_TIMEZONE = ZoneInfo('Africa/Casablanca')

SYSTEM_PROMPT_TEMPLATE = """You are the IdeaLab assistant, a helpful AI embedded in the IdeaLab platform.
IdeaLab is an idea management platform where entrepreneurs submit startup ideas and get structured feedback from expert reviewers.
- Roles: Entrepreneur (submits ideas), Reviewer (evaluates ideas), Admin (manages platform)
- Idea statuses: draft -> submitted -> review -> validated / rejected
- SGV Score: 4 dimensions (Market, Innovation, Feasibility, ROI) each 0-25, shown as /10
- Reviewer levels: Bronze, Silver, Gold, Expert
- Features: bookmarks, comments, exports (PDF/CSV/JSON), notifications
- Validated ideas: +50 reputation points for entrepreneur
- Rejected ideas can be edited and resubmitted

Current date and time: {current_datetime}

Be concise, friendly, and helpful. You can answer questions about IdeaLab, startup ideas, feedback, technology, business, learning, writing, general knowledge, and everyday tasks. If the user asks for current date or time, use the current date and time above. You do not have live web access, so for live scores, breaking news, prices, or other real-time facts, say that you need a live data source and avoid guessing. Do not claim that you can only answer IdeaLab questions."""


def get_system_prompt():
    current_datetime = datetime.now(LOCAL_TIMEZONE).strftime('%A, %B %d, %Y at %H:%M %Z')
    return SYSTEM_PROMPT_TEMPLATE.format(current_datetime=current_datetime)


def get_api_key():
    load_dotenv(ENV_FILE)
    key = os.environ.get('GEMINI_API_KEY', '').strip()
    if key:
        return key
    if ENV_FILE.exists():
        return (dotenv_values(ENV_FILE).get('GEMINI_API_KEY') or '').strip()
    return ''


def get_model_name():
    load_dotenv(ENV_FILE)
    model = os.environ.get('GEMINI_MODEL', '').strip()
    if model:
        return model
    if ENV_FILE.exists():
        model = (dotenv_values(ENV_FILE).get('GEMINI_MODEL') or '').strip()
        if model:
            return model
    return DEFAULT_MODEL


def get_response_text(response):
    text = getattr(response, 'text', '') or ''
    if text.strip():
        return text.strip()

    candidates = getattr(response, 'candidates', None) or []
    if candidates:
        finish_reason = getattr(candidates[0], 'finish_reason', None)
        raise ValueError(f'Gemini returned no text. Finish reason: {finish_reason}')

    raise ValueError('Gemini returned no text.')


@csrf_exempt
def chat(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed.'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    message = payload.get('message', '').strip()
    if not message:
        return JsonResponse({'error': 'message is required.'}, status=400)

    api_key = get_api_key()
    if not api_key or api_key == 'your-gemini-api-key-here':
        return JsonResponse({'error': 'Gemini API key not configured.'}, status=500)

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=get_model_name(),
            system_instruction=get_system_prompt(),
        )
        response = model.generate_content(
            message,
            generation_config={
                'temperature': 0.4,
                'max_output_tokens': 800,
            },
            request_options={'timeout': 30},
        )
        return JsonResponse({'reply': get_response_text(response)})
    except ImportError:
        return JsonResponse({'error': 'google-generativeai is not installed. Run pip install -r requirements.txt.'}, status=500)
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=502)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
