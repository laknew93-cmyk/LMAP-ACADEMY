from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    student = "student"
    admin = "admin"


class CourseLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(500), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.student)
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="user")
    progress = relationship("VideoProgress", back_populates="user")


class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    slug = Column(String(300), unique=True, index=True)
    description = Column(Text)
    short_description = Column(String(500))
    price = Column(Float, nullable=False)
    mrp = Column(Float)
    category = Column(String(100))
    sort_order = Column(Integer, default=0)
    # JSON: audience, outcomes, prerequisites, tools, projects, faqs, seo
    details = Column(Text)
    # JSON: admin-panel edits (title, subtitle, price, mrp, is_published) applied on top of the content files
    overrides = Column(Text)
    level = Column(Enum(CourseLevel), default=CourseLevel.beginner)
    thumbnail = Column(String(500))
    duration_hours = Column(Float, default=0)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    modules = relationship("Module", back_populates="course", order_by="Module.order")
    enrollments = relationship("Enrollment", back_populates="course")


class Module(Base):
    __tablename__ = "modules"
    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(300), nullable=False)
    order = Column(Integer, default=0)

    course = relationship("Course", back_populates="modules")
    videos = relationship("Video", back_populates="module", order_by="Video.order")


class Video(Base):
    __tablename__ = "videos"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(300), nullable=False)
    description = Column(Text)
    filename = Column(String(500))
    summary = Column(String(500))
    source_file = Column(String(300))  # lesson markdown filename in backend/content
    content = Column(Text)  # markdown lesson body; shown when there is no video file
    duration_seconds = Column(Integer, default=0)
    order = Column(Integer, default=0)
    is_preview = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    module = relationship("Module", back_populates="videos")
    progress = relationship("VideoProgress", back_populates="video")


class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    razorpay_order_id = Column(String(200))
    razorpay_payment_id = Column(String(200))
    amount_paid = Column(Float)
    source = Column(String(20))  # course | bundle | free | manual
    coupon_code = Column(String(40))
    note = Column(String(500))

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class VideoProgress(Base):
    __tablename__ = "video_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    video_id = Column(Integer, ForeignKey("videos.id"), nullable=False)
    watched_seconds = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    last_watched = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")
    video = relationship("Video", back_populates="progress")


class Certificate(Base):
    __tablename__ = "certificates"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
    course = relationship("Course")


class SiteSetting(Base):
    """Editable business/site details (key → JSON value), managed from the admin panel."""
    __tablename__ = "site_settings"
    key = Column(String(100), primary_key=True)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Lead(Base):
    __tablename__ = "leads"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    phone = Column(String(30))
    email = Column(String(200))
    interest = Column(String(200))
    message = Column(Text)
    source = Column(String(300))  # page the form was submitted from
    status = Column(String(20), default="new")  # new | contacted | converted | closed
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class Coupon(Base):
    __tablename__ = "coupons"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(40), unique=True, index=True, nullable=False)
    percent_off = Column(Integer)  # either percent_off or amount_off
    amount_off = Column(Float)
    course_slug = Column(String(300))  # limit to one course ("all-access" for the bundle); empty = any
    max_uses = Column(Integer)  # empty = unlimited
    used_count = Column(Integer, default=0)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
