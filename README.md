⚡ ZenoType 0.7.1: The Cultural Uplink

An AI-Powered, Terminal-Inspired Typing Coach & Performance Analytics Tool.

ZenoType bridges the gap between raw typing mechanics and localized AI generation. By connecting a lightweight React frontend directly to a local LLM via Ollama, ZenoType dynamically generates endless, educational typing text centered around any topic you want to learn about.

✨ Core Features (v0.7.1)

🌐 Dynamic Neural Uplink: On boot, ZenoType pings your local AI to synthesize 8 fresh, highly niche, and culturally relevant topics tailored for a modern audience (Internet culture, obscure history, and absurd niche trivia). No more static lists.

🧠 Persistent Neural Thread: Context is maintained across paragraphs. The engine feeds your progress back into the AI, allowing it to write a seamless, informative essay that evolves as you type.

🛡️ Aggressive ASCII Sanitization: Built-in safeguards convert curly quotes and long dashes into standard keyboard equivalents and strip out non-printable characters (like Greek or math symbols) to ensure your stats are never corrupted by keys you can't type.

📈 Terminal-Grade Analytics: Featuring a rolling Tokens-Per-Minute (TPM) graph, raw keystroke accuracy, and an all-time Worst Keys metric. Use the Reset History button in the heatmap to scrub data and start fresh.

⌨️ QWERTY Performance Heatmap: A visual overview of your keyboard proficiency. Keys are colored dynamically: Emerald (>90%), Amber (60-90%), or Rose (<60%).

🙌 Cybernetic Guide Hands: Abstract geometric hands float at the bottom of the screen, illuminating the exact finger (and required shift key) for the upcoming character in real-time.

🔮 Transformers & Flow State: 5% of standard words are infused with purple "Transformer" energy. Capture them to increase your T-Score. Every 5 captures triggers a "Flow State" sprint (100% lowercase, zero punctuation text for a pure speed boost).

⌨️ Global Hotkeys

Stay in the zone with dedicated keyboard controls:

Enter : Toggle Session Analytics Panel (Pauses/Unpauses game)

Alt + S : Toggle Session Analytics Panel

Alt + O : Toggle Settings Options

Alt + H : Toggle Dynamic Guide Hands

Alt + R : Return to the Neural Uplink to synthesize new topics

Alt + ↓ / ↑ : Cycle Text Visibility Depth (2, 3, 4, 5, or 10 Terminal lines)

Logo Click: Clicking the "ZenoType" logo in the header acts as an instant restart (Alt + R).

🛠️ Installation & Setup

ZenoType is built using Vite, React, and Tailwind CSS v4.

1. Clone & Install

git clone <repository-url>
cd zenotype
npm install


2. Start the Development Server

npm run dev


🤖 Ollama & Custom Modelfile

To utilize the Neural Uplink and Thread Engine, you must have Ollama installed and configured.

Step 1: Enable CORS

Web browsers block local apps from fetching data from background services. Run sudo systemctl edit ollama.service (Linux) and ensure these variables are set:

Environment="OLLAMA_HOST=0.0.0.0"
Environment="OLLAMA_ORIGINS=*"


Step 2: Build the "zenotype" Model

For the best experience, create a custom model to prevent conversational filler. Save the following as Modelfile and run ollama create zenotype -f Modelfile.

FROM llama3.2:3b

SYSTEM """
agent:
  name: "ZenoType-Backend"
  role: "Educational engine for ZenoType typing game"
  purpose: "Generate flowing paragraphs on any topic, adapting structural format to speed."

directives:
  restrictions:
    - "NO conversational filler, NO markdown, NO underscores in topics."
    - "NEVER deviate from the core topic to generic tech talk."
    - "Syntax mode: Use {}, [], &&, || while maintaining prose flow."
"""

PARAMETER temperature 0.75
PARAMETER num_ctx 2048
