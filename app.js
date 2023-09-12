const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/books') {
    // GET /books => Barcha kitoblarni o'qish
    fs.readFile('books.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
      } else {
        res.statusCode = 200;
        res.end(data);
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/books/')) {
    // GET /books/:id => Kitobni ID bo'yicha izlash
    const id = req.url.split('/')[2]; // :id ni olish
    fs.readFile('books.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
      } else {
        const books = JSON.parse(data);
        const book = books.find((b) => b.id == id);

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
    // POST /books => Yangi kitob qo'shish
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk;
    });

    req.on('end', () => {
      try {
        const newBook = JSON.parse(requestBody);
        fs.readFile('books.json', 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
          } else {
            const books = JSON.parse(data);
            const existingBook = books.find((b) => b.title === newBook.title);

            if (existingBook) {
              res.statusCode = 409;
              res.end(JSON.stringify({ message: 'Bu kitob bazada mavjud' }));
            } else {
              newBook.id = books.length + 1;
              books.push(newBook);
              fs.writeFile('books.json', JSON.stringify(books, null, 2), (err) => {
                if (err) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
                } else {
                  res.statusCode = 201;
                  res.end(JSON.stringify(newBook));
                }
              });
            }
          }
        });
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Noto‘g‘ri so‘rov yuborildi' }));
      }
    });
  } else if (req.method === 'PUT' && req.url.startsWith('/books/')) {
    // PUT /books/:id => Kitobni ID bo'yicha o'zgartirish
    const id = req.url.split('/')[2]; // :id ni olish
    let requestBody = '';
    req.on('data', (chunk) => {
      requestBody += chunk;
    });

    req.on('end', () => {
      try {
        const updatedBook = JSON.parse(requestBody);
        fs.readFile('books.json', 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
          } else {
            const books = JSON.parse(data);
            const index = books.findIndex((b) => b.id == id);

            if (index !== -1) {
              books[index] = { ...books[index], ...updatedBook };
              fs.writeFile('books.json', JSON.stringify(books, null, 2), (err) => {
                if (err) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
                } else {
                  res.statusCode = 200;
                  res.end(JSON.stringify(books[index]));
                }
              });
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ message: 'Ma\'lumot topilmadi' }));
            }
          }
        });
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Noto‘g‘ri so‘rov yuborildi' }));
      }
    });
  } else if (req.method === 'DELETE' && req.url.startsWith('/books/')) {
    // DELETE /books/:id => Kitobni ID bo'yicha o'chirish
    const id = req.url.split('/')[2]; // :id ni olish
    fs.readFile('books.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
      } else {
        const books = JSON.parse(data);
        const index = books.findIndex((b) => b.id == id);

        if (index !== -1) {
          const deletedBook = books.splice(index, 1)[0];
          fs.writeFile('books.json', JSON.stringify(books, null, 2), (err) => {
            if (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ message: 'Xatolik yuz berdi' }));
            } else {
              res.statusCode = 200;
              res.end(JSON.stringify(deletedBook));
            }
          });
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
