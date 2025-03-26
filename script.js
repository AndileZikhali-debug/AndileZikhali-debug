// Book class to represent a book
class Book {
  constructor(id, title, author, category, isRead) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.category = category;
    this.isRead = isRead;
  }
}

// Borrowing history entry
class BorrowEntry {
  constructor(bookId, borrower, date) {
    this.bookId = bookId;
    this.borrower = borrower;
    this.date = date;
  }
}

// Library class to manage books and borrowing history
class Library {
  constructor() {
    this.books = JSON.parse(localStorage.getItem('books')) || [];
    this.history = JSON.parse(localStorage.getItem('history')) || [];
  }

  // Add a new book
  addBook(book) {
    this.books.push(book);
    this.save();
  }

  // Update an existing book
  updateBook(id, updatedBook) {
    const index = this.books.findIndex(book => book.id === id);
    if (index !== -1) {
      this.books[index] = { ...this.books[index], ...updatedBook };
      this.save();
    }
  }

  // Delete a book
  deleteBook(id) {
    this.books = this.books.filter(book => book.id !== id);
    this.history = this.history.filter(entry => entry.bookId !== id);
    this.save();
  }

  // Borrow a book
  borrowBook(bookId, borrower) {
    const entry = new BorrowEntry(bookId, borrower, new Date().toLocaleString());
    this.history.push(entry);
    this.save();
  }

  // Save to localStorage
  save() {
    localStorage.setItem('books', JSON.stringify(this.books));
    localStorage.setItem('history', JSON.stringify(this.history));
  }
}

// UI class to handle DOM manipulation
class UI {
  static displayBooks(books) {
    const booksContainer = document.getElementById('books-container');
    booksContainer.innerHTML = '';

    books.forEach(book => {
      const bookCard = document.createElement('div');
      bookCard.classList.add('book-card');
      bookCard.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Category:</strong> ${book.category}</p>
        <p class="status ${book.isRead ? 'read' : 'unread'}">
          <strong>Status:</strong> ${book.isRead ? 'Read' : 'Unread'}
        </p>
        <div class="actions">
          <button onclick="app.editBook('${book.id}')">Edit</button>
          <button onclick="app.deleteBook('${book.id}')">Delete</button>
          <button onclick="app.showBorrowForm('${book.id}')">Borrow</button>
        </div>
      `;
      booksContainer.appendChild(bookCard);
    });
  }

  static displayHistory(history, books) {
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '';

    history.forEach(entry => {
      const book = books.find(b => b.id === entry.bookId);
      if (book) {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.innerHTML = `
          <p><strong>${book.title}</strong> was borrowed by ${entry.borrower} on ${entry.date}</p>
        `;
        historyContainer.appendChild(historyItem);
      }
    });
  }

  static showBorrowForm(bookId) {
    const borrower = prompt('Enter the name of the borrower:');
    if (borrower) {
      app.borrowBook(bookId, borrower);
    }
  }

  static clearForm() {
    document.getElementById('book-id').value = '';
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('category').value = 'Fiction';
    document.getElementById('is-read').value = 'false';
    document.getElementById('cancel-edit').style.display = 'none';
    document.querySelector('#book-form h2').textContent = 'Add a New Book';
  }
}

// App class to manage the application logic
class App {
  constructor() {
    this.library = new Library();
    this.init();
  }

  init() {
    // Display initial books and history
    this.filterAndDisplayBooks();
    UI.displayHistory(this.library.history, this.library.books);

    // Event listeners
    document.getElementById('book-form').addEventListener('submit', this.handleFormSubmit.bind(this));
    document.getElementById('cancel-edit').addEventListener('click', this.cancelEdit.bind(this));
    document.getElementById('search').addEventListener('input', this.filterAndDisplayBooks.bind(this));
    document.getElementById('filter-category').addEventListener('change', this.filterAndDisplayBooks.bind(this));
  }

  handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('book-id').value || Date.now().toString();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const category = document.getElementById('category').value;
    const isRead = document.getElementById('is-read').value === 'true';

    const book = new Book(id, title, author, category, isRead);

    if (document.getElementById('book-id').value) {
      this.library.updateBook(id, book);
    } else {
      this.library.addBook(book);
    }

    UI.clearForm();
    this.filterAndDisplayBooks();
  }

  editBook(id) {
    const book = this.library.books.find(book => book.id === id);
    if (book) {
      document.getElementById('book-id').value = book.id;
      document.getElementById('title').value = book.title;
      document.getElementById('author').value = book.author;
      document.getElementById('category').value = book.category;
      document.getElementById('is-read').value = book.isRead.toString();
      document.getElementById('cancel-edit').style.display = 'inline-block';
      document.querySelector('#book-form h2').textContent = 'Edit Book';
    }
  }

  cancelEdit() {
    UI.clearForm();
  }

  deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
      this.library.deleteBook(id);
      this.filterAndDisplayBooks();
      UI.displayHistory(this.library.history, this.library.books);
    }
  }

  borrowBook(bookId, borrower) {
    this.library.borrowBook(bookId, borrower);
    UI.displayHistory(this.library.history, this.library.books);
  }

  filterAndDisplayBooks() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const categoryFilter = document.getElementById('filter-category').value;

    let filteredBooks = this.library.books;

    // Filter by search term
    if (searchTerm) {
      filteredBooks = filteredBooks.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm) ||
        book.category.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      filteredBooks = filteredBooks.filter(book => book.category === categoryFilter);
    }

    UI.displayBooks(filteredBooks);
  }
}

// Initialize the app
const app = new App();

// Expose methods to the global scope for onclick handlers
window.app = app;
