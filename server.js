const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();

// CORS 미들웨어 설정
app.use(cors());

app.use(express.json({limit: '50mb'}));
app.use(express.static('public'));

// 데이터 파일 경로
const dataFilePath = path.join(__dirname, 'users.json');

// 초기 데이터 파일이 없는 경우 생성
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, '[]', 'utf8');
}

// 메인 페이지
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 로그인 및 회원가입 엔드포인트
app.post('/login', (req, res) => {
    const { userId, password } = req.body;
    let users = [];

    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        users = JSON.parse(data);
    } catch (err) {
        console.error('파일 읽기 오류:', err);
    }

    const existingUser = users.find(user => user.userId === userId);

    if (!existingUser) {
        // 새 사용자 등록
        const newUser = { userId, password, stamps: [] };
        users.push(newUser);
        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
        res.json({ 
            success: true, 
            stamps: [], 
            message: '회원가입이 완료되었습니다!' 
        });
    } else {
        // 비밀번호 확인
        if (existingUser.password === password) {
            res.json({ 
                success: true, 
                stamps: existingUser.stamps,
                message: '로그인 성공!'
            });
        } else {
            res.json({ 
                success: false, 
                message: '비밀번호가 틀렸습니다!' 
            });
        }
    }
});

// 스탬프 저장 엔드포인트
app.post('/saveStamps', (req, res) => {
    const { userId, stamps } = req.body;
    let users = [];

    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        users = JSON.parse(data);
    } catch (err) {
        console.error('파일 읽기 오류:', err);
    }

    const userIndex = users.findIndex(user => user.userId === userId);

    if (userIndex !== -1) {
        users[userIndex].stamps = stamps;
        fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2));
        res.json({ success: true, message: '저장 완료' });
    } else {
        res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});