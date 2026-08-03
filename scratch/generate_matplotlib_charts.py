import os
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Ensure public/charts output folder exists
output_dir = os.path.join(os.path.dirname(__file__), "..", "public", "charts")
os.makedirs(output_dir, exist_ok=True)

# Set global Matplotlib styling parameters for crisp, professional publication graphics
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.edgecolor'] = '#cbd5e1'
plt.rcParams['axes.linewidth'] = 0.8
plt.rcParams['grid.color'] = '#e2e8f0'
plt.rcParams['grid.linestyle'] = '--'
plt.rcParams['grid.alpha'] = 0.7

# --- 1. GENDER DISTRIBUTION PLOT ---
fig, ax = plt.subplots(figsize=(6, 4.2), dpi=200)
genders = ['Male', 'Female', 'Transgender']
counts = [1420, 1580, 45]
colors = ['#2563eb', '#ec4899', '#8b5cf6']

bars = ax.bar(genders, counts, color=colors, width=0.5, edgecolor='#1e293b', linewidth=0.8, zorder=3)
ax.grid(axis='y', zorder=0)
ax.set_title('Figure 1: Resident Population Gender Breakdown (Matplotlib)', fontsize=11, fontweight='bold', pad=12, color='#0f172a')
ax.set_ylabel('Number of Residents', fontsize=10, fontweight='bold', color='#334155')
ax.set_ylim(0, max(counts) * 1.15)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'{height:,}',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4),  # 4 points vertical offset
                textcoords="offset points",
                ha='center', va='bottom', fontsize=9, fontweight='bold', color='#1e293b')

plt.tight_layout()
fig.savefig(os.path.join(output_dir, 'demographics_gender_plot.png'))
plt.close(fig)

# --- 2. AGE PYRAMID / DISTRIBUTION PLOT ---
fig, ax = plt.subplots(figsize=(7, 4.2), dpi=200)
age_groups = ['0-5', '6-17', '18-24', '25-35', '36-45', '46-60', '60+']
age_counts = [210, 480, 560, 840, 620, 430, 260]

bars = ax.bar(age_groups, age_counts, color='#0f766e', width=0.55, edgecolor='#042f2e', linewidth=0.8, zorder=3)
ax.grid(axis='y', zorder=0)
ax.set_title('Figure 2: Demographic Age Group Distribution (Matplotlib)', fontsize=11, fontweight='bold', pad=12, color='#0f172a')
ax.set_xlabel('Age Bracket (Years)', fontsize=10, fontweight='bold', color='#334155')
ax.set_ylabel('Population Count', fontsize=10, fontweight='bold', color='#334155')
ax.set_ylim(0, max(age_counts) * 1.15)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'{height:,}',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4),
                textcoords="offset points",
                ha='center', va='bottom', fontsize=9, fontweight='bold', color='#0f172a')

plt.tight_layout()
fig.savefig(os.path.join(output_dir, 'demographics_age_pyramid.png'))
plt.close(fig)

# --- 3. EDUCATION DISTRIBUTION HORIZONTAL BAR PLOT ---
fig, ax = plt.subplots(figsize=(7.5, 4.5), dpi=200)
edu_levels = ['No Formal Edu', 'Primary', 'Middle School', 'High School', 'Higher Sec', 'Diploma', 'Undergrad', 'Postgrad']
edu_counts = [180, 420, 510, 680, 490, 240, 380, 145]

y_pos = np.arange(len(edu_levels))
bars = ax.barh(y_pos, edu_counts, color='#3b82f6', height=0.6, edgecolor='#1d4ed8', linewidth=0.8, zorder=3)
ax.set_yticks(y_pos)
ax.set_yticklabels(edu_levels, fontsize=9.5, fontweight='bold', color='#334155')
ax.invert_yaxis()  # top-down
ax.grid(axis='x', zorder=0)
ax.set_title('Figure 3: Educational Attainment Breakdown (Matplotlib)', fontsize=11, fontweight='bold', pad=12, color='#0f172a')
ax.set_xlabel('Resident Count', fontsize=10, fontweight='bold', color='#334155')
ax.set_xlim(0, max(edu_counts) * 1.15)

for bar in bars:
    width = bar.get_width()
    ax.annotate(f'{width:,}',
                xy=(width, bar.get_y() + bar.get_height() / 2),
                xytext=(5, 0),
                textcoords="offset points",
                ha='left', va='center', fontsize=9, fontweight='bold', color='#1e293b')

plt.tight_layout()
fig.savefig(os.path.join(output_dir, 'demographics_education.png'))
plt.close(fig)

# --- 4. OCCUPATION DISTRIBUTION PLOT ---
fig, ax = plt.subplots(figsize=(7.5, 4.5), dpi=200)
occupations = ['Farmer', 'Homemaker', 'Daily Wager', 'Student', 'Private Job', 'Govt Job', 'Business', 'Unemployed']
occ_counts = [850, 720, 460, 540, 310, 120, 180, 215]

bars = ax.bar(occupations, occ_counts, color='#d97706', width=0.55, edgecolor='#78350f', linewidth=0.8, zorder=3)
ax.grid(axis='y', zorder=0)
ax.set_title('Figure 4: Primary Livelihood & Occupation Distribution (Matplotlib)', fontsize=11, fontweight='bold', pad=12, color='#0f172a')
ax.set_ylabel('Number of Individuals', fontsize=10, fontweight='bold', color='#334155')
ax.set_xticks(np.arange(len(occupations)))
ax.set_xticklabels(occupations, rotation=20, ha='right', fontsize=9, fontweight='bold', color='#334155')
ax.set_ylim(0, max(occ_counts) * 1.15)

for bar in bars:
    height = bar.get_height()
    ax.annotate(f'{height:,}',
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 4),
                textcoords="offset points",
                ha='center', va='bottom', fontsize=8.5, fontweight='bold', color='#0f172a')

plt.tight_layout()
fig.savefig(os.path.join(output_dir, 'demographics_occupation.png'))
plt.close(fig)

# --- 5. SCHEME ELIGIBILITY VS BENEFITED COMPARISON PLOT ---
fig, ax = plt.subplots(figsize=(8, 4.8), dpi=200)
schemes = ['SHG Membership', 'Entrepreneurship', 'PM Matru Vandana', 'Girl Scholarship', 'Widow Pension', 'Agri Subsidy']
eligible = [1580, 1580, 180, 320, 240, 850]
benefited = [1120, 410, 140, 210, 160, 620]

x = np.arange(len(schemes))
width = 0.35

rects1 = ax.bar(x - width/2, eligible, width, label='Eligible Candidates', color='#94a3b8', edgecolor='#475569', linewidth=0.8, zorder=3)
rects2 = ax.bar(x + width/2, benefited, width, label='Beneficiaries Enrolled', color='#10b981', edgecolor='#047857', linewidth=0.8, zorder=3)

ax.grid(axis='y', zorder=0)
ax.set_title('Figure 5: Welfare Scheme Eligibility vs Enrolled Beneficiaries (Matplotlib)', fontsize=11, fontweight='bold', pad=12, color='#0f172a')
ax.set_ylabel('Resident Count', fontsize=10, fontweight='bold', color='#334155')
ax.set_xticks(x)
ax.set_xticklabels(schemes, rotation=15, ha='right', fontsize=9, fontweight='bold', color='#334155')
ax.legend(frameon=True, facecolor='#ffffff', edgecolor='#cbd5e1', fontsize=9)
ax.set_ylim(0, max(eligible) * 1.15)

plt.tight_layout()
fig.savefig(os.path.join(output_dir, 'demographics_scheme_eligibility.png'))
plt.close(fig)

print("SUCCESS: All 5 Matplotlib demographic charts generated in public/charts/")
