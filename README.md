# AI Voice Language Tutor

An end-to-end interactive language learning application. A learner speaks a sentence in a selected target language; the app transcribes their spoken sentence via Speech-to-Text, analyzes grammar and vocabulary using Google's Gemini LLM, generates clear pedagogical feedback with explanations, and speaks a natural corrected version back to the learner using Text-to-Speech.

---

## 1. Project Overview

Learning a new language requires speaking practice with immediate, encouraging feedback. The **AI Voice Language Tutor** closes the feedback loop:

1. **Audio Recording**: Learner selects a language (Spanish, French, German, Italian, Japanese, etc.) and speaks through an intuitive microphone interface with live audio waveform feedback.
2. **Speech-to-Text (STT)**: Converts the learner's spoken audio into text with support for manual editing.
3. **LLM Grammar & Vocabulary Analysis**: Gemini checks grammar, word choice, and phrasing nuance, returning structured corrections and supportive explanations.
4. **Text-to-Speech (TTS)**: Reads the corrected sentence aloud with native accent pronunciation, playback rate controls (0.75x slow, 1x, 1.25x), and replay controls.
5. **Progress Tracking (Stretch Goal)**: Tracks session counts, accuracy rate, recurring grammar mistakes, vocabulary improvements, and history.
6. **Adaptive Difficulty (Stretch Goal)**: Dynamically analyzes learner accuracy and recommends adjusting practice between Beginner, Intermediate, and Advanced tiers.

---

## 2. Architecture

```
                      +-----------------------------+
                      |       React Frontend        |
                      |  (Vite + TS + Tailwind CSS) |
                      +--------------+--------------+
                                     |
                                     | REST / JSON
                                     v
                      +-----------------------------+
                      |      Backend API Layer      |
                      |  Express / Python FastAPI   |
                      +--------------+--------------+
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+------------------+       +-------------------+        +--------------------+
|  Speech-to-Text  |       |    Gemini LLM     |        |   Text-to-Speech   |
| (Gemini / STT)   |       |  (gemini-3.8)     |        | (TTS API / Native) |
+------------------+       +-------------------+        +--------------------+
```

### Directory Structure

```
.
├── backend/                        # Python FastAPI Backend Architecture
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point & CORS
│   │   ├── models/
│   │   │   ├── feedback.py         # Pydantic schemas (Feedback, Analysis, Audio)
│   │   │   └── session.py          # Practice session schemas
│   │   ├── routers/
│   │   │   ├── speech.py           # POST /api/transcribe
│   │   │   ├── analysis.py         # POST /api/analyze
│   │   │   ├── tts.py              # POST /api/speak
│   │   │   └── progress.py         # GET & POST /api/progress
│   │   └── services/
│   │       ├── stt_service.py      # Speech-to-Text transcription service
│   │       ├── llm_service.py      # Gemini grammar & vocabulary analyzer
│   │       └── tts_service.py      # Text-to-Speech generation service
│   └── requirements.txt
│
├── src/                            # React 19 + TypeScript Frontend
│   ├── components/
│   │   ├── Header.tsx              # App branding, tab toggles, language picker
│   │   ├── LanguageSelector.tsx    # Multilingual target selector
│   │   ├── AudioRecorder.tsx       # Circular mic button, states & waveform
│   │   ├── RecordingControls.tsx   # Done, cancel, restart controls
│   │   ├── TranscriptCard.tsx      # "What You Said" card with inline editor
│   │   ├── FeedbackCard.tsx        # "AI Feedback" parent section
│   │   ├── GrammarFeedback.tsx     # Incorrect vs Correct cards with explanations
│   │   ├── VocabularyFeedback.tsx  # Natural phrasing & word alternatives
│   │   ├── CorrectedSentenceCard.tsx# Prominent correction & audio trigger
│   │   ├── AudioPlayer.tsx         # Play, pause, stop, replay & speed controls
│   │   └── AdaptiveDifficultyBanner.tsx # Adaptive difficulty tier recommender
│   ├── hooks/
│   │   ├── useAudioRecording.ts    # Web Audio API + MediaRecorder hook
│   │   └── usePracticeSession.ts   # Session state & progress aggregator
│   ├── services/
│   │   ├── apiService.ts           # Unified API client for backend
│   │   ├── speechToTextService.ts  # Modular STT client service
│   │   └── textToSpeechService.ts  # Modular TTS client service
│   ├── types/
│   │   ├── feedback.ts             # Feedback data types
│   │   ├── language.ts             # Supported language profiles & sample prompts
│   │   └── practiceSession.ts      # Session & progress summary interfaces
│   ├── pages/
│   │   ├── Home.tsx                # Layout & coordinator
│   │   ├── Practice.tsx            # Main practice workspace
│   │   └── Progress.tsx            # Progress analytics dashboard
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── server.ts                       # Integrated Node Express full-stack server
├── package.json
└── README.md
```

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**:
  - Node.js Express + `@google/genai` TypeScript SDK (integrated full-stack server running live in the cloud container).
  - Python FastAPI + `google-genai` (included in `/backend` matching assignment specifications).
- **AI / LLM**: Google Gemini 3.8 (`gemini-3.8-flash`) for grammar analysis and `gemini-3.5-transcribe` / `gemini-3.1-flash-tts-preview` for speech tasks.
- **Audio**: Web Audio API (`AnalyserNode` for live waveforms) and HTML5 `MediaRecorder`.

---

## 4. Environment Variable Setup

Create a `.env` file in the project root:

```bash
# Required: Google Gemini API Key (accessed server-side only)
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional external STT / TTS provider keys (if using Whisper or ElevenLabs)
STT_API_KEY=""
TTS_API_KEY=""
```

In Google AI Studio, `GEMINI_API_KEY` is automatically injected into the server environment via the platform secrets store.

---

## 5. How to Run the Application

### Option A: Integrated Node Full-Stack Server (Live Container)

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will run on `http://localhost:3000`.

3. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

### Option B: Running the Python FastAPI Backend

If you prefer to run the Python FastAPI backend separately:

1. **Navigate to backend and install requirements**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Set environment variable**:
   ```bash
   export GEMINI_API_KEY="your_api_key_here"
   ```

3. **Launch Uvicorn**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   FastAPI interactive documentation will be available at `http://localhost:8000/docs`.

---

## 6. How to Configure STT, Gemini & TTS

### Speech-to-Text (STT) Configuration
- **Gemini STT**: Configured in `server.ts` (`POST /api/transcribe`) and `backend/app/services/stt_service.py` using `gemini-3.5-transcribe`. Audio is streamed or passed as base64 audio parts (`audio/webm` or `audio/wav`).
- **External Whisper Alternative**: To switch to OpenAI Whisper, update `services/speechToTextService.ts` or `backend/app/services/stt_service.py` with an `OpenAI` client pointing to `audio.transcriptions.create(model="whisper-1", file=...)`.

### Gemini LLM Grammar & Vocabulary Configuration
- Analyzes sentences using `gemini-3.8-flash` with a structured JSON schema enforcing:
  - `originalSentence`: String
  - `correctedSentence`: String
  - `grammarFeedback`: Array of `{ original, corrected, explanation }`
  - `vocabularyFeedback`: Array of `{ word, suggestion, explanation }`
  - `overallFeedback`: Encouraging teacher summary
  - `difficultyLevel`: Assessed level

### Text-to-Speech (TTS) Configuration
- **Modular Service**: Located in `src/services/textToSpeechService.ts`.
- **Playback Options**:
  - High-fidelity native speech synthesis with accurate target language accent (`es-ES`, `fr-FR`, `de-DE`, `ja-JP`, `zh-CN`, etc.).
  - Backend Gemini TTS (`gemini-3.1-flash-tts-preview`) returning audio stream.
- **Controls**: Supports Play, Pause, Stop, Replay, and variable speeds (`0.75x`, `1.0x`, `1.25x`).

---

## 7. Security

- **No Exposed API Keys**: `GEMINI_API_KEY` is strictly managed on the server side (`server.ts` or FastAPI `main.py`). The browser never sees API tokens.
- **Audio Sanitization**: Audio uploads are validated for size and duration to prevent server memory saturation.
