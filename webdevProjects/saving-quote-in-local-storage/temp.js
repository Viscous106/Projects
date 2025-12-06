let quotes = JSON.parse(localStorage.getItem("Quotes")) || [];

// elements
let saveButton = document.querySelector(".save");
let quoteInput = document.getElementById("quote-input");
let nameInput = document.getElementById("name-input");
let categoryInput = document.getElementById("category-input");

let allQuotesContainer = document.querySelector(".all-quotes");
let searchInput = document.getElementById("search-input");

//functions
//to save data in local storage
saveButton.addEventListener("click", function() {
  let quoteText = quoteInput.value;
  let authorName = nameInput.value;
  let quoteCategory = categoryInput.value;

  if (quoteText && authorName && quoteCategory) {
    let newQuote = {
      text: quoteText,
      author: authorName,
      category: quoteCategory,
    };
    quotes.push(newQuote);
    localStorage.setItem("Quotes", JSON.stringify(quotes));

    quoteInput.value = "";
    nameInput.value = "";
    categoryInput.value = "";

    displayQuotes(quotes);
  }
});



function displayQuotes(quotesToDisplay) {
  allQuotesContainer.innerHTML = "";
  quotesToDisplay.forEach(function(quote, index) {
    let quoteItem = document.createElement("div");
    quoteItem.setAttribute("class", "quote-item");

    let author = document.createElement("div");
    author.setAttribute("class", "quote-author");
    author.textContent = `- ${quote.author}`;

    let text = document.createElement("div");
    text.setAttribute("class", "quote-text");
    text.textContent = quote.text;

    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute("class", "delete-quote-btn");
    deleteButton.addEventListener("click", function() {
        quotes.splice(index, 1);
        localStorage.setItem("Quotes", JSON.stringify(quotes));
        displayQuotes(quotes);
    });

    quoteItem.appendChild(author);
    quoteItem.appendChild(text);
    quoteItem.appendChild(deleteButton);

    allQuotesContainer.appendChild(quoteItem);
  });
}

// Initial display of quotes if any are in local storage
displayQuotes(quotes);

searchInput.addEventListener("input", function() {
    let searchTerm = searchInput.value.toLowerCase();
    let filteredQuotes = quotes.filter(function(quote) {
        return (
            quote.text.toLowerCase().includes(searchTerm) ||
            quote.author.toLowerCase().includes(searchTerm) ||
            quote.category.toLowerCase().includes(searchTerm)
        );
    });
    displayQuotes(filteredQuotes);
});
