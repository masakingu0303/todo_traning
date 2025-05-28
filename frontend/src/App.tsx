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
  check: boolean;
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

  //userが変更されたとき（ログイン・ログアウト）に実行,ログイン時のみ処理
  useEffect(() => {
    if (user) {
      fetch(`${API}?uid=${user.uid}`)
        .then(res => res.json())
        .then(data => {
          const updatedDate = data.map((todo: Todos) => ({
            ...todo, check: todo.check ?? false
          }));
          setTodos(updatedDate)
        });
    }
  }, [user]);


  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Googleログインしてください');
      return;
    }
    //未ログインの場合、アラート表示して処理中断。
    if (text && date) {
      const newTodo = { text, date, check: false, uid: user.uid };
      //入力欄の内容をサーバー（API/JSON Server）に送信
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })
        //新タスクを、画面のリスト（todos）に即追加
        .then(res => res.json())
        .then(data => setTodos([...todos, data]));
      setText('');
      setDate('');
    } else {
      alert('テキストと日付を入力してください');
    }
  };

  //選択したid以外のtodosを表示
  const handleDelete = (id?: number) => {
    fetch(`${API}/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(todo => todo.id !== id)));
  };

  // ソート処理（データ（todos配列）の順番を並べ替える）
  const sortedTodos = [...todos];
  if (sortOrder === 'dateAsc') {
    sortedTodos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortOrder === 'dateDesc') {
    sortedTodos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  //checkで状態を更新
  const handleCheck = (id: number, checked: boolean) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        // idが一致した場合のみcheckを更新
        return { ...todo, check: checked };
      } else {
        // 一致しない場合はそのまま
        return todo;
      }
    });
    setTodos(updatedTodos);

    //PUTでcheckのみ更新
    fetch(`${API}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check: checked })  // 更新するプロパティだけ送信
    });

  };




  return (
    <Container fluid className='container'>
      {/* ログイン・ログアウト切り替え */}
      {!user ? (
        //未ログイン時
        <div className='d-flex justify-content-center align-items-center min-vh-100'>
          <div className='text-center'>
            <h1 className='mb-3 fw-bold'>タスク管理アプリ</h1> {/* 下に余白を追加（mb-3） */}
            <Button onClick={signInWithGoogle}>
              <i className="bi bi-google me-1"></i>ログイン</Button>
          </div>
        </div>

      ) : (
        //ログイン時
        <>
          <h1 className='text-center mt-3'>タスク管理アプリ</h1>
          <div className='d-flex justify-content-between align-items-center'>
            <p className='mb-0'>{user.displayName}のアカウント</p>
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

          <div className='my-2 text-center'>
            <Button onClick={() => setSortOrder('added')} variant={sortOrder === 'added' ? 'primary' : 'secondary'}>追加順</Button>{' '}
            <Button onClick={() => setSortOrder('dateAsc')} variant={sortOrder === 'dateAsc' ? 'primary' : 'secondary'}>日付昇順</Button>{' '}
            <Button onClick={() => setSortOrder('dateDesc')} variant={sortOrder === 'dateDesc' ? 'primary' : 'secondary'}>日付降順</Button>
          </div>

          <div className='p-3'>
            <h2 className='text-center'>現在{today.getMonth() + 1}月{today.getDate()}日</h2>
            {sortedTodos.map((todo) => {
              const todoDate = new Date(todo.date);
              todoDate.setHours(0, 0, 0, 0);
              const diffTime = todoDate.getTime() - today.getTime();
              const diffDays = diffTime / (1000 * 60 * 60 * 24);

              let message = '';
              if (todo.check) {
                message = '完了';
              } else if (diffDays > 0 ) {
                message = `残り${diffDays}日`;
              } else {
                message = '期限切れ';
              }
              

              let messageColor = 'text-dark';
              if (diffDays < 0) messageColor = 'text-danger';
              else if (diffDays < 3) messageColor = 'text-warning';

              return (
                <div key={todo.id} className='todoBox shadow'>
                  <input type="checkbox" checked={todo.check} onChange={(e) => handleCheck(todo.id!, e.target.checked)} />
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
