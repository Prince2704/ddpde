import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="Atlas Decision Engine",
    layout="wide"
)

# ---------------- CSS ----------------

st.markdown("""
<style>

.stApp {
    background: linear-gradient(to right, #03111f, #041f35);
    color: white;
}

.block-container {
    padding-top: 2rem;
    padding-left: 2rem;
    padding-right: 2rem;
}

.card {
    background: #0f2236;
    padding: 24px;
    border-radius: 20px;
    border: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 20px;
}

.hero-title {
    font-size: 70px;
    font-weight: 800;
    line-height: 1;
    color: white;
}

.hero-sub {
    color: #9eb3c7;
    font-size: 18px;
    margin-top: 20px;
}

.metric {
    font-size: 38px;
    font-weight: bold;
    color: white;
}

.small {
    color: #9fb2c8;
    font-size: 14px;
}

.green {
    color: #63ffd8;
}

.tag {
    display:inline-block;
    background:#17364d;
    color:#63ffd8;
    padding:6px 12px;
    border-radius:999px;
    margin-right:8px;
    font-size:12px;
}

.section-title {
    font-size:32px;
    font-weight:700;
    margin-top:30px;
    margin-bottom:15px;
}

</style>
""", unsafe_allow_html=True)

# ---------------- HERO ----------------

left, right = st.columns([2.2,1])

with left:
    st.markdown("""
    <div class="card">
        <div class="green"><b>ATLAS DECISION ENGINE</b></div>

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
    <div class="card">
        <div class="small">Engine Health</div>

        <div class="metric">
        Ready
        </div>

        <div class="small">
        Scoring rules loaded,
        governance checks active.
        </div>
    </div>
    """, unsafe_allow_html=True)

# ---------------- KPI ----------------

c1,c2,c3,c4 = st.columns(4)

data = [
    ("Leading Option", "AI Forecast Copilot"),
    ("Approval Signal", "Approve"),
    ("Portfolio Average", "77.1/100"),
    ("Active Alerts", "0")
]

for col, item in zip([c1,c2,c3,c4], data):

    with col:
        st.markdown(f"""
        <div class="card">
            <div class="small">{item[0]}</div>
            <div class="metric" style="font-size:26px;">
            {item[1]}
            </div>
        </div>
        """, unsafe_allow_html=True)

# ---------------- PORTFOLIO ----------------

st.markdown(
    '<div class="section-title">Portfolio View</div>',
    unsafe_allow_html=True
)

portfolio = [
    ("AI Forecast Copilot","82.3/100","$10.6M"),
    ("Support Automation Studio","77.1/100","$6.8M"),
    ("Dynamic Pricing Optimizer","76.2/100","$17.2M"),
    ("Supplier Risk Control Tower","76.1/100","$9.3M"),
    ("Warehouse Automation","75.5/100","$7M")
]

for name, score, value in portfolio:

    html = f"""
    <div class="card">

        <div style="display:flex; justify-content:space-between;">

            <div>
                <h3>{name}</h3>
                <div class="small">Enterprise initiative</div>
            </div>

            <div style="text-align:right;">
                <div class="metric" style="font-size:24px;">
                    {score}
                </div>
                <div class="small">
                    Composite score
                </div>
            </div>

        </div>

        <br>

        <div style="display:flex; gap:40px;">

            <div>
                <div class="small">Expected Value</div>
                <h3>{value}</h3>
            </div>

            <div>
                <div class="small">Confidence</div>
                <h3>76%</h3>
            </div>

            <div>
                <div class="small">Success Probability</div>
                <h3>76%</h3>
            </div>

        </div>

        <br>

        <span class="tag">AI</span>
        <span class="tag">Forecast</span>
        <span class="tag">Automation</span>

    </div>
    """

    st.markdown(html, unsafe_allow_html=True)

# ---------------- DECISION SUMMARY ----------------

st.markdown(
    '<div class="section-title">Decision Summary</div>',
    unsafe_allow_html=True
)

l1,l2 = st.columns(2)

with l1:
    st.markdown("""
    <div class="card">

        <div class="green">
        Expansion aggressive
        </div>

        <h2>AI Forecast Copilot</h2>

        <p style="color:#b9c6d4;">
        AI Forecast Copilot leads because it combines
        strong financial return with strategic fit.
        </p>

        <div class="metric">
        Approve
        </div>

        <br>

        <span class="tag">Financial Return</span>
        <span class="tag">Strategic Fit</span>

    </div>
    """, unsafe_allow_html=True)

with l2:

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
                <b>{title}</b>
                <div class="green">{value}</div>
            </div>

            <div style="
                width:100%;
                height:10px;
                background:#203447;
                border-radius:20px;
                margin-top:12px;
            ">

                <div style="
                    width:{value};
                    height:10px;
                    background:#63ffd8;
                    border-radius:20px;
                "></div>

            </div>

        </div>
        """, unsafe_allow_html=True)

# ---------------- TABLE ----------------

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
    "Base Case": [78.6,74.7,74.1,73.7,72.2],
    "Expansion": [82.3,77.8,76.3,76.3,75.5],
    "Downturn": [71.9,69.2,68.5,70.3,65.2]
})

st.dataframe(df, use_container_width=True)

# ---------------- GOVERNANCE ----------------

st.markdown(
    '<div class="section-title">Governance & Risk Posture</div>',
    unsafe_allow_html=True
)

g1,g2,g3 = st.columns(3)

with g1:
    st.markdown("""
    <div class="card">
        <h3>Approval Path</h3>

        <p>Business sponsor → Finance → COO</p>

        <h3>Guardrail Status</h3>

        <p>No hard blockers</p>

        <h3>Evidence Quality</h3>

        <p>Average portfolio confidence: 75.8%</p>
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

        <p>FY27 Growth Allocation recalculated</p>

    </div>
    """, unsafe_allow_html=True)

st.markdown("---")

st.caption("Atlas Decision Engine © 2026")
