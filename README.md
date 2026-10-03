 <div align="center">
<img src="docs/assets/verity-banner.svg" alt="VERITY - Public Claim Intelligence" width="100%"/>




An evidence-focused platform for exploring public claims, examining sources, and understanding how assessments are presented.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-42d6ff?style=for-the-badge&logo=githubpages&logoColor=white)](https://devsatyamm.github.io/Verity/)
[![Repository](https://img.shields.io/badge/GitHub-Repository-171717?style=for-the-badge&logo=github)](https://github.com/devSatyamm/Verity)
[![Status](https://img.shields.io/badge/Focus-Evidence%20%26%20Transparency-8275ef?style=for-the-badge)](https://github.com/devSatyamm/Verity)

*Evidence over virality. Transparency over assumptions.*

</div>

---

## ✦ About VERITY

In a world where information spreads faster than ever, distinguishing facts from misleading claims is increasingly difficult.

**VERITY** is designed to bring claim exploration, evidence, source attribution, and claim history into one interface.

> Popularity is not proof. Every assessment should be traceable to evidence.

## ◈ How It Works

<div align="center">

```mermaid
flowchart LR
    A["🔎 Explore Claim"] --> B["🌐 Find Sources"]
    B --> C["🧾 Examine Evidence"]
    C --> D["🧠 Assess Findings"]
    D --> E["📊 Present Results"]
    style A fill:#142d4e,stroke:#42d6ff,color:#fff
    style B fill:#142d4e,stroke:#42d6ff,color:#fff
    style C fill:#142d4e,stroke:#42d6ff,color:#fff
    style D fill:#252348,stroke:#8b7cff,color:#fff
    style E fill:#252348,stroke:#8b7cff,color:#fff
```

</div>

| Step | Process | Description |
|---|---|---|
| 01 | **Explore** | Search and explore public claims. |
| 02 | **Collect** | Gather relevant sources and context. |
| 03 | **Analyze** | Compare evidence and assess relevance. |
| 04 | **Review** | Present findings with uncertainty and provenance. |

## ✧ Core Features

<table>
<tr>
<td width="50%" valign="top">

### 🔎 Claim Search

Explore public claims through a focused search interface.

</td>
<td width="50%" valign="top">

### 🧾 Evidence Explorer

Inspect sources, context, and supporting information.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🧠 AI Assessment

A structured assessment interface designed to present evidence and uncertainty.

</td>
<td width="50%" valign="top">

### 🕒 Claim Timeline

Track claim revisions and changes where historical data is available.

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 🗳️ Community Feedback

Keep community opinion separate from evidence-based findings.

</td>
<td width="50%" valign="top">

### 🌐 Source Integrations

Designed to accommodate public records, news sources, and online information.

</td>
</tr>
</table>

## ⌘ Architecture

```mermaid
flowchart TB
    A["VERITY Frontend"]
    A --> B["Claim Search & Results"]
    A --> C["Evidence & Timeline"]
    A --> D["Community Interface"]
    B --> E["Optional Backend Services"]
    C --> E
    D --> E
    E --> F["Live Retrieval"]
    E --> G["Secure Authentication"]
    E --> H["Database & Scheduled Jobs"]
    style A fill:#142d4e,stroke:#42d6ff,color:#fff
    style B fill:#172b46,stroke:#426d9b,color:#fff
    style C fill:#172b46,stroke:#426d9b,color:#fff
    style D fill:#172b46,stroke:#426d9b,color:#fff
    style E fill:#252348,stroke:#8b7cff,color:#fff
    style F fill:#252348,stroke:#8b7cff,color:#fff
    style G fill:#252348,stroke:#8b7cff,color:#fff
    style H fill:#252348,stroke:#8b7cff,color:#fff
```

VERITY's GitHub Pages edition is a static frontend. Features such as live data retrieval, secure authentication, persistent voting, AI processing, and scheduled ingestion require compatible external backend services.

## ⚡ Technology

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-UI-149eca?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Types-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-Styling-06b6d4?style=flat-square&logo=tailwindcss)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Deployment-2088ff?style=flat-square&logo=githubactions)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Hosting-222222?style=flat-square&logo=githubpages)

</div>

These badges represent the intended project stack. Check the current source and configuration to confirm active integrations.

## 🚀 Getting Started

### Prerequisites

- Node.js LTS
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/devSatyamm/Verity.git
cd Verity
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Check `package.json` for the scripts available in the current version.

## 🌍 Deployment

<div align="center">

### [VERITY Live Demo](https://devsatyamm.github.io/Verity/)

</div>

The static frontend can be deployed through GitHub Actions.

For repository-based GitHub Pages hosting, ensure the build correctly handles the `/Verity/` base path, asset URLs, and client-side routing.

To troubleshoot deployment:

1. Open the repository's **Settings**.
2. Navigate to **Pages**.
3. Check the configured deployment source.
4. Open the **Actions** tab.
5. Review the latest deployment workflow.

## 🛡️ Design Principles

- **Evidence over virality:** Engagement does not establish truth.
- **Transparent sourcing:** Preserve source attribution and provenance.
- **Honest uncertainty:** Allow insufficient evidence as a valid outcome.
- **Separated perspectives:** Distinguish AI assessments, community opinions, and human review.
- **Safe rendering:** Treat external content as untrusted input.
- **Privacy-conscious design:** Never expose privileged credentials in frontend code.





## 👤 Maintainers

<div align="center">

<table>
<tr>
<td align="center" width="33%">

### Satyam Mishra

<a href="https://github.com/devSatyamm">
<img src="https://github.com/devSatyamm.png" width="100" height="100" style="border-radius:50%;" alt="Satyam Mishra"/>
</a>

[GitHub](https://github.com/devSatyamm) • [LinkedIn](https://www.linkedin.com/in/satyamofficial/)

</td>

<td align="center" width="33%">

### Kanak Pant

<a href="https://github.com/kanakpant0305">
<img src="https://github.com/kanakpant0305.png" width="100" height="100" style="border-radius:50%;" alt="Kanak Pant"/>
</a>

[GitHub](https://github.com/kanakpant0305) • [LinkedIn](https://www.linkedin.com/in/kanak-pant-39312641b/)

</td>

<td align="center" width="33%">

### Aditya Rahul Joshi

<a href="https://github.com/aadityarahuljoshi-wq">
<img src="https://github.com/aadityarahuljoshi-wq.png" width="100" height="100" style="border-radius:50%;" alt="Aditya Rahul Joshi"/>
</a>

[GitHub](https://github.com/aadityarahuljoshi-wq) • [LinkedIn](https://www.linkedin.com/in/aditya-rahul-joshi-a51a9336b/)

</td>
</tr>
</table>

<br/>

**VERITY**  
*Make information easier to investigate.*

</div>
