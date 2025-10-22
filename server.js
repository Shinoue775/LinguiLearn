const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());

// ✅ This line serves your frontend files (HTML, JS, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// --- Your existing lesson + answer endpoints below ---
const lessons = {
  1: { id: 1, title: "Basics" }
};
const exercises = {
  1: { id: 1, lesson_id: 1, prompt: "Translate: ‘Hello’", correct_choice_id: 2 },
  2: { id: 2, lesson_id: 1, prompt: "Translate: ‘Goodbye’", correct_choice_id: 5 }
};
const choices = {
  1: { id: 1, exercise_id: 1, text: "Hola", is_correct: false },
  2: { id: 2, exercise_id: 1, text: "Bonjour", is_correct: true },
  3: { id: 3, exercise_id: 1, text: "Ciao", is_correct: false },
  4: { id: 4, exercise_id: 2, text: "Adiós", is_correct: true },
  5: { id: 5, exercise_id: 2, text: "Au revoir", is_correct: false },
  6: { id: 6, exercise_id: 2, text: "Arrivederci", is_correct: false }
};

const userProgress = {};

app.get('/lesson/:lessonId/next/:userId', (req, res) => {
  const { lessonId, userId } = req.params;
  let prog = userProgress[`${userId}-${lessonId}`];
  if (!prog) prog = userProgress[`${userId}-${lessonId}`] = { currentIndex: 0, correct: 0, wrong: 0 };

  const exs = Object.values(exercises).filter(e => e.lesson_id == lessonId);
  if (prog.currentIndex >= exs.length) {
    return res.json({ done: true, correct: prog.correct, wrong: prog.wrong });
  }
  const ex = exs[prog.currentIndex];
  const ch = Object.values(choices).filter(c => c.exercise_id == ex.id);
  res.json({
    done: false,
    exercise: {
      id: ex.id,
      prompt: ex.prompt,
      choices: ch.map(c => ({ id: c.id, text: c.text }))
    }
  });
});

app.post('/lesson/:lessonId/answer/:userId', (req, res) => {
  const { lessonId, userId } = req.params;
  const { exerciseId, choiceId } = req.body;
  const c = choices[choiceId];
  if (!c || c.exercise_id != exerciseId) {
    return res.status(400).json({ error: 'Invalid choice' });
  }

  let prog = userProgress[`${userId}-${lessonId}`];
  const exs = Object.values(exercises).filter(e => e.lesson_id == lessonId);
  const idx = prog.currentIndex;
  const ex = exs[idx];
  if (ex.id != exerciseId) {
    return res.status(400).json({ error: 'Out of order' });
  }

  let correct = false;
  if (c.is_correct) {
    prog.correct += 1;
    correct = true;
  } else {
    prog.wrong += 1;
  }
  prog.currentIndex += 1;
  res.json({ correct });
});

// ✅ Start server
app.listen(3000, () => {
  console.log('Server up on port 3000');
});
