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
  const today = new Date();

  // レンダリング時、JSONサーバーからタスク一覧を取得してtodosを更新
  useEffect(() => {
    fetch(API).then(res => res.json())
      .then(data => setTodos(data))
  }, []);

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (text && date) {
      const newTodo = { text, date }

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
      window.alert('テキストと日付をを入力してください')
    }
  };

  //クリックしたid以外のtodoををsetTodosに入れる
  const handleDelete = (id?: number) => {
    fetch(`${API}/${id}`, {
      method: 'DELETE'
    }).then(() => setTodos(todos.filter(todo => todo.id !== id)))
  };


  return (
    <Container fluid className='container'>
      <h1 className='text-center'>タスク管理</h1>
      <div className='shadow'>
        <Form.Control type='text' placeholder='テキストを入力' value={text} onChange={(e) => setText(e.target.value)} />
        <InputGroup className='d-flex'>
          <Form.Control className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button type='submit' className='btn btn-primary' onClick={handleClick}>追加</Button>
        </InputGroup>
      </div>

      <div className='py-3 px-3'>
        <h2 className=' align-items-center'>
          タスク - 納期 - 進捗 - 現在{today.getMonth() + 1}月{today.getDate()}日
        </h2>
        {todos.map((todo) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);  // 時分秒リセット
          const todoDate = new Date(todo.date);
          todoDate.setHours(0, 0, 0, 0);  // 同じくリセット

          const diffTime = todoDate.getTime() - today.getTime();
          const diffDays = diffTime / (1000 * 60 * 60 * 24);  // 日数差（小数点）

          let message = '';
          if (diffDays > 0) {
            message = `残り${diffDays}日`;   // 未来
          } else {
            message = '期限切れ';             // 過去
          }


          let messageColor = '';
          if (diffDays < 0) {
            messageColor = 'text-danger';   // 期限切れは赤
          } else if (diffDays < 3) {
            messageColor = 'text-warning';  // 残り3日未満は黄色
          } else {
            messageColor = 'text-dark';     // それ以外は黒
          }

          return (
            <div key={todo.id} className='todoBox shadow'>
              <div className='my-1 mx-1'>{todo.text}</div>
              <InputGroup className='d-flex justify-content-between align-items-center'>
                <div>
                  {todoDate.getMonth() + 1}月{todoDate.getDate()}日まで
                  <div className={messageColor}>{message}</div>
                </div>
                <Button className='btn btn-danger' onClick={() => handleDelete(todo.id)}>
                  <i className="bi bi-trash me-1">削除</i>
                </Button>
              </InputGroup>
            </div>
          )
        })}

      </div>
    </Container>
  )
}

export default App
