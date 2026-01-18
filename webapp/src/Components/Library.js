import React, { useState, useEffect } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import _ from "lodash";
import libraryLogo from "../images/library-lg.png";
import switchOrder from "../images/switch-order-logo.png";
import book from "../images/book.png";
import { Link } from "react-router-dom";

function Library() {
  const [tag, setTag] = useState("bname");
  const [order, setOrder] = useState("1");
  const [noOfBooks, setBookNo] = useState(0);
  const [noOfAuthors, setAuthorNo] = useState(0);
  const [noOfEditions, setEditionNo] = useState(0);
  const [books, setBooks] = useState([]);
  const [searchVal, setSearchVal] = useState("");
  const [loading, setLoading] = useState(false);

  async function getCount() {
    try {
      const doc = await fetch("/api/library/count");
      const { noOfBooks, noOfAuthors, noOfEditions } = await doc.json();
      setBookNo(noOfBooks);
      setAuthorNo(noOfAuthors);
      setEditionNo(noOfEditions);
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  }

  async function getBooks() {
    setLoading(true);
    try {
      const doc = await fetch(`/api/library?tag=${tag}&order=${order}`);
      const books = await doc.json();
      setBooks(books);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setSearchVal(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Improvement: Client-side validation to prevent empty searches
    if (searchVal.trim() === "") {
      const doc = await fetch(`/api/library?tag=bname`);
      const result = await doc.json();
      setBooks(result);
      return;
    }

    setLoading(true);
    try {
      const doc = await fetch(
        `/api/library/search?tag=${tag}&filter=${searchVal.trim()}`
      );
      const result = await doc.json();
      setBooks(result);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = async (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") handleSubmit(e);
  };

  const handleOrder = (e) => {
    e.preventDefault();
    if (order === "1") setOrder("-1");
    else setOrder("1");
  };

  const handleDelete = async (el) => {
    // Improvement: Added confirmation dialog to prevent accidental deletion
    if (window.confirm(`Are you sure you want to delete "${el.bname}" (Edition: ${el.edition})?`)) {
      try {
        const response = await fetch(`api/library/delete?bname=${el.bname}&edition=${el.edition}`, {
          method: "POST"
        });
        
        if (response.ok) {
          // Fixed: Use filter to create a new array instead of lodash .remove which mutates the state directly
          const updatedBooks = books.filter(book => !(book.bname === el.bname && book.edition === el.edition));
          setBooks(updatedBooks);
          // Refresh counts
          getCount();
        }
      } catch (err) {
        console.error("Delete operation failed:", err);
      }
    }
  };

  useEffect(() => {
    getCount();
    if (searchVal === '') {
      getBooks();
    }
  }, [tag, order, noOfBooks, noOfAuthors, noOfEditions, books.length]);

  return (
    <div>
      <Row>
        <Col className="leftside" md={2}>
          <p>
            <span className="pageimageholder" style={{ marginTop: "40px", border: "1px solid" }}>
              <img style={{ marginTop: "40px" }} src={libraryLogo} alt="" />
            </span>
          </p>
          <p className="page-title">LIBRARY</p>
          <p>
            No. of books: <b>{noOfBooks}</b> <br />
            No. of Authors: <b>{noOfAuthors}</b> <br />
            No. of Editions: <b>{noOfEditions}</b>
          </p>
          <br />
          <Link to="/library/add">
            <button className="add-btn" style={{ border: "1px solid" }}>
              <i className="fa fa-plus mr-3" aria-hidden="true"></i>Add Book
            </button>
          </Link>
        </Col>

        <Col className="rightside" md={8}>
          <Row>
            <Col md={1} style={{ cursor: 'pointer', fontWeight: tag === 'bname' ? 'bold' : 'normal' }} onClick={() => setTag("bname")}>
              Name
            </Col>
            <Col md={1} style={{ cursor: 'pointer', fontWeight: tag === 'author' ? 'bold' : 'normal' }} onClick={() => setTag("author")}>
              Author
            </Col>
            <Col className="mr-auto" md={1} style={{ cursor: 'pointer', fontWeight: tag === 'edition' ? 'bold' : 'normal' }} onClick={() => setTag("edition")}>
              Edition
            </Col>

            <input
              className="search"
              type="text"
              placeholder="Search"
              value={searchVal}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              style={{ border: "1px solid" }}
            />
            <button onClick={handleOrder} style={{ background: 'none', border: 'none' }}>
              <img src={switchOrder} alt="Switch Order" />
            </button>
          </Row>
          <hr />
          
          {/* Improvement: Added Loading State for better UX */}
          {loading ? (
            <div className="text-center mt-5">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row className="homerow justify-content-md-center">
              {books.length > 0 ? (
                books.map((el, id) => (
                  <Col md={5} key={id} className="pagegrid" style={{ border: "1px solid" }}>
                    <Row>
                      <Col md={1}>
                        <span>
                          <img style={{ marginTop: "30px" }} src={book} alt="" />
                        </span>
                      </Col>
                      <Col>
                        <br />
                        <p className="float-right">
                          <Link to={`/library/update/${el.bookid}`}>
                            <i className="fa fa-pencil mr-3" aria-hidden="true" />
                          </Link>
                          <i 
                            className="fa fa-trash text-danger" 
                            style={{ cursor: 'pointer' }} 
                            aria-hidden="true" 
                            onClick={() => handleDelete(el)} 
                          />
                        </p>
                        <p className="grid-title ">{el.bname}</p>
                        <span style={{ float: "right" }}> - {el.author}</span>
                      </Col>
                    </Row>
                    <p style={{ position: "absolute", bottom: "0" }}>
                      Edition {el.edition}
                    </p>
                  </Col>
                ))
              ) : (
                <p className="mt-5">No books found.</p>
              )}
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default Library;