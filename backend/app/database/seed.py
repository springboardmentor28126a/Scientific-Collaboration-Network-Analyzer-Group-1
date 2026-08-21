from sqlalchemy.orm import Session
from datetime import date, datetime, timedelta
from app.models.institution import Institution
from app.models.researcher import Researcher
from app.models.publication import Publication
from app.models.project import Project
from app.models.collaboration import Collaboration
from app.models.notification import Notification
from app.models.user import User
from app.utils.hash import hash_password

def seed_data(db: Session):
    # 0. Seed Users if empty
    if db.query(User).count() == 0:
        user1 = User(
            name="Dr. Salma",
            email="salma@scinexus.org",
            hashed_password=hash_password("password123"),
            role="Researcher"
        )
        user2 = User(
            name="Dr. Siddiqua",
            email="siddiqua@scinexus.org",
            hashed_password=hash_password("password123"),
            role="Researcher"
        )
        user3 = User(
            name="Dr. Mansoor",
            email="mansoor@scinexus.org",
            hashed_password=hash_password("password123"),
            role="Researcher"
        )
        user4 = User(
            name="Prof. Sarah Jenkins",
            email="sarah.jenkins@scinexus.org",
            hashed_password=hash_password("password123"),
            role="Institution Admin"
        )
        db.add_all([user1, user2, user3, user4])
        db.commit()

    # 1. Seed Institutions if empty
    if db.query(Institution).count() == 0:
        inst1 = Institution(
            id="inst-1",
            name="SciNexus University",
            type="University",
            address="123 Science Park, Boston, MA",
            website="https://scinexus.edu"
        )
        inst2 = Institution(
            id="inst-2",
            name="Global Research Lab",
            type="Research Institute",
            address="456 Innovation Way, San Francisco, CA",
            website="https://globalresearch.org"
        )
        inst3 = Institution(
            id="inst-3",
            name="National Institute of Technology",
            type="Government Lab",
            address="789 Technology Blvd, Austin, TX",
            website="https://nit.gov"
        )
        db.add_all([inst1, inst2, inst3])
        db.commit()

    # Get available institution IDs dynamically
    all_insts = db.query(Institution).all()
    inst_ids = [i.id for i in all_insts]
    
    # Fallback to the first institution ID if fewer than 3 exist
    inst1_id = inst_ids[0] if len(inst_ids) > 0 else None
    inst2_id = inst_ids[1] if len(inst_ids) > 1 else inst1_id
    inst3_id = inst_ids[2] if len(inst_ids) > 2 else inst2_id

    # 2. Seed Researchers if empty
    if db.query(Researcher).count() == 0:
        res1 = Researcher(
            id="res-1",
            name="Dr. Salma",
            email="salma@scinexus.org",
            role="Researcher",
            institution_id=inst1_id,
            department="Computer Science"
        )
        res2 = Researcher(
            id="res-2",
            name="Dr. Siddiqua",
            email="siddiqua@scinexus.org",
            role="Researcher",
            institution_id=inst2_id,
            department="Quantum Computing"
        )
        res3 = Researcher(
            id="res-3",
            name="Dr. Mansoor",
            email="mansoor@scinexus.org",
            role="Researcher",
            institution_id=inst3_id,
            department="Bioinformatics"
        )
        res4 = Researcher(
            id="res-4",
            name="Prof. Sarah Jenkins",
            email="sarah.jenkins@scinexus.org",
            role="Institution Admin",
            institution_id=inst1_id,
            department="Data Science"
        )
        db.add_all([res1, res2, res3, res4])
        db.commit()

    # 3. Seed Publications if empty
    if db.query(Publication).count() == 0:
        pub1 = Publication(
            title="Analyzing Collaborative Research Networks using Graph Analytics",
            abstract="This paper discusses methods to visualize and analyze scientific collaboration networks, identifying key hub researchers and institutional synergy.",
            pub_type="Journal",
            status="Published",
            authors="Dr. Salma, Dr. Siddiqua",
            doi="10.1016/j.csi.2026.103750",
            journal_conference="Journal of Computer Science and Informatics",
            citation_count=42,
            institution_id=inst1_id,
            published_date=date(2025, 3, 14)
        )
        pub2 = Publication(
            title="Next-Gen Data Flow Security in Distributed Systems",
            abstract="We present a secure, high-throughput protocol for data exchange in federated academic databases, avoiding traditional AI bottlenecks.",
            pub_type="Conference",
            status="Published",
            authors="Dr. Mansoor, Dr. Salma",
            doi="10.1109/ICDCS.2025.00021",
            journal_conference="IEEE International Conference on Distributed Computing Systems",
            citation_count=18,
            institution_id=inst3_id,
            published_date=date(2025, 7, 22)
        )
        pub3 = Publication(
            title="Deep Collaboration Patterns in Academic Partnerships",
            abstract="An empirical study of publication outputs and growth curves in major research universities over a ten-year span.",
            pub_type="Book",
            status="Published",
            authors="Dr. Salma, Dr. Mansoor, Dr. Siddiqua",
            doi="10.1007/978-3-031-12345-6",
            journal_conference="Springer Research Series",
            citation_count=29,
            institution_id=inst1_id,
            published_date=date(2024, 11, 5)
        )
        pub4 = Publication(
            title="Optimizing Resource Allocation in Cloud Infrastructures",
            abstract="This report outlines cost-effective scheduling algorithms for scientific workloads in private cloud computing environments.",
            pub_type="Technical Report",
            status="Submitted",
            authors="Dr. Siddiqua",
            doi=None,
            journal_conference="Global Research Lab Tech Report #44",
            citation_count=0,
            institution_id=inst2_id,
            published_date=date(2026, 1, 10)
        )
        pub5 = Publication(
            title="A Decentralized Authentication Scheme for Academic Research Profiles",
            abstract="A draft proposing a lightweight, token-based verification system for academic portal identities.",
            pub_type="Patent",
            status="Draft",
            authors="Dr. Mansoor",
            doi=None,
            journal_conference="USPTO Patent Application 18/429,910",
            citation_count=0,
            institution_id=inst3_id,
            published_date=None
        )
        db.add_all([pub1, pub2, pub3, pub4, pub5])
        db.commit()

    # 4. Seed Projects if empty
    if db.query(Project).count() == 0:
        proj1 = Project(
            title="Project SciNexus: Federated Collaboration Engine",
            description="Developing the core communication and database sync engine for institutional research tracking.",
            funding_agency="National Science Foundation (NSF)",
            budget=1500000,
            lead_researcher_id="res-1",
            institution_id=inst1_id,
            status="Active",
            start_date=date(2025, 1, 1),
            end_date=date(2027, 12, 31)
        )
        proj2 = Project(
            title="Global Health Research Network",
            description="A collaborative endeavor to map epidemiological datasets across global research hubs.",
            funding_agency="World Health Organization (WHO)",
            budget=750000,
            lead_researcher_id="res-2",
            institution_id=inst2_id,
            status="Completed",
            start_date=date(2023, 6, 1),
            end_date=date(2025, 6, 1)
        )
        proj3 = Project(
            title="AI-Free Network Optimization Framework",
            description="Investigating deterministic graph algorithms to build optimal routes for collaborative teams.",
            funding_agency="Department of Energy (DOE)",
            budget=500000,
            lead_researcher_id="res-3",
            institution_id=inst3_id,
            status="Proposed",
            start_date=date(2026, 9, 1),
            end_date=None
        )
        db.add_all([proj1, proj2, proj3])
        db.commit()

    # 5. Seed Collaborations if empty
    if db.query(Collaboration).count() == 0:
        c1 = Collaboration(
            researcher_id="res-1",
            partner_researcher_id="res-2",
            institution_id=inst1_id,
            partner_institution_id=inst2_id,
            project_id=None,
            status="Active",
            collaborated_at=date(2024, 5, 20)
        )
        c2 = Collaboration(
            researcher_id="res-1",
            partner_researcher_id="res-3",
            institution_id=inst1_id,
            partner_institution_id=inst3_id,
            project_id=None,
            status="Active",
            collaborated_at=date(2025, 1, 15)
        )
        c3 = Collaboration(
            researcher_id="res-2",
            partner_researcher_id="res-3",
            institution_id=inst2_id,
            partner_institution_id=inst3_id,
            project_id=None,
            status="Completed",
            collaborated_at=date(2023, 10, 10)
        )
        db.add_all([c1, c2, c3])
        db.commit()

    # 6. Seed Notifications if empty
    if db.query(Notification).count() == 0:
        notif1 = Notification(
            user_email="all",
            title="Welcome to SciNexus!",
            message="Your academic collaboration tracking dashboard is now operational.",
            notification_type="info",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        notif2 = Notification(
            user_email="all",
            title="New Publication Uploaded",
            message="Dr. Salma and Dr. Siddiqua published a new paper: 'Analyzing Collaborative Research Networks using Graph Analytics'.",
            notification_type="success",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(days=1)
        )
        notif3 = Notification(
            user_email="all",
            title="System Maintenance Scheduled",
            message="The database will undergo brief scheduled maintenance tonight at 02:00 AM UTC. No downtime expected.",
            notification_type="warning",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=5)
        )
        notif4 = Notification(
            user_email="all",
            title="New Collaboration Registered",
            message="A collaboration has been established between SciNexus University and National Institute of Technology.",
            notification_type="success",
            is_read=False,
            created_at=datetime.utcnow() - timedelta(hours=2)
        )
        db.add_all([notif1, notif2, notif3, notif4])
        db.commit()
