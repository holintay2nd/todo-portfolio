# 📝 Firebase 할일 관리 앱

Firebase Realtime Database를 활용한 실시간 할일 관리 웹 애플리케이션입니다.

## ✨ 주요 기능

### 🔥 Firebase 연동
- **Firebase Realtime Database**: 실시간 데이터 동기화
- **자동 동기화**: 여러 디바이스에서 동시 접근 시 실시간 업데이트
- **오프라인 지원**: 네트워크 연결 실패 시 자동으로 로컬 모드 전환

### 📱 할일 관리
- **할일 추가**: 직관적인 "할 일 추가" 버튼으로 간편하게 추가
- **할일 수정**: 클릭 한 번으로 수정 모달 열기
- **할일 삭제**: 안전한 삭제 확인 절차
- **완료 토글**: 체크박스로 완료/미완료 상태 변경

### 🎨 사용자 경험
- **직관적인 UI**: 복잡한 필터 없이 깔끔한 인터페이스
- **반응형 디자인**: 모바일과 데스크톱 모두 최적화
- **실시간 통계**: 전체/진행중/완료 할일 개수 실시간 표시
- **키보드 단축키**: 효율적인 작업을 위한 단축키 지원

## 🚀 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Realtime Database
- **Styling**: CSS Grid, Flexbox, CSS Animations
- **Icons**: Font Awesome

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/holintay2nd/todo-portfolio.git
cd todo-portfolio
```

### 2. Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Realtime Database 활성화
3. `index.html`의 Firebase 설정 정보를 본인 프로젝트 정보로 변경

### 3. 로컬 실행
```bash
# 간단한 HTTP 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js의 http-server 사용
npx http-server
```

4. 브라우저에서 `http://localhost:8000` 접속

## 🔧 Firebase 설정

### Realtime Database 보안 규칙
```json
{
  "rules": {
    "todos": {
      ".read": true,
      ".write": true
    }
  }
}
```

### Firebase 설정 정보
`index.html`에서 다음 정보를 본인 프로젝트 정보로 변경:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com/"
};
```

## 📱 사용법

### 할일 추가
1. "할 일 추가" 버튼 클릭
2. 입력 필드에 할일 내용 입력
3. "추가" 버튼 클릭 또는 Enter 키

### 할일 수정
1. 할일 항목의 "수정" 버튼 클릭
2. 모달에서 내용 수정
3. "저장" 버튼 클릭 또는 Ctrl+Enter

### 할일 삭제
1. 할일 항목의 "삭제" 버튼 클릭
2. 확인 메시지에서 "확인" 클릭

### 할일 완료
- 할일 항목의 체크박스 클릭

## ⌨️ 키보드 단축키

- **Enter**: 할일 추가
- **Ctrl+Enter**: 수정 저장
- **ESC**: 모달 닫기 / 입력 폼 닫기

## 🌟 특징

### 실시간 동기화
- Firebase Realtime Database를 통한 실시간 데이터 동기화
- 여러 브라우저 탭에서 동시 작업 시 즉시 반영

### 오프라인 지원
- 네트워크 연결이 끊어져도 로컬 스토리지에서 작업 가능
- 연결 복구 시 자동으로 Firebase와 동기화

### 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 기기에서 최적화
- 터치 친화적 인터페이스

### 사용자 친화적
- 직관적인 UI/UX
- 명확한 피드백과 알림
- 에러 처리 및 복구

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트 링크: [https://github.com/holintay2nd/todo-portfolio](https://github.com/holintay2nd/todo-portfolio)

---

⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!
