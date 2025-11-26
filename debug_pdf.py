import requests
import brotli
import io
from pypdf import PdfReader

URL = "https://www.berkshirehathaway.com/letters/2004ltr.pdf"

def debug_merged_pdf():
    filename = "buffett_letters_all_v2.pdf"
    print(f"Checking {filename}...")
    
    try:
        reader = PdfReader(filename)
        print(f"Total Pages: {len(reader.pages)}")
        
        # Check first page (2004 letter)
        page0 = reader.pages[0]
        text0 = page0.extract_text()
        print("\n--- Page 1 Text Sample ---")
        print(text0[:500])
        
        # Check a middle page (e.g., page 50)
        if len(reader.pages) > 50:
            page50 = reader.pages[50]
            text50 = page50.extract_text()
            print("\n--- Page 50 Text Sample ---")
            print(text50[:500])
            
    except Exception as e:
        print(f"PDF reading failed: {e}")

if __name__ == "__main__":
    debug_merged_pdf()
