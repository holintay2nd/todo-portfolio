// 할일 관리 앱 JavaScript with Backend API

class TodoApp {
    constructor() {
        this.todos = [];
        this.editingId = null;
        this.apiBaseUrl = window.API_BASE_URL;
        this.isLoading = false;
        
        this.initializeElements();
        this.bindEvents();
        this.initializeApp();
    }

    // 앱 초기화
    async initializeApp() {
        try {
            console.log('🚀 백엔드 API 초기화 시작');
            this.updateConnectionStatus('connecting', '백엔드에 연결 중...');
            
            // 백엔드 연결 테스트
            await this.testBackendConnection();
            
            // 할일 목록 로드
            await this.loadTodos();
            
            this.updateConnectionStatus('connected', '백엔드에 연결됨');
            this.showNotification('백엔드 API에 연결되었습니다!', 'success');
            console.log('✅ 백엔드 API 초기화 완료');
        } catch (error) {
            console.error('❌ 백엔드 초기화 오류:', error);
            this.updateConnectionStatus('error', '백엔드 연결 실패 - 로컬 모드');
            this.showNotification('백엔드 연결에 실패했습니다. 로컬 모드로 실행됩니다.', 'warning');
            
            // 백엔드 연결 실패 시 로컬 스토리지 사용
            console.log('💾 로컬 모드로 전환');
            this.todos = JSON.parse(localStorage.getItem('todos')) || [];
            this.render();
            this.updateStats();
        }
    }

    // 연결 상태 업데이트
    updateConnectionStatus(status, message) {
        this.connectionStatus.className = `connection-status ${status}`;
        this.connectionStatus.innerHTML = `<i class="fas fa-server"></i> ${message}`;
    }

    // 백엔드 연결 테스트
    async testBackendConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/stats/overview`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ 백엔드 연결 성공:', result);
            return result;
        } catch (error) {
            console.error('❌ 백엔드 연결 실패:', error);
            throw error;
        }
    }

    // 할일 목록 로드
    async loadTodos() {
        try {
            const response = await fetch(this.apiBaseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                this.todos = result.data;
                this.render();
                this.updateStats();
                console.log('✅ 할일 목록 로드 완료:', this.todos.length);
            } else {
                throw new Error(result.message || '할일 목록을 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('❌ 할일 목록 로드 실패:', error);
            throw error;
        }
    }


    initializeElements() {
        // DOM 요소들 가져오기
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.inputForm = document.getElementById('inputForm');
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.addIcon = document.getElementById('addIcon');
        this.addText = document.getElementById('addText');
        this.addSpinner = document.getElementById('addSpinner');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.todoList = document.getElementById('todoList');
        this.emptyState = document.getElementById('emptyState');
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');
        
        // 모달 요소들
        this.editModal = document.getElementById('editModal');
        this.editInput = document.getElementById('editInput');
        this.closeModal = document.getElementById('closeModal');
        this.cancelEdit = document.getElementById('cancelEdit');
        this.saveEdit = document.getElementById('saveEdit');
    }

    bindEvents() {
        // 할 일 추가 버튼 이벤트
        this.addTaskBtn.addEventListener('click', () => this.showInputForm());
        
        // 취소 버튼 이벤트
        this.cancelBtn.addEventListener('click', () => this.hideInputForm());
        
        // 할일 추가 이벤트
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });


        // 모달 이벤트
        this.closeModal.addEventListener('click', () => this.closeEditModal());
        this.cancelEdit.addEventListener('click', () => this.closeEditModal());
        this.saveEdit.addEventListener('click', () => this.saveEditTodo());
        
        // 모달 외부 클릭으로 닫기
        this.editModal.addEventListener('click', (e) => {
            if (e.target === this.editModal) this.closeEditModal();
        });

        // ESC 키로 모달 닫기, Ctrl+Enter로 저장
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.editModal.style.display === 'block') {
                    this.closeEditModal();
                } else if (this.inputForm.style.display !== 'none') {
                    this.hideInputForm();
                }
            }
            
            // Ctrl+Enter로 수정 저장
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && this.editModal.style.display === 'block') {
                e.preventDefault();
                this.saveEditTodo();
            }
        });
    }

    // 입력 폼 보이기
    showInputForm() {
        this.inputForm.style.display = 'block';
        this.addTaskBtn.style.display = 'none';
        
        // 입력 필드에 포커스
        setTimeout(() => {
            this.todoInput.focus();
        }, 100);
        
        console.log('📝 입력 폼 표시');
    }

    // 입력 폼 숨기기
    hideInputForm() {
        this.inputForm.style.display = 'none';
        this.addTaskBtn.style.display = 'inline-flex';
        this.todoInput.value = '';
        
        console.log('❌ 입력 폼 숨김');
    }

    // 할일 추가 (메인 함수)
    async addTodo() {
        const text = this.todoInput.value.trim();
        
        console.log('🚀 할일 추가 시작:', { text, timestamp: new Date().toISOString() });
        
        // 입력 검증
        if (!this.validateTodoInput(text)) {
            console.log('❌ 입력 검증 실패');
            return;
        }

        // 중복 추가 방지
        if (this.addBtn.disabled) {
            console.log('❌ 이미 처리 중인 요청');
            return;
        }

        // 로딩 상태 시작
        this.setAddButtonLoading(true);
        console.log('⏳ 로딩 상태 시작');

        try {
            // 백엔드 API를 통한 Create 작업 실행
            console.log('🔥 백엔드 API Create 작업 시작');
            const result = await this.createTodoInBackend(text);
            console.log('📊 Create 결과:', result);
            
            if (result.success) {
                // 입력 폼 숨기기
                this.hideInputForm();
                
                // 할일 목록 새로고침
                await this.loadTodos();
                
                // 성공 메시지 표시
                const successMessage = result.method === 'backend-api' 
                    ? `할일이 백엔드에 성공적으로 생성되었습니다! (${result.responseTime}ms)`
                    : '할일이 로컬에 생성되었습니다!';
                
                this.showNotification(successMessage, 'success');
                
                // 생성된 할일 정보 로깅
                console.log('✅ 할일 생성 완료:', {
                    id: result.id,
                    text: text,
                    method: result.method,
                    timestamp: new Date().toISOString()
                });
                
            } else {
                console.error('❌ Create 실패:', result.error);
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('💥 할일 생성 오류:', error);
            
            // 에러 타입에 따른 다른 메시지 표시
            let errorMessage = '할일 생성에 실패했습니다.';
            if (error.message.includes('permission')) {
                errorMessage = '권한이 없습니다. Firebase 설정을 확인해주세요.';
            } else if (error.message.includes('network')) {
                errorMessage = '네트워크 연결을 확인해주세요.';
            } else if (error.message.includes('quota')) {
                errorMessage = '할당량을 초과했습니다. 잠시 후 다시 시도해주세요.';
            } else {
                errorMessage = `할일 생성에 실패했습니다: ${error.message}`;
            }
            
            this.showNotification(errorMessage, 'error');
            
            // 오류 발생 시 입력 필드에 텍스트 복원 (입력 폼은 유지)
            this.todoInput.value = text;
            this.todoInput.focus();
        } finally {
            // 로딩 상태 종료
            console.log('🏁 로딩 상태 종료');
            this.setAddButtonLoading(false);
        }
    }

    // 입력 검증 함수
    validateTodoInput(text) {
        if (!text) {
            this.showNotification('할일을 입력해주세요!', 'warning');
            this.todoInput.focus();
            return false;
        }

        if (text.length < 2) {
            this.showNotification('할일은 최소 2글자 이상 입력해주세요!', 'warning');
            this.todoInput.focus();
            return false;
        }

        if (text.length > 100) {
            this.showNotification('할일은 최대 100글자까지 입력 가능합니다!', 'warning');
            this.todoInput.focus();
            return false;
        }

        // 중복 할일 체크 (백엔드 API 호환성 고려)
        const isDuplicate = this.todos.some(todo => {
            const todoText = todo.text || todo.title || '';
            return todoText.toLowerCase() === text.toLowerCase() && !todo.completed;
        });
        
        if (isDuplicate) {
            this.showNotification('이미 같은 할일이 있습니다!', 'warning');
            this.todoInput.focus();
            return false;
        }

        return true;
    }

    // 백엔드 API를 통한 할일 생성 (Create 기능)
    async createTodoInBackend(text) {
        try {
            // 할일 데이터 객체 생성
            const todoData = {
                title: text.trim(),
                description: '',
                priority: 'medium',
                category: '',
                dueDate: null,
                tags: []
            };
            
            console.log('🔥 백엔드 API Create 시작:', {
                url: this.apiBaseUrl,
                data: todoData,
                timestamp: new Date().toISOString()
            });
            
            const startTime = Date.now();
            
            const response = await fetch(this.apiBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todoData)
            });
            
            const endTime = Date.now();
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log('✅ 백엔드 API Create 성공:', {
                    id: result.data._id,
                    data: result.data,
                    responseTime: `${endTime - startTime}ms`,
                    timestamp: new Date().toISOString()
                });
                
                // 성공 알림 업데이트
                this.updateConnectionStatus('connected', '백엔드에 연결됨');
                
                return {
                    success: true,
                    id: result.data._id,
                    data: result.data,
                    method: 'backend-api',
                    responseTime: endTime - startTime
                };
            } else {
                throw new Error(result.message || '할일 생성에 실패했습니다.');
            }
        } catch (error) {
            console.error('❌ 백엔드 API Create 실패:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            
            // 에러 상태 알림
            this.updateConnectionStatus('error', `데이터 생성 오류: ${error.message}`);
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 할일 데이터 객체 생성 (백엔드 API 호환성 고려)
    createTodoData(text) {
        const now = new Date().toISOString();
        
        return {
            title: text.trim(),  // 백엔드 API에서 사용하는 필드
            text: text.trim(),   // 기존 호환성을 위해 유지
            completed: false,
            createdAt: now,
            updatedAt: now,
            priority: 'medium', // 백엔드 API에서 사용하는 우선순위 값
            category: '', // 백엔드 API에서 사용하는 카테고리
            userId: 'anonymous', // 사용자 ID (향후 인증 기능 추가 시 사용)
            tags: [], // 태그 배열 (향후 확장용)
            dueDate: null, // 마감일 (향후 확장용)
            description: '', // 상세 설명 (향후 확장용)
            isArchived: false // 아카이브 상태
        };
    }

    // Create 통계 정보 가져오기
    getCreateStats() {
        return {
            totalCreated: this.todos.length,
            firebaseCreated: this.todos.filter(todo => todo.method === 'firebase').length,
            localCreated: this.todos.filter(todo => todo.method === 'local').length,
            lastCreated: this.todos.length > 0 ? this.todos[0].createdAt : null
        };
    }

    // Create 기능 테스트
    async testCreateFunction() {
        console.log('🧪 Create 기능 테스트 시작');
        
        const testText = `테스트 할일 ${Date.now()}`;
        const result = await this.createTodoInFirebase(testText);
        
        console.log('🧪 Create 기능 테스트 결과:', result);
        
        return result;
    }

    // 추가 버튼 로딩 상태 설정
    setAddButtonLoading(isLoading) {
        this.addBtn.disabled = isLoading;
        this.todoInput.disabled = isLoading;
        
        if (isLoading) {
            // 로딩 상태: 스피너 표시
            if (this.addIcon) this.addIcon.style.display = 'none';
            if (this.addText) this.addText.style.display = 'none';
            if (this.addSpinner) this.addSpinner.style.display = 'inline-block';
            
            // 버튼 텍스트 변경
            const spinner = document.createElement('i');
            spinner.className = 'fas fa-spinner fa-spin';
            spinner.style.marginRight = '8px';
            
            const text = document.createElement('span');
            text.textContent = '추가 중...';
            
            this.addBtn.innerHTML = '';
            this.addBtn.appendChild(spinner);
            this.addBtn.appendChild(text);
        } else {
            // 일반 상태: 원래 아이콘과 텍스트 표시
            if (this.addIcon) this.addIcon.style.display = 'inline';
            if (this.addText) this.addText.style.display = 'inline';
            if (this.addSpinner) this.addSpinner.style.display = 'none';
            
            // 원래 버튼 내용 복원
            this.addBtn.innerHTML = '<i class="fas fa-plus" id="addIcon"></i> <span id="addText">추가</span><div class="loading-spinner" id="addSpinner" style="display: none;"><i class="fas fa-spinner fa-spin"></i></div>';
            
            // DOM 요소 다시 참조
            this.addIcon = document.getElementById('addIcon');
            this.addText = document.getElementById('addText');
            this.addSpinner = document.getElementById('addSpinner');
        }
    }

    // 할일 완료 상태 토글
    async toggleTodo(id) {
        const todo = this.todos.find(todo => todo._id === id || todo.id === id);
        if (!todo) return;

        const todoId = todo._id || todo.id;

        try {
            // 백엔드 API에 토글 요청
            const response = await fetch(`${this.apiBaseUrl}/${todoId}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // 할일 목록 새로고침
                await this.loadTodos();
                
                const message = result.data.completed ? '할일을 완료했습니다!' : '할일을 다시 진행중으로 변경했습니다!';
                this.showNotification(message, 'info');
            } else {
                throw new Error(result.message || '할일 상태 변경에 실패했습니다.');
            }
        } catch (error) {
            console.error('할일 상태 변경 오류:', error);
            
            // 백엔드 오류 시 로컬 모드로 폴백
            todo.completed = !todo.completed;
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            this.render();
            this.updateStats();
            
            this.updateConnectionStatus('offline', '오프라인 모드 - 로컬 저장');
            const message = todo.completed ? '할일을 완료했습니다! (로컬 저장)' : '할일을 다시 진행중으로 변경했습니다! (로컬 저장)';
            this.showNotification(message, 'warning');
        }
    }

    // 할일 수정 모달 열기
    editTodo(id) {
        const todo = this.todos.find(todo => todo._id === id || todo.id === id);
        if (todo) {
            this.editingId = id;
            this.editInput.value = todo.title || todo.text;
            this.editModal.style.display = 'block';
            
            // 모달 제목에 할일 정보 표시
            const modalTitle = this.editModal.querySelector('h3');
            modalTitle.innerHTML = `할일 수정 <small style="color: #6c757d; font-weight: normal;">(${this.formatDate(todo.createdAt)})</small>`;
            
            // 입력 필드에 포커스 및 텍스트 선택
            setTimeout(() => {
                this.editInput.focus();
                this.editInput.select();
            }, 100);
            
            console.log('📝 할일 수정 모달 열기:', {
                id: id,
                text: todo.title || todo.text,
                createdAt: todo.createdAt,
                completed: todo.completed
            });
        }
    }

    // 할일 수정 저장
    async saveEditTodo() {
        const text = this.editInput.value.trim();
        if (!text) {
            this.showNotification('할일을 입력해주세요!', 'warning');
            return;
        }

        const todo = this.todos.find(todo => todo._id === this.editingId || todo.id === this.editingId);
        if (!todo) return;

        const todoId = todo._id || todo.id;

        try {
            // 백엔드 API에 수정 요청
            const response = await fetch(`${this.apiBaseUrl}/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: text
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // 할일 목록 새로고침
                await this.loadTodos();
                
                this.closeEditModal();
                this.showNotification('할일이 수정되었습니다!', 'success');
            } else {
                throw new Error(result.message || '할일 수정에 실패했습니다.');
            }
        } catch (error) {
            console.error('할일 수정 오류:', error);
            
            // 백엔드 오류 시 로컬 모드로 폴백
            todo.title = text;  // 백엔드 API 호환성을 위해 title 사용
            todo.text = text;   // 기존 호환성을 위해 text도 유지
            todo.updatedAt = new Date().toISOString();
            this.saveTodos();
            this.render();
            
            this.updateConnectionStatus('offline', '오프라인 모드 - 로컬 저장');
            this.closeEditModal();
            this.showNotification('할일이 수정되었습니다! (로컬 저장)', 'warning');
        }
    }

    // 수정 모달 닫기
    closeEditModal() {
        this.editModal.style.display = 'none';
        this.editingId = null;
        this.editInput.value = '';
    }

    // 할일 삭제
    async deleteTodo(id) {
        const todo = this.todos.find(todo => todo._id === id || todo.id === id);
        if (!todo) return;

        const todoId = todo._id || todo.id;
        const todoText = todo.title || todo.text;

        // 더 상세한 삭제 확인
        const confirmMessage = `정말로 이 할일을 삭제하시겠습니까?\n\n"${todoText}"\n\n삭제된 할일은 복구할 수 없습니다.`;
        
        if (!confirm(confirmMessage)) {
            console.log('❌ 할일 삭제 취소됨:', id);
            return;
        }

        console.log('🗑️ 할일 삭제 시작:', {
            id: todoId,
            text: todoText,
            completed: todo.completed,
            createdAt: todo.createdAt
        });

        try {
            // 백엔드 API에 삭제 요청
            const response = await fetch(`${this.apiBaseUrl}/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // 할일 목록 새로고침
                await this.loadTodos();
                
                console.log('✅ 백엔드에서 할일 삭제 완료');
                this.showNotification(`"${todoText}" 할일이 삭제되었습니다!`, 'info');
            } else {
                throw new Error(result.message || '할일 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('❌ 할일 삭제 오류:', error);
            
            // 백엔드 오류 시 로컬 모드로 폴백
            this.todos = this.todos.filter(todo => (todo._id || todo.id) !== todoId);
            this.saveTodos();
            this.render();
            this.updateStats();
            
            this.updateConnectionStatus('offline', '오프라인 모드 - 로컬 저장');
            console.log('✅ 로컬에서 할일 삭제 완료');
            this.showNotification(`"${todoText}" 할일이 삭제되었습니다! (로컬 저장)`, 'warning');
        }
    }


    // 할일 목록 렌더링
    render() {
        if (this.todos.length === 0) {
            this.todoList.style.display = 'none';
            this.emptyState.style.display = 'block';
            
            // 빈 상태 메시지 업데이트
            const emptyMessage = this.emptyState.querySelector('h3');
            const emptyDescription = this.emptyState.querySelector('p');
            
            emptyMessage.textContent = '할일이 없습니다';
            emptyDescription.textContent = '새로운 할일을 추가해보세요!';
        } else {
            this.todoList.style.display = 'block';
            this.emptyState.style.display = 'none';
            
            this.todoList.innerHTML = this.todos.map(todo => {
                const todoId = todo._id || todo.id;
                const todoText = todo.title || todo.text;
                return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todoId}">
                    <div class="todo-content">
                        <input type="checkbox" 
                               class="todo-checkbox" 
                               ${todo.completed ? 'checked' : ''} 
                               onchange="todoApp.toggleTodo('${todoId}')">
                        <span class="todo-text">${this.escapeHtml(todoText)}</span>
                        <div class="todo-meta">
                            <small class="todo-date">${this.formatDate(todo.createdAt)}</small>
                            ${todo.updatedAt && todo.updatedAt !== todo.createdAt ? 
                                `<small class="todo-updated">수정됨</small>` : ''}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="btn btn-edit" onclick="todoApp.editTodo('${todoId}')" title="수정">
                            <i class="fas fa-edit"></i>
                            <span class="btn-text">수정</span>
                        </button>
                        <button class="btn btn-delete" onclick="todoApp.deleteTodo('${todoId}')" title="삭제">
                            <i class="fas fa-trash"></i>
                            <span class="btn-text">삭제</span>
                        </button>
                    </div>
                </div>
            `;
            }).join('');
        }
    }

    // 통계 업데이트
    updateStats() {
        const total = this.todos.length;
        const pending = this.todos.filter(todo => !todo.completed).length;
        const completed = this.todos.filter(todo => todo.completed).length;

        this.totalCount.textContent = total;
        this.pendingCount.textContent = pending;
        this.completedCount.textContent = completed;
    }

    // 로컬 스토리지에 저장
    saveTodos() {
        localStorage.setItem('todos', JSON.stringify(this.todos));
    }

    // HTML 이스케이프 (XSS 방지)
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 날짜 포맷팅
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '오늘';
        } else if (diffDays === 2) {
            return '어제';
        } else if (diffDays <= 7) {
            return `${diffDays - 1}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // 알림 표시
    showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 새 알림 생성
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 스타일 적용
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '250px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.3s ease',
            background: this.getNotificationColor(type)
        });

        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: 'linear-gradient(135deg, #28a745, #20c997)',
            warning: 'linear-gradient(135deg, #ffc107, #fd7e14)',
            error: 'linear-gradient(135deg, #dc3545, #e83e8c)',
            info: 'linear-gradient(135deg, #17a2b8, #6f42c1)'
        };
        return colors[type] || colors.info;
    }

    // 앱 정리 (리소스 해제)
    cleanup() {
        // 백엔드 API는 별도의 정리가 필요하지 않음
        console.log('🧹 앱 정리 완료');
    }

    // 모든 할일 완료
    async completeAll() {
        const hasIncomplete = this.todos.some(todo => !todo.completed);
        const newCompleted = hasIncomplete;

        try {
            // 백엔드 API에 모든 할일 업데이트 요청
            const incompleteTodos = this.todos.filter(todo => !todo.completed);
            
            if (incompleteTodos.length === 0) {
                this.showNotification('완료할 할일이 없습니다.', 'info');
                return;
            }

            // 각 할일에 대해 개별적으로 업데이트 요청
            const updatePromises = incompleteTodos.map(async (todo) => {
                const todoId = todo._id || todo.id;
                const response = await fetch(`${this.apiBaseUrl}/${todoId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed: newCompleted
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return response.json();
            });

            await Promise.all(updatePromises);
            
            // 할일 목록 새로고침
            await this.loadTodos();
            
            const message = newCompleted ? '모든 할일을 완료했습니다!' : '모든 할일을 다시 진행중으로 변경했습니다!';
            this.showNotification(message, 'info');
        } catch (error) {
            console.error('전체 할일 상태 변경 오류:', error);
            
            // 백엔드 오류 시 로컬 모드로 폴백
            this.todos.forEach(todo => {
                todo.completed = newCompleted;
            });
            this.saveTodos();
            this.render();
            this.updateStats();
            
            this.updateConnectionStatus('offline', '오프라인 모드 - 로컬 저장');
            const message = newCompleted ? '모든 할일을 완료했습니다! (로컬 저장)' : '모든 할일을 다시 진행중으로 변경했습니다! (로컬 저장)';
            this.showNotification(message, 'warning');
        }
    }

    // 완료된 할일 모두 삭제
    async clearCompleted() {
        const completedTodos = this.todos.filter(todo => todo.completed);
        const completedCount = completedTodos.length;
        
        if (completedCount === 0) {
            this.showNotification('완료된 할일이 없습니다!', 'warning');
            return;
        }

        if (!confirm(`완료된 ${completedCount}개의 할일을 모두 삭제하시겠습니까?`)) return;

        try {
            // 백엔드 API에 완료된 할일들 삭제 요청
            const deletePromises = completedTodos.map(async (todo) => {
                const todoId = todo._id || todo.id;
                const response = await fetch(`${this.apiBaseUrl}/${todoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                return response.json();
            });

            await Promise.all(deletePromises);
            
            // 할일 목록 새로고침
            await this.loadTodos();
            
            this.showNotification(`${completedCount}개의 완료된 할일이 삭제되었습니다!`, 'info');
        } catch (error) {
            console.error('완료된 할일 삭제 오류:', error);
            
            // 백엔드 오류 시 로컬 모드로 폴백
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveTodos();
            this.render();
            this.updateStats();
            
            this.updateConnectionStatus('offline', '오프라인 모드 - 로컬 저장');
            this.showNotification(`${completedCount}개의 완료된 할일이 삭제되었습니다! (로컬 저장)`, 'warning');
        }
    }
}

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 앱 초기화
let todoApp;
document.addEventListener('DOMContentLoaded', () => {
    todoApp = new TodoApp();
});

// 페이지 언로드 시 리소스 정리
window.addEventListener('beforeunload', () => {
    if (todoApp) {
        todoApp.cleanup();
    }
});

// 키보드 단축키
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter로 할일 추가
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        todoApp.addTodo();
    }
    
    // Ctrl/Cmd + A로 모든 할일 완료/미완료 토글
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.shiftKey) {
        e.preventDefault();
        todoApp.completeAll();
    }
    
    // Ctrl/Cmd + Shift + A로 완료된 할일 모두 삭제
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        todoApp.clearCompleted();
    }
});
