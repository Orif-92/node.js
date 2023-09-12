
const bookList = document.getElementById('book-list');
const bookForm = document.getElementById('book-form');

// Kitoblarni olish
function fetchBooks() {
    fetch('http://localhost:3000/books')
        .then((response) => response.json())
        .then((data) => {
            // Ma'lumotlar HTML-ga chiqariladi
            bookList.innerHTML = '';
            data.forEach((book) => {
                const bookItem = document.createElement('div');
                bookItem.innerHTML = `
                    <p>${book.id}</p>
                    <h2>${book.title}</h2>
                    <p>${book.author}</p>
                    <button class="button-edit" onclick="editBook(${book.id})">Tahrirlash</button>
                    <button class="button-delete" onclick="deleteBook(${book.id})">O'chirish</button>
                `;
                bookList.appendChild(bookItem);
            });
        })
        .catch((error) => console.error('Xatolik:', error));
}

// Kitoblarni sahifaga yuklash
fetchBooks();

// Kitob qo'shish funksiyasi
function addBook() {
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;

    if (!title || !author) {
        alert("Sarlavha va muallifni kiriting!");
        return;
    }

    
    const newBook = { title, author };
    
    fetch('http://localhost:3000/books', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.message && data.message === 'Bu kitob bazada mavjud') {
            alert('Bu kitob bazada mavjud!');
        } else {
            // Ma'lumotlar o'zgartirilganidan so'ng sahifani yangilash
            fetchBooks();
        }
    })
    .catch((error) => console.error('Xatolik:', error));  

    // Sarlavha va muallifni tozalash
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
}

// Kitobni ID bo'yicha qidirish funksiya
function findBookById() {
    const searchInput = document.getElementById('search-input');
    const bookId = parseInt(searchInput.value);

    // Kitobni ID bo'yicha qidirish so'rovi serverga yuboriladi
    fetch(`http://localhost:3000/books/${bookId}`)
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error('Kitob topilmadi');
            }
        })
        .then((foundBook) => {
            alert(`${foundBook.id} ${foundBook.title} - ${foundBook.author}`);
        })
        .catch((error) => {
            alert(error.message);
        });
}


// Kitobni tahrirlash funksiyasi
function editBook(id) {
    const newTitle = prompt('Yangi sarlavhani kiriting:');
    const newAuthor = prompt('Yangi muallifni kiriting:');

    if (!newTitle || !newAuthor) {
        alert("Sarlavha va muallifni kiriting!");
        return;
    }

    const updatedBook = { title: newTitle, author: newAuthor };

    fetch(`http://localhost:3000/books/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBook)
    })
        .then(() => {
            // Ma'lumotlar o'zgartirilganidan so'ng sahifani yangilash
            fetchBooks();
        })
        .catch((error) => console.error('Xatolik:', error));
}

// Kitobni o'chirish funksiyasi
function deleteBook(id) {
    const confirmation = confirm('Kitobni o\'chirishni tasdiqlaysizmi?');
    
    if (!confirmation) {
        return;
    }

    fetch(`http://localhost:3000/books/${id}`, {
        method: 'DELETE',
    })
        .then(() => {
            // Ma'lumotlar o'chirilganidan so'ng sahifani yangilash
            fetchBooks();
        })
        .catch((error) => console.error('Xatolik:', error));
}


