import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Dùng để gọi API
import { 
  Container, 
  ListGroup, 
  Form, 
  Button, 
  InputGroup, 
  Spinner, 
  Alert 
} from 'react-bootstrap'; // Import các component giao diện


const API_URL = 'http://localhost:5000/api/todos';

function App() {
 
  const [todos, setTodos] = useState([]); 
  const [text, setText] = useState('');     
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState('');
  



  useEffect(() => {
    fetchTodos();
  }, []);

  
  const fetchTodos = async () => {
    setLoading(true);
    try {
      
      const response = await axios.get(API_URL);
      setTodos(response.data); 
      setError('');
    } catch (err) {
      setError('Lỗi: Không thể tải danh sách công việc.');
    }
    setLoading(false);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!text.trim()) return; 

    try {
    
      const response = await axios.post(API_URL, { text: text });
      
     
      setTodos([response.data, ...todos]);
      setText(''); 
      setError('');
    } catch (err) {
      setError('Lỗi: Không thể thêm công việc.');
    }
  };


  const toggleComplete = async (id) => {
    try {
      
      const response = await axios.put(`${API_URL}/${id}`);
      
      
      setTodos(
        todos.map((todo) =>
          todo._id === id ? { ...todo, completed: response.data.completed } : todo
        )
      );
    } catch (err) {
      setError('Lỗi: Không thể cập nhật công việc.');
    }
  };

 
  const deleteTodo = async (id) => {
    try {
      
      await axios.delete(`${API_URL}/${id}`);
      
     
      setTodos(todos.filter((todo) => todo._id !== id));
    } catch (err) {
      setError('Lỗi: Không thể xóa công việc.');
    }
  };

  return (
    <Container className="mt-5" style={{ maxWidth: '600px' }}>
      <h1 className="text-center mb-4">Ứng dụng To-Do</h1>


      {error && <Alert variant="danger">{error}</Alert>}

      
      <Form onSubmit={handleSubmit} className="mb-3">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Thêm một công việc mới..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button variant="primary" type="submit">
            Thêm
          </Button>
        </InputGroup>
      </Form>

     
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

     
      <ListGroup>
        {todos.map((todo) => (
          <ListGroup.Item
            key={todo._id}
            className="d-flex justify-content-between align-items-center"
            variant={todo.completed ? 'light' : ''} // Làm mờ nếu đã xong
          >
           
            <span
              onClick={() => toggleComplete(todo._id)}
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
                flex: 1,
                opacity: todo.completed ? 0.6 : 1,
              }}
            >
              {todo.text}
            </span>

            {/* Nút Xóa */}
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => deleteTodo(todo._id)}
            >
              &times; {/* Dấu 'x' */}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
}

export default App;