import os
from datetime import datetime
from langchain.tools import tool

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")


@tool
def file_save_tool(filename: str, content: str) -> str:
    """Save content to a file in the output directory.

    Use this tool when the user asks to save analysis results, notes,
    or any text content to a file. The file will be saved under the
    output/ directory.

    Args:
        filename: Name of the file to save (e.g. "analysis.txt", "report.md").
        content: The text content to write to the file.
    """
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"File saved successfully: {filepath} (at {timestamp})"
