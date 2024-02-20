# import binascii
#
# from Crypto.Cipher import AES
# from Crypto.Util.Padding import unpad
# import base64
#
# # 使用与Java中相同的密钥
# key = '********************'  # 这里填写密钥
# # 修复Base64解码错误：确保Base64字符串长度为4的倍数
# key += '=' * ((4 - len(key) % 4) % 4)
# def decrypt_aes(encrypted_text):
#
#
#     # 将Base64编码的密钥解码为字节
#     try:
#         key_bytes = base64.b64decode(key)
#     except binascii.Error as e:
#         raise ValueError(f"Incorrect Base64 key encoding: {e}")
#
#     # 检查密钥长度是否合法
#     if len(key_bytes) not in [16, 24, 32]:
#         raise ValueError("Incorrect AES key length")
#
#     cipher = AES.new(key_bytes, AES.MODE_ECB)
#     decrypted_data = unpad(cipher.decrypt(base64.b64decode(encrypted_text)), AES.block_size)
#
#     return decrypted_data.decode('utf-8')
#
