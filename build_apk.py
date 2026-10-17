import os
import zipfile
import hashlib
import base64
from datetime import datetime, timezone, timedelta
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization


def generate_key_and_cert():
    # 2048-bit RSA key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Sora Music"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Sora Android"),
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

def build_sora_apk():
    template_apk_path = "template.apk"
    dist_dir = "dist"
    output_apk_path = "Sora.apk"
    
    if not os.path.exists(template_apk_path):
        raise FileNotFoundError(f"{template_apk_path} not found")
        
    print("Reading dist assets...")
    dist_files = {}
    for root, _, files in os.walk(dist_dir):
        for f in files:
            full_path = os.path.join(root, f)
            rel_path = os.path.relpath(full_path, dist_dir).replace('\\', '/')
            with open(full_path, 'rb') as fp:
                dist_files[rel_path] = fp.read()
                
    print(f"Loaded {len(dist_files)} files from {dist_dir}")
    
    # Custom settings.json for Sora
    settings_json = b'''{
  "sites": [
    {
      "url": "https://appassets.androidplatform.net/sites/local/index.html",
      "title": "Sora"
    }
  ],
  "local_sites": true,
  "remote_debug": true,
  "web_settings": {
    "JavaScriptEnabled": true
  },
  "source": "assets",
  "timestamp": "2026-10-17T12:00:00Z"
}'''

    config_json = b'''{
  "sites": {
    "local/index.html": "Sora"
  },
  "bundles": [],
  "prefix": "https://appassets.androidplatform.net/sites/"
}'''

    # Build intermediate unsigned zip
    entries = {}
    with zipfile.ZipFile(template_apk_path, 'r') as zin:
        for item in zin.infolist():
            # Skip old signatures and old demo/local web content
            if item.filename.startswith("META-INF/") and (
                item.filename.endswith(".SF") or 
                item.filename.endswith(".RSA") or 
                item.filename.endswith(".DSA") or 
                item.filename.endswith(".MF")
            ):
                continue
            if item.filename.startswith("assets/demo/") or item.filename.startswith("assets/local/"):
                continue
            entries[item.filename] = zin.read(item.filename)

    # Insert Sora dist files into assets/local/
    for rel_path, content in dist_files.items():
        apk_target = f"assets/local/{rel_path}"
        entries[apk_target] = content
        
    entries["assets/settings.json"] = settings_json
    entries["assets/local/config.json"] = config_json

    print("Generating RSA key and self-signed certificate...")
    private_key, cert = generate_key_and_cert()
    
    # 1. Create META-INF/MANIFEST.MF
    manifest_lines = [
        "Manifest-Version: 1.0",
        "Created-By: 1.0 (Sora Android Builder)"
    ]
    
    entry_hashes = {}
    for name in sorted(entries.keys()):
        data = entries[name]
        h = hashlib.sha256(data).digest()
        h_b64 = base64.b64encode(h).decode('ascii')
        entry_hashes[name] = h_b64
        manifest_lines.append("")
        manifest_lines.append(f"Name: {name}")
        manifest_lines.append(f"SHA-256-Digest: {h_b64}")
        
    manifest_bytes = "\r\n".join(manifest_lines).encode('utf-8') + b"\r\n"
    entries["META-INF/MANIFEST.MF"] = manifest_bytes
    
    # 2. Create META-INF/CERT.SF
    manifest_sha256 = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode('ascii')
    cert_sf_lines = [
        "Signature-Version: 1.0",
        "Created-By: 1.0 (Sora Android Builder)",
        f"SHA-256-Digest-Manifest: {manifest_sha256}"
    ]
    
    for name in sorted(entry_hashes.keys()):
        # Each entry header in manifest
        section = f"Name: {name}\r\nSHA-256-Digest: {entry_hashes[name]}\r\n\r\n".encode('utf-8')
        s_hash = base64.b64encode(hashlib.sha256(section).digest()).decode('ascii')
        cert_sf_lines.append("")
        cert_sf_lines.append(f"Name: {name}")
        cert_sf_lines.append(f"SHA-256-Digest: {s_hash}")
        
    cert_sf_bytes = "\r\n".join(cert_sf_lines).encode('utf-8') + b"\r\n"
    entries["META-INF/CERT.SF"] = cert_sf_bytes
    
    # 3. Create PKCS#7 / CMS signature block for META-INF/CERT.RSA
    # We use cryptography's PKCS7 signature serialization
    from cryptography.hazmat.primitives.serialization import pkcs7
    
    signature = (
        pkcs7.PKCS7SignatureBuilder()
        .set_data(cert_sf_bytes)
        .add_signer(cert, private_key, hashes.SHA256())
        .add_certificate(cert)
        .sign(serialization.Encoding.DER, [pkcs7.PKCS7Options.DetachedSignature, pkcs7.PKCS7Options.Binary])
    )
    entries["META-INF/CERT.RSA"] = signature
    
    print(f"Writing signed APK to {output_apk_path}...")
    with zipfile.ZipFile(output_apk_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        # Write MANIFEST and signature files first (standard APK convention)
        for sig_file in ["META-INF/MANIFEST.MF", "META-INF/CERT.SF", "META-INF/CERT.RSA"]:
            zout.writestr(sig_file, entries[sig_file])
            
        for name, data in entries.items():
            if name.startswith("META-INF/"):
                continue
            zout.writestr(name, data)
            
    apk_size = os.path.getsize(output_apk_path)
    print(f"Success! {output_apk_path} created ({apk_size / 1024 / 1024:.2f} MB)")

if __name__ == '__main__':
    build_sora_apk()
