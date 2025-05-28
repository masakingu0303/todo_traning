import { Container, Button, InputGroup, Form } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import './App.css';

// Firebase関連を追加
import { auth, signInWithGoogle, logout } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Todos {
  id?: number;
  text: string | null;
  date: string;
  uid: string;  // ユーザーIDを追加
}

const API = 'http://localhost:3000/todos';

const App = () => {
  const [user] = useAuthState(auth);  // ログイン状態管理
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todos[]>([]);
  const [date, setDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'added' | 'dateAsc' | 'dateDesc'>('added');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    if (user) {
      fetch(`${API}?uid=${user.uid}`)
        .then(res => res.json())
        .then(data => setTodos(data));
    }
  }, [user]);

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Googleログインしてください');
      return;
    }
    if (text && date) {
      const newTodo = { text, date, uid: user.uid };
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })
        .then(res => res.json())
        .then(data => setTodos([...todos, data]));
      setText('');
      setDate('');
    } else {
      alert('テキストと日付を入力してください');
    }
  };

  const handleDelete = (id?: number) => {
    fetch(`${API}/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(todo => todo.id !== id)));
  };

  // ソート処理
  const sortedTodos = [...todos];
  if (sortOrder === 'dateAsc') {
    sortedTodos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortOrder === 'dateDesc') {
    sortedTodos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <Container fluid className='container'>
      <h1 className='text-center mt-3'>タスク管理</h1>

      {/* ログイン・ログアウト切り替え */}
      {!user ? (
        <div className='text-center mt-3'><Button onClick={signInWithGoogle} >Googleでログイン</Button></div>
      ) : (
        <>
          <div className='d-flex justify-content-between align-items-center'>
            <p className='mb-0'>こんにちは、{user.displayName}さん！</p>
            <Button onClick={logout}>
              <i className="bi bi-box-arrow-right me-1"></i>ログアウト
            </Button>
          </div>

          <div className='shadow my-3'>
            <Form.Control type='text' placeholder='テキストを入力' value={text} onChange={e => setText(e.target.value)} />
            <InputGroup className='d-flex'>
              <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Button type='submit' onClick={handleClick}>追加</Button>
            </InputGroup>
          </div>

          <div className='my-2'>
            <Button onClick={() => setSortOrder('added')} variant={sortOrder === 'added' ? 'primary' : 'secondary'}>追加順</Button>{' '}
            <Button onClick={() => setSortOrder('dateAsc')} variant={sortOrder === 'dateAsc' ? 'primary' : 'secondary'}>日付昇順</Button>{' '}
            <Button onClick={() => setSortOrder('dateDesc')} variant={sortOrder === 'dateDesc' ? 'primary' : 'secondary'}>日付降順</Button>
          </div>

          <div className='py-3 px-3'>
            <h2>タスク - 納期 - 進捗 - 現在{today.getMonth() + 1}月{today.getDate()}日</h2>
            {sortedTodos.map((todo) => {
              const todoDate = new Date(todo.date);
              todoDate.setHours(0, 0, 0, 0);
              const diffTime = todoDate.getTime() - today.getTime();
              const diffDays = diffTime / (1000 * 60 * 60 * 24);

              let message = diffDays > 0 ? `残り${diffDays}日` : '期限切れ';
              let messageColor = 'text-dark';
              if (diffDays < 0) messageColor = 'text-danger';
              else if (diffDays < 3) messageColor = 'text-warning';

              return (
                <div key={todo.id} className='todoBox shadow'>
                  <div className='my-1 mx-1'>{todo.text}</div>
                  <InputGroup className='d-flex justify-content-between align-items-center'>
                    <div>
                      {todoDate.getMonth() + 1}月{todoDate.getDate()}日まで
                      <div className={messageColor}>{message}</div>
                    </div>
                    <Button className='btn btn-danger' onClick={() => handleDelete(todo.id)}>
                      <i className="bi bi-trash me-1"></i>削除
                    </Button>
                  </InputGroup>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Container>
  );
}

export default App;
