
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const remainingTasks = document.getElementById("remainingTasks");

const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const taskSummary = document.getElementById("taskSummary");

const filters = document.querySelectorAll(".filter");
const clearCompleted = document.getElementById("clearCompleted");

let tasks = [];

try {
  const savedTasks = JSON.parse(
    localStorage.getItem("taskflow-tasks") || "[]"
  );

  if (
    Array.isArray(savedTasks) &&
    savedTasks.every(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    )
  ) {
    tasks = savedTasks;
  }
} catch {
  tasks = [];
}

let currentFilter = "all";

function saveTasks() {
  try {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  } catch {
    // The current session still works if storage is unavailable.
  }
}

function renderTasks() {
  taskList.replaceChildren();

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") {
      return !task.completed;
    }

    if (currentFilter === "completed") {
      return task.completed;
    }

    return true;
  });

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
      item.classList.add("done");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-btn";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    deleteButton.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, text, deleteButton);
    taskList.appendChild(item);
  });

  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const remaining = total - completed;

  const progress = total === 0
    ? 0
    : Math.round((completed / total) * 100);

  totalTasks.textContent = total;
  completedTasks.textContent = completed;
  remainingTasks.textContent = remaining;

  progressText.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;

  taskSummary.textContent =
    `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;

  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;

  if (total === 0) {
    document.getElementById("emptyTitle").textContent =
      "Your space is clear!";

    document.getElementById("emptyMessage").textContent =
      "Add a task and start making progress.";
  } else if (visibleTasks.length === 0) {
    document.getElementById("emptyTitle").textContent =
      "No tasks here!";

    document.getElementById("emptyMessage").textContent =
      "Try another filter to see your tasks.";
  } else {
    emptyState.hidden = true;
  }
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: crypto.randomUUID(),
    text: text,
    completed: false
  });

  saveTasks();

  currentFilter = "all";

  filters.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.filter === "all"
    );
  });

  taskInput.value = "";
  renderTasks();
  taskInput.focus();
});

filters.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;

    filters.forEach(filter => {
      filter.classList.toggle("active", filter === button);
    });

    renderTasks();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();

