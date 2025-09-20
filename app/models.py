from sqlalchemy import Column, Integer, String, Text, ForeignKey, Index, DateTime, Date, Enum, Table, text, Boolean, SmallInteger
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# -------------------
# Association Table: Users ↔ Worklets (Many-to-Many)
# -------------------
user_worklet_association = Table(
    "user_worklet_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("worklet_id", Integer, ForeignKey("worklets.id", ondelete="CASCADE"), primary_key=True),
    Column("is_active", Boolean, nullable=False, server_default=text("1")),
    mysql_engine="InnoDB",
)

# -------------------
# User Table
# -------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    role = Column(Enum("Mentor", "Professor", "Student", name="user_role_enum"), nullable=False)
    team = Column(String(100), nullable=True)
    college = Column(String(150), nullable=True)
    created_at = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    is_verified = Column(Boolean, server_default=text("0"), nullable=False)
    otp_code = Column(String(6), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)

    # Relationships
    worklets = relationship(
        "Worklet",
        secondary=user_worklet_association,
        back_populates="users",
        lazy="joined"
    )

    def __repr__(self):
        return f"<User(id={self.id}, name='{self.name}', email='{self.email}', role='{self.role}')>"

# -------------------
# Worklet Table (Pranal schema)
# -------------------
class Worklet(Base):
    __tablename__ = "worklets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cert_id = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status_id = Column(Integer, nullable=True)
    status = Column(String(50), nullable=True)
    created_on = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    year = Column(Integer, nullable=False)  # STORED GENERATED in DB
    team = Column(String(100), nullable=True)
    college = Column(String(150), nullable=False)
    git_path = Column(String(255), nullable=True)
    risk_status = Column(Integer, nullable=True)
    performance_status = Column(Integer, nullable=True)
    percentage_completion = Column(Integer, nullable=True)
    problem_statement = Column(Text, nullable=True)
    expectations = Column(Text, nullable=True)
    prerequisites = Column(Text, nullable=True)
    milestone_id = Column(Integer, nullable=True)

    # Relationships
    users = relationship(
        "User",
        secondary=user_worklet_association,
        back_populates="worklets",
        lazy="joined"
    )

    def __repr__(self):
        return f"<Worklet(id={self.id}, cert_id='{self.cert_id}', team='{self.team}')>"

# -------------------
# Mentor Table
# -------------------
class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    contact = Column(String(50), nullable=True)
    team = Column(String(100), nullable=True)
    expertise = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __repr__(self):
        return f"<Mentor(id={self.id}, name='{self.name}', email='{self.email}')>"

# -------------------
# Indexes for fast lookup
# -------------------
Index("ix_user_email", User.email, unique=True)
Index("ix_user_role", User.role)
Index("ix_user_team", User.team)
Index("ix_worklet_cert_id", Worklet.cert_id, unique=True)
Index("ix_mentor_email", Mentor.email, unique=True)
