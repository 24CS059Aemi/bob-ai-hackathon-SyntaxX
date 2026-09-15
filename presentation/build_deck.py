from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / "slides.pptx"
SCREENSHOTS = ROOT / "demo" / "screenshots"

NAVY = RGBColor(10, 22,  forty := 40)
BLUE = RGBColor(37, 99, 235)
CYAN = RGBColor(14, 165, 233)
WHITE = RGBColor(248, 250, 252)
MUTED = RGBColor(180, 194, 214)
INK = RGBColor(15, 23, 42)
RED = RGBColor(220, 38, 38)
ORANGE = RGBColor(234, 88, 12)
GREEN = RGBColor(22, 163, 74)


prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)


def textbox(slide, text, x, y, w, h, size=20, color=WHITE, bold=False, align=None):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    frame = box.text_frame
    frame.clear()
    frame.word_wrap = True
    frame.margin_left = Inches(0.04)
    frame.margin_right = Inches(0.04)
    frame.vertical_anchor = MSO_ANCHOR.TOP
    p = frame.paragraphs[0]
    p.text = text
    p.font.name = "Aptos"
    p.font.size = Pt(size)
    p.font.bold = bold
    p.font.color.rgb = color
    if align:
        p.alignment = align
    return box


def background(slide, title, eyebrow=None, number=None):
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = NAVY
    band = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(0.18), prs.slide_height)
    band.fill.solid()
    band.fill.fore_color.rgb = BLUE
    band.line.fill.background()
    if number:
        textbox(slide, f"{number:02d}", 11.95, 0.42, 0.7, 0.35, 14, CYAN, True, PP_ALIGN.RIGHT)
    if eyebrow:
        textbox(slide, eyebrow.upper(), 0.72, 0.45, 5.5, 0.3, 11, CYAN, True)
    textbox(slide, title, 0.72, 0.78, 10.8, 0.65, 28, WHITE, True)
    textbox(slide, "GRIDADVISOR  /  SYNTAXX", 0.72, 7.12, 4, 0.2, 9, MUTED, True)


def bullets(slide, items, x=0.9, y=1.8, w=5.7, size=18, color=WHITE):
    for index, item in enumerate(items):
        yy = y + index * 0.72
        dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(yy + 0.1), Inches(0.12), Inches(0.12))
        dot.fill.solid()
        dot.fill.fore_color.rgb = CYAN
        dot.line.fill.background()
        textbox(slide, item, x + 0.28, yy, w, 0.5, size, color)


def card(slide, title, body, x, y, w, h, accent=BLUE):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    shape.fill.solid()
    shape.fill.fore_color.rgb = RGBColor(20, 37, 63)
    shape.line.color.rgb = RGBColor(48,  seventy := 96, 132)
    stripe = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y), Inches(0.08), Inches(h))
    stripe.fill.solid()
    stripe.fill.fore_color.rgb = accent
    stripe.line.fill.background()
    textbox(slide, title, x + 0.25, y + 0.2, w - 0.45, 0.35, 17, WHITE, True)
    textbox(slide, body, x + 0.25, y + 0.68, w - 0.45, h - 0.8, 13, MUTED)


def add_image(slide, filename, x, y, w, h):
    path = SCREENSHOTS / filename
    if path.exists():
        slide.shapes.add_picture(str(path), Inches(x), Inches(y), width=Inches(w), height=Inches(h))


# 1. Title
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "Predict failures before the outage", "IBM BoB AI Innovation Hackathon 2026")
textbox(slide, "GridAdvisor", 0.8, 2.0, 7.5, 0.9, 46, WHITE, True)
textbox(slide, "Power Outage Prediction & Grid Equipment Failure Advisor", 0.85, 3.0, 7.5, 0.8, 23, CYAN, True)
textbox(slide, "An AI-powered operational intelligence platform for electricity utilities.", 0.85, 4.05, 6.4, 0.55, 18, MUTED)
card(slide, "TEAM SYNTAXX", "Anshi Ladani  |  Aemi Patel  |  Suyanshi Patel  |  Drashti Patel\nTrack: AI  ·  CHARUSAT", 8.25, 2.0, 4.1, 1.65, CYAN)
card(slide, "LIVE DEMO", "grid-advisor-yipp.onrender.com", 8.25, 4.0, 4.1, 1.05, GREEN)

# 2. Problem
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "The grid problem", "01 / Problem", 2)
textbox(slide, "Failures are often discovered after they become outages.", 0.9, 1.65, 7.0, 0.65, 25, CYAN, True)
bullets(slide, [
    "Transformers and substations generate complex health signals.",
    "Sensor, weather, and incident data is difficult to analyse together.",
    "Manual inspection does not clearly show what must be fixed first.",
    "One failure can interrupt service for thousands of customers.",
], y=2.55, w=6.3)
card(slide, "THE OPPORTUNITY", "Move from reactive maintenance to predictive, prioritised action before equipment fails.", 8.0, 2.05, 4.2, 2.0, RED)

# 3. Solution
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "One risk picture for every asset", "02 / Solution", 3)
textbox(slide, "GridAdvisor turns raw grid signals into a clear action plan.", 0.9, 1.55, 8.5, 0.55, 23, CYAN, True)
card(slide, "COLLECT", "Temperature, vibration, partial discharge, oil quality, load, weather, and incidents.", 0.9, 2.45, 2.8, 1.8, BLUE)
card(slide, "SCORE", "A transparent composite risk formula produces a 0–100 score.", 3.95, 2.45, 2.8, 1.8, RED)
card(slide, "PRIORITISE", "Assets and zones are ranked from Critical to Low using risk and grid impact.", 7.0, 2.45, 2.8, 1.8, ORANGE)
card(slide, "ACT", "Maintenance deadlines, crew assignments, and Bob AI explanations.", 10.05, 2.45, 2.8, 1.8, GREEN)
textbox(slide, "Result: operators know where to act, why it matters, and what to do next.", 1.0, 5.25, 10.8, 0.6, 24, WHITE, True, PP_ALIGN.CENTER)

# 4. Architecture
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "How the platform works", "03 / Architecture", 4)
card(slide, "DATA", "Synthetic sensor readings\nWeather forecasts\nIncident history", 0.8, 2.0, 2.35, 1.7, BLUE)
card(slide, "FASTAPI", "REST JSON API\nData access\nDecision services", 3.45, 2.0, 2.35, 1.7, CYAN)
card(slide, "INTELLIGENCE", "Risk scorer\nAsset ranker\nMaintenance + crew engines", 6.1, 2.0, 2.7, 1.7, ORANGE)
card(slide, "BOB AI", "Operational briefing\nAsset explanation\nwatsonx.ai Granite", 9.1, 2.0, 2.7, 1.7, GREEN)
textbox(slide, "↓", 1.8, 4.0, 0.6, 0.5, 28, CYAN, True, PP_ALIGN.CENTER)
textbox(slide, "↓", 4.45, 4.0, 0.6, 0.5, 28, CYAN, True, PP_ALIGN.CENTER)
textbox(slide, "↓", 7.15, 4.0, 0.6, 0.5, 28, CYAN, True, PP_ALIGN.CENTER)
textbox(slide, "React + TypeScript dashboard  →  risk table  →  zone map  →  action tabs", 1.1, 4.65, 10.9, 0.7, 22, WHITE, True, PP_ALIGN.CENTER)
textbox(slide, "SQLite today  |  PostgreSQL-ready  |  Docker + Render deployment", 1.2, 5.8, 10.7, 0.45, 16, MUTED, False, PP_ALIGN.CENTER)

# 5. Dashboard evidence
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "The operator dashboard", "04 / Product", 5)
add_image(slide, "4.png", 0.75, 1.55, 7.2, 4.9)
card(slide, "AT A GLANCE", "• Risk summary by severity\n• Zone risk heatmap\n• Ranked assets\n• Filter by severity\n• View asset-level sensors", 8.35, 1.75, 3.8, 2.55, CYAN)
textbox(slide, "The interface is designed for fast operational decisions, not raw data exploration.", 8.35, 4.75, 3.8, 0.9, 19, WHITE, True)

# 6. Action workflow
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "From risk score to field action", "05 / Operations", 6)
card(slide, "1  SENSOR DETAIL", "Click View to inspect seven days of temperature, vibration, partial discharge, and oil quality trends.", 0.85, 1.7, 3.75, 1.7, BLUE)
card(slide, "2  MAINTENANCE PLAN", "Every risky asset gets an action, deadline, skills, duration, and customer impact.", 4.8, 1.7, 3.75, 1.7, ORANGE)
card(slide, "3  CREW POSITIONING", "Crews are matched by skill and proximity to reduce response time.", 8.75, 1.7, 3.75, 1.7, GREEN)
add_image(slide, "8.png", 1.05, 4.0, 5.2, 2.45)
add_image(slide, "9.png", 7.05, 4.0, 5.2, 2.45)

# 7. IBM Bob
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "IBM Bob makes risk understandable", "06 / IBM Technology", 7)
add_image(slide, "10.png", 0.8, 1.55, 7.1, 4.95)
card(slide, "WHAT BOB ADDS", "• Plain-English operational briefing\n• Per-asset risk explanation\n• Recommended next action\n• watsonx.ai Granite integration\n• Rule-based fallback when credentials are unavailable", 8.25, 1.7, 4.0, 3.1, CYAN)
textbox(slide, "From technical signals to a decision an operator can act on in seconds.", 8.25, 5.3, 3.9, 0.75, 20, WHITE, True)

# 8. Impact and team
slide = prs.slides.add_slide(prs.slide_layouts[6])
background(slide, "Predict earlier. Respond faster.", "07 / Impact", 8)
card(slide, "VALUE", "Earlier failure detection\nFaster maintenance decisions\nBetter crew utilisation\nReduced outage response time\nMore customers protected", 0.85, 1.65, 3.6, 2.7, GREEN)
card(slide, "PROTOTYPE SCALE", "15 grid assets\n5 monitored zones\nMultiple sensor types\nCritical → Low ranking\nLive Render deployment", 4.85, 1.65, 3.6, 2.7, BLUE)
card(slide, "TEAM SYNTAXX", "Anshi Ladani — Team Lead\nAemi Patel — Engineer\nSuyanshi Patel — Engineer\nDrashti Patel — Engineer", 8.85, 1.65, 3.6, 2.7, CYAN)
textbox(slide, "Thank you", 0.9, 5.25, 11.5, 0.55, 31, WHITE, True, PP_ALIGN.CENTER)
textbox(slide, "Live demo: https://grid-advisor-yipp.onrender.com", 0.9, 5.95, 11.5, 0.4, 17, CYAN, True, PP_ALIGN.CENTER)

prs.save(OUT)
print(OUT)