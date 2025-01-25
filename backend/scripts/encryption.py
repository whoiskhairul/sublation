from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv
import base64


# Generate a key (only once, then store it securely)
# key = Fernet.generate_key()
# Store this key securely, e.g., in environment variables
load_dotenv()
#key = os.environ.get('FERNET_KEY')
# key = 'NT6d4Rj4kXdyKZLctqLIWoiIQWM6su-2HeJcemkKCKU='  # Replace with your actual key

#f = Fernet(key)

# Retrieve the key
key = os.getenv('FERNET_KEY')

# Validate the key
if not key:
    raise ValueError("FERNET_KEY is missing in environment variables.")

try:
    # Ensure the key can be decoded and is 32 bytes
    decoded_key = base64.urlsafe_b64decode(key)
    if len(decoded_key) != 32:
        raise ValueError("FERNET_KEY must be 32 bytes after decoding.")
    f = Fernet(key)  # Create Fernet instance
except Exception as e:
    raise ValueError(f"Invalid FERNET_KEY format: {e}")

def encrypt_data(data: str) -> str:
    """Encrypt data for URL usage."""
    return f.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    """Decrypt encrypted URL data."""
    return f.decrypt(token.encode()).decode()


if __name__ == "__main__":
    while True:
        data = str(input("Enter some data to encrypt: "))
        encrypted_data = encrypt_data(data)
        print(f"Encrypted data: {encrypted_data}")

        encrypted_data = input("Enter the encrypted data to decrypt: ")
        decrypted_data = decrypt_data(encrypted_data)
        print(f"Decrypted data: {decrypted_data}")