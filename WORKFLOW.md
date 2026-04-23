# Project Workflow Guide

This document illustrates the end-to-end workflow of the Job Portal Application, highlighting the interaction between Job Seekers and Employers.

## 📊 High-Level Flowchart

```mermaid
graph TD
    %% Entry Point
    Start((Start)) --> Auth{Login / Register}
    
    %% Role Branching
    Auth -->|Select Role: Job Seeker| JS_Dash[Job Seeker Dashboard]
    Auth -->|Select Role: Employer| EMP_Dash[Employer Dashboard]

    %% Job Seeker Workflow
    subgraph "Job Seeker Path"
    JS_Dash --> Search[Search Jobs / Apply Filters]
    Search --> Details[View Job Details]
    Details --> Apply[Submit Application]
    Apply --> MyApps[My Applications List]
    MyApps --> Status[Track Status: Applied/Shortlisted/Hired]
    end

    %% Employer Workflow
    subgraph "Employer Path"
    EMP_Dash --> PostJob[Post New Job Listing]
    PostJob --> Review[Review Incoming Applicants]
    Review --> Decisions[Update Status: Shortlist/Reject/Hire]
    Decisions --> EmpAnalytics[View Pipeline Analytics]
    end

    %% Interaction Points
    Apply -.->|Triggers| Review
    Decisions -.->|Triggers Notification| MyApps
    
    %% Mutual Interaction (Communication)
    Review <-->|Direct Messaging| Chat[Real-time Chat]
    Apply <-->|Direct Messaging| Chat
    
    %% System Notifications
    Chat -.->|Alerts| Notif[Notifications System]
    Decisions -.->|Alerts| Notif

    style Start fill:#4f46e5,color:#fff
    style JS_Dash fill:#e0f2fe,stroke:#0369a1
    style EMP_Dash fill:#fef3c7,stroke:#b45309
    style Chat fill:#dcfce7,stroke:#15803d
    style Notif fill:#fef2f2,stroke:#b91c1c
```

---

## 🛠️ Workflow Breakdown

### 1. Authentication & Onboarding
*   **Role Selection:** Users must choose their identity (Job Seeker or Employer) during registration. This decision permanently shapes their application experience.
*   **Access Control:** The system uses secure JWT/Firebase tokens to ensure users only access routes permitted for their role.

### 2. Job Seeker Journey
*   **Discovery:** A responsive search engine with keyword and location filters helps candidates find relevant opportunities.
*   **Engagement:** Candidates can view detailed job descriptions and requirements before applying.
*   **Application Tracking:** Every application is logged, allowing candidates to monitor progress as employers review their profiles.

### 3. Employer Journey
*   **Talent Acquisition:** Employers can post rich job descriptions including company names, salary ranges, and specific requirements.
*   **Candidate Pipeline:** Employers manage all applicants from a centralized dashboard, allowing them to shortlist or hire candidates with a single click.
*   **Intelligence:** The dashboard provides real-time analytics on which jobs are attracting the most interest.

### 4. Communication & Real-time Updates
*   **Direct Messaging:** A dedicated chat system enables immediate coordination between both parties.
*   **Automated Notifications:** The system sends instant alerts for:
    *   New messages received.
    *   Application status updates (Shortlisted, Hired, etc.).

---

## 🚀 Future Roadmap
*   **AI Matching:** Automatic recommendation of jobs based on seeker profiles.
*   **Resume Parsing:** Automated data extraction from uploaded PDF resumes.
*   **Interview Scheduling:** Calendar integration for booking interview slots directly.
