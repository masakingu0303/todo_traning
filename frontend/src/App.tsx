import { Container, Button, InputGroup, Form } from 'react-bootstrap'
import { useState } from 'react'
import './App.css'

interface Todos {
  text: string | null
}

const App = () => {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todos[]>([]);
  const [date, setDate] = useState('');

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (text) {
      setTodos([...todos, { text }]);
      setText('');
    };
  };

  return (
    <Container fluid>
      <h1 className='text-center'>タスク管理</h1>
      <InputGroup className='d-flex g-3'>
        <Form.Control type='text' placeholder='テキストを入力' value={text} onChange={(e) => setText(e.target.value)} />
        <Form.Control className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button type='submit' className='btn btn-primary' onClick={handleClick}>追加</Button>
      </InputGroup>

      <ul className="list-unstyled">
        {todos.map((todo, index) => (
          <li key={index}>
            {todo.text}
            <Button className='btn btn-link'><i className="bi bi-trash me-1">削除</i>
            </Button>
          </li>
        ))}
      </ul>
    </Container>
  )
}

export default App
