import os
import struct
import hashlib
import zipfile
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding

def lp(data: bytes) -> bytes:
    """Length-prefixed with 4-byte little-endian uint32"""
    return struct.pack('<I', len(data)) + data

def generate_key_and_cert():
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Sora"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Sora Music"),
    ])
    now = datetime.now(timezone.utc)
    cert = (
        x509.CertificateBuilder()
        .subject_name(subject)
        .issuer_name(issuer)
        .public_key(private_key.public_key())
        .serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(days=1))
        .not_valid_after(now + timedelta(days=365 * 30))
        .sign(private_key, hashes.SHA256())
    )
    return private_key, cert

def find_eocd(apk_bytes: bytes):
    for i in range(len(apk_bytes) - 22, max(-1, len(apk_bytes) - 65557), -1):
        if apk_bytes[i:i+4] == b'\x50\x4b\x05\x06':
            return i
    raise ValueError("EOCD not found")

def sign_apk_v2(input_apk_bytes: bytes, private_key, cert) -> bytes:
    eocd_offset = find_eocd(input_apk_bytes)
    # Parse EOCD: signature (4), disk num (2), start disk (2), records on disk (2), total records (2), CD size (4), CD offset (4), comment len (2)
    cd_size = struct.unpack('<I', input_apk_bytes[eocd_offset+12 : eocd_offset+16])[0]
    cd_offset = struct.unpack('<I', input_apk_bytes[eocd_offset+16 : eocd_offset+20])[0]

    sec1 = input_apk_bytes[:cd_offset]
    sec3 = input_apk_bytes[cd_offset:eocd_offset]
    eocd = input_apk_bytes[eocd_offset:]

    # Compute 1MB chunked digest over Sec1, Sec3, and modified EOCD
    CHUNK_SIZE = 1048576 # 1MB
    chunks = []
    for s in [sec1, sec3]:
        for i in range(0, len(s), CHUNK_SIZE):
            chunks.append(s[i : i + CHUNK_SIZE])

    # We need to know the APK signing block size first to compute the new CD offset in modified EOCD!
    # Let's estimate and build dummy or do two-pass.
    cert_der = cert.public_bytes(serialization.Encoding.DER)
    public_key_der = private_key.public_key().public_bytes(
        serialization.Encoding.DER,
        serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # In v2 signing, the dummy digest pass has the exact same byte length (SHA256 = 32 bytes)
    # So the size of the APK signing block is 100% constant!
    # Let's compute the exact block size:
    # signed_data = lp(lp(0x0101 + lp(32-byte digest))) + lp(lp(cert_der)) + lp(empty_attr=b"")
    # signature = 256 bytes (RSA 2048)
    # signer = lp(signed_data) + lp(lp(0x0101 + lp(256-byte sig))) + lp(public_key_der)
    # v2_val = lp(lp(signer))
    
    # Calculate exact sizes
    signed_data_len = 4 + (4 + 4 + 4 + 32) + 4 + (4 + len(cert_der)) + 4 + 0
    signer_len = 4 + signed_data_len + 4 + (4 + 4 + 4 + 256) + 4 + len(public_key_der)
    v2_val_len = 4 + (4 + signer_len)
    pair_len = 8 + 4 + v2_val_len # 8-byte len, 4-byte ID (0x7109871a), v2_val
    block_size = pair_len + 8 + 16 # includes end 8-byte size and 16-byte magic
    total_sig_block_len = 8 + block_size

    new_cd_offset = cd_offset + total_sig_block_len

    # Modified EOCD has new_cd_offset at offset 16
    modified_eocd = bytearray(eocd)
    struct.pack_into('<I', modified_eocd, 16, new_cd_offset)
    modified_eocd = bytes(modified_eocd)

    for i in range(0, len(modified_eocd), CHUNK_SIZE):
        chunks.append(modified_eocd[i : i + CHUNK_SIZE])

    # Compute chunk hashes
    chunk_hashes = []
    for chunk in chunks:
        h = hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunk)) + chunk).digest()
        chunk_hashes.append(h)

    # Top-level APK digest
    apk_digest = hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunk_hashes)) + b"".join(chunk_hashes)).digest()

    # Build signed_data
    # 1. Digests list: lp(0x0101 + lp(apk_digest))
    digest_entry = struct.pack('<I', 0x0101) + lp(apk_digest)
    digests_list = lp(digest_entry)

    # 2. Certificates list: lp(cert_der)
    certs_list = lp(cert_der)

    # 3. Additional attributes: empty
    attrs = b""

    signed_data = lp(digests_list) + lp(certs_list) + lp(attrs)

    # Sign with RSA-SHA256 (PKCS#1 v1.5)
    sig_bytes = private_key.sign(signed_data, padding.PKCS1v15(), hashes.SHA256())

    # Build signatures list
    sig_entry = struct.pack('<I', 0x0101) + lp(sig_bytes)
    signatures_list = lp(sig_entry)

    # Build signer
    signer = lp(signed_data) + lp(signatures_list) + lp(public_key_der)
    signers_list = lp(signer)

    v2_value = lp(signers_list)

    # Build APK Signing Block
    pair_content = struct.pack('<I', 0x7109871a) + v2_value
    pair = struct.pack('<Q', len(pair_content)) + pair_content
    block_content_size = len(pair) + 8 + 16
    apk_signing_block = (
        struct.pack('<Q', block_content_size) +
        pair +
        struct.pack('<Q', block_content_size) +
        b"APK Sig Block 42"
    )

    assert len(apk_signing_block) == total_sig_block_len, f"{len(apk_signing_block)} != {total_sig_block_len}"

    # Assembled signed APK
    signed_apk = sec1 + apk_signing_block + sec3 + modified_eocd
    return bytes(signed_apk)
