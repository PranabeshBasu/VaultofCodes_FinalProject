class TodoApp {
    constructor() {
        this.todos = [];
        this.filter = 'all';
        this.searchQuery = '';
        this.editingId = null;
        
        this.initializeElements();
        this.loadTodos();
        this.bindEvents();
        this.render();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.searchInput = document.getElementById('searchInput');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.statsText = document.getElementById('statsText');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filterBtns = document.querySelectorAll('.filter-btn');
    }

    bindEvents() {
        // Add todo
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Search
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.render();
        });

        // Filter
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });

        // Clear completed
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTodos());
    }

    loadTodos() {
        const saved = localStorage.getItem('todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved).map(todo => ({
                    ...todo,
                    createdAt: new Date(todo.createdAt)
                }));
            } catch (error) {
                console.error('Error loading todos:', error);
                this.todos = [];
            }
        }
    }

    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        if (!text) return;

        const newTodo = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: new Date()
        };

        this.todos.unshift(newTodo);
        this.todoInput.value = '';
        this.saveTodos();
        this.render();
    }

    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
        this.saveTodos();
        this.render();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveTodos();
        this.render();
    }

    startEditing(id, text) {
        this.editingId = id;
        this.render();
        
        // Focus the input after render
        setTimeout(() => {
            const input = document.querySelector(`[data-edit-id="${id}"]`);
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    }

    saveEdit(id, newText) {
        if (newText.trim()) {
            this.todos = this.todos.map(todo =>
                todo.id === id ? { ...todo, text: newText.trim() } : todo
            );
            this.saveTodos();
        }
        this.editingId = null;
        this.render();
    }

    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    clearCompletedTodos() {
        this.todos = this.todos.filter(todo => !todo.completed);
        this.saveTodos();
        this.render();
    }

    getFilteredTodos() {
        return this.todos.filter(todo => {
            const matchesFilter = 
                this.filter === 'all' || 
                (this.filter === 'active' && !todo.completed) || 
                (this.filter === 'completed' && todo.completed);
            
            const matchesSearch = todo.text.toLowerCase().includes(this.searchQuery.toLowerCase());
            
            return matchesFilter && matchesSearch;
        });
    }

    updateFilterButtons() {
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.filter);
        });
    }

    updateStats() {
        const activeTodos = this.todos.filter(todo => !todo.completed).length;
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        
        this.statsText.textContent = `${activeTodos} active, ${completedTodos} completed`;
        this.clearCompleted.style.display = completedTodos > 0 ? 'block' : 'none';
    }

    createTodoElement(todo, index) {
        const isEditing = this.editingId === todo.id;
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" style="animation-delay: ${index * 50}ms">
                <div class="todo-content">
                    <button class="todo-checkbox ${todo.completed ? 'completed' : ''}" onclick="app.toggleTodo('${todo.id}')">
                        ${todo.completed ? '✓' : ''}
                    </button>
                    
                    ${isEditing ? `
                        <input 
                            type="text" 
                            class="todo-input-edit" 
                            value="${todo.text}" 
                            data-edit-id="${todo.id}"
                            onkeypress="if(event.key==='Enter') app.saveEdit('${todo.id}', this.value); if(event.key==='Escape') app.cancelEdit()"
                            onblur="app.saveEdit('${todo.id}', this.value)"
                        >
                    ` : `
                        <span class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</span>
                    `}
                    
                    <div class="todo-actions">
                        ${isEditing ? `
                            <button class="action-btn save" onclick="app.saveEdit('${todo.id}', document.querySelector('[data-edit-id=\\'${todo.id}\\']').value)">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="20,6 9,17 4,12"></polyline>
                                </svg>
                            </button>
                            <button class="action-btn cancel" onclick="app.cancelEdit()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        ` : `
                            <button class="action-btn edit" onclick="app.startEditing('${todo.id}', '${todo.text.replace(/'/g, "\\'")}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="action-btn delete" onclick="app.deleteTodo('${todo.id}')">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                                </svg>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        
        if (filteredTodos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            if (this.searchQuery) {
                this.emptyState.innerHTML = `
                    <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <p class="empty-title">No tasks found</p>
                    <p class="empty-subtitle">Try adjusting your search terms</p>
                `;
            } else {
                this.emptyState.innerHTML = `
                    <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                    </svg>
                    <p class="empty-title">No tasks found</p>
                    <p class="empty-subtitle">Add your first task to get started!</p>
                `;
            }
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.todoList.innerHTML = filteredTodos
                .map((todo, index) => this.createTodoElement(todo, index))
                .join('');
        }
        
        this.updateStats();
    }
}

// Initialize the app
const app = new TodoApp();