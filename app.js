const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/books') {
    // books.json faylini o'qish
    fs.readFile('books.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Serverda xatolik yuz berdi' }));
      } else {
        res.statusCode = 200;
        res.end(data);
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/books/')) {
    // :id bo'yicha qidirish
    const id = req.url.split('/').pop(); // URL dan id ni olish

    fs.readFile('books.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Serverda xatolik yuz berdi' }));
      } else {
        const books = JSON.parse(data);
        const book = books.find((item) => item.id === parseInt(id));

        if (book) {
          res.statusCode = 200;
          res.end(JSON.stringify(book));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
        }
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
