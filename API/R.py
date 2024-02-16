from flask import jsonify


def R(status_code, data=None, message=None):
    """生成一个标准的JSON响应"""
    response = {
        'success': status_code,  # 根据状态码判断操作是否成功
        'data': data,
        'message': message
    }

    # 移除值为None的键
    response = {k: v for k, v in response.items() if v is not None}

    return jsonify(response)
