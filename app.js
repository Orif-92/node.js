const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET' && req.url === '/books') {
    fs.readFile('books.json', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
      } else {
        res.statusCode = 200;
        res.end(data);
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/books/')) {
    const id = req.url.split('/').pop();
    fs.readFile('books.json', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
      } else {
        const books = JSON.parse(data);
        const book = books.find((b) => b.id === parseInt(id));
        if (book) {
          res.statusCode = 200;
          res.end(JSON.stringify(book));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
        }
      }
    });
  } else if (req.method === 'POST' && req.url === '/books') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const newBook = JSON.parse(body);
        fs.readFile('books.json', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
          } else {
            const books = JSON.parse(data);
            newBook.id = books.length + 1;
            books.push(newBook);
            fs.writeFile('books.json', JSON.stringify(books), (err) => {
              if (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
              } else {
                res.statusCode = 201;
                res.end(JSON.stringify(newBook));
              }
            });
          }
        });
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Noto\'g\'ri so\'rovnoma formati' }));
      }
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ message: 'Manzil topilmadi' }));
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
