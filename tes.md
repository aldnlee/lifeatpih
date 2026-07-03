componentDiagram
    %% Styling untuk Tema Hitam Putih
    classDef default fill:#000,stroke:#fff,color:#fff,stroke-width:2px;
    classDef external fill:#fff,stroke:#000,color:#000,stroke-width:2px,stroke-dasharray: 5 5;

    package "Client Layer" {
        [Astro Frontend] as FE
        [Tailwind Styling] as UI
        [GSAP Animations] as Anim
    }

    package "Logic & Auth Layer" {
        [Google OAuth] as Auth
        [Decap CMS Connector] as CMS
    }

    package "Database & Cloud Layer" {
        [PostgreSQL Database] as DB
        [Edge Functions (Deno)] as EF
    }

    package "External Services" {
        [Resend Email API] as Email:::external
        [Cloudflare Storage] as CF:::external
    }

    %% Relationships
    FE --> UI : uses
    FE --> Anim : uses
    FE --> Auth : authenticates
    FE --> DB : query/update
    FE --> CMS : fetch content
    
    DB --> EF : trigger on update
    EF --> Email : call API
    CMS --> FE : build-time data