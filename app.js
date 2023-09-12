const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/books') {
    fs.readFile('books.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Server xatosi' }));
        return;
      }
      const books = JSON.parse(data);
      res.statusCode = 200;
      res.end(JSON.stringify(books));
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
