def get_book_text(book_path):
    with open(book_path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    path = "books/frankenstein.txt"
    text = get_book_text(path)
    print(text)

main()
