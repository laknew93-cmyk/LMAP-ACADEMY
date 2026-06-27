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
