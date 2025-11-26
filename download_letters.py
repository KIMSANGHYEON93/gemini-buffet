import requests
from bs4 import BeautifulSoup
from pypdf import PdfWriter
import io
import os
import shutil
from urllib.parse import urljoin

BASE_URL = "https://www.berkshirehathaway.com/letters/letters.html"
ROOT_URL = "https://www.berkshirehathaway.com/letters/"
OUTPUT_FILENAME = "buffett_letters_all_v2.pdf"
TEMP_DIR = "temp_pdfs"

def get_pdf_links():
    print(f"Fetching {BASE_URL}...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    response = requests.get(BASE_URL, headers=headers)
    response.raise_for_status()
    
    content = response.content
    if 'br' in response.headers.get('Content-Encoding', ''):
        try:
            import brotli
            content = brotli.decompress(content)
        except ImportError:
            print("Brotli module not found.")
        except Exception as e:
            print(f"Brotli decompression failed: {e}")
    elif 'gzip' in response.headers.get('Content-Encoding', ''):
        try:
            import gzip
            content = gzip.decompress(content)
        except Exception as e:
            print(f"Gzip decompression failed: {e}")

    soup = BeautifulSoup(content, 'html.parser')
    
    links = []
    all_links = soup.find_all('a', href=True)
    print(f"Total links found on page: {len(all_links)}")
    
    for a in all_links:
        href = a['href']
        if href.lower().endswith('.pdf'):
            full_url = urljoin(ROOT_URL, href)
            if full_url not in links:
                links.append(full_url)
    
    print(f"Found {len(links)} PDF links.")
    return links

def download_and_merge_pdfs(pdf_links):
    if not os.path.exists(TEMP_DIR):
        os.makedirs(TEMP_DIR)
        
    downloaded_files = []
    
    for link in pdf_links:
        filename = link.split('/')[-1]
        filepath = os.path.join(TEMP_DIR, filename)
        
        try:
            print(f"Downloading {link}...")
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            response = requests.get(link, headers=headers)
            response.raise_for_status()
            
            content = response.content
            
            # Decompression logic
            if content.startswith(b'%PDF'):
                pass
            elif 'br' in response.headers.get('Content-Encoding', ''):
                try:
                    import brotli
                    decompressed = brotli.decompress(content)
                    if decompressed.startswith(b'%PDF'):
                        content = decompressed
                except Exception as e:
                    print(f"Brotli failed for {link}: {e}")
            elif 'gzip' in response.headers.get('Content-Encoding', ''):
                try:
                    import gzip
                    decompressed = gzip.decompress(content)
                    if decompressed.startswith(b'%PDF'):
                        content = decompressed
                except Exception as e:
                    print(f"Gzip failed for {link}: {e}")

            if not content.startswith(b'%PDF'):
                print(f"Skipping {link}: Invalid PDF content")
                continue

            with open(filepath, 'wb') as f:
                f.write(content)
            
            downloaded_files.append(filepath)
            print(f"Saved {filepath}")
            
        except Exception as e:
            print(f"Failed to process {link}: {e}")

    if downloaded_files:
        print(f"Merging {len(downloaded_files)} PDFs into {OUTPUT_FILENAME}...")
        merger = PdfWriter()
        
        for pdf_file in downloaded_files:
            try:
                merger.append(pdf_file)
                print(f"Merged {pdf_file}")
            except Exception as e:
                print(f"Error merging {pdf_file}: {e}")
                
        with open(OUTPUT_FILENAME, "wb") as f_out:
            merger.write(f_out)
        print("Done.")
        
        # Cleanup
        # shutil.rmtree(TEMP_DIR) 
        # print("Cleaned up temp directory.")
    else:
        print("No PDFs were downloaded.")

if __name__ == "__main__":
    try:
        links = get_pdf_links()
        download_and_merge_pdfs(links)
    except Exception as e:
        print(f"An error occurred: {e}")
