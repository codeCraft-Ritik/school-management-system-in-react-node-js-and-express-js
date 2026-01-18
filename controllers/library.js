exports.getAllBooks = async(req, res) => {    
    const connection = req.app.get('connection');
    var { tag, order } = req.query;
    order = order === '-1' ? 'DESC': 'ASC';
    const [rows, fields] = await connection.query('SELECT * FROM library ORDER BY ' + tag + ' ' + order);
    res.status(200).json(rows);
}

// Update getABook
exports.getABook = async(req, res) => {
    const connection = req.app.get('connection');
    const { bookid } = req.params;
    // Using ? placeholder instead of string concatenation
    const [rows] = await connection.query('SELECT * FROM library WHERE bookid = ?', [bookid]);
    res.status(200).json(rows[0]);
}

exports.addBook = async(req, res) => {
    const connection = req.app.get('connection');
    // const post = { bookid: 5, bname: 'Rich Dad Poor Dad', edition: 5, author: 'Robert Kiyosaki' };
    const { bname, edition, author } = req.body;
    const post = { bname, edition, author };
    console.log(post);
    const [rows, fields] = await connection.query('INSERT INTO library SET ?', [post]);
    res.status(200).json(rows);
}

// Update deleteBook
exports.deleteBook = async(req, res) => {
    const connection = req.app.get('connection');
    const { bname, edition } = req.query;
    const [rows] = await connection.query('DELETE FROM library WHERE bname = ? AND edition = ?', [bname, edition]);

    if (rows.affectedRows === 0) {
        return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(rows);
}

// Update updateBook
exports.updateBook = async(req, res) => {
    const connection = req.app.get('connection');
    const { bookid } = req.params;
    const { bname, author, edition } = req.body;
    const [rows] = await connection.query(
        'UPDATE library SET bname = ?, author = ?, edition = ? WHERE bookid = ?',
        [bname, author, edition, bookid]);
    res.status(200).json(rows);
}

exports.searchBooks = async(req, res) => {
    const connection = req.app.get('connection');
    var { tag, filter } = req.query;
    filter = '%' + filter + '%'
    const [rows, fields] = await connection.query(' SELECT * FROM library WHERE ' + tag + ' LIKE ?', [filter]);
    res.status(200).json(rows);
}

exports.libraryCount = async(req, res) => {
    const connection = req.app.get('connection');
    const [rows, fields] = await connection.query(
        'SELECT COUNT(DISTINCT bname) AS noOfBooks, COUNT(DISTINCT author) AS noOfAuthors, COUNT(DISTINCT edition) AS noOfEditions FROM library',
        );
    res.status(200).json(rows[0]);
}