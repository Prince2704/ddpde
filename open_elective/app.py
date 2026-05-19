import streamlit as st
import pandas as pd

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="Atlas Decision Engine",
    page_icon="📊",
    layout="wide"
)

# ---------------- CUSTOM CSS ----------------
st.markdown("""
<style>
.stApp {
    background: linear-gradient(to right, #03121f, #071b2d);
    color: white;
}

.card {
    background-color: #0f2236;
    padding: 20px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.08);
    margin-bottom: 20px;
}

.metric {
    font-size: 34px;
    font-weight: bold;
    color: #58f5d0;
}

.small {
    color: #9fb3c8;
    font-size: 14px;
}

.title {
    font-size: 56px;
    font-weight: 700;
    line-height: 1.1;
}

.subtitle {
    color: #9fb3c8;
    font-size: 18px;
}

.section-title {
    font-size: 30px;
    font-weight: 600;
    margin-top: 30px;
    margin-bottom: 10px;
}

.tag {
    background: #17364d;
    padding: 5px 12px;
    border-radius: 20px;
    display: inline-block;
    margin-right: 8px;
    color: #70ffd9;
    font-size: 12px;
}
</style>
""", unsafe_allow_html=True)

# ---------------- HERO SECTION ----------------

col1, col2 = st.columns([2,1])

with col1:
    st.markdown("""
    <div class="card">
        <div class="small">ATLAS DECISION ENGINE</div>
        <div class="title">
        Make investment and operating choices with evidence, not intuition alone.
        </div>

        <br>

        <div class="subtitle">
        A working prototype that combines weighted scoring, risk controls,
        scenario planning, explainability, governance, and exportable decision records.
        </div>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="card">
        <div class="small">Engine Health</div>
        <div class="metric">Ready</div>
        <br>
        <div class="subtitle">
        Scoring rules loaded, governance checks active.
        </div>
    </div>
    """, unsafe_allow_html=True)

# ---------------- KPI CARDS ----------------

c1, c2, c3, c4 = st.columns(4)

cards = [
    ("Leading Option", "AI Forecast Copilot"),
    ("Approval Signal", "Approve"),
    ("Portfolio Average", "77.1/100"),
    ("Active Alerts", "0")
]

for col, card in zip([c1,c2,c3,c4], cards):
    with col:
        st.markdown(f"""
        <div class="card">
            <div class="small">{card[0]}</div>
            <div class="metric">{card[1]}</div>
        </div>
        """, unsafe_allow_html=True)

# ---------------- PORTFOLIO VIEW ----------------

st.markdown('<div class="section-title">Portfolio View</div>', unsafe_allow_html=True)

projects = [
    ("AI Forecast Copilot", "82.3/100", "$10.6M"),
    ("Support Automation Studio", "77.8/100", "$6.8M"),
    ("Dynamic Pricing Optimizer", "76.3/100", "$17.2M"),
    ("Supplier Risk Control Tower", "76.3/100", "$9.3M"),
]

for name, score, budget in projects:
    st.markdown(f"""
    <div class="card">
        <h3>{name}</h3>
        <div class="small">Composite Score</div>
        <div class="metric">{score}</div>
        <br>
        <div class="small">Expected Value</div>
        <h4>{budget}</h4>

        <div class="tag">AI</div>
        <div class="tag">Forecast</div>
        <div class="tag">Automation</div>
    </div>
    """, unsafe_allow_html=True)

# ---------------- RECOMMENDATION ----------------

st.markdown('<div class="section-title">Decision Summary</div>', unsafe_allow_html=True)

left, right = st.columns(2)

with left:
    st.markdown("""
    <div class="card">
        <div class="small">Expansion aggressive</div>
        <h2>AI Forecast Copilot</h2>

        <p>
        AI Forecast Copilot leads because it combines strong
        financial return with above-market strategic fit.
        </p>

        <div class="metric">Approve</div>

        <div class="tag">Financial Return</div>
        <div class="tag">Strategic Fit</div>
    </div>
    """, unsafe_allow_html=True)

with right:
    st.markdown("""
    <div class="card">
        <h3>Top Score Drivers</h3>

        <p>Financial Return — 24.4%</p>
        <p>Strategic Fit — 20.3%</p>
        <p>Customer Impact — 13%</p>
        <p>Data Confidence — 11.4%</p>
    </div>
    """, unsafe_allow_html=True)

# ---------------- SCENARIO TABLE ----------------

st.markdown('<div class="section-title">Scenario Analysis</div>', unsafe_allow_html=True)

data = {
    "Option": [
        "AI Forecast Copilot",
        "Support Automation Studio",
        "Dynamic Pricing Optimizer",
        "Supplier Risk Control Tower"
    ],
    "Base Case": ["78.6", "74.7", "74.1", "73.7"],
    "Expansion": ["82.3", "77.8", "76.3", "76.3"],
    "Downturn": ["71.9", "69.2", "68.5", "70.3"]
}

df = pd.DataFrame(data)

st.dataframe(df, use_container_width=True)

# ---------------- GOVERNANCE ----------------

st.markdown('<div class="section-title">Governance & Risk Posture</div>', unsafe_allow_html=True)

g1, g2, g3 = st.columns(3)

with g1:
    st.markdown("""
    <div class="card">
        <h3>Approval Path</h3>
        <p>Business Sponsor → Finance → COO</p>
    </div>
    """, unsafe_allow_html=True)

with g2:
    st.markdown("""
    <div class="card">
        <h3>Signals to Watch</h3>
        <p>Forecast accuracy</p>
        <p>Gross margin uplift</p>
        <p>Planner adoption</p>
    </div>
    """, unsafe_allow_html=True)

with g3:
    st.markdown("""
    <div class="card">
        <h3>Recent Analysis Events</h3>
        <p>Expansion recalculated</p>
        <p>Forecast Copilot ranked #1</p>
    </div>
    """, unsafe_allow_html=True)

# ---------------- FOOTER ----------------

st.markdown("---")
st.caption("Atlas Decision Engine © 2026")
