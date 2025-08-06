// 전역 변수
let todos = [];
let currentView = 'list';
let currentDate = new Date();
let editingTodoId = null;

// DOM 요소들
const todoInput = document.getElementById('todoInput');
const todoDate = document.getElementById('todoDate');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const listViewBtn = document.getElementById('listViewBtn');
const calendarViewBtn = document.getElementById('calendarViewBtn');
const listView = document.getElementById('listView');
const calendarView = document.getElementById('calendarView');
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthElement = document.getElementById('currentMonth');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const editModal = document.getElementById('editModal');
const editTodoInput = document.getElementById('editTodoInput');
const editTodoDate = document.getElementById('editTodoDate');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const closeModal = document.querySelector('.close');

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    todoDate.value = today;
    
    // 로컬스토리지에서 데이터 불러오기
    loadTodosFromStorage();
    
    // 초기 뷰 렌더링
    renderCurrentView();
    
    // 이벤트 리스너 설정
    setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 할 일 추가
    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTodo();
        }
    });
    
    // 뷰 전환
    listViewBtn.addEventListener('click', () => switchView('list'));
    calendarViewBtn.addEventListener('click', () => switchView('calendar'));
    
    // 달력 네비게이션
    prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    nextMonthBtn.addEventListener('click', () => navigateMonth(1));
    
    // 모달 관련
    saveEditBtn.addEventListener('click', saveEditedTodo);
    cancelEditBtn.addEventListener('click', closeEditModal);
    closeModal.addEventListener('click', closeEditModal);
    
    // 모달 외부 클릭 시 닫기
    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// 할 일 추가
function addTodo() {
    const text = todoInput.value.trim();
    const date = todoDate.value;
    
    if (!text) {
        alert('할 일을 입력해주세요!');
        return;
    }
    
    if (!date) {
        alert('날짜를 선택해주세요!');
        return;
    }
    
    const newTodo = {
        id: Date.now().toString(),
        text: text,
        date: date,
        completed: false
    };
    
    todos.push(newTodo);
    saveTodosToStorage();
    renderCurrentView();
    
    // 입력 필드 초기화
    todoInput.value = '';
    todoInput.focus();
}

// 할 일 삭제
function deleteTodo(id) {
    if (confirm('정말 삭제하시겠습니까?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodosToStorage();
        renderCurrentView();
    }
}

// 할 일 수정 모달 열기
function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    editingTodoId = id;
    editTodoInput.value = todo.text;
    editTodoDate.value = todo.date;
    editModal.style.display = 'block';
    editTodoInput.focus();
}

// 할 일 수정 저장
function saveEditedTodo() {
    const text = editTodoInput.value.trim();
    const date = editTodoDate.value;
    
    if (!text) {
        alert('할 일을 입력해주세요!');
        return;
    }
    
    if (!date) {
        alert('날짜를 선택해주세요!');
        return;
    }
    
    const todoIndex = todos.findIndex(t => t.id === editingTodoId);
    if (todoIndex !== -1) {
        todos[todoIndex].text = text;
        todos[todoIndex].date = date;
        saveTodosToStorage();
        renderCurrentView();
    }
    
    closeEditModal();
}

// 수정 모달 닫기
function closeEditModal() {
    editModal.style.display = 'none';
    editingTodoId = null;
}

// 뷰 전환
function switchView(view) {
    currentView = view;
    
    // 버튼 활성화 상태 변경
    listViewBtn.classList.toggle('active', view === 'list');
    calendarViewBtn.classList.toggle('active', view === 'calendar');
    
    // 뷰 표시/숨김
    listView.classList.toggle('active', view === 'list');
    calendarView.classList.toggle('active', view === 'calendar');
    
    renderCurrentView();
}

// 현재 뷰 렌더링
function renderCurrentView() {
    if (currentView === 'list') {
        renderListView();
    } else {
        renderCalendarView();
    }
}

// 리스트 뷰 렌더링
function renderListView() {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = '<p style="text-align: center; color: #888; padding: 40px;">할 일이 없습니다. 새로운 할 일을 추가해보세요!</p>';
        return;
    }
    
    // 날짜순으로 정렬
    const sortedTodos = [...todos].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedTodos.forEach(todo => {
        const todoItem = createTodoItemElement(todo);
        todoList.appendChild(todoItem);
    });
}

// 할 일 항목 요소 생성
function createTodoItemElement(todo) {
    const todoItem = document.createElement('div');
    todoItem.className = 'todo-item';
    
    const formattedDate = formatDate(todo.date);
    
    todoItem.innerHTML = `
        <div class="todo-content">
            <div class="todo-text">${escapeHtml(todo.text)}</div>
            <div class="todo-date">${formattedDate}</div>
        </div>
        <div class="todo-actions">
            <button class="edit-btn" onclick="editTodo('${todo.id}')">수정</button>
            <button class="delete-btn" onclick="deleteTodo('${todo.id}')">삭제</button>
        </div>
    `;
    
    return todoItem;
}

// 달력 뷰 렌더링
function renderCalendarView() {
    renderCalendarHeader();
    renderCalendarGrid();
}

// 달력 헤더 렌더링
function renderCalendarHeader() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    currentMonthElement.textContent = `${year}년 ${month}월`;
}

// 달력 그리드 렌더링
function renderCalendarGrid() {
    calendarGrid.innerHTML = '';
    
    // 요일 헤더 추가
    const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
    dayHeaders.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #ff9a9e;
            padding: 10px;
            background: rgba(255, 154, 158, 0.1);
            border-radius: 8px;
        `;
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 이번 달 첫 날과 마지막 날
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 첫 주의 시작 (이전 달 날짜들)
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // 6주 표시 (42일)
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + i);
        
        const dayCell = createCalendarDayCell(cellDate, month);
        calendarGrid.appendChild(dayCell);
    }
}

// 달력 날짜 셀 생성
function createCalendarDayCell(date, currentMonth) {
    const dayCell = document.createElement('div');
    dayCell.className = 'calendar-day';
    
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = isDateToday(date);
    
    if (!isCurrentMonth) {
        dayCell.classList.add('other-month');
    }
    
    if (isToday) {
        dayCell.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    
    const dayTodos = document.createElement('div');
    dayTodos.className = 'day-todos';
    
    // 해당 날짜의 할 일들 찾기
    const dateStr = getLocalDateString(date);
    const todosForDate = todos.filter(todo => todo.date === dateStr);
    
    todosForDate.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = 'day-todo-item';
        todoItem.textContent = todo.text.length > 8 ? todo.text.substring(0, 8) + '...' : todo.text;
        todoItem.title = todo.text; // 툴팁으로 전체 텍스트 표시
        dayTodos.appendChild(todoItem);
    });
    
    dayCell.appendChild(dayNumber);
    dayCell.appendChild(dayTodos);
    
    return dayCell;
}

// 월 네비게이션
function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendarView();
}

// 날짜가 오늘인지 확인
function isDateToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

// 날짜 포맷팅
function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

// 로컬 타임존 기준 YYYY-MM-DD 문자열 반환
function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 로컬스토리지에서 할 일 불러오기
function loadTodosFromStorage() {
    try {
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            todos = JSON.parse(savedTodos);
        }
    } catch (error) {
        console.error('할 일을 불러오는 중 오류 발생:', error);
        todos = [];
    }
}

// 로컬스토리지에 할 일 저장
function saveTodosToStorage() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
        console.error('할 일을 저장하는 중 오류 발생:', error);
        alert('데이터 저장 중 오류가 발생했습니다.');
    }
}