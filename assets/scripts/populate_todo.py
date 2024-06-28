import requests
import re

# Fetch the CSS file
file_path = "../../src/entrypoints/catppuccin.css"
url = "https://schoolbox-static.cloud/23.1.17-2/css/core/core.css?v=23.1.17"
response = requests.get(url)
core_css_content = response.text
core_css_classes = []
catppuccin_css_content = ""
catppuccin_css_classes = []

with open(file_path, 'r') as file:
    catppuccin_css_content = file.read()

print(f"Number of Schoolbox components found': {core_css_content.count("Component")}")

# find all the core classes
core_css_classes = list(set(re.findall(r'\.\b[^\s,.{}]*Component[^\s,:{}]*\b', core_css_content)))

# find all the icon classes


# print them out to stylesTodo.md
with open("./stylesTodo.md", "w") as f:
    f.write("""# Styles Todo

This file is automatically generated by the `populateTodo.py` script. It contains a list of all the CSS classes that need to be added to the catppuccin.css file.

""")
    for css_class in core_css_classes:
        # remove "icon-masonry-"
        css_class = css_class.replace("icon-masonry-", "")
        # check if they need to be ticked or not
        if css_class in catppuccin_css_content:
            f.write(f"- [x] {css_class}\n")
        else:
            f.write(f"- [ ] {css_class}\n")