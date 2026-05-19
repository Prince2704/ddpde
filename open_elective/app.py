import streamlit as st
import pandas as pd

# ---------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------

st.set_page_config(
    page_title="Atlas Decision Engine",
    page_icon="📊",
    layout="wide"
)

# ---------------------------------------------------
# CUSTOM CSS
# ---------------------------------------------------

st.markdown("""
<style>

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

.stApp {
    background: linear-gradient(to right, #03101d, #041d33);
    color: white;
}

.block-container {
    padding-top: 1.5rem;
    padding-left: 2rem;
    padding-right: 2rem;
}

.card {
    background: rgba(15, 32, 52, 0.95);
    border-radius: 22px;
    padding: 24px;
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 20px;
    box-shadow: 0 0 20px rgba(0,0,0,0.25);
}

.hero-title {
    font-size: 78px;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -2px;
    color: white;
}

.hero-sub {
    font-size: 18px;
    color: #9fb2c8;
    margin-top: 20px;
}

.metric-big {
    font-size: 44px;
    font-weight: 700;
    color: white;
}

.metric-small {
    color: #9fb2c8;
    font-size: 14px;
}

.section-title {
    font-size: 32px;
    font-weight: 700;
    margin-top: 30px;
    margin-bottom: 15px;
    color: white;
}

.green {
    color: #63ffd8;
}

.tag {
    display: inline-block;
    background: #17364d;
    color: #72ffd9;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 12px;
    margin-right: 8px;
    margin-top: 8px;
}

.progress-container {
    width: 100%;
    background: #23384d;
    border-radius: 20px;
    height: 10px;
    margin-top: 12px;
}

.progress-bar {
    background: #63ffd8;
    height: 10px;
    border-radius: 20px;
}

</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------
# HERO SECTION
# ---------------------------------------------------

left, right = st.columns([2.3, 1.2])

with left:
    st.markdown("""
    <div class="card" style="padding:40px;">
        <div class="green" style="font-weight:700; letter-spacing:2px;">
            ATLAS DECISION ENGINE
        </div>

        <div class="hero-title">
            Make investment and operating choices with evidence, not intuition alone.
        </div>

        <div class="hero-sub">
            A working prototype that combines weighted scoring,
            risk controls, scenario planning, explainability,
            governance, and exportable decision records.
        </div>
    </div>
    """, unsafe_allow_html=True)

with right:
    st.markdown("""
    <div class="card" style="height:260px;">
        <div class="metric-small">Engine Health</div>

        <div class="metric-big">
            Ready
        </div>

        <br>

        <div class="metric-small">
            Scoring rules loaded, sample portfolio synchronized,
            governance checks active.
        </div>
    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------
# TOP CARDS
# ---------------------------------------------------

c1, c2, c3, c4 = st.columns(4)

cards = [
    ("Leading Option", "AI Forecast Copilot"),
    ("Approval Signal", "Approve"),
    ("Portfolio Average", "77.1/100"),
    ("Active Alerts", "0")
]

for col, item in zip([c1, c2, c3, c4], cards):

    with col:
        st.markdown(f"""
        <div class="card">
            <div class="metric-small">{item[0]}</div>

            <br>

            <div class="metric-big" style="font-size:28px;">
                {item[1]}
            </div>
        </div>
        """, unsafe_allow_html=True)

# ---------------------------------------------------
# PORTFOLIO SECTION
# ---------------------------------------------------

st.markdown(
    '<div class="section-title">Portfolio View</div>',
    unsafe_allow_html=True
)

portfolio = [
    ("AI Forecast Copilot", "82.3/100", "$10.6M"),
    ("Support Automation Studio", "77.1/100", "$6.8M"),
    ("Dynamic Pricing Optimizer", "76.2/100", "$17.2M"),
    ("Supplier Risk Control Tower", "76.1/100", "$9.3M"),
    ("Warehouse Automation", "75.5/100", "$7M")
]

for name, score, value in portfolio:

    st.markdown(f"""
    <div class="card">

        <div style="display:flex; justify-content:space-between;">

            <div>
                <h3>{name}</h3>

                <div class="metric-small">
                    Enterprise initiative
                </div>
            </div>

            <div style="text-align:right;">
                <div class="metric-big" style="font-size:26px;">
                    {score}
                </div>

                <div class="metric-small">
                    Composite score
                </div>
            </div>

        </div>

        <br>

        <div style="display:flex; gap:50px;">

            <div>
                <div class="metric-small">Expected Value</div>
                <h3>{value}</h3>
            </div>

            <div>
                <div class="metric-small">Confidence</div>
                <h3>76%</h3>
            </div>

            <div>
                <div class="metric-small">Success Probability</div>
                <h3>76%</h3>
            </div>

        </div>

        <br>

        <div class="tag">AI</div>
        <div class="tag">Forecast</div>
        <div class="tag">Automation</div>

    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------
# DECISION SUMMARY
# ---------------------------------------------------

st.markdown(
    '<div class="section-title">Decision Summary</div>',
    unsafe_allow_html=True
)

r1, r2 = st.columns(2)

with r1:

    st.markdown("""
    <div class="card">

        <div class="green">
            Expansion aggressive
        </div>

        <h2>AI Forecast Copilot</h2>

        <p style="color:#b9c6d4;">
            AI Forecast Copilot leads because it combines strong
            financial return with above-market strategic fit while
            keeping downside manageable.
        </p>

        <div class="metric-big">
            Approve
        </div>

        <br>

        <div class="tag">Financial Return</div>
        <div class="tag">Strategic Fit</div>

    </div>
    """, unsafe_allow_html=True)

with r2:

    drivers = [
        ("Financial Return", "24.4%"),
        ("Strategic Fit", "20.3%"),
        ("Customer Impact", "13%"),
        ("Data Confidence", "11.4%"),
        ("Operational Fit", "7.3%")
    ]

    for title, value in drivers:

        st.markdown(f"""
        <div class="card">

            <div style="display:flex; justify-content:space-between;">
                <h4>{title}</h4>
                <div class="green">{value}</div>
            </div>

            <div class="progress-container">
                <div class="progress-bar" style="width:{value};"></div>
            </div>

        </div>
        """, unsafe_allow_html=True)

# ---------------------------------------------------
# SCENARIO ANALYSIS
# ---------------------------------------------------

st.markdown(
    '<div class="section-title">Scenario Analysis</div>',
    unsafe_allow_html=True
)

df = pd.DataFrame({
    "Option": [
        "AI Forecast Copilot",
        "Support Automation Studio",
        "Dynamic Pricing Optimizer",
        "Supplier Risk Control Tower",
        "Warehouse Automation"
    ],
    "Base Case": [78.6, 74.7, 74.1, 73.7, 72.2],
    "Expansion": [82.3, 77.8, 76.3, 76.3, 75.5],
    "Downturn": [71.9, 69.2, 68.5, 70.3, 65.2],
    "Disruption": [74.8, 70.8, 68.8, 73.1, 68.9]
})

st.dataframe(df, use_container_width=True)

# ---------------------------------------------------
# GOVERNANCE SECTION
# ---------------------------------------------------

st.markdown(
    '<div class="section-title">Governance & Risk Posture</div>',
    unsafe_allow_html=True
)

g1, g2, g3 = st.columns(3)

with g1:
    st.markdown("""
    <div class="card">

        <h3>Approval Path</h3>

        <p>
            Business sponsor → Finance → COO
        </p>

        <br>

        <h3>Guardrail Status</h3>

        <p>
            No hard blockers
        </p>

        <br>

        <h3>Evidence Quality</h3>

        <p>
            Average confidence across portfolio: 75.8%
        </p>

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
        <p>AI Forecast Copilot ranked #1</p>

        <br>

        <p>FY27 Growth Allocation Review recalculated</p>

    </div>
    """, unsafe_allow_html=True)

# ---------------------------------------------------
# FOOTER
# ---------------------------------------------------

st.markdown("---")
st.caption("Atlas Decision Engine © 2026")
