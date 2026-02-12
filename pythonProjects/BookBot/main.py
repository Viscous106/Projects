from stats import count_words, count_characters, sort_on_values
def get_book_text(book_path):
    with open(book_path, 'r', encoding='utf-8') as f:
        return f.read()

def main():
    path = "books/frankenstein.txt"
    text = get_book_text(path)
    word_count = count_words(text)
    char_count = count_characters(text)
    sorted_chars = sort_on_values(char_count)

    print(f"--- Begin report of {path} ---")
    print(f"Found {word_count} total words")
    for item in sorted_chars:
        print(f"{item['char']}: {item['num']}")
    print("--- End report ---")
    
main()
