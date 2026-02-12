def count_words(text):
    return len(text.split())

def count_characters(text):
    char_counts = {}
    for char in text.lower():
        if char.isalpha():  # Check if it is a letter (a-z)
            char_counts[char] = char_counts.get(char, 0) + 1
    return char_counts

def sort_on_values(char_counts_dict):
    sorted_list = []
    for char, count in char_counts_dict.items():
        if char.isalpha(): # Ensure only alphabetical characters are added to the list for sorting
            sorted_list.append({"char": char, "num": count})

    def sort_key(dict_item):
        return dict_item["num"]

    sorted_list.sort(reverse=True, key=sort_key)
    return sorted_list


