import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text
)
from sqlalchemy.orm import relationship
from database import Base

class ExerciseType(str, enum.Enum):
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE"
    WORD_BANK = "WORD_BANK"
    MATCH_PAIRS = "MATCH_PAIRS"
    TYPE_ANSWER = "TYPE_ANSWER"

class LessonStatus(str, enum.Enum):
    LOCKED = "LOCKED"
    AVAILABLE = "AVAILABLE"
    COMPLETED = "COMPLETED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    hearts = Column(Integer, default=5)
    gems = Column(Integer, default=500)
    last_activity_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    progress_records = relationship("UserLessonProgress", back_populates="user")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    code = Column(String(10), default="es")
    units = relationship("Unit", back_populates="course", cascade="all, delete-orphan")

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    order_index = Column(Integer, nullable=False)

    course = relationship("Course", back_populates="units")
    lessons = relationship("Lesson", back_populates="unit", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    title = Column(String(100), nullable=False)
    order_index = Column(Integer, nullable=False)
    base_xp = Column(Integer, default=15)

    unit = relationship("Unit", back_populates="lessons")
    exercises = relationship("Exercise", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("UserLessonProgress", back_populates="lesson")

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    type = Column(Enum(ExerciseType), nullable=False)
    prompt = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    correct_solution = Column(Text, nullable=False)

    lesson = relationship("Lesson", back_populates="exercises")
    options = relationship("ExerciseOption", back_populates="exercise", cascade="all, delete-orphan")

class ExerciseOption(Base):
    __tablename__ = "exercise_options"

    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    text = Column(String(255), nullable=False)
    is_correct = Column(Boolean, default=False)
    pair_key = Column(String(100), nullable=True)

    exercise = relationship("Exercise", back_populates="options")

class UserLessonProgress(Base):
    __tablename__ = "user_lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    status = Column(Enum(LessonStatus), default=LessonStatus.LOCKED)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="progress_records")
    lesson = relationship("Lesson", back_populates="progress_records")