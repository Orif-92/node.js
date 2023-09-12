const http = require('http');
const fs = require('fs');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // CORS sozlamalari
    res.setHeader('Access-Control-Allow-Origin', '*'); // Barcha domenlarni qabul qilish
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Qo'llaniladigan metodlar
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Qo'shimcha HTTP headerlari
    res.setHeader('Access-Control-Max-Age', '86400'); // Max-Age uchun vaqt (sekundlarda)

    // OPTIONS so'rovi uchun 204 No Content javobi
    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/books') {
        // GET - /books => books.json faylini o'qib oling va barcha ma'lumotlarni chiqaring
        const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(books));
    } else if (req.method === 'GET' && parsedUrl.pathname.startsWith('/books/')) {
        // GET - /books/:id => books.json faylidan :id bo’yicha qidiring, agar topilsa ma’lumotni qaytaring, aks xolda ma’lumot topilmadi degan xabarni qaytaring
        const bookId = parsedUrl.pathname.split('/').pop();
        const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
        const book = books.find((b) => b.id === Number(bookId));
        if (book) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(book));
        } else {
            res.statusCode = 404;
            res.end('Ma’lumot topilmadi');
        }
    } else if (req.method === 'POST' && parsedUrl.pathname === '/books') {
        // POST - /books => books.json fayliga yangi ma’lumotni qo’shing
        // ma’lumotlarni qo’shishda title va author kiritilsin. id => auto generate qilinsin
        // Agar kitoblar ro’yxatida kiritilayotgan title bo’yicha boshqa kitob mavjud bo’lsa, bu kitob bazada mavjud degan degan xabar qaytarilsin
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newBook = JSON.parse(body);
    
            // Kitoblar ro'yxatini o'qib olamiz
            const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
    
            // Yangi kitobni qo'shamiz
            const existingBook = books.find((book) => book.title === newBook.title);
            if (existingBook) {
                // Kitob mavjud, xabarni yuborish
                res.statusCode = 400; // Bad Request
                res.end(JSON.stringify({ message: 'Bu kitob bazada mavjud' }));
            } else {
                // Yangi kitobni qo'shamiz va kitoblar ro'yxatini yangilaymiz
                const newId = books.length + 1;
                newBook.id = newId;
                books.push(newBook);
                fs.writeFileSync('books.json', JSON.stringify(books, null, 2), 'utf8');
    
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(newBook));
            }
        });
    } else if (req.method === 'PUT' && parsedUrl.pathname.startsWith('/books/')) {
      // PUT - /books/:id => books.json faylidan :id bo’yicha qidiring, agar topilsa ma’lumotni kiritilgan ma’lumotlar bo’yicha tahrirlang, topilmasa ma’lumot topilmadi xabarini qaytaring
      const bookId = parsedUrl.pathname.split('/').pop();
      if (bookId) {
          const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
          const index = books.findIndex((b) => b.id === Number(bookId));
          if (index !== -1) {
              let body = '';
              req.on('data', (chunk) => {
                  body += chunk.toString();
              });
              req.on('end', () => {
                  const updatedBook = JSON.parse(body);
                  // Oldingi "id" ni saqlash
                  const oldBookId = books[index].id;
                  updatedBook.id = oldBookId; // "id" ni oldingi qiymatga o'rnatish
                  books[index] = updatedBook;
                  fs.writeFileSync('books.json', JSON.stringify(books, null, 2), 'utf8');
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(updatedBook));
              });
          } else {
              res.statusCode = 404;
              res.end('Ma’lumot topilmadi');
          }
      } else {
          res.statusCode = 400;
          res.end('Kitob ID topilmadi');
      }
      
  } else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/books/')) {
      // DELETE - /books/:id => books.json faylidan :id bo’yicha qidiring, agar topilsa ma’lumotni o’chirib tashlang, aks xolda ma’lumot topilmadi degan xabarni qaytaring.
      const bookId = parsedUrl.pathname.split('/').pop();
      const books = JSON.parse(fs.readFileSync('books.json', 'utf8'));
      const index = books.findIndex((b) => b.id === Number(bookId));
      if (index !== -1) {
          const deletedBook = books.splice(index, 1)[0];
          fs.writeFileSync('books.json', JSON.stringify(books, null, 2), 'utf8');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(deletedBook));
      } else {
          res.statusCode = 404;
          res.end('Ma’lumot topilmadi');
      }
  } else {
      res.statusCode = 404;
      res.end('Sahifa topilmadi');
  }
  
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} da ishga tushdi`);
});
