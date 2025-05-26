import { Container, Button, InputGroup, Form } from 'react-bootstrap'
import { useState, useEffect } from 'react'
import './App.css'

interface Todos {
  id?: number;
  text: string | null;
  date: string;
}

const API = 'http://localhost:3000/todos';

const App = () => {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todos[]>([]);
  const [date, setDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'added' | 'dateAsc' | 'dateDesc'>('added');  // ← ソート順を追加

  useEffect(() => {
    fetch(API).then(res => res.json())
      .then(data => setTodos(data))
  }, []);

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (text && date) {
      const newTodo = { text, date };
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })
        .then(res => res.json())
        .then(data => setTodos([...todos, data]))
      setText('');
      setDate('');
    } else if (text.length > 100) {
      window.alert(`テキストを100文字以下にしてください、現在${text.length}文字`)
    } else {
      window.alert('テキストと日付を入力してください')
    }
  };

  const handleDelete = (id?: number) => {
    fetch(`${API}/${id}`, { method: 'DELETE' })
      .then(() => setTodos(todos.filter(todo => todo.id !== id)))
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ソート処理
  const sortedTodos = [...todos];
  if (sortOrder === 'dateAsc') {
    sortedTodos.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else if (sortOrder === 'dateDesc') {
    sortedTodos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <Container fluid className='container'>
      <h1 className='text-center'>タスク管理</h1>
      <div className='shadow'>
        <Form.Control type='text' placeholder='テキストを入力' value={text} onChange={(e) => setText(e.target.value)} />
        <InputGroup className='d-flex'>
          <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button type='submit' className='btn btn-primary' onClick={handleClick}>追加</Button>
        </InputGroup>
      </div>

      {/* ソート切り替えボタン */}
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
    </Container>
  )
}

export default App;
