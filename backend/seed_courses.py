"""Run once to seed all 5 LMAP Academy courses with full curriculum."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, init_db
from models import Course, Module, Video, CourseLevel
import re

def slugify(text):
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")

COURSES = [
    {
        "title": "AI Foundations for Career Re-entry",
        "short_description": "Master ChatGPT, Gemini & Copilot — go from zero to confident AI user in 8 weeks.",
        "description": """This is the perfect starting point if you have been away from work or simply haven't kept up with AI tools. You don't need any technical background. By the end of this course you will be able to use AI tools fluently in your daily work, communicate better, write faster, and present yourself as someone who understands the future of work.

What you will learn:
• How AI language models actually work (no jargon, just clarity)
• ChatGPT — prompting like a professional, not a beginner
• Google Gemini for research, summarisation, and planning
• Microsoft Copilot inside Word, Excel, and Outlook
• Building your personal AI workflow that saves 2–3 hours every day
• Ethics, privacy, and what NOT to share with AI tools
• How to describe your AI skills to employers and clients

This course is designed for women returning to work after a gap, homemakers ready to explore new opportunities, and anyone who feels left behind by the speed of technology.""",
        "price": 10000,
        "level": CourseLevel.beginner,
        "duration_hours": 9,
        "modules": [
            {
                "title": "Welcome & Understanding AI Without the Jargon",
                "videos": [
                    ("What is AI and Why It Changes Everything", 1800, True),
                    ("How ChatGPT, Gemini, and Copilot Are Different", 1500, False),
                    ("Setting Up Your Free AI Accounts", 900, False),
                    ("The Golden Rules: What to Share and What to Protect", 1200, False),
                ]
            },
            {
                "title": "Mastering ChatGPT — Your AI Assistant",
                "videos": [
                    ("Your First 10 Prompts — Getting Comfortable", 1800, False),
                    ("The Prompt Formula That Gets Great Results Every Time", 2100, False),
                    ("Writing Emails, Reports, and Messages with AI", 2400, False),
                    ("Using ChatGPT for Research and Summarisation", 1800, False),
                    ("Role-Playing Scenarios: Practice Interviews with AI", 1500, False),
                ]
            },
            {
                "title": "Google Gemini for Smart Research",
                "videos": [
                    ("Gemini vs ChatGPT — When to Use Which", 1200, False),
                    ("Deep Research Mode: Replacing 3 Hours of Googling", 2100, False),
                    ("Summarising Long Documents and PDFs Instantly", 1800, False),
                    ("Planning Your Week, Month, and Career with Gemini", 1500, False),
                ]
            },
            {
                "title": "Microsoft Copilot — AI Inside Your Office",
                "videos": [
                    ("Copilot in Word: Write Reports in Minutes", 2100, False),
                    ("Copilot in Excel: Understand Data Without Formulas", 2400, False),
                    ("Copilot in Outlook: Emails That Write Themselves", 1800, False),
                    ("Copilot in Teams: Meeting Summaries and Action Items", 1500, False),
                ]
            },
            {
                "title": "Building Your Personal AI Workflow",
                "videos": [
                    ("Mapping Your Day — Where AI Saves You the Most Time", 1800, False),
                    ("Creating Your Personal Prompt Library", 1500, False),
                    ("How to Talk About AI Skills on Your CV and LinkedIn", 2100, False),
                    ("Your 30-Day AI Practice Plan", 1200, False),
                ]
            },
        ]
    },
    {
        "title": "AI for Business & Freelancing",
        "short_description": "Build a ₹50k–₹1L/month freelance income using AI tools — from finding clients to delivering work.",
        "description": """Whether you want to work independently or re-enter the corporate world, this course teaches you how to turn AI tools into a real income stream. You will learn to identify in-demand services, price your work, find clients, and deliver high-quality outputs faster than anyone without AI.

What you will learn:
• The 7 most in-demand AI-powered freelance services in 2025
• Notion AI for project management, knowledge bases, and client portals
• Canva AI for creating professional designs without a designer
• Zapier and Make.com — automating repetitive work to save 10+ hours per week
• How to find your first client within 30 days (with scripts)
• Pricing your services: from ₹5,000 per project to ₹1L per month retainers
• Building a professional portfolio with no prior work experience
• LinkedIn profile optimisation using AI to attract inbound leads

This course is for anyone who wants income flexibility — stay-at-home mothers, women on career breaks, graduates who want to freelance before committing to a job.""",
        "price": 10000,
        "level": CourseLevel.beginner,
        "duration_hours": 11,
        "modules": [
            {
                "title": "The Freelance AI Opportunity in 2025",
                "videos": [
                    ("Why AI Created the Best Freelance Market in History", 1800, True),
                    ("The 7 Services Clients Are Paying For Right Now", 2100, False),
                    ("Your Skills Audit — What You Already Have to Offer", 1500, False),
                ]
            },
            {
                "title": "Notion AI — Your Business Brain",
                "videos": [
                    ("Setting Up Notion as Your Business Operating System", 2400, False),
                    ("AI-Powered Client Portals That Impress Immediately", 2100, False),
                    ("Content Calendars and Project Trackers with Notion AI", 1800, False),
                    ("Building SOPs (Standard Operating Procedures) with AI", 1500, False),
                ]
            },
            {
                "title": "Canva AI — Design Like a Professional",
                "videos": [
                    ("Canva AI Magic Studio: Your Complete Walkthrough", 2100, False),
                    ("Creating Brand Kits for Clients in Under 30 Minutes", 1800, False),
                    ("Social Media Content at Scale — 30 Posts in 2 Hours", 2400, False),
                    ("Presentations, Proposals, and Pitch Decks with AI", 2100, False),
                ]
            },
            {
                "title": "Automation with Zapier and Make.com",
                "videos": [
                    ("What is Automation and Why Clients Will Pay for It", 1500, False),
                    ("Your First Zap: Connecting Gmail, Sheets, and Slack", 2400, False),
                    ("Building Client Onboarding Flows That Run Themselves", 2100, False),
                    ("Selling Automation as a Service: Pricing and Packages", 1800, False),
                ]
            },
            {
                "title": "Finding Clients and Getting Paid",
                "videos": [
                    ("LinkedIn Profile Makeover with AI — Step by Step", 2400, False),
                    ("Cold Outreach Scripts That Actually Get Replies", 1800, False),
                    ("Your First Client in 30 Days — The Exact Plan", 2100, False),
                    ("Contracts, Invoices, and Getting Paid on Time", 1500, False),
                    ("Scaling to ₹1L/Month: Your 90-Day Roadmap", 1800, False),
                ]
            },
        ]
    },
    {
        "title": "No-Code AI Product Building",
        "short_description": "Build real apps, tools, and products using Bolt, Lovable & Cursor — no coding needed.",
        "description": """The biggest shift in technology right now is that you no longer need to know how to code to build software products. With AI-powered no-code and low-code tools, you can go from idea to working product in days. This course shows you exactly how.

What you will learn:
• The no-code AI stack: Bolt, Lovable, Cursor, Bubble, and Glide
• Building your first web app from a simple text description
• Creating internal tools for businesses (huge market for freelancers)
• Connecting your apps to databases, payment systems, and APIs
• Launching and monetising your product: app stores, SaaS, one-time sales
• How to find product ideas by solving real problems
• Building a portfolio of mini-products that demonstrate your skills
• Case study: Student who built and sold a ₹2L product in 3 months

This course is for creative problem-solvers who want to build things that exist in the world — not just deliver services.""",
        "price": 10000,
        "level": CourseLevel.intermediate,
        "duration_hours": 13,
        "modules": [
            {
                "title": "The No-Code Revolution — Your New Superpower",
                "videos": [
                    ("Why 2025 is the Best Year to Be a Non-Technical Builder", 1800, True),
                    ("The No-Code AI Stack Explained Simply", 1500, False),
                    ("Finding Product Ideas Worth Building", 2100, False),
                ]
            },
            {
                "title": "Bolt.new — From Idea to App in One Prompt",
                "videos": [
                    ("Your First App in 10 Minutes with Bolt.new", 2400, False),
                    ("Iterating Your App with AI Feedback Loops", 2100, False),
                    ("Adding User Login, Database, and Payments to Your App", 2700, False),
                    ("Deploying Your App Live on the Internet for Free", 1800, False),
                ]
            },
            {
                "title": "Lovable — Beautiful Products Without Designers",
                "videos": [
                    ("Introduction to Lovable: UI That Actually Looks Good", 2100, False),
                    ("Building a Landing Page That Converts in 1 Hour", 2400, False),
                    ("Creating a SaaS Tool: Subscription + Dashboard + AI", 3000, False),
                    ("Connecting Lovable to Supabase for Real Data", 2100, False),
                ]
            },
            {
                "title": "Bubble and Glide — Apps for Any Device",
                "videos": [
                    ("Bubble for Complex Web Apps: Workflows and Logic", 2700, False),
                    ("Glide: Turn a Google Sheet into a Mobile App", 2100, False),
                    ("Building an Internal Tool for a Local Business", 2400, False),
                ]
            },
            {
                "title": "Launching and Monetising Your Product",
                "videos": [
                    ("Product Hunt, Indie Hackers, and Where to Launch", 1800, False),
                    ("Pricing Models: One-Time, Subscription, or Per-Use", 1500, False),
                    ("Marketing Your Product with AI-Written Content", 2100, False),
                    ("From ₹0 to First Sale: The 14-Day Launch Sprint", 2400, False),
                ]
            },
        ]
    },
    {
        "title": "AI for Content & Personal Branding",
        "short_description": "Build a powerful personal brand on LinkedIn & Instagram using AI — attract jobs, clients, and opportunities.",
        "description": """In today's world, your online presence is your resume, your portfolio, and your shop front — all in one. This course teaches you to build a compelling personal brand using AI tools for writing, video, design, and strategy. Whether you want a job, clients, or speaking opportunities, this is how you get noticed.

What you will learn:
• Defining your personal brand: what you stand for and who you attract
• LinkedIn content strategy: posting consistently without running out of ideas
• Writing viral posts with AI that sound like you, not a robot
• Instagram Reels and YouTube Shorts: creating video content with AI avatars
• HeyGen: making professional video content without being on camera
• Repurposing one idea into 10 pieces of content across platforms
• Building an email list from scratch with AI-written newsletters
• Monetising your audience: brand deals, courses, consulting, digital products

This course is for women who want visibility, credibility, and inbound opportunities without cold pitching.""",
        "price": 10000,
        "level": CourseLevel.beginner,
        "duration_hours": 9,
        "modules": [
            {
                "title": "Finding Your Brand Voice and Niche",
                "videos": [
                    ("What Personal Branding Actually Means in 2025", 1500, True),
                    ("Your Brand Positioning Statement — Crafted with AI", 2100, False),
                    ("Who Is Your Audience and What Do They Need", 1800, False),
                ]
            },
            {
                "title": "LinkedIn — The Platform That Changes Careers",
                "videos": [
                    ("Profile Optimisation: The Complete AI-Assisted Rewrite", 2700, False),
                    ("The Content Formula: Stories, Insights, and Value Posts", 2400, False),
                    ("Writing 30 LinkedIn Posts in 2 Hours with AI", 2100, False),
                    ("Engaging with Your Network Without Wasting Time", 1500, False),
                    ("Getting Recruiters and Clients to Come to You", 1800, False),
                ]
            },
            {
                "title": "Video Content with AI Avatars — No Camera Needed",
                "videos": [
                    ("HeyGen Introduction: Create Videos with Your AI Avatar", 2400, False),
                    ("Script Writing with AI: Hooks, Value, Call to Action", 2100, False),
                    ("Creating 60-Second Reels That Get 10,000+ Views", 1800, False),
                    ("Subtitles, Thumbnails, and Editing with AI Tools", 1500, False),
                ]
            },
            {
                "title": "Content Repurposing and Email Lists",
                "videos": [
                    ("Turn One Idea into 10 Pieces of Content", 2100, False),
                    ("Starting a Newsletter: From Zero to 1,000 Subscribers", 2400, False),
                    ("AI-Written Newsletters That People Actually Read", 1800, False),
                ]
            },
            {
                "title": "Monetising Your Personal Brand",
                "videos": [
                    ("Consulting and Coaching: Positioning and Pricing", 1800, False),
                    ("Creating and Selling Digital Products with AI", 2100, False),
                    ("Brand Partnerships and Sponsorships for Creators", 1500, False),
                    ("Your 6-Month Brand Building Roadmap", 1800, False),
                ]
            },
        ]
    },
    {
        "title": "Data & AI for Non-Technical Professionals",
        "short_description": "Use Excel AI, Power BI, and Python basics to become the smartest person in any business meeting.",
        "description": """Data is the language of business. This course teaches you to read, analyse, and present data using AI tools — without needing a mathematics or computer science background. By the end, you will be able to do work that data analysts charge ₹50,000+ per month for.

What you will learn:
• Excel with Copilot AI: formulas, pivot tables, and dashboards without memorising anything
• Power BI: creating stunning interactive dashboards from any data source
• Google Sheets AI: collaborative data analysis for teams
• Python basics with AI assistance (Cursor + GitHub Copilot): cleaning and analysing data
• Building reports that tell a story — not just tables of numbers
• SQL basics: querying databases to answer business questions
• Reading and presenting data to non-technical stakeholders
• Career paths: data analyst, business analyst, operations manager

This course is for professionals who work with numbers — finance, HR, marketing, operations — and want to move up using data skills.""",
        "price": 10000,
        "level": CourseLevel.intermediate,
        "duration_hours": 12,
        "modules": [
            {
                "title": "Thinking Like a Data Person",
                "videos": [
                    ("Why Data Skills Are the Highest-Paid Non-Technical Skill", 1500, True),
                    ("Understanding Data: Tables, Trends, and Insights", 1800, False),
                    ("Setting Up Your Data Toolkit for Free", 1200, False),
                ]
            },
            {
                "title": "Excel with AI — From Beginner to Power User",
                "videos": [
                    ("Excel Copilot: Ask Questions, Get Answers Instantly", 2400, False),
                    ("VLOOKUP, SUMIF, and Pivot Tables — Explained by AI", 2700, False),
                    ("Building a Professional Dashboard in 30 Minutes", 2400, False),
                    ("Cleaning Messy Data with AI Assistance", 1800, False),
                ]
            },
            {
                "title": "Power BI — Beautiful Dashboards That Impress",
                "videos": [
                    ("Power BI Desktop: Your First Dashboard in 1 Hour", 2700, False),
                    ("Connecting to Excel, Databases, and Google Sheets", 2100, False),
                    ("DAX Formulas Made Simple with AI Help", 2400, False),
                    ("Publishing and Sharing Reports with Your Team", 1800, False),
                ]
            },
            {
                "title": "Python Basics with AI Assistance",
                "videos": [
                    ("Why Python and Why AI Makes It Accessible to Everyone", 1800, False),
                    ("Your First Python Script: Cleaning a CSV File", 2400, False),
                    ("Pandas with Copilot: Analysing Data in Plain English", 2700, False),
                    ("Creating Charts and Graphs with Matplotlib", 2100, False),
                ]
            },
            {
                "title": "Communicating Data and Career Paths",
                "videos": [
                    ("Telling Stories with Data: Slides, Reports, and Memos", 2100, False),
                    ("SQL Basics: Getting Data Out of Any Database", 2400, False),
                    ("Data Analyst vs Business Analyst: Which Path is Right for You", 1500, False),
                    ("Building Your Data Portfolio with AI Projects", 2100, False),
                    ("Salary Negotiation: How to Price Your Data Skills", 1500, False),
                ]
            },
        ]
    },
]


def seed():
    init_db()
    db = SessionLocal()
    try:
        existing = db.query(Course).count()
        if existing > 0:
            print(f"[LMAP] {existing} courses already exist. Skipping seed.")
            return

        for i, course_data in enumerate(COURSES):
            modules_data = course_data.pop("modules")
            slug = slugify(course_data["title"])

            course = Course(**course_data, slug=slug, is_published=True)
            db.add(course)
            db.flush()

            for j, mod_data in enumerate(modules_data):
                videos_data = mod_data.pop("videos")
                module = Module(course_id=course.id, title=mod_data["title"], order=j)
                db.add(module)
                db.flush()

                for k, (title, duration, is_preview) in enumerate(videos_data):
                    video = Video(
                        module_id=module.id,
                        title=title,
                        duration_seconds=duration,
                        order=k,
                        is_preview=is_preview,
                    )
                    db.add(video)

            print(f"[LMAP] ✓ Course {i+1}: {course.title} ({len(modules_data)} modules)")

        db.commit()
        print("[LMAP] All 5 courses seeded successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
