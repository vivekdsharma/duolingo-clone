from database import engine, SessionLocal, Base
from models import User, Course, Unit, Lesson, Exercise, ExerciseOption, UserLessonProgress, ExerciseType, LessonStatus

def seed():
    print("Creating tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    user = User(
        username="learner_vivek",
        xp=120,
        streak=3,
        hearts=5,
        gems=450
    )
    db.add(user)
    db.flush()

    course = Course(title="Spanish", code="es")
    db.add(course)
    db.flush()

    unit1 = Unit(
        course_id=course.id,
        title="Unit 1: Essentials",
        description="Learn basic greetings and everyday phrases.",
        order_index=1
    )
    db.add(unit1)
    db.flush()

    lesson1 = Lesson(unit_id=unit1.id, title="Basics 1", order_index=1, base_xp=15)
    db.add(lesson1)
    db.flush()

    # Exercise 1: MCQ
    ex1 = Exercise(
        lesson_id=lesson1.id,
        type=ExerciseType.MULTIPLE_CHOICE,
        prompt="Which of these is 'the apple'?",
        order_index=1,
        correct_solution="la manzana"
    )
    db.add(ex1)
    db.flush()
    db.add_all([
        ExerciseOption(exercise_id=ex1.id, text="la manzana", is_correct=True),
        ExerciseOption(exercise_id=ex1.id, text="el pan", is_correct=False),
        ExerciseOption(exercise_id=ex1.id, text="el agua", is_correct=False),
    ])

    # Exercise 2: Word Bank
    ex2 = Exercise(
        lesson_id=lesson1.id,
        type=ExerciseType.WORD_BANK,
        prompt="Translate: 'The boy drinks water'",
        order_index=2,
        correct_solution="El niño bebe agua"
    )
    db.add(ex2)
    db.flush()
    for word in ["El", "niño", "bebe", "agua", "la", "come"]:
        db.add(ExerciseOption(exercise_id=ex2.id, text=word, is_correct=(word in ["El", "niño", "bebe", "agua"])))

    # Exercise 3: Match Pairs
    ex3 = Exercise(
        lesson_id=lesson1.id,
        type=ExerciseType.MATCH_PAIRS,
        prompt="Tap the matching pairs",
        order_index=3,
        correct_solution="pair_matching"
    )
    db.add(ex3)
    db.flush()
    pairs = [("Water", "Agua", "p1"), ("Bread", "Pan", "p2"), ("Boy", "Niño", "p3")]
    for en, es, key in pairs:
        db.add(ExerciseOption(exercise_id=ex3.id, text=en, is_correct=True, pair_key=key))
        db.add(ExerciseOption(exercise_id=ex3.id, text=es, is_correct=True, pair_key=key))

    # Exercise 4: Type Answer
    ex4 = Exercise(
        lesson_id=lesson1.id,
        type=ExerciseType.TYPE_ANSWER,
        prompt="Write 'Hello' in Spanish",
        order_index=4,
        correct_solution="hola"
    )
    db.add(ex4)
    db.flush()

    lesson2 = Lesson(unit_id=unit1.id, title="Greetings", order_index=2, base_xp=15)
    db.add(lesson2)
    db.flush()

    ex5 = Exercise(
        lesson_id=lesson2.id,
        type=ExerciseType.MULTIPLE_CHOICE,
        prompt="How do you say 'Good morning'?",
        order_index=1,
        correct_solution="Buenos días"
    )
    db.add(ex5)
    db.flush()
    db.add_all([
        ExerciseOption(exercise_id=ex5.id, text="Buenos días", is_correct=True),
        ExerciseOption(exercise_id=ex5.id, text="Adiós", is_correct=False),
    ])

    db.add(UserLessonProgress(user_id=user.id, lesson_id=lesson1.id, status=LessonStatus.AVAILABLE))
    db.add(UserLessonProgress(user_id=user.id, lesson_id=lesson2.id, status=LessonStatus.LOCKED))

    db.commit()
    db.close()
    print("Database seeded successfully with Spanish Unit 1!")

if __name__ == "__main__":
    seed()